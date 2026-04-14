// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: 'GUM\u00ae Deep Clean Technique\u00ae Toothbrush',
  description: 'The GUM\u00ae Deep Clean Technique\u00ae Toothbrush features ultra-fine tapered bristles that penetrate deep below the gumline to remove plaque bacteria that cause gum disease. The patented Quad-Grip\u00ae handle naturally guides your hand to the proper brushing angle, promoting the technique recommended by dental professionals.',
  category: 'toothbrushes',
  image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--0a295760-5530-4008-a103-a99e6f050496/00070942125895-524-hero.jpg?width=480&preferwebp=true&quality=85',
  features: [
    'Ultra-fine tapered bristles brush below the gumline',
    'Quad-Grip\u00ae handle promotes perfect brushing technique',
    'Soft bristles safe for sensitive gums and enamel',
    'Compact head reaches back teeth easily',
    'Recommended by dental professionals',
  ],
  url: 'https://www.sunstargum.com/us-en/products/toothbrushes/gum-technique-deep-clean-toothbrush.html',
  related_products: [
    {
      name: 'GUM\u00ae Sensitive Clean Technique\u00ae Toothbrush',
      image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--cc09aad6-d5b1-4c20-883f-604a8809cf15/00070942007412-hero.jpg?width=480&preferwebp=true&quality=85',
      url: 'https://www.sunstargum.com/us-en/products/toothbrushes/gum-technique-sensitive-clean-toothbrush.html',
    },
    {
      name: 'GUM\u00ae Enamel Clean TECHNIQUE\u00ae Toothbrush',
      image_url: 'https://www.sunstargum.com/content/dam/gum/us-en/products/toothbrushes/gum-technique-enamel-clean-toothbrush/gum-technique-enamel-clean-toothbrush.png',
      url: 'https://www.sunstargum.com/us-en/products/toothbrushes/gum-technique-enamel-clean-toothbrush.html',
    },
    {
      name: 'GUM\u00ae Multi-Clean Toothbrush',
      image_url: 'https://www.sunstargum.com/content/dam/gum/us-en/products/toothbrushes/gum-multiclean-toothbrush/gum-multiclean-toothbrush.png',
      url: 'https://www.sunstargum.com/us-en/products/toothbrushes/gum-multiclean-toothbrush.html',
    },
  ],
};

function renderProduct(block, product, bridge) {
  // Main layout container — horizontal split: image left, details right
  const layout = document.createElement('div');
  layout.className = 'detail-layout';

  // Left: product image
  const imgCol = document.createElement('div');
  imgCol.className = 'detail-image';

  const img = document.createElement('img');
  img.src = product.image_url || '';
  img.alt = product.name || 'Product image';
  imgCol.appendChild(img);
  layout.appendChild(imgCol);

  // Right: details column
  const detailCol = document.createElement('div');
  detailCol.className = 'detail-content';

  // Category chip
  if (product.category) {
    const chip = document.createElement('span');
    chip.className = 'category-chip';
    chip.textContent = product.category;
    detailCol.appendChild(chip);
  }

  // Product name
  const heading = document.createElement('h3');
  heading.textContent = product.name || 'Product';
  detailCol.appendChild(heading);

  // Description
  if (product.description) {
    const desc = document.createElement('p');
    desc.className = 'detail-description';
    desc.textContent = product.description;
    detailCol.appendChild(desc);
  }

  // Features list
  if (product.features && product.features.length > 0) {
    const featureList = document.createElement('ul');
    featureList.className = 'feature-list';
    product.features.forEach((feat) => {
      const li = document.createElement('li');
      li.textContent = feat;
      featureList.appendChild(li);
    });
    detailCol.appendChild(featureList);
  }

  // CTA button
  const cta = document.createElement('a');
  cta.className = 'cta-btn';
  cta.textContent = 'Learn More';
  cta.href = product.url || '#';
  cta.target = '_blank';
  cta.rel = 'noopener noreferrer';
  if (bridge) {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      bridge.sendMessage(`Tell me more about ${product.name}`);
    });
  }
  detailCol.appendChild(cta);

  layout.appendChild(detailCol);
  block.appendChild(layout);
}

export default async function decorate(block, bridge) {
  let product;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      product = SAMPLE_DATA;
    } else {
      // structuredContent is a flat object: { name, description, category, ... }
      const { structuredContent } = await bridge.toolResult;
      product = structuredContent || {};
    }
  } else {
    product = SAMPLE_DATA;
  }

  block.textContent = '';
  renderProduct(block, product, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    const ro = new ResizeObserver(() => {
      clearTimeout(ro._t);
      ro._t = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}
