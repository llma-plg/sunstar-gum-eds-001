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
    image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--0a295760-5530-4008-a103-a99e6f050496/00070942125895-524-hero.jpg?width=480&preferwebp=true&quality=85',
  },
  {
    name: 'GUM\u00ae Sensitive Clean Technique\u00ae Toothbrush',
    description: 'Gentle bristles designed for sensitive gums. Quad-Grip\u00ae handle for optimal brushing technique.',
    category: 'toothbrushes',
    image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--cc09aad6-d5b1-4c20-883f-604a8809cf15/00070942007412-hero.jpg?width=480&preferwebp=true&quality=85',
  },
  {
    name: 'GUM\u00ae Sonic Powered Toothbrush',
    description: 'Powerful sonic technology for a thorough clean. Removes more plaque than a manual toothbrush.',
    category: 'toothbrushes',
    image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--f5ccd9db-10f3-4785-8550-f70405cb29bf/00070942005432-4100-hero.jpg?width=480&preferwebp=true&quality=85',
  },
  {
    name: 'GUM\u00ae Crayola\u2122 Kids\' Twistables\u2122 Flossers',
    description: 'Fun Crayola-themed flossers make flossing exciting for kids. Easy-grip handle designed for small hands.',
    category: 'dental-floss',
    image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--35c1f8d8-d82e-4928-bf3a-085bb9b9feb8/859rq-product-packaging-flossers-crayols-twistables-hero-cleanedup-us.jpg?width=480&preferwebp=true&quality=85',
  },
  {
    name: 'GUM\u00ae Soft-Picks\u00ae Original',
    description: 'Flexible rubber bristles gently clean between teeth. Comfortable and easy to use.',
    category: 'interdental',
    image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--a9a60fce-c215-4647-93d2-af40c8df6ae0/6323r-product-packaging-btc-softpicks-original-hero-cleanedup-us.jpg?width=480&preferwebp=true&quality=85',
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
        bridge.callTool('get-product-details', { product_name: product.name });
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
