# Homeframe for webOS TV

A standalone immersive TV home for LG webOS TV (version 2.0.1). It places The Bazaar compatibility interface at the center, with live TV, IPTV, radio, EPG, watchlist, release calendar, new episodes, library browsing, and a native app dock. It does not replace LG Home.

## Install from Homebrew Channel

In Homebrew Channel, add this repository URL:

`https://raw.githubusercontent.com/dalienthealien88/LGTVHOMESCREEn/main/repo.json`

Open the Homeframe listing and choose Install. Homebrew Channel downloads the IPK from this repository and checks the SHA-256 value in the manifest.

## Files

- `Homeframe.ipk` — installable app package
- `homeframe.manifest.json` — Homebrew package metadata and package checksum
- `repo.json` — one-app Homebrew repository index
- `icon.png` — app/repository icon
- `Homeframe-source.zip` — editable app source

## Use

After installation, launch Homeframe from the TV app launcher. Sign into The Bazaar on the TV if asked; the desktop browser session is not shared. Netflix, Prime Video, YouTube, Disney+, and Live TV shortcuts use webOS app IDs that can be changed in Apps.

The supplied Bazaar address uses HTTP. Do not enter a password over an untrusted network; configure HTTPS before using credentials over the public internet. Version 2.0.1 removes JavaScript and DOM features that older webOS TV browsers may not support. Verify launch and remote control on the target TV. Home-screen takeover is not included.


