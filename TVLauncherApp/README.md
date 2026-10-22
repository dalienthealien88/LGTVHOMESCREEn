# TV Launcher

A separate, custom TV-friendly launcher built as a new app alongside the existing Bazaar and URL Viewer packages.

## Includes

- full-screen app grid
- a horizontally scrolling app carousel with D-pad navigation and centered focus
- automatically adds newly discovered apps to the homepage, including the built-in web browser
- uses each installed app's logo from its on-TV package files
- weather + clock widgets
- bottom-corner settings button with per-app visibility controls
- a shortcut to return to the stock LG Home screen
- discovers apps through the Homebrew Channel service
- remote-friendly D-pad navigation
- TV remote Back button closes settings and returns focus to the selected app
- launches apps through the webOS Application Manager

Installed-app discovery and logo loading use the Homebrew Channel service and require Homebrew root to be enabled. The homepage includes user apps such as Bazaar, URL Viewer, Homebrew Channel, and LG Input Hook; the launcher itself is excluded, and the built-in web browser is included despite being a system app. Newly discovered supported apps are added automatically and can be hidden individually in settings. D-pad navigation moves through the settings controls and app visibility list. Weather is fixed to the Isle of Man. Logos are read through Homebrew because the launcher cannot load files directly from other apps' package folders.

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
