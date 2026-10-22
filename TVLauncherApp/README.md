# TV Launcher

A separate, custom TV-friendly launcher built as a new app alongside the existing Bazaar and URL Viewer packages.

## Includes

- full-screen app grid
- a horizontally scrolling app carousel with D-pad navigation and centered focus
- automatically fills the homepage with installed non-system apps
- weather + clock widgets
- launcher settings tile in the app grid
- add/remove apps with local persistence
- select non-system apps from the TV's webOS Application Manager app list through the Homebrew Channel service, with direct API fallbacks
- add custom URLs or webOS app IDs
- remote-friendly D-pad navigation
- D-pad navigation through the app carousel and launcher settings
- TV remote Back button closes launcher settings and returns focus to the selected app
- app launch support for URLs and webOS app IDs

Installed-app discovery uses the Homebrew Channel service and requires Homebrew root to be enabled. The homepage and picker exclude system apps and the launcher itself; upgrading removes the previous demo URL shortcuts and fills the homepage with detected apps. Removing an installed app hides it from the homepage until it is added again in settings. Adding an app by ID remains available without discovery.

## Files

- `index.html`
- `styles.css`
- `app.js`
- `appinfo.json`
- `icon.png`
- `webOSTV.js` (webOS service bridge library)
- `WEBOSTV-LICENSE.txt`

## Packaging

Run `node TVLauncherApp/build-ipk.cjs` from the repository root to create `TVLauncher.ipk` and update its SHA-256 hash in `tvlauncher.manifest.json`. The package is a standalone webOS app, not a replacement for the stock launcher. Install it using your supported webOS homebrew or developer installation method, then assign it through a custom remote button mapping.
