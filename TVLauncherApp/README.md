# TV Launcher

A separate, custom TV-friendly launcher built as a new app alongside the existing Bazaar and URL Viewer packages.

## Includes

- full-screen app grid
- weather + clock widgets
- bottom-right settings drawer
- add/remove apps with local persistence
- remote-friendly D-pad navigation
- app launch support for URLs and webOS app IDs

## Files

- `index.html`
- `styles.css`
- `app.js`
- `appinfo.json`
- `icon.svg`

## Packaging

This is intended as a standalone webOS app package, not a replacement for the stock launcher.

Use LG webOS packaging tools to build an IPK from the `TVLauncherApp` folder and install it with a custom remote button mapping.
