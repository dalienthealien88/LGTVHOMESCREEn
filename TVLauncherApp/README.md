# TV Launcher

A separate, custom TV-friendly launcher built as a new app alongside the existing Bazaar and URL Viewer packages.

## Includes

- full-screen app grid
- weather + clock widgets
- bottom-right settings drawer
- add/remove apps with local persistence
- remote-friendly D-pad navigation
- directional access to the bottom-right settings button
- app launch support for URLs and webOS app IDs

## Files

- `index.html`
- `styles.css`
- `app.js`
- `appinfo.json`
- `icon.svg`

## Packaging

Run `node TVLauncherApp/build-ipk.cjs` from the repository root to create `TVLauncher.ipk` and update its SHA-256 hash in `tvlauncher.manifest.json`. The package is a standalone webOS app, not a replacement for the stock launcher. Install it using your supported webOS homebrew or developer installation method, then assign it through a custom remote button mapping.
