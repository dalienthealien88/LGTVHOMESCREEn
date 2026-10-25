# The Bazaar

The Bazaar is a full-screen webOS app that opens `http://thebazaar.duckdns.org:9999/` directly when launched. The website handles its own sign-in; the app does not collect or store passwords. Its login session is kept by the TV's webOS app browser.

The site uses HTTP. Use it only on a trusted home network.

## Packaging

Run `node HomeframeApp/build-ipk.cjs` from the repository root to build `Homeframe.ipk` and update the SHA-256 hash in `homeframe.manifest.json`.
