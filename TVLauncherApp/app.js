const STORAGE_KEY = 'tvlauncher.apps.v1';
const NETFLIX_APP_ID = 'netflix';
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
  appNameInput.focus();
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

  if (settingsOpen && (key === 'Escape' || key === 'Backspace')) {
    closePanel();
    event.preventDefault();
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
addAppForm.addEventListener('submit', addApp);
document.addEventListener('keydown', handleKeyNavigation);
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
