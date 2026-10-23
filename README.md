# LG webOS homebrew apps

## The Bazaar

A remote-friendly webOS home screen for The Bazaar, with shortcuts to Home, Library, Live TV, Games, Watchlist, Favourites, History, Search, New episodes, Release calendar, Collections, Friends, Watch together, Game stats, Chat, and Inbox. Each shortcut opens the matching section in The Bazaar on the server's own origin, using its compatibility-mode routes where available. The Sign in link opens The Bazaar's own login page; the app does not store credentials.

## Install or update

In Homebrew Channel, refresh the repository and choose Update for The Bazaar (app ID `com.homeframe.launcher`). Choose Sign in in the top bar to open The Bazaar's login page. Use the remote arrows to choose a section and OK to open it; Back returns to the client home. The repository URL is:

`https://raw.githubusercontent.com/dalienthealien88/LGTVHOMESCREEn/main/repo.json`

The app opens The Bazaar's own login page and website for browsing and playback; its server rejects cross-origin login submissions, so sign-in stays on the server's origin. The NAS page uses HTTP, so sign in only on a trusted home network.

## URL Viewer

URL Viewer lets you enter and open a website address on the TV. **Open** loads it directly; **Try embedded** keeps app controls available, though some sites block embedded viewing. Choose **Save as default** to prefill that page next time, or **Clear default** to remove it. It remembers the last opened address when no default is set. The app does not save passwords; sites may keep their own sign-in session if webOS preserves their cookies.

In Homebrew Channel, refresh the repository and install **URL Viewer** (app ID `com.lgtv.urlviewer`). The repository URL is:

`https://raw.githubusercontent.com/dalienthealien88/LGTVHOMESCREEn/main/repo.json`

## TV Launcher

In Homebrew Channel, refresh the same repository and install **TV Launcher** (app ID `com.lgtv.tvlauncher`). After installing, assign the app using your TV's custom remote button mapping; it does not replace the stock launcher.
