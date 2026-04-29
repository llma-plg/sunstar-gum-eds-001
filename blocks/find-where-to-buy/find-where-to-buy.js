const CART_SVG = '<svg class="gum-retailer-type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';

const STORE_SVG = '<svg class="gum-retailer-type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';

const PIN_SVG = '<svg class="gum-wtb-pin-icon" viewBox="0 0 24 24" fill="#009257"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>';

const SAMPLE_DATA = [
  { name: 'Amazon', type: 'online', url: 'https://www.amazon.com/stores/Sunstar/page/D0BAAE16-0B5A-4D8D-A955-ACA08C2FCA2F' },
  { name: 'Walmart', type: 'online', url: 'https://www.walmart.com/brand/gum/10000242' },
  { name: 'Costco', type: 'online', url: 'https://www.costco.com/CatalogSearch?dept=All&keyword=gum%20oral%20care' },
  { name: 'Walgreens', type: 'both', url: 'https://www.walgreens.com/store/c/productlist/N=360523-301733' },
  { name: 'CVS', type: 'both', url: 'https://www.cvs.com/shop/brand-shop/g/gum' },
  { name: 'Kroger', type: 'both', url: 'https://www.kroger.com/pl/oral-care/21003?brandName=GUM&fulfillment=all' },
];

function typeLabel(type) {
  if (type === 'online') return 'Online';
  if (type === 'both') return 'In-Store & Online';
  return 'In-Store';
}

function typeIcon(type) {
  return type === 'online' ? CART_SVG : STORE_SVG;
}

function createRetailerCard(retailer, bridge) {
  const card = document.createElement('div');
  card.className = 'gum-retailer-card';

  const top = document.createElement('div');
  top.className = 'gum-retailer-top';

  const name = document.createElement('h3');
  name.className = 'gum-retailer-name';
  name.textContent = retailer.name;

  const badge = document.createElement('span');
  badge.className = `gum-retailer-badge gum-retailer-badge--${retailer.type === 'online' ? 'online' : 'both'}`;
  const iconSpan = document.createElement('span');
  iconSpan.className = 'gum-badge-icon';
  iconSpan.innerHTML = typeIcon(retailer.type);
  badge.appendChild(iconSpan);
  const badgeText = document.createElement('span');
  badgeText.textContent = typeLabel(retailer.type);
  badge.appendChild(badgeText);

  top.appendChild(name);
  top.appendChild(badge);

  const actions = document.createElement('div');
  actions.className = 'gum-retailer-actions';

  const cta = document.createElement('a');
  cta.className = 'gum-store-btn';
  cta.textContent = 'Shop Now';
  cta.href = retailer.url;
  cta.target = '_blank';
  cta.rel = 'noopener noreferrer';

  if (bridge) {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      bridge.openLink(retailer.url);
    });
  }

  actions.appendChild(cta);

  card.appendChild(top);
  card.appendChild(actions);

  return card;
}

export default async function decorate(block, bridge) {
  let retailers;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      retailers = SAMPLE_DATA;
    } else {
      const { structuredContent } = await bridge.toolResult;
      retailers = structuredContent?.items || [];
    }
  } else {
    retailers = SAMPLE_DATA;
  }

  block.textContent = '';

  if (!retailers || retailers.length === 0) {
    block.innerHTML = '<p class="gum-wtb-empty">No retailers found.</p>';
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'gum-wtb-wrapper';

  // Header
  const header = document.createElement('div');
  header.className = 'gum-wtb-header';
  header.innerHTML = PIN_SVG;

  const title = document.createElement('h2');
  title.className = 'gum-wtb-title';
  title.textContent = 'Where to Buy GUM Products';

  const count = document.createElement('span');
  count.className = 'gum-wtb-count';
  count.textContent = `${retailers.length} retailers`;

  header.appendChild(title);
  header.appendChild(count);
  wrapper.appendChild(header);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'gum-wtb-grid';

  retailers.forEach((retailer) => {
    grid.appendChild(createRetailerCard(retailer, bridge));
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
