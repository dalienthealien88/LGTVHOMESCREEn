const STORAGE_KEY = 'tvlauncher.apps.v1';
const NETFLIX_APP_ID = 'netflix';
const APP_MANAGER_URI = 'luna://com.webos.applicationManager';
const HOMEBREW_SERVICE_URI = 'luna://org.webosbrew.hbchannel.service';
const APP_MANAGER_LIST_APPS_COMMAND = 'luna-send-pub -n 1 luna://com.webos.applicationManager/dev/listApps {}';
const APP_MANAGER_LIST_APPS_METHODS = ['dev/listApps', 'listApps'];
const DEFAULT_APPS = [
  { id: 'youtube', name: 'YouTube', icon: '▶', target: 'https://www.youtube.com/', type: 'url' },
  { id: 'netflix', name: 'Netflix', icon: 'N', target: NETFLIX_APP_ID, type: 'app' },
  { id: 'spotify', name: 'Spotify', icon: '♫', target: 'https://open.spotify.com/', type: 'url' },
  { id: 'settings', name: 'TV Settings', icon: '⚙', target: 'com.webos.app.settings', type: 'app' },
  { id: 'browser', name: 'Browser', icon: '🌐', target: 'com.webos.app.browser', type: 'app' },
  { id: 'music', name: 'Media', icon: '♪', target: 'com.webos.app.music', type: 'app' },
  { id: 'launcher-settings', name: 'Launcher Settings', icon: '⚙', target: '', type: 'internal' }
];
const appGrid = document.getElementById('launcherGrid');
const appList = document.getElementById('appList');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const addAppForm = document.getElementById('addAppForm');
const installedAppPicker = document.getElementById('installedAppPicker');
const installedAppStatus = document.getElementById('installedAppStatus');
const addInstalledAppButton = document.getElementById('addInstalledApp');
const appNameInput = document.getElementById('appName');
const appIconInput = document.getElementById('appIcon');
const appTargetInput = document.getElementById('appTarget');
const dateText = document.getElementById('dateText');
const timeText = document.getElementById('timeText');
const weatherIcon = document.getElementById('weatherIcon');
const weatherLocation = document.getElementById('weatherLocation');
const weatherTemp = document.getElementById('weatherTemp');
const tvStatus = document.getElementById('tvStatus');
const networkStatus = document.getElementById('networkStatus');
const sunStatus = document.getElementById('sunStatus');

let apps = loadApps();
let selectedIndex = 0;
let settingsOpen = false;
let installedApps = [];

function withLauncherSettings(savedApps) {
  const migratedApps = savedApps.map((app) => (
    app.id === 'settings' && app.name === 'Settings'
      ? { ...app, name: 'TV Settings' }
      : app.id === 'netflix'
        ? { ...app, target: NETFLIX_APP_ID, type: 'app' }
        : app
  ));

  if (!migratedApps.some((app) => app.id === 'launcher-settings')) {
    migratedApps.push({ ...DEFAULT_APPS[DEFAULT_APPS.length - 1] });
  }
  return migratedApps;
}

function loadApps() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_APPS.map((app) => ({ ...app }));

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.length) return DEFAULT_APPS.map((app) => ({ ...app }));
    return withLauncherSettings(parsed);
  } catch (error) {
    return DEFAULT_APPS.map((app) => ({ ...app }));
  }
}

function saveApps() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function renderApps() {
  appGrid.innerHTML = '';

  apps.forEach((app, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'app-tile';
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-label', app.name);
    tile.dataset.index = String(index);
    tile.innerHTML = `
      <div class="app-icon">${app.icon || '◉'}</div>
      <div class="app-name">${escapeHtml(app.name)}</div>
      <div class="app-type">${app.type === 'app' ? 'App' : app.type === 'internal' ? 'Launcher' : 'Link'}</div>
    `;

    if (index === selectedIndex) {
      tile.classList.add('active');
    }

    tile.addEventListener('click', () => {
      selectedIndex = index;
      renderApps();
      activateApp(apps[index]);
    });
    tile.addEventListener('focus', () => {
      selectedIndex = index;
      appGrid.querySelectorAll('.app-tile').forEach((focusedTile, tileIndex) => {
        focusedTile.classList.toggle('active', tileIndex === index);
      });
    });

    appGrid.appendChild(tile);
  });

  renderSavedApps();
}

function renderSavedApps() {
  appList.innerHTML = '';

  apps.forEach((app, index) => {
    const item = document.createElement('div');
    item.className = 'saved-app';
    item.innerHTML = `
      <div class="saved-app-name">
        <span class="saved-app-icon">${app.icon || '◉'}</span>
        <span>${escapeHtml(app.name)}</span>
      </div>
      <button class="remove-app" type="button">Remove</button>
    `;

    item.querySelector('.remove-app').addEventListener('click', () => removeApp(index));
    appList.appendChild(item);
  });
}

function addApp(event) {
  event.preventDefault();

  const name = appNameInput.value.trim();
  const icon = (appIconInput.value || '◉').trim() || '◉';
  const target = appTargetInput.value.trim();
  const type = document.querySelector('input[name="launchType"]:checked')?.value || 'url';

  if (!name || !target) return;

  apps.push({
    id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    name,
    icon: icon.slice(0, 2),
    target,
    type
  });

  selectedIndex = apps.length - 1;
  saveApps();
  renderApps();
  addAppForm.reset();
  appIconInput.value = '▶';
  document.querySelector('input[name="launchType"][value="url"]').checked = true;
  closePanel();
}

function addInstalledApp() {
  const selectedApp = installedApps.find((app) => app.id === installedAppPicker.value);
  if (!selectedApp) return;

  if (apps.some((app) => app.type === 'app' && app.target === selectedApp.id)) {
    installedAppStatus.textContent = `${selectedApp.name} is already in your launcher.`;
    return;
  }

  apps.push({
    id: `webos-${selectedApp.id}`,
    name: selectedApp.name,
    icon: selectedApp.icon,
    target: selectedApp.id,
    type: 'app'
  });
  selectedIndex = apps.length - 1;
  saveApps();
  renderApps();
  installedAppStatus.textContent = `${selectedApp.name} added to your launcher.`;
}

function loadInstalledApps() {
  installedAppPicker.replaceChildren(new Option('Loading installed apps...', ''));
  addInstalledAppButton.disabled = true;
  installedAppStatus.textContent = 'Finding installed apps...';

  const setInstalledApps = (availableApps) => {
    installedApps = availableApps
      .filter((app) => app
        && typeof app.id === 'string'
        && app.id
        && app.systemApp !== true
        && app.id !== 'com.lgtv.tvlauncher')
      .map((app) => ({
        id: app.id,
        name: typeof app.title === 'string' && app.title.trim() ? app.title.trim() : app.id,
        icon: typeof app.title === 'string' && app.title.trim() ? app.title.trim().slice(0, 2) : '◉'
      }))
      .sort((first, second) => first.name.localeCompare(second.name));
    installedAppPicker.replaceChildren();
    if (!installedApps.length) {
      installedAppPicker.add(new Option('No installed apps found', ''));
      return false;
    }

    installedAppPicker.add(new Option('Choose an app...', ''));
    installedApps.forEach((app) => {
      installedAppPicker.add(new Option(`${app.name} (${app.id})`, app.id));
    });
    installedAppStatus.textContent = `${installedApps.length} installed apps found.`;
    return true;
  };

  const formatError = (error) => {
    if (typeof error === 'string') return error;
    if (error?.errorText) return error.errorText;
    if (error?.message) return error.message;
    if (error?.errorCode !== undefined) return `error ${error.errorCode}`;
    return 'app list unavailable';
  };

  const failures = [];

  const handleAppListResponse = (response) => {
    if (response?.returnValue === false || !Array.isArray(response?.apps)) {
      failures.push(`app manager: ${formatError(response || 'unexpected app list response')}`);
      return false;
    }
    return setInstalledApps(response.apps);
  };

  const tryMethod = (index) => {
    if (index >= APP_MANAGER_LIST_APPS_METHODS.length) {
      console.warn('Unable to list installed webOS apps', failures);
      installedAppPicker.replaceChildren(new Option('Installed app list unavailable', ''));
      installedAppStatus.textContent = failures.length
        ? `Could not read the TV app list (${failures.join('; ')}). You can still add an app ID below.`
        : 'The TV returned no installed apps. You can still add an app ID below.';
      return;
    }

    const method = APP_MANAGER_LIST_APPS_METHODS[index];
    const handleFailure = (error) => {
      failures.push(`${method}: ${formatError(error)}`);
      tryMethod(index + 1);
    };
    const handleSuccess = (response) => {
      if (!handleAppListResponse(response)) {
        failures.push(`${method}: returned no usable apps`);
        tryMethod(index + 1);
      }
    };

    if (window.webOS?.service?.request) {
      try {
        window.webOS.service.request(APP_MANAGER_URI, {
          method,
          parameters: {},
          onSuccess: handleSuccess,
          onFailure: handleFailure
        });
      } catch (error) {
        handleFailure(error);
      }
      return;
    }

    if (typeof window.PalmServiceBridge === 'function') {
      try {
        const bridge = new window.PalmServiceBridge();
        bridge.onservicecallback = (message) => {
          try {
            handleSuccess(JSON.parse(message));
          } catch (error) {
            handleFailure(error);
          }
        };
        bridge.call(`${APP_MANAGER_URI}/${method}`, JSON.stringify({}));
      } catch (error) {
        handleFailure(error);
      }
      return;
    }

    handleFailure(new Error('webOS Luna service bridge is unavailable.'));
  };

  const tryHomebrewService = () => {
    if (!window.webOS?.service?.request) {
      tryMethod(0);
      return;
    }

    try {
      window.webOS.service.request(HOMEBREW_SERVICE_URI, {
        method: 'exec',
        parameters: { command: APP_MANAGER_LIST_APPS_COMMAND },
        onSuccess: (response) => {
          if (response?.returnValue === false || typeof response?.stdoutString !== 'string') {
            failures.push(`Homebrew service: ${formatError(response || 'no command output')}`);
            tryMethod(0);
            return;
          }

          try {
            const appList = JSON.parse(response.stdoutString);
            if (!handleAppListResponse(appList)) {
              failures.push('Homebrew service: returned no usable apps');
              tryMethod(0);
            }
          } catch (error) {
            failures.push(`Homebrew service: ${formatError(error)}`);
            tryMethod(0);
          }
        },
        onFailure: (error) => {
          failures.push(`Homebrew service: ${formatError(error)}`);
          tryMethod(0);
        }
      });
    } catch (error) {
      failures.push(`Homebrew service: ${formatError(error)}`);
      tryMethod(0);
    }
  };

  tryHomebrewService();
}

function removeApp(index) {
  if (apps.length <= 1) return;

  apps.splice(index, 1);
  if (selectedIndex >= apps.length) selectedIndex = Math.max(apps.length - 1, 0);

  saveApps();
  renderApps();
}

function launchApp(app) {
  if (!app) return;

  const target = app.target || '';

  if (app.type === 'app' && target) {
    try {
      if (window.PalmSystem) {
        window.location.href = `luna://com.webos.applicationManager/launch?appId=${encodeURIComponent(target)}`;
        return;
      }
    } catch (error) {
      console.warn('Launch failed', error);
    }
  }

  if (target.startsWith('http://') || target.startsWith('https://')) {
    window.open(target, '_blank');
    return;
  }

  tvStatus.textContent = `Opened: ${app.name}`;
}

function activateApp(app) {
  if (app?.id === 'launcher-settings') {
    openPanel();
    return;
  }
  launchApp(app);
}

function openPanel() {
  settingsOpen = true;
  settingsPanel.classList.remove('hidden');
  loadInstalledApps();
  installedAppPicker.focus();
}

function closePanel() {
  settingsOpen = false;
  settingsPanel.classList.add('hidden');
  focusGrid();
}

function focusGrid() {
  focusApp(selectedIndex);
}

function focusApp(index) {
  selectedIndex = Math.max(0, Math.min(index, apps.length - 1));
  const tiles = [...appGrid.querySelectorAll('.app-tile')];
  tiles.forEach((tile, tileIndex) => {
    tile.classList.toggle('active', tileIndex === selectedIndex);
  });
  const target = tiles[selectedIndex];
  if (target) {
    target.focus();
    const gridBounds = appGrid.getBoundingClientRect();
    const tileBounds = target.getBoundingClientRect();
    appGrid.scrollLeft += tileBounds.left - gridBounds.left - (gridBounds.width - tileBounds.width) / 2;
  }
}

function updateClock() {
  const now = new Date();
  dateText.textContent = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  timeText.textContent = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function updateWeather() {
  if (!navigator.geolocation) {
    weatherLocation.textContent = 'Default';
    weatherTemp.textContent = '19°';
    weatherIcon.textContent = '☀️';
    sunStatus.textContent = '06:30 / 19:45';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto&forecast_days=1`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const current = data.current;
        const temp = Math.round(current?.temperature_2m ?? 20);
        const weatherCode = current?.weather_code ?? 0;

        weatherLocation.textContent = data.timezone?.split('/').slice(-1)[0] || 'Local';
        weatherTemp.textContent = `${temp}°`;
        weatherIcon.textContent = weatherEmoji(weatherCode);

        if (data.daily && data.daily.sunrise && data.daily.sunset) {
          const sunrise = new Date(data.daily.sunrise[0]);
          const sunset = new Date(data.daily.sunset[0]);
          sunStatus.textContent = `${sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} / ${sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
      } catch (error) {
        weatherLocation.textContent = 'Weather';
        weatherTemp.textContent = '--°';
        weatherIcon.textContent = '☁️';
        sunStatus.textContent = '--:-- / --:--';
      }
    },
    () => {
      weatherLocation.textContent = 'Default';
      weatherTemp.textContent = '19°';
      weatherIcon.textContent = '☀️';
      sunStatus.textContent = '06:30 / 19:45';
    },
    { enableHighAccuracy: false, timeout: 8000 }
  );
}

function weatherEmoji(code) {
  switch (code) {
    case 0: return '☀️';
    case 1:
    case 2:
    case 3: return '⛅';
    case 45:
    case 48: return '🌫️';
    case 51:
    case 53:
    case 55:
    case 56:
    case 57: return '🌦️';
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82: return '🌧️';
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86: return '❄️';
    case 95:
    case 96:
    case 99: return '⛈️';
    default: return '☀️';
  }
}

function updateNetworkStatus() {
  const online = navigator.onLine;
  networkStatus.textContent = online ? 'Online' : 'Offline';
  tvStatus.textContent = online ? 'Ready' : 'Limited';
}

function handleKeyNavigation(event) {
  const key = event.key;
  const backPressed = key === 'Escape'
    || key === 'Backspace'
    || key === 'Back'
    || key === 'BrowserBack'
    || key === 'GoBack'
    || event.keyCode === 461
    || event.which === 461;

  if (settingsOpen && backPressed) {
    closePanel();
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (settingsOpen) return;

  const activeElement = document.activeElement;
  const currentIndex = activeElement.classList.contains('app-tile')
    ? Number(activeElement.dataset.index)
    : selectedIndex;

  if (key === 'ArrowRight' || key === 'd') {
    focusApp(currentIndex + 1);
    event.preventDefault();
  } else if (key === 'ArrowLeft' || key === 'a') {
    focusApp(currentIndex - 1);
    event.preventDefault();
  } else if (key === 'Enter' || key === ' ') {
    if (activeElement.classList.contains('app-tile')) {
      activateApp(apps[currentIndex]);
      event.preventDefault();
    } else {
      focusGrid();
    }
  } else if (key === 'm' || key === 'i') {
    openPanel();
    event.preventDefault();
  }
}

closeSettings.addEventListener('click', closePanel);
addInstalledAppButton.addEventListener('click', addInstalledApp);
installedAppPicker.addEventListener('change', () => {
  addInstalledAppButton.disabled = !installedAppPicker.value;
});
addAppForm.addEventListener('submit', addApp);
document.addEventListener('keydown', handleKeyNavigation, true);
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

updateClock();
updateWeather();
updateNetworkStatus();
renderApps();
setInterval(updateClock, 30000);
setInterval(updateWeather, 900000);
