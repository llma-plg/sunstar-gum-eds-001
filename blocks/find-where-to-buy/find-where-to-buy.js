const PIN_SVG = '<svg class="gum-stores-pin-icon" width="24" height="24" viewBox="0 0 24 24" fill="#009257"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>';

const PHONE_SVG = '<svg class="gum-store-meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="#6b7280"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';

const CLOCK_SVG = '<svg class="gum-store-meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="#6b7280"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm.5 11H7v-1h4.5V7h1v6z"/></svg>';

const DIRECTIONS_SVG = '<svg class="gum-store-btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M21.71 11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9c.39-.38.39-1.01 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/></svg>';

const SAMPLE_DATA = [
  {
    name: 'Walgreens', address: '1234 Market St', city: 'San Francisco', state: 'CA', zip: '94103', phone: '(415) 863-1136', hours: 'Open until 10:00 PM', distance: '0.3 mi',
  },
  {
    name: 'CVS Pharmacy', address: '789 Mission St', city: 'San Francisco', state: 'CA', zip: '94105', phone: '(415) 442-4406', hours: 'Open until 9:00 PM', distance: '0.7 mi',
  },
  {
    name: 'Target', address: '789 Mission St Ste 100', city: 'San Francisco', state: 'CA', zip: '94103', phone: '(415) 343-6272', hours: 'Open until 10:00 PM', distance: '0.9 mi',
  },
  {
    name: 'Walgreens', address: '3201 Divisadero St', city: 'San Francisco', state: 'CA', zip: '94123', phone: '(415) 931-6415', hours: 'Open until 10:00 PM', distance: '1.2 mi',
  },
];

function createStoreCard(store, bridge) {
  const card = document.createElement('div');
  card.className = 'gum-store-card';

  const top = document.createElement('div');
  top.className = 'gum-store-top';

  const name = document.createElement('h3');
  name.className = 'gum-store-name';
  name.textContent = store.name;

  const distance = document.createElement('span');
  distance.className = 'gum-store-distance';
  distance.textContent = store.distance;

  top.appendChild(name);
  top.appendChild(distance);

  const address = document.createElement('p');
  address.className = 'gum-store-address';
  address.textContent = `${store.address}, ${store.city}, ${store.state} ${store.zip}`;

  const meta = document.createElement('div');
  meta.className = 'gum-store-meta';

  const phoneRow = document.createElement('div');
  phoneRow.className = 'gum-store-meta-row';
  phoneRow.innerHTML = `${PHONE_SVG} ${store.phone}`;

  const hoursRow = document.createElement('div');
  hoursRow.className = 'gum-store-meta-row';
  hoursRow.innerHTML = `${CLOCK_SVG} ${store.hours}`;

  meta.appendChild(phoneRow);
  meta.appendChild(hoursRow);

  const actions = document.createElement('div');
  actions.className = 'gum-store-actions';

  const directionsUrl = store.directionsUrl
    || `https://maps.google.com/?q=${encodeURIComponent(`${store.address}, ${store.city}, ${store.state} ${store.zip}`)}`;

  const directionsBtn = document.createElement('a');
  directionsBtn.className = 'gum-store-btn';
  directionsBtn.innerHTML = `${DIRECTIONS_SVG} Get Directions`;
  directionsBtn.href = directionsUrl;
  directionsBtn.rel = 'noopener noreferrer';

  if (bridge) {
    directionsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      bridge.openLink(directionsUrl);
    });
  } else {
    directionsBtn.target = '_blank';
  }

  const callBtn = document.createElement('a');
  callBtn.className = 'gum-store-btn-outline';
  callBtn.textContent = 'Call Store';
  callBtn.href = `tel:${store.phone.replace(/[^0-9+]/g, '')}`;

  if (bridge) {
    callBtn.addEventListener('click', (e) => {
      e.preventDefault();
      bridge.openLink(`tel:${store.phone.replace(/[^0-9+]/g, '')}`);
    });
  }

  actions.appendChild(directionsBtn);
  actions.appendChild(callBtn);

  card.appendChild(top);
  card.appendChild(address);
  card.appendChild(meta);
  card.appendChild(actions);

  return card;
}

export default async function decorate(block, bridge) {
  block.textContent = '';

  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.textContent = 'Finding nearby stores…';
  block.appendChild(loading);

  let stores;
  let location = 'your area';

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      stores = SAMPLE_DATA;
      location = 'San Francisco, CA';
    } else {
      try {
        const result = await bridge.toolResult;
        const sc = result?.structuredContent || result;
        stores = sc?.stores || [];
        location = sc?.searchArea || 'your area';
      } catch (e) {
        console.warn('[find-where-to-buy] Could not get tool data', e);
      }
    }
  } else {
    stores = SAMPLE_DATA;
    location = 'San Francisco, CA';
  }

  if (!stores || stores.length === 0) {
    block.textContent = '';
    block.innerHTML = '<p class="gum-stores-empty">No stores found nearby.</p>';
    return;
  }

  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'gum-stores-wrapper';

  const header = document.createElement('div');
  header.className = 'gum-stores-header';
  header.innerHTML = PIN_SVG;

  const title = document.createElement('h2');
  title.className = 'gum-stores-title';
  title.textContent = `Stores near ${location}`;

  const count = document.createElement('span');
  count.className = 'gum-stores-count';
  count.textContent = `${stores.length} locations`;

  header.appendChild(title);
  header.appendChild(count);
  wrapper.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'gum-stores-grid';

  stores.forEach((store) => {
    grid.appendChild(createStoreCard(store, bridge));
  });

  wrapper.appendChild(grid);
  block.appendChild(wrapper);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}
