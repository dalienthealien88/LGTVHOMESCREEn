# TV Launcher

A separate, custom TV-friendly launcher built as a new app alongside the existing Bazaar and URL Viewer packages.

## Includes

- full-screen app grid
- a curated Netflix picks carousel with generic, non-personalized title searches
- weather + clock widgets
- launcher settings tile in the app grid
- add/remove apps with local persistence
- remote-friendly D-pad navigation
- D-pad navigation between the app grid, Netflix picks, and launcher settings
- app launch support for URLs and webOS app IDs

## Files

- `index.html`
- `styles.css`
- `app.js`
- `appinfo.json`
- `icon.png`

## Packaging

Run `node TVLauncherApp/build-ipk.cjs` from the repository root to create `TVLauncher.ipk` and update its SHA-256 hash in `tvlauncher.manifest.json`. The package is a standalone webOS app, not a replacement for the stock launcher. Install it using your supported webOS homebrew or developer installation method, then assign it through a custom remote button mapping.
