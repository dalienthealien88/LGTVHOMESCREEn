# Homeframe custom launcher

This app is a custom LG webOS-style launcher designed for a TV remote. It includes:

- full-screen, remote-friendly app grid
- settings menu anchored in the bottom-right
- add/remove app shortcuts with local storage persistence
- clock and date widget
- weather widget using the browser location and Open-Meteo
- quick network/TV status and sunrise/sunset info
- keyboard and D-pad-friendly navigation

## Files

- `index.html` — app structure
- `styles.css` — full-screen launcher styling
- `app.js` — clock, weather, launcher logic, remote navigation, persistent apps
- `appinfo.json` — metadata for webOS packaging
- `icon.svg` — launcher icon

## Usage

Open `index.html` in a browser for local testing, or package it as a webOS app and assign the custom button mapping you mentioned for direct launch.

## Remote behavior

- Arrow keys / D-pad: move focus
- OK / Enter: launch the focused app
- Settings button or `M` key: open settings
- Escape / Back: close settings

## Notes

- App links work best when the target is a URL.
- App IDs can be used for webOS app launches when supported by your environment.
- Weather is fetched anonymously from Open-Meteo and uses browser geolocation if available.
