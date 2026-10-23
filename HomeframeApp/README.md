# The Bazaar for webOS

A remote-friendly home screen for The Bazaar on LG webOS. The app keeps its own UI lightweight and opens Bazaar destinations using the hosted site's compatibility-mode routes where available. Games and game stats open their actual full-interface routes. Sign in opens The Bazaar's own same-origin login page, so the server's cross-site request protection accepts the login and manages the session. This app does not collect, save, or submit credentials.

## Build

Run `python HomeframeApp/build-ipk.py` from the repository root. The script packages the webOS app as `Homeframe.ipk` and updates the SHA-256 in `homeframe.manifest.json`.

## Remote controls

- Arrow keys / D-pad: move between destinations.
- OK / Enter: open the selected Bazaar section.
- Choose **Sign in** in the top bar to sign in on The Bazaar.
- Back: return from the Bazaar site to this screen using webOS navigation.

## Network note

The configured Bazaar server uses HTTP. Use it only on a trusted network. Sign in on the TV; browser sessions are separate. The app intentionally does not store passwords.
