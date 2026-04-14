/*
 * Search Products Widget
 * Horizontal scrollable carousel of GUM oral care product cards.
 * Renders inside ChatGPT/Claude via bridge, or standalone in EDS preview.
 */

const SAMPLE_DATA = [
  {
    name: 'GUM\u00ae Deep Clean Technique\u00ae Toothbrush',
    description: 'Ultra-fine tapered bristles provide a deeper clean below the gumline. Quad-Grip\u00ae handle promotes perfect brushing technique.',
    category: 'toothbrushes',
    image_url: 'https://www.sunstargum.com/content/dam/gum/us-en/products/toothbrushes/gum-technique-deep-clean-toothbrush/gum-technique-deep-clean-toothbrush.png',
  },
  {
    name: 'GUM\u00ae Sensitive Clean Technique\u00ae Toothbrush',
    description: 'Gentle bristles designed for sensitive gums. Quad-Grip\u00ae handle for optimal brushing technique.',
    category: 'toothbrushes',
    image_url: 'https://www.sunstargum.com/content/dam/gum/us-en/products/toothbrushes/gum-technique-sensitive-clean-toothbrush/gum-technique-sensitive-clean-toothbrush.png',
  },
  {
    name: 'GUM\u00ae Sonic Powered Toothbrush',
    description: 'Powerful sonic technology for a thorough clean. Removes more plaque than a manual toothbrush.',
    category: 'toothbrushes',
    image_url: 'https://www.sunstargum.com/content/dam/gum/us-en/products/toothbrushes/gum-sonic-power-toothbrush-gum-health/gum-sonic-power-toothbrush-gum-health.png',
  },
  {
    name: 'GUM\u00ae Crayola\u2122 Kids\' Twistables\u2122 Flossers',
    description: 'Fun Crayola-themed flossers make flossing exciting for kids. Easy-grip handle designed for small hands.',
    category: 'dental-floss',
    image_url: 'https://www.sunstargum.com/content/dam/gum/us-en/products/dental-floss/gum-crayola-twistables-flossers/gum-crayola-twistables-flossers.png',
  },
  {
    name: 'GUM\u00ae Soft-Picks\u00ae Original',
    description: 'Flexible rubber bristles gently clean between teeth. Comfortable and easy to use.',
    category: 'interdental',
    image_url: 'https://www.sunstargum.com/content/dam/gum/us-en/products/interdental-cleaners/gum-soft-picks-original-dental-picks/gum-soft-picks-original-dental-picks.png',
  },
];

function renderProducts(block, products, bridge) {
  const carousel = document.createElement('div');
  carousel.className = 'carousel-track';

  products.slice(0, 5).forEach((product) => {
    const card = document.createElement('div');
    card.className = 'card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'card-img';
    const img = document.createElement('img');
    img.src = product.image_url || '';
    img.alt = product.name || 'Product image';
    img.loading = 'lazy';
    imgWrap.appendChild(img);
    card.appendChild(imgWrap);

    const body = document.createElement('div');
    body.className = 'card-body';

    // Category badge
    if (product.category) {
      const badge = document.createElement('span');
      badge.className = 'card-badge';
      badge.textContent = product.category.replace(/-/g, ' ');
      body.appendChild(badge);
    }

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = product.name || '';
    body.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = product.description || '';
    body.appendChild(desc);

    card.appendChild(body);

    const btn = document.createElement('button');
    btn.className = 'cta-btn';
    btn.textContent = 'View Details';
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${product.name}`);
      });
    }
    card.appendChild(btn);

    carousel.appendChild(card);
  });

  block.appendChild(carousel);
}

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const { structuredContent } = await bridge.toolResult;
      items = structuredContent?.items || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderProducts(block, items, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    const ro = new ResizeObserver(() => {
      clearTimeout(ro._t);
      ro._t = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}
