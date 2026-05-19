// Sample data for standalone/preview mode
const SAMPLE_DEALERS = [
  {
    name: 'Dacia Bucuresti Militari',
    address: 'Bd. Iuliu Maniu 442, București 061072',
    phone: '+40 21 310 5000',
    services: ['Sales', 'Service', 'Parts']
  },
  {
    name: 'Dacia Cluj-Napoca',
    address: 'Str. Fabricii 2, Cluj-Napoca 400632',
    phone: '+40 264 430 500',
    services: ['Sales', 'Service', 'Parts']
  },
  {
    name: 'Dacia Timișoara',
    address: 'Calea Sagului 100, Timișoara 300517',
    phone: '+40 256 490 300',
    services: ['Sales', 'Service']
  },
  {
    name: 'Dacia Iași',
    address: 'Șos. Națională 77, Iași 707410',
    phone: '+40 232 250 400',
    services: ['Sales', 'Parts']
  },
  {
    name: 'Dacia Brașov',
    address: 'Calea Bucuresti 251, Brașov 500326',
    phone: '+40 268 470 200',
    services: ['Sales', 'Service', 'Parts']
  }
];

export default async function decorate(block, bridge) {
  let dealers;
  let searchLocation = '';

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    
    if (isPreview) {
      dealers = SAMPLE_DEALERS;
    } else {
      const { structuredContent } = await bridge.toolResult;
      dealers = structuredContent?.dealers || structuredContent?.results || [];
    }
  } else {
    dealers = SAMPLE_DEALERS;
  }

  block.textContent = '';
  renderWidget(block, dealers, searchLocation, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    const ro = new ResizeObserver(() => {
      clearTimeout(ro._t);
      ro._t = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderWidget(block, dealers, initialLocation, bridge) {
  // Search form
  const form = document.createElement('form');
  form.className = 'search-form';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-input';
  input.placeholder = 'Enter city or address (e.g. Bucuresti, Cluj-Napoca)';
  input.value = initialLocation;

  const searchBtn = document.createElement('button');
  searchBtn.type = 'submit';
  searchBtn.className = 'search-btn';
  searchBtn.textContent = 'Search';

  form.appendChild(input);
  form.appendChild(searchBtn);

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const location = input.value.trim();
    if (location && bridge) {
      bridge.sendMessage(`Find Dacia dealers near ${location}`);
    }
  });

  block.appendChild(form);

  // Results container
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'results-container';

  if (dealers && dealers.length > 0) {
    const dealerList = document.createElement('div');
    dealerList.className = 'dealer-list';

    dealers.forEach(dealer => {
      const card = createDealerCard(dealer, bridge);
      dealerList.appendChild(card);
    });

    resultsContainer.appendChild(dealerList);
  } else {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'Enter a location to find nearby Dacia dealers';
    resultsContainer.appendChild(emptyState);
  }

  block.appendChild(resultsContainer);
}

function createDealerCard(dealer, bridge) {
  const card = document.createElement('div');
  card.className = 'dealer-card';

  // Dealer name
  const name = document.createElement('h3');
  name.className = 'dealer-name';
  name.textContent = dealer.name || 'Unnamed Dealer';
  card.appendChild(name);

  // Address
  if (dealer.address) {
    const address = document.createElement('p');
    address.className = 'dealer-address';
    address.textContent = dealer.address;
    card.appendChild(address);
  }

  // Phone
  if (dealer.phone) {
    const phone = document.createElement('a');
    phone.className = 'dealer-phone';
    phone.href = `tel:${dealer.phone}`;
    phone.textContent = dealer.phone;
    card.appendChild(phone);
  }

  // Services
  if (dealer.services && dealer.services.length > 0) {
    const servicesContainer = document.createElement('div');
    servicesContainer.className = 'dealer-services';

    dealer.services.forEach(service => {
      const badge = document.createElement('span');
      badge.className = 'service-badge';
      badge.textContent = service;
      servicesContainer.appendChild(badge);
    });

    card.appendChild(servicesContainer);
  }

  return card;
}