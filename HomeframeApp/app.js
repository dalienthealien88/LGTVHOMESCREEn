const BAZAAR_ORIGIN = 'http://thebazaar.duckdns.org:9999';
const GRID_COLUMNS = 4;
const DESTINATIONS = [
  { label: 'Home', description: 'For you and continue watching', icon: '⌂', view: 'home', params: { overview: '1' } },
  { label: 'Library', description: 'Browse films and shows', icon: '▤', view: 'library' },
  { label: 'Live TV', description: 'Channels and programme guide', icon: '◉', view: 'live' },
  { label: 'Games', description: 'Play your game collection', icon: '✦', path: '/games', fullInterface: true },
  { label: 'Watchlist', description: 'Your saved films and shows', icon: '♡', view: 'watchlist' },
  { label: 'Favourites', description: 'Your favourite picks', icon: '♥', view: 'favourites' },
  { label: 'History', description: 'Pick up where you left off', icon: '◷', view: 'history' },
  { label: 'Search', description: 'Find something to watch', icon: '⌕', view: 'search' },
  { label: 'New episodes', description: 'Recently added to your shows', icon: '✧', view: 'arrivals', params: { scope: 'following' } },
  { label: 'Release calendar', description: 'See what is coming up', icon: '▦', view: 'calendar' },
  { label: 'My collections', description: 'Browse your saved collections', icon: '▧', view: 'lists' },
  { label: 'Friends', description: 'See your friends and activity', icon: '♧', view: 'friends' },
  { label: 'Watch together', description: 'Watch with your people', icon: '◎', view: 'cinema' },
  { label: 'Game stats', description: 'Your play time and sessions', icon: '◴', path: '/home/stats', fullInterface: true },
  { label: 'Chat', description: 'Open your conversations', icon: '▱', view: 'chat' },
  { label: 'Inbox', description: 'Messages and notifications', icon: '✉', view: 'inbox' }
];

const destinationGrid = document.getElementById('destinationGrid');
const openBazaarButton = document.getElementById('openBazaar');
const connectionStatus = document.getElementById('connectionStatus');
const launchStatus = document.getElementById('launchStatus');
const openSignInButton = document.getElementById('openSignIn');
let launchPending = false;

function bazaarUrl(destination) {
  const url = new URL(destination.path || '/', BAZAAR_ORIGIN);
  if (destination.fullInterface) {
    url.searchParams.set('compat', 'off');
  } else {
    url.searchParams.set('compat', 'on');
    url.searchParams.set('view', destination.view);
    Object.entries(destination.params || {}).forEach(([key, value]) => url.searchParams.set(key, value));
  }
  return url.toString();
}

function openDestination(destination) {
  if (launchPending) return;
  if (!navigator.onLine) {
    launchStatus.textContent = 'Connect your TV to the network to open The Bazaar.';
    launchStatus.classList.add('visible');
    return;
  }
  launchPending = true;
  launchStatus.textContent = 'Opening The Bazaar…';
  launchStatus.classList.add('visible');
  window.location.href = bazaarUrl(destination);
}

function renderDestinations() {
  DESTINATIONS.forEach((destination, index) => {
    const link = document.createElement('a');
    link.className = 'destination-card';
    link.href = bazaarUrl(destination);
    link.dataset.index = String(index);
    link.setAttribute('aria-label', `${destination.label}. ${destination.description}`);

    const icon = document.createElement('span');
    icon.className = 'destination-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = destination.icon;

    const title = document.createElement('span');
    title.className = 'destination-title';
    title.textContent = destination.label;

    const description = document.createElement('span');
    description.className = 'destination-description';
    description.textContent = destination.description;

    link.append(icon, title, description);
    link.addEventListener('click', (event) => {
      if (!navigator.onLine) {
        event.preventDefault();
        launchStatus.textContent = 'Connect your TV to the network to open The Bazaar.';
        launchStatus.classList.add('visible');
      }
    });
    destinationGrid.appendChild(link);
  });
}

function updateConnectionStatus() {
  const online = navigator.onLine;
  connectionStatus.classList.toggle('offline', !online);
  connectionStatus.replaceChildren();
  const dot = document.createElement('span');
  dot.className = 'status-dot';
  connectionStatus.append(dot, document.createTextNode(online ? 'Ready to connect' : 'Offline'));
}

function updateClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function handleRemoteKeys(event) {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const buttons = Array.from(document.querySelectorAll('.sign-in-toggle, #openBazaar, .destination-card'));
  const current = buttons.indexOf(document.activeElement);
  if (current < 0) return;

  let next = current;
  if (current === 0) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = 1;
    else return;
  } else if (current === 1) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = 0;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = 2;
    else return;
  } else {
    const column = (current - 2) % GRID_COLUMNS;
    switch (event.key) {
      case 'ArrowRight':
        next = column < GRID_COLUMNS - 1 && current + 1 < buttons.length ? current + 1 : current;
        break;
      case 'ArrowLeft':
        next = column === 0 ? current : current - 1;
        break;
      case 'ArrowDown':
        next = current + GRID_COLUMNS < buttons.length ? current + GRID_COLUMNS : current;
        break;
      case 'ArrowUp':
        next = current <= GRID_COLUMNS + 1 ? 1 : current - GRID_COLUMNS;
        break;
      default:
        return;
    }
  }
  event.preventDefault();
  buttons[next].focus();
}

openBazaarButton.addEventListener('click', () => openDestination(DESTINATIONS[0]));
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
document.addEventListener('keydown', handleRemoteKeys);

renderDestinations();
openSignInButton.focus();
updateConnectionStatus();
updateClock();
setInterval(updateClock, 30000);
