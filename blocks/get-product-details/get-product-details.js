const SAMPLE_DATA = {
  name: 'GUM® Deep Clean Technique® Toothbrush',
  description: 'The GUM® Deep Clean Technique® Toothbrush features ultra-fine tapered bristles that penetrate deep below the gumline to remove plaque bacteria that cause gum disease. The patented Quad-Grip® handle naturally guides your hand to the proper brushing angle, promoting the technique recommended by dental professionals.',
  category: 'toothbrushes',
  image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--0a295760-5530-4008-a103-a99e6f050496/00070942125895-524-hero.jpg?width=480&preferwebp=true&quality=85',
  features: [
    'Ultra-fine tapered bristles brush below the gumline',
    'Quad-Grip® handle promotes perfect brushing technique',
    'Soft bristles safe for sensitive gums and enamel',
    'Compact head reaches back teeth easily',
    'Recommended by dental professionals',
  ],
  url: 'https://www.sunstargum.com/us-en/products/toothbrushes/gum-technique-deep-clean-toothbrush.html',
  related_products: [
    {
      name: 'GUM® Sensitive Clean Technique® Toothbrush',
      image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--cc09aad6-d5b1-4c20-883f-604a8809cf15/00070942007412-hero.jpg?width=480&preferwebp=true&quality=85',
      url: 'https://www.sunstargum.com/us-en/products/toothbrushes/gum-technique-sensitive-clean-toothbrush.html',
    },
    {
      name: 'GUM® Enamel Clean TECHNIQUE® Toothbrush',
      image_url: 'https://www.sunstargum.com/content/dam/gum/us-en/products/toothbrushes/gum-technique-enamel-clean-toothbrush/gum-technique-enamel-clean-toothbrush.png',
      url: 'https://www.sunstargum.com/us-en/products/toothbrushes/gum-technique-enamel-clean-toothbrush.html',
    },
    {
      name: 'GUM® Multi-Clean Toothbrush',
      image_url: 'https://www.sunstargum.com/content/dam/gum/us-en/products/toothbrushes/gum-multiclean-toothbrush/gum-multiclean-toothbrush.png',
      url: 'https://www.sunstargum.com/us-en/products/toothbrushes/gum-multiclean-toothbrush.html',
    },
  ],
};

export default async function decorate(block, bridge) {
  let product;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      product = SAMPLE_DATA;
    } else {
      const { structuredContent } = await bridge.toolResult;
      product = structuredContent || {};
    }
  } else {
    product = SAMPLE_DATA;
  }

  block.textContent = '';

  if (!product || !product.name) {
    block.innerHTML = '<p class="gum-detail-error">Product details not available.</p>';
    return;
  }

  const card = document.createElement('div');
  card.className = 'gum-detail-card';

  // Hero section: image left, info right
  const hero = document.createElement('div');
  hero.className = 'gum-detail-hero';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'gum-detail-image';
  const img = document.createElement('img');
  img.src = product.image_url || '';
  img.alt = product.name || 'Product image';
  img.loading = 'eager';
  img.addEventListener('load', () => img.classList.add('loaded'));
  imageWrap.appendChild(img);

  const info = document.createElement('div');
  info.className = 'gum-detail-info';

  if (product.category) {
    const category = document.createElement('span');
    category.className = 'gum-detail-category';
    category.textContent = product.category.replace(/-/g, ' ');
    info.appendChild(category);
  }

  const name = document.createElement('h2');
  name.className = 'gum-detail-name';
  name.textContent = product.name;
  info.appendChild(name);

  if (product.description) {
    const desc = document.createElement('p');
    desc.className = 'gum-detail-description';
    desc.textContent = product.description;
    info.appendChild(desc);
  }

  if (product.features && product.features.length > 0) {
    const featuresList = document.createElement('ul');
    featuresList.className = 'gum-detail-features';
    product.features.forEach((f) => {
      const li = document.createElement('li');
      li.textContent = f;
      featuresList.appendChild(li);
    });
    info.appendChild(featuresList);
  }

  hero.appendChild(imageWrap);
  hero.appendChild(info);
  card.appendChild(hero);

  // CTAs
  const ctaWrap = document.createElement('div');
  ctaWrap.className = 'gum-detail-cta';

  const findStoresBtn = document.createElement('button');
  findStoresBtn.className = 'gum-btn';
  findStoresBtn.textContent = 'Find Where to Buy';
  findStoresBtn.addEventListener('click', () => {
    if (bridge) {
      bridge.sendMessage(`Use find-where-to-buy to show retailers that carry ${product.name}`);
    }
  });

  const visitBtn = document.createElement('button');
  visitBtn.className = 'gum-btn-outline';
  visitBtn.textContent = 'View on GUM Website';
  visitBtn.addEventListener('click', () => {
    if (bridge && product.url) {
      bridge.openLink(product.url);
    }
  });

  ctaWrap.appendChild(findStoresBtn);
  ctaWrap.appendChild(visitBtn);
  card.appendChild(ctaWrap);

  block.appendChild(card);

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
