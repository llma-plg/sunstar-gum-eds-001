const SAMPLE_DATA = [
  { productId: 'GUM-524', name: 'GUM® Deep Clean Technique® Toothbrush', rating: 4.7, reviewCount: 58, imageUrl: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--0a295760-5530-4008-a103-a99e6f050496/00070942125895-524-hero.jpg?width=480&preferwebp=true&quality=85' },
  { productId: 'GUM-412', name: 'GUM® Sensitive Clean Technique® Toothbrush', rating: 4.5, reviewCount: 34, imageUrl: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--cc09aad6-d5b1-4c20-883f-604a8809cf15/00070942007412-hero.jpg?width=480&preferwebp=true&quality=85' },
  { productId: 'GUM-4100', name: 'GUM® Sonic Powered Toothbrush', rating: 4.6, reviewCount: 45, imageUrl: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--f5ccd9db-10f3-4785-8550-f70405cb29bf/00070942005432-4100-hero.jpg?width=480&preferwebp=true&quality=85' },
  { productId: 'GUM-859', name: 'GUM® Crayola™ Kids\' Twistables™ Flossers', rating: 4.3, reviewCount: 27, imageUrl: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--35c1f8d8-d82e-4928-bf3a-085bb9b9feb8/859rq-product-packaging-flossers-crayols-twistables-hero-cleanedup-us.jpg?width=480&preferwebp=true&quality=85' },
  { productId: 'GUM-6323', name: 'GUM® Soft-Picks® Original', rating: 4.4, reviewCount: 39, imageUrl: 'https://www.sunstargum.com/adobe/dynamicmedia/deliver/dm-aid--a9a60fce-c215-4647-93d2-af40c8df6ae0/6323r-product-packaging-btc-softpicks-original-hero-cleanedup-us.jpg?width=480&preferwebp=true&quality=85' },
];

function createStarsSVG(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
    const filled = i <= Math.round(rating);
    const color = filled ? '#2bb573' : '#d1d5db';
    stars.push(`<svg class="gum-star" viewBox="0 0 20 20" fill="${color}"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/></svg>`);
  }
  return stars.join('');
}

function createProductCard(product, bridge) {
  const card = document.createElement('div');
  card.className = 'gum-product-card';

  const imgWrap = document.createElement('div');
  imgWrap.className = 'gum-product-image-wrap';
  const img = document.createElement('img');
  img.src = product.imageUrl;
  img.alt = product.name;
  img.loading = 'lazy';
  img.addEventListener('load', () => img.classList.add('loaded'));
  imgWrap.appendChild(img);

  const info = document.createElement('div');
  info.className = 'gum-product-info';

  const name = document.createElement('h3');
  name.className = 'gum-product-name';
  name.textContent = product.name;

  const ratingWrap = document.createElement('div');
  ratingWrap.className = 'gum-product-rating';
  const stars = document.createElement('span');
  stars.className = 'gum-stars';
  stars.innerHTML = createStarsSVG(product.rating);
  const ratingText = document.createElement('span');
  ratingText.className = 'gum-rating-text';
  ratingText.textContent = `${product.rating} (${product.reviewCount})`;
  ratingWrap.appendChild(stars);
  ratingWrap.appendChild(ratingText);

  const cta = document.createElement('button');
  cta.className = 'gum-product-cta';
  cta.textContent = 'More Details';

  info.appendChild(name);
  info.appendChild(ratingWrap);
  info.appendChild(cta);

  card.appendChild(imgWrap);
  card.appendChild(info);

  card.addEventListener('click', () => {
    if (bridge) {
      const prompt = `Show me the full details for product ${product.productId} (${product.name}).`;
      bridge.sendMessage(prompt);
    }
  });

  return card;
}

export default async function decorate(block, bridge) {
  block.textContent = '';

  const loading = document.createElement('div');
  loading.className = 'loading';
  loading.textContent = 'Loading GUM products…';
  block.appendChild(loading);

  let products;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      products = SAMPLE_DATA;
    } else {
      try {
        const result = await bridge.toolResult;
        const sc = result?.structuredContent || result;
        products = sc?.products || [];
      } catch (e) {
        console.warn('[search-products] Could not get tool data', e);
      }
    }
  } else {
    products = SAMPLE_DATA;
  }

  if (!products || products.length === 0) {
    block.textContent = '';
    block.innerHTML = '<p class="gum-products-empty">No products available.</p>';
    return;
  }

  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'gum-products-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'gum-products-carousel';

  products.forEach((product) => {
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
