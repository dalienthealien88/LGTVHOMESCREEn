# URL Viewer for LG webOS TV

A simple webOS app that lets you enter and open an HTTP or HTTPS website address using the TV remote. Pages open inside the app so its controls remain available. If a site blocks embedded viewing, use **Open full page**. Use **Save as default** to have an address prefilled next time; **Clear default** removes it. The app also remembers the last address opened when no default is saved.

## Build

Run `node make-icon.cjs` once, then `node build-ipk.cjs` to create `URLViewer.ipk`. Install the IPK using the webOS homebrew or developer installation method supported by your TV.

The viewer opens the address as a top-level page in the app. Website sign-in and playback behavior depend on the website and the TV's webOS browser version.
