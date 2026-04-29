const SAMPLE_DATA = [
  {
    name: 'GUM® Deep Clean Technique® Toothbrush',
    description: 'Ultra-fine tapered bristles provide a deeper clean below the gumline. Quad-Grip® handle promotes perfect brushing technique.',
    category: 'toothbrushes',
    image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--0a295760-5530-4008-a103-a99e6f050496/00070942125895-524-hero.jpg?width=480&preferwebp=true&quality=85',
  },
  {
    name: 'GUM® Sensitive Clean Technique® Toothbrush',
    description: 'Gentle bristles designed for sensitive gums. Quad-Grip® handle for optimal brushing technique.',
    category: 'toothbrushes',
    image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--cc09aad6-d5b1-4c20-883f-604a8809cf15/00070942007412-hero.jpg?width=480&preferwebp=true&quality=85',
  },
  {
    name: 'GUM® Sonic Powered Toothbrush',
    description: 'Powerful sonic technology for a thorough clean. Removes more plaque than a manual toothbrush.',
    category: 'toothbrushes',
    image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--f5ccd9db-10f3-4785-8550-f70405cb29bf/00070942005432-4100-hero.jpg?width=480&preferwebp=true&quality=85',
  },
  {
    name: 'GUM® Crayola™ Kids\' Twistables™ Flossers',
    description: 'Fun Crayola-themed flossers make flossing exciting for kids. Easy-grip handle designed for small hands.',
    category: 'dental-floss',
    image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--35c1f8d8-d82e-4928-bf3a-085bb9b9feb8/859rq-product-packaging-flossers-crayols-twistables-hero-cleanedup-us.jpg?width=480&preferwebp=true&quality=85',
  },
  {
    name: 'GUM® Soft-Picks® Original',
    description: 'Flexible rubber bristles gently clean between teeth. Comfortable and easy to use.',
    category: 'interdental',
    image_url: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--a9a60fce-c215-4647-93d2-af40c8df6ae0/6323r-product-packaging-btc-softpicks-original-hero-cleanedup-us.jpg?width=480&preferwebp=true&quality=85',
  },
];

function createProductCard(product, bridge) {
  const card = document.createElement('div');
  card.className = 'gum-product-card';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'gum-product-image-wrap';
  const img = document.createElement('img');
  img.src = product.image_url || '';
  img.alt = product.name || 'Product image';
  img.loading = 'lazy';
  img.addEventListener('load', () => img.classList.add('loaded'));
  imgWrap.appendChild(img);

  const info = document.createElement('div');
  info.className = 'gum-product-info';

  const name = document.createElement('h3');
  name.className = 'gum-product-name';
  name.textContent = product.name || '';

  const cta = document.createElement('button');
  cta.className = 'gum-product-cta';
  cta.textContent = 'More Details';

  info.appendChild(name);
  info.appendChild(cta);

  card.appendChild(imgWrap);
  card.appendChild(info);

  card.addEventListener('click', () => {
    if (bridge) {
      bridge.sendMessage(`Use get-product-details to show full details for "${product.name}"`);
    }
  });

  return card;
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

  if (!items || items.length === 0) {
    block.innerHTML = '<p class="gum-products-empty">No products available.</p>';
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'gum-products-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'gum-products-carousel';

  items.forEach((product) => {
    carousel.appendChild(createProductCard(product, bridge));
  });

  wrapper.appendChild(carousel);

  const leftArrow = document.createElement('button');
  leftArrow.className = 'gum-carousel-arrow left';
  leftArrow.innerHTML = '‹';
  leftArrow.setAttribute('aria-label', 'Previous');

  const rightArrow = document.createElement('button');
  rightArrow.className = 'gum-carousel-arrow right';
  rightArrow.innerHTML = '›';
  rightArrow.setAttribute('aria-label', 'Next');

  const scrollAmount = 250;

  leftArrow.addEventListener('click', () => {
    carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  const updateArrows = () => {
    leftArrow.disabled = carousel.scrollLeft <= 0;
    rightArrow.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2;
  };

  carousel.addEventListener('scroll', updateArrows, { passive: true });
  setTimeout(updateArrows, 100);

  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);
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
