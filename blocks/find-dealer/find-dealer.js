// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Dacia Bucuresti Nord',
    address: 'Bd. Ficusului 42, Bucuresti 013975',
    distance: '2.3 km',
    phone: '+40 21 123 4567',
    services: ['Sales', 'Service', 'Parts'],
    hours: 'Mon-Fri: 9:00-18:00',
  },
  {
    name: 'Dacia Militari',
    address: 'Str. Apusului 123, Bucuresti 061331',
    distance: '4.7 km',
    phone: '+40 21 234 5678',
    services: ['Sales', 'Service'],
    hours: 'Mon-Fri: 9:00-18:00',
  },
  {
    name: 'Dacia Colentina',
    address: 'Bd. Colentina 89, Bucuresti 021171',
    distance: '5.2 km',
    phone: '+40 21 345 6789',
    services: ['Service', 'Parts'],
    hours: 'Mon-Sat: 8:00-17:00',
  },
];

export default async function decorate(block, bridge) {
  let dealers;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      // Preview mode (LLM Apps UI) — use sample data
      dealers = SAMPLE_DATA;
    } else {
      // Production — data comes from the MCP tool result
      // structuredContent is an object wrapping the dealers array
      const { structuredContent } = await bridge.toolResult;
      dealers = structuredContent?.dealers || structuredContent?.results || [];
    }
  } else {
    // STANDALONE: widget is in EDS preview (localhost:3000 or aem.page)
    dealers = SAMPLE_DATA;
  }

  block.textContent = '';
  renderWidget(block, dealers, bridge);

  if (bridge) {
    // Report size and observe changes
    const reportSizeDebounced = () => {
      bridge.reportSize(block.offsetWidth, block.offsetHeight);
    };
    reportSizeDebounced();

    const ro = new ResizeObserver(() => {
      clearTimeout(ro._t);
      ro._t = setTimeout(reportSizeDebounced, 150);
    });
    ro.observe(block);
  }
}

function renderWidget(block, dealers, bridge) {
  // Create search form
  const form = document.createElement('div');
  form.className = 'search-form';

  const label = document.createElement('label');
  label.textContent = 'Find Dealers Near:';
  form.appendChild(label);

  const inputGroup = document.createElement('div');
  inputGroup.className = 'input-group';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter city or address (e.g. Bucuresti)';
  input.value = '';
  inputGroup.appendChild(input);

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Search';
  inputGroup.appendChild(button);

  form.appendChild(inputGroup);
  block.appendChild(form);

  // Create dealers list
  const list = document.createElement('div');
  list.className = 'dealers-list';

  if (dealers && dealers.length > 0) {
    dealers.forEach((dealer) => {
      const card = createDealerCard(dealer, bridge);
      list.appendChild(card);
    });
  } else {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No dealers found. Try searching for a location.';
    list.appendChild(empty);
  }

  block.appendChild(list);

  // Handle search interaction
  if (bridge) {
    button.addEventListener('click', () => {
      const location = input.value.trim();
      if (location) {
        bridge.sendMessage(`Find Dacia dealers near ${location}`);
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const location = input.value.trim();
        if (location) {
          bridge.sendMessage(`Find Dacia dealers near ${location}`);
        }
      }
    });
  }
}

function createDealerCard(dealer, bridge) {
  const card = document.createElement('div');
  card.className = 'dealer-card';

  // Dealer name
  const name = document.createElement('h3');
  name.className = 'dealer-name';
  name.textContent = dealer.name || 'Unknown Dealer';
  card.appendChild(name);

  // Address
  if (dealer.address) {
    const address = document.createElement('p');
    address.className = 'dealer-address';
    address.textContent = dealer.address;
    card.appendChild(address);
  }

  // Distance
  if (dealer.distance) {
    const distance = document.createElement('p');
    distance.className = 'dealer-distance';
    distance.textContent = `📍 ${dealer.distance} away`;
    card.appendChild(distance);
  }

  // Services
  if (dealer.services && dealer.services.length > 0) {
    const servicesContainer = document.createElement('div');
    servicesContainer.className = 'dealer-services';

    dealer.services.forEach((service) => {
      const badge = document.createElement('span');
      badge.className = 'service-badge';
      badge.textContent = service;
      servicesContainer.appendChild(badge);
    });

    card.appendChild(servicesContainer);
  }

  // Contact info
  const contact = document.createElement('div');
  contact.className = 'dealer-contact';

  if (dealer.phone) {
    const phone = document.createElement('a');
    phone.className = 'dealer-phone';
    phone.href = `tel:${dealer.phone}`;
    phone.textContent = `📞 ${dealer.phone}`;
    contact.appendChild(phone);
  }

  if (dealer.hours) {
    const hours = document.createElement('span');
    hours.textContent = `🕐 ${dealer.hours}`;
    contact.appendChild(hours);
  }

  card.appendChild(contact);

  // Make card interactive
  if (bridge) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on phone link
      if (e.target.tagName !== 'A') {
        bridge.sendMessage(`Tell me more about ${dealer.name}`);
      }
    });
  }

  return card;
}
