// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DEALERS = [
  {
    name: 'Dacia Bucuresti Nord',
    address: 'Șoseaua București-Ploiești 172-176, Sector 1, București 013685',
    phone: '+40 21 232 4567',
    services: ['Sales', 'Service', 'Parts']
  },
  {
    name: 'Dacia Bucuresti Sud',
    address: 'Calea Vitan 231, Sector 3, București 031295',
    phone: '+40 21 326 7890',
    services: ['Sales', 'Service', 'Test Drive']
  },
  {
    name: 'Dacia Militari',
    address: 'Bulevardul Iuliu Maniu 558, Sector 6, București 061125',
    phone: '+40 21 430 1234',
    services: ['Sales', 'Parts', 'Financing']
  }
];

export default async function decorate(block, bridge) {
  let dealers = [];
  let initialLocation = '';

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    
    if (isPreview) {
      dealers = SAMPLE_DEALERS;
    } else {
      // Production mode — data comes from the MCP tool result
      const { structuredContent } = await bridge.toolResult;
      dealers = structuredContent?.dealers || [];
    }
  } else {
    // Standalone EDS preview
    dealers = SAMPLE_DEALERS;
  }

  block.textContent = '';
  render(block, dealers, initialLocation, bridge);

  if (bridge) {
    // Report size and observe changes
    const reportSizeDebounced = () => {
      clearTimeout(reportSizeDebounced._timer);
      reportSizeDebounced._timer = setTimeout(() => {
        bridge.reportSize(block.offsetWidth, block.offsetHeight);
      }, 150);
    };

    reportSizeDebounced();
    const ro = new ResizeObserver(reportSizeDebounced);
    ro.observe(block);
  }
}

function render(block, dealers, location, bridge) {
  // Create search form
  const form = document.createElement('div');
  form.className = 'search-form';

  const formGroup = document.createElement('div');
  formGroup.className = 'form-group';

  const label = document.createElement('label');
  label.textContent = 'Location';
  label.htmlFor = 'dealer-location-input';
  formGroup.appendChild(label);

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'dealer-location-input';
  input.placeholder = 'e.g., Bucuresti, Cluj-Napoca';
  input.value = location;
  formGroup.appendChild(input);

  form.appendChild(formGroup);

  const searchBtn = document.createElement('button');
  searchBtn.className = 'search-btn';
  searchBtn.textContent = 'Find Dealers';
  
  if (bridge) {
    searchBtn.addEventListener('click', () => {
      const locationValue = input.value.trim();
      if (locationValue) {
        bridge.sendMessage(`Find Dacia dealers near ${locationValue}`);
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const locationValue = input.value.trim();
        if (locationValue) {
          bridge.sendMessage(`Find Dacia dealers near ${locationValue}`);
        }
      }
    });
  }
  
  form.appendChild(searchBtn);
  block.appendChild(form);

  // Create dealers list
  const dealersList = document.createElement('div');
  dealersList.className = 'dealers-list';

  if (dealers && dealers.length > 0) {
    dealers.forEach(dealer => {
      const card = createDealerCard(dealer, bridge);
      dealersList.appendChild(card);
    });
  } else {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'Enter a location to find nearby Dacia dealers';
    dealersList.appendChild(emptyState);
  }

  block.appendChild(dealersList);
}

function createDealerCard(dealer, bridge) {
  const card = document.createElement('div');
  card.className = 'dealer-card';

  const name = document.createElement('h3');
  name.className = 'dealer-name';
  name.textContent = dealer.name;
  card.appendChild(name);

  if (dealer.address) {
    const address = document.createElement('p');
    address.className = 'dealer-address';
    address.textContent = dealer.address;
    card.appendChild(address);
  }

  if (dealer.phone) {
    const phone = document.createElement('p');
    phone.className = 'dealer-phone';
    phone.textContent = dealer.phone;
    card.appendChild(phone);
  }

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

  if (bridge) {
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'dealer-actions';

    const contactBtn = document.createElement('button');
    contactBtn.className = 'dealer-cta';
    contactBtn.textContent = 'Contact';
    contactBtn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${dealer.name}`);
    });
    actionsContainer.appendChild(contactBtn);

    if (dealer.address) {
      const directionsBtn = document.createElement('button');
      directionsBtn.className = 'dealer-cta';
      directionsBtn.textContent = 'Directions';
      directionsBtn.addEventListener('click', () => {
        bridge.sendMessage(`Get directions to ${dealer.name} at ${dealer.address}`);
      });
      actionsContainer.appendChild(directionsBtn);
    }

    card.appendChild(actionsContainer);
  }

  return card;
}