// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Amazon', type: 'online', url: 'https://www.amazon.com/stores/Sunstar/page/D0BAAE16-0B5A-4D8D-A955-ACA08C2FCA2F' },
  { name: 'Walmart', type: 'online', url: 'https://www.walmart.com/brand/gum/10000242' },
  { name: 'Costco', type: 'online', url: 'https://www.costco.com/CatalogSearch?dept=All&keyword=gum%20oral%20care' },
  { name: 'Walgreens', type: 'both', url: 'https://www.walgreens.com/store/c/productlist/N=360523-301733' },
  { name: 'CVS', type: 'both', url: 'https://www.cvs.com/shop/brand-shop/g/gum' },
  { name: 'Kroger', type: 'both', url: 'https://www.kroger.com/pl/oral-care/21003?brandName=GUM&fulfillment=all' },
  { name: 'Albertsons', type: 'both', url: 'https://www.albertsons.com/shop/aisles/personal-care-health/oral-hygiene.html?brand=GUM' },
  { name: 'Safeway', type: 'both', url: 'https://www.safeway.com/shop/search-results.html?q=gum%20brand&brand=GUM' },
  { name: 'Meijer', type: 'both', url: 'https://www.meijer.com/shopping/departments/beauty-personal-care/oral-care/dental-floss-picks.html?brand=Gum' },
  { name: 'H-E-B', type: 'both', url: 'https://www.heb.com/category/shop/health-beauty/oral-hygiene/floss/490096/490422?filter=brand%3AGUM' },
  { name: 'Publix', type: 'both', url: 'https://www.publix.com/c/oral-care/88b324c1-9ab6-42a1-aa5a-d7b7edf2f664?facet=facetNationalBrands%3A%3AGUM' },
  { name: 'Jewel-Osco', type: 'both', url: 'https://www.jewelosco.com/shop/aisles/personal-care-health/oral-hygiene.html?brand=GUM' },
];

/**
 * Returns a short, human-readable label for a retailer type.
 * @param {string} type - 'online', 'both', or 'physical'
 * @returns {string}
 */
function typeLabel(type) {
  if (type === 'online') return 'Online';
  if (type === 'both') return 'In-Store & Online';
  return 'In-Store';
}

/**
 * Returns an SVG icon string for the retailer type.
 * Uses a simple storefront or cart icon.
 * @param {string} type
 * @returns {string}
 */
function typeIcon(type) {
  if (type === 'online') {
    // Cart icon
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
  }
  // Storefront icon for both/physical
  return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
}

/**
 * Renders the retailer list into the block.
 * @param {Element} block
 * @param {Array} retailers
 * @param {object|undefined} bridge
 */
function renderRetailers(block, retailers, bridge) {
  block.textContent = '';

  // Header section with icon
  const header = document.createElement('div');
  header.className = 'wtb-header';

  const heading = document.createElement('h3');
  heading.textContent = 'Where to Buy GUM Products';
  header.appendChild(heading);

  const subtitle = document.createElement('p');
  subtitle.className = 'wtb-subtitle';
  subtitle.textContent = `${retailers.length} retailers available`;
  header.appendChild(subtitle);

  block.appendChild(header);

  // Retailer list
  const list = document.createElement('div');
  list.className = 'retailer-list';

  retailers.forEach((retailer) => {
    const card = document.createElement('div');
    card.className = 'retailer-card';

    // Left section: name and badge
    const info = document.createElement('div');
    info.className = 'retailer-info';

    const name = document.createElement('span');
    name.className = 'retailer-name';
    name.textContent = retailer.name;
    info.appendChild(name);

    const badge = document.createElement('span');
    badge.className = `retailer-badge retailer-badge--${retailer.type === 'online' ? 'online' : 'both'}`;
    const iconSpan = document.createElement('span');
    iconSpan.className = 'badge-icon';
    iconSpan.innerHTML = typeIcon(retailer.type);
    badge.appendChild(iconSpan);
    const badgeText = document.createElement('span');
    badgeText.textContent = typeLabel(retailer.type);
    badge.appendChild(badgeText);
    info.appendChild(badge);

    card.appendChild(info);

    // Right section: CTA button
    const cta = document.createElement('a');
    cta.className = 'cta-btn';
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

    card.appendChild(cta);
    list.appendChild(card);
  });

  block.appendChild(list);
}

export default async function decorate(block, bridge) {
  let retailers;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      retailers = SAMPLE_DATA;
    } else {
      // structuredContent is { items: [...] } — key from action handler
      const { structuredContent } = await bridge.toolResult;
      retailers = structuredContent?.items || [];
    }
  } else {
    // Standalone EDS preview
    retailers = SAMPLE_DATA;
  }

  renderRetailers(block, retailers, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    const ro = new ResizeObserver(() => {
      clearTimeout(ro._t);
      ro._t = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}
