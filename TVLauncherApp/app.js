const STORAGE_KEY = 'tvlauncher.apps.v1';
const HIDDEN_INSTALLED_APPS_KEY = 'tvlauncher.hidden-apps.v1';
const APP_MANAGER_URI = 'luna://com.webos.applicationManager';
const HOMEBREW_SERVICE_URI = 'luna://org.webosbrew.hbchannel.service';
const APP_MANAGER_LIST_APPS_COMMAND = 'luna-send -n 1 luna://com.webos.applicationManager/listApps {}';
const APP_MANAGER_LIST_APPS_METHODS = ['dev/listApps', 'listApps'];
const BROWSER_APP_ID = 'com.webos.app.browser';
const LG_HOME_APP_ID = 'com.webos.app.home';
const LAUNCHER_APP_ID = 'com.lgtv.tvlauncher';
const LEGACY_DEFAULT_APP_IDS = new Set(['youtube', 'netflix', 'spotify', 'settings', 'browser', 'music']);
const appGrid = document.getElementById('launcherGrid');
const appList = document.getElementById('appList');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const openSettingsButton = document.getElementById('openSettings');
const returnHomeButton = document.getElementById('returnHome');
const settingsStatus = document.getElementById('settingsStatus');
const launchStatus = document.getElementById('launchStatus');
const dateText = document.getElementById('dateText');
const timeText = document.getElementById('timeText');
const weatherIcon = document.getElementById('weatherIcon');
const weatherLocation = document.getElementById('weatherLocation');
const weatherTemp = document.getElementById('weatherTemp');

let apps = loadApps();
let selectedIndex = 0;
let settingsOpen = false;
let installedApps = [];
let hiddenInstalledAppIds = loadHiddenInstalledAppIds();

function withLauncherSettings(savedApps) {
  const migratedApps = savedApps
    .filter((app) => (
      app
      && typeof app === 'object'
      && typeof app.id === 'string'
      && !LEGACY_DEFAULT_APP_IDS.has(app.id)
      && app.id !== 'launcher-settings'
    ))
    .map((app) => {
      const savedApp = { ...app };
      delete savedApp.iconUrl;
      return savedApp;
    });

  return migratedApps;
}

function loadApps() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return withLauncherSettings(parsed);
  } catch (error) {
    console.warn('Unable to read saved launcher apps', error);
    return [];
  }
}

function loadHiddenInstalledAppIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HIDDEN_INSTALLED_APPS_KEY) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []);
  } catch (error) {
    console.warn('Unable to read hidden installed apps', error);
    return new Set();
  }
}

function saveHiddenInstalledAppIds() {
  localStorage.setItem(HIDDEN_INSTALLED_APPS_KEY, JSON.stringify([...hiddenInstalledAppIds]));
}

function saveApps() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps.map((app) => {
    const savedApp = { ...app };
    delete savedApp.iconUrl;
    return savedApp;
  })));
}

function installedAppIconPath(app) {
  const validPackagePath = /^\/(?:media\/(?:cryptofs|developer)\/apps|mnt\/otncabi)\/usr\/palm\/applications\/[A-Za-z0-9._-]+$/;
  if (typeof app.folderPath !== 'string'
    || !validPackagePath.test(app.folderPath)
    || !app.folderPath.endsWith(`/${app.id}`)) return '';

  const iconName = [app.extraLargeIcon, app.largeIcon, app.mediumLargeIcon, app.icon]
    .find((name) => typeof name === 'string' && name.trim());
  if (!iconName || iconName.startsWith('/')) return '';

  const iconParts = iconName.split('/');
  if (iconParts.some((part) => !/^[A-Za-z0-9._-]+$/.test(part) || part === '.' || part === '..')) return '';
  return `${app.folderPath}/${iconParts.join('/')}`;
}

function loadInstalledAppIcon(installedApp) {
  if (!installedApp.iconPath || !window.webOS?.service?.request) return;

  try {
    window.webOS.service.request(HOMEBREW_SERVICE_URI, {
      method: 'exec',
      parameters: { command: `base64 '${installedApp.iconPath}'` },
      onSuccess: (response) => {
        const encodedImage = typeof response?.stdoutString === 'string'
          ? response.stdoutString.replace(/\s/g, '')
          : '';
        if (response?.returnValue === false || !/^[A-Za-z0-9+/]+=*$/.test(encodedImage)) {
          console.warn(`Unable to load icon for ${installedApp.name}`, response);
          return;
        }

        const extension = installedApp.iconPath.split('.').pop().toLowerCase();
        const mimeType = extension === 'jpg' || extension === 'jpeg'
          ? 'image/jpeg'
          : extension === 'svg'
            ? 'image/svg+xml'
            : 'image/png';
        installedApp.iconUrl = `data:${mimeType};base64,${encodedImage}`;

        const tile = [...appGrid.querySelectorAll('.app-tile')]
          .find((appTile) => appTile.dataset.appId === installedApp.id);
        if (tile) {
          const iconContainer = tile.querySelector('.app-icon');
          const fallbackIcon = iconContainer.querySelector('span');
          const iconImage = document.createElement('img');
          iconImage.className = 'app-logo';
          iconImage.alt = '';
          iconImage.src = installedApp.iconUrl;
          iconImage.addEventListener('load', () => {
            fallbackIcon.hidden = true;
          });
          iconImage.addEventListener('error', () => {
            iconImage.remove();
          });
          iconContainer.appendChild(iconImage);
        }
      },
      onFailure: (error) => {
        console.warn(`Unable to load icon for ${installedApp.name}`, error);
      }
    });
  } catch (error) {
    console.warn(`Unable to load icon for ${installedApp.name}`, error);
  }
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
    tile.dataset.appId = app.type === 'app' ? app.target : app.id;
    tile.innerHTML = `
      <div class="app-icon"></div>
      <div class="app-name">${escapeHtml(app.name)}</div>
      <div class="app-type">${app.type === 'app' ? 'App' : app.type === 'internal' ? 'Launcher' : 'Link'}</div>
    `;
    const iconContainer = tile.querySelector('.app-icon');
    const fallbackIcon = document.createElement('span');
    fallbackIcon.textContent = app.icon || '◉';
    iconContainer.appendChild(fallbackIcon);

    if (app.iconUrl) {
      const iconImage = document.createElement('img');
      iconImage.className = 'app-logo';
      iconImage.alt = '';
      iconImage.src = app.iconUrl;
      iconImage.addEventListener('load', () => {
        fallbackIcon.hidden = true;
      });
      iconImage.addEventListener('error', () => {
        iconImage.remove();
      });
      iconContainer.appendChild(iconImage);
    }

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
  const focusedAppId = appList.contains(document.activeElement)
    ? document.activeElement.dataset.appId
    : null;
  appList.innerHTML = '';
  const homeApps = [
    ...installedApps.map((app) => ({
      id: app.id,
      name: app.name,
      icon: app.icon,
      isInstalled: true
    })),
    ...apps
      .filter((app) => !installedApps.some((installedApp) => installedApp.id === app.target))
      .map((app) => ({
        id: app.type === 'app' ? app.target : app.id,
        name: app.name,
        icon: app.icon,
        isInstalled: false
      }))
  ];

  homeApps.forEach((app) => {
    const item = document.createElement('div');
    item.className = 'visibility-app';
    const label = document.createElement('label');
    label.className = 'visibility-label';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !hiddenInstalledAppIds.has(app.id);
    checkbox.dataset.appId = app.id;
    checkbox.setAttribute('aria-label', `${app.name} on home screen`);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        hiddenInstalledAppIds.delete(app.id);
      } else {
        hiddenInstalledAppIds.add(app.id);
      }
      saveHiddenInstalledAppIds();
      syncInstalledAppsToHomepage();
      [...appList.querySelectorAll('input[type="checkbox"]')]
        .find((appCheckbox) => appCheckbox.dataset.appId === app.id)
        ?.focus();
    });
    const icon = document.createElement('span');
    icon.className = 'visibility-icon';
    icon.textContent = app.icon || '◉';
    const name = document.createElement('span');
    name.className = 'visibility-name';
    name.textContent = app.name;
    const type = document.createElement('span');
    type.className = 'visibility-type';
    type.textContent = app.isInstalled ? 'Installed' : 'Custom';
    label.append(checkbox, icon, name, type);
    item.appendChild(label);
    appList.appendChild(item);
  });

  if (!homeApps.length) {
    const emptyState = document.createElement('p');
    emptyState.className = 'settings-empty';
    emptyState.textContent = 'No supported apps were found.';
    appList.appendChild(emptyState);
  }

  if (focusedAppId) {
    [...appList.querySelectorAll('input[type="checkbox"]')]
      .find((checkbox) => checkbox.dataset.appId === focusedAppId)
      ?.focus();
  }
}

function syncInstalledAppsToHomepage() {
  const installedIds = new Set(installedApps.map((app) => app.id));
  const customApps = apps.filter((app) => (
    !LEGACY_DEFAULT_APP_IDS.has(app.id)
    && !app.id.startsWith('webos-')
    && !(app.type === 'app' && installedIds.has(app.target))
    && !hiddenInstalledAppIds.has(app.type === 'app' ? app.target : app.id)
  ));
  const installedShortcuts = installedApps
    .filter((app) => !hiddenInstalledAppIds.has(app.id))
    .map((app) => ({
      id: `webos-${app.id}`,
      name: app.name,
      icon: app.icon,
      iconUrl: app.iconUrl,
      target: app.id,
      type: 'app'
    }));

  apps = [...installedShortcuts, ...customApps];
  selectedIndex = Math.max(0, Math.min(selectedIndex, apps.length - 1));
  saveApps();
  renderApps();
}

function loadInstalledApps() {
  settingsStatus.textContent = 'Finding apps on this TV…';

  const setInstalledApps = (availableApps) => {
    installedApps = availableApps
      .filter((app) => app
        && typeof app.id === 'string'
        && app.id
        && app.id !== LAUNCHER_APP_ID
        && (app.systemApp !== true || app.id === BROWSER_APP_ID))
      .map((app) => ({
        id: app.id,
        name: typeof app.title === 'string' && app.title.trim() ? app.title.trim() : app.id,
        icon: typeof app.title === 'string' && app.title.trim() ? app.title.trim().slice(0, 2) : '◉',
        iconPath: installedAppIconPath(app)
      }))
      .sort((first, second) => first.name.localeCompare(second.name));
    if (!installedApps.length) {
      settingsStatus.textContent = 'No supported apps were found on this TV.';
      renderSavedApps();
      return false;
    }

    settingsStatus.textContent = `${installedApps.length} apps found. Toggle apps to show or hide them.`;
    syncInstalledAppsToHomepage();
    installedApps.forEach(loadInstalledAppIcon);
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
      settingsStatus.textContent = failures.length
        ? `Could not read the TV app list (${failures.join('; ')}). Check that Homebrew root access is enabled.`
        : 'The TV returned no installed apps.';
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

function launchApp(app) {
  if (!app) return;

  const target = app.target || '';

  if (app.type === 'app' && target) {
    const handleFailure = (error) => {
      const detail = error?.errorText || error?.message || 'Unknown launch error';
      console.error(`Unable to launch ${app.name} (${target})`, error);
      launchStatus.textContent = `Could not open ${app.name}: ${detail}`;
      launchStatus.classList.add('visible');
    };

    const handleSuccess = () => {
      launchStatus.textContent = `Opening ${app.name}…`;
      launchStatus.classList.add('visible');
      window.setTimeout(() => launchStatus.classList.remove('visible'), 2400);
    };

    try {
      if (window.webOS?.service?.request) {
        window.webOS.service.request(APP_MANAGER_URI, {
          method: 'launch',
          parameters: { id: target },
          onSuccess: handleSuccess,
          onFailure: handleFailure
        });
      } else if (typeof window.PalmServiceBridge === 'function') {
        const bridge = new window.PalmServiceBridge();
        bridge.onservicecallback = (message) => {
          try {
            const response = JSON.parse(message);
            if (response.returnValue === false) {
              handleFailure(response);
            } else {
              handleSuccess(response);
            }
          } catch (error) {
            handleFailure(error);
          }
        };
        bridge.call(`${APP_MANAGER_URI}/launch`, JSON.stringify({ id: target }));
      } else {
        handleFailure(new Error('webOS service bridge is unavailable.'));
      }
    } catch (error) {
      handleFailure(error);
    }
    return;
  }

  if (target.startsWith('http://') || target.startsWith('https://')) {
    window.open(target, '_blank');
    return;
  }

}

function activateApp(app) {
  launchApp(app);
}

function openPanel() {
  settingsOpen = true;
  settingsPanel.classList.remove('hidden');
  loadInstalledApps();
  closeSettings.focus();
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
  const latitude = 54.2361;
  const longitude = -4.5481;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;
  weatherLocation.textContent = 'Isle of Man';

  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`Weather request failed (${response.status})`);
      return response.json();
    })
    .then((data) => {
      if (!data.current || typeof data.current.temperature_2m !== 'number') {
        throw new Error('Weather response did not include current conditions');
      }
      weatherTemp.textContent = `${Math.round(data.current.temperature_2m)}°`;
      weatherIcon.textContent = weatherEmoji(data.current.weather_code);
    })
    .catch((error) => {
      console.warn('Unable to load Isle of Man weather', error);
      weatherTemp.textContent = '--°';
      weatherIcon.textContent = '☁';
    });
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
    backKeyHandled = true;
    closePanel();
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  if (settingsOpen) {
    const controls = [closeSettings, ...appList.querySelectorAll('input[type="checkbox"]'), returnHomeButton];
    const activeIndex = controls.indexOf(document.activeElement);

    if (key === 'ArrowDown' || key === 'ArrowRight') {
      controls[Math.min(activeIndex + 1, controls.length - 1)]?.focus();
      document.activeElement.scrollIntoView?.({ block: 'nearest' });
      event.preventDefault();
    } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
      controls[Math.max(activeIndex - 1, 0)]?.focus();
      document.activeElement.scrollIntoView?.({ block: 'nearest' });
      event.preventDefault();
    } else if ((key === 'Enter' || key === ' ') && document.activeElement.matches('input[type="checkbox"]')) {
      document.activeElement.click();
      event.preventDefault();
    } else if ((key === 'Enter' || key === ' ') && document.activeElement.matches('button')) {
      document.activeElement.click();
      event.preventDefault();
    }
    return;
  }

  const activeElement = document.activeElement;
  if (activeElement === openSettingsButton && key === 'ArrowLeft') {
    focusApp(apps.length - 1);
    event.preventDefault();
    return;
  }

  const currentIndex = activeElement.classList.contains('app-tile')
    ? Number(activeElement.dataset.index)
    : selectedIndex;

  if (key === 'ArrowRight' || key === 'd') {
    if (activeElement.classList.contains('app-tile') && currentIndex === apps.length - 1) {
      openSettingsButton.focus();
    } else {
      focusApp(currentIndex + 1);
    }
    event.preventDefault();
  } else if (key === 'ArrowLeft' || key === 'a') {
    focusApp(currentIndex - 1);
    event.preventDefault();
  } else if (key === 'Enter' || key === ' ') {
    if (activeElement.classList.contains('app-tile')) {
      activateApp(apps[currentIndex]);
      event.preventDefault();
    } else if (activeElement === openSettingsButton) {
      openPanel();
      event.preventDefault();
    } else {
      focusGrid();
    }
  } else if (key === 'm' || key === 'i') {
    openPanel();
    event.preventDefault();
  }
}

let backKeyHandled = false;

closeSettings.addEventListener('click', closePanel);
openSettingsButton.addEventListener('click', openPanel);
returnHomeButton.addEventListener('click', () => {
  launchApp({ name: 'LG Home', target: LG_HOME_APP_ID, type: 'app' });
});
document.addEventListener('keydown', handleKeyNavigation, true);
document.addEventListener('keyup', (event) => {
  const backPressed = event.key === 'Escape'
    || event.key === 'Backspace'
    || event.key === 'Back'
    || event.key === 'BrowserBack'
    || event.key === 'GoBack'
    || event.keyCode === 461
    || event.which === 461;
  if (backKeyHandled || (settingsOpen && backPressed)) {
    backKeyHandled = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);

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
renderApps();
loadInstalledApps();
setInterval(updateClock, 30000);
setInterval(updateWeather, 900000);
