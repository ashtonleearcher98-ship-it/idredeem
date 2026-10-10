// Offline utility: keep original documents outside your repository.
import {webcrypto,createHash} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import readline from 'node:readline/promises';
const [holder,identity,passport,medilink]=process.argv.slice(2);
if(!holder||!identity||!passport||!medilink){console.error('Usage: node tools/add-collection.mjs "Full name" identity.png passport.png medilink.png');process.exit(1);}
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
const code=(await rl.question('Redemption code (visible on this terminal): ')).trim().toUpperCase();rl.close();
if(!/^[A-Z0-9-]{6,64}$/.test(code))throw Error('Use 6–64 letters, numbers or hyphens. Prefer at least 16 random characters.');
const documents=[];
for(const [title,filename,source] of [['Identity card','Greenwick-Identity-Card.png',identity],['Passport','Greenwick-Passport.png',passport],['MediLink card','Greenwick-MediLink.png',medilink]]){const bytes=await readFile(source);if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Each document must be a PNG image.');documents.push({title,filename,bytes:bytes.toString('base64')});}
const salt=webcrypto.getRandomValues(new Uint8Array(16)),iv=webcrypto.getRandomValues(new Uint8Array(12)),iterations=600000;
const material=await webcrypto.subtle.importKey('raw',new TextEncoder().encode(code),'PBKDF2',false,['deriveKey']);
const key=await webcrypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt']);
const ciphertext=await webcrypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify({holder,documents})));
const output=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../data');await mkdir(output,{recursive:true});
const id=createHash('sha256').update(code).digest('hex');const target=path.join(output,id+'.json');
await writeFile(target,JSON.stringify({version:1,iterations,salt:Buffer.from(salt).toString('base64'),iv:Buffer.from(iv).toString('base64'),ciphertext:Buffer.from(ciphertext).toString('base64')}),{flag:'wx'});
console.log('Encrypted collection created. Upload the new data file with the portal.');
