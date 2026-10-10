# Greenwick Government — Digital document portal

A buildless GitHub Pages website for redeeming and downloading the supplied identity card, passport and MediLink card. Original PNG bytes are preserved. The included encrypted collection uses the code supplied by the issuer. The code and unencrypted originals are not included in the repository.

## Deploy on GitHub Pages

1. Create a repository and upload the **contents** of this folder, including `data`, `index.html`, `app.js`, `styles.css`, `favicon.svg` and `.nojekyll`. Do not upload just the ZIP.
2. In repository **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, then Save.
3. Open the Pages URL when deployment completes. Use HTTPS. No package installation, API keys or build step is required.
4. Enter the code supplied by the issuer. Download each of the three original PNGs.

Deployment has not been performed for you. All paths are relative, so repository subpath hosting works.

## Local preview

Run `python -m http.server 8000` in this folder, then visit `http://localhost:8000`. Opening `index.html` directly from disk is unsupported because the browser must fetch the encrypted collection.

## Add another collection

Requires Node.js 20 or newer. Keep source images outside this repository.

```sh
node tools/add-collection.mjs "Full name" /path/identity.png /path/passport.png /path/medilink.png
```

Enter a new code at the prompt. It is visible in your terminal but is not written into the website. Prefer at least 16 randomly generated letters/numbers. Upload the generated `data/*.json` file. Existing collection files are never overwritten by the utility; remove the old encrypted file intentionally before replacing the same code.

## Security limits

This is a static collection portal, not a production government identity authentication system. Files use AES-256-GCM with a PBKDF2-SHA-256 key derived from the redemption code (600,000 iterations, random salt and IV). The filename contains a SHA-256 digest of the code. A short code can be guessed offline, including by checking that digest; the requested short code is therefore weak despite encryption. Someone with the code can decrypt and save all documents. Use a backend and long random tokens for sensitive real-world records.

The browser's five-attempt cooldown is a convenience only and is bypassable. There is no server-side rate limiting, one-time redemption, revocation, identity verification, account system or access audit. Removing a collection prevents future portal fetches, but cannot revoke copies already downloaded. Git history may preserve deleted encrypted collections. Sessions close after ten minutes; downloaded files persist. Nothing is saved in browser localStorage, sessionStorage or cookies. Hosting providers may retain normal request logs, including requested collection paths. No external fonts, scripts or analytics are used.

Never publish unencrypted source documents or a code list. Inform holders that this portal permits repeat access. The supplied files are virtual micronation documents; the portal does not imply recognition by other authorities.
