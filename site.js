const mobileToggles = document.querySelectorAll('.mobile-toggle');
const navigation = document.querySelector('#navigation');
function setNavigation(open) {
  navigation.classList.toggle('visible', open);
  mobileToggles.forEach(toggle => {
    toggle.setAttribute('aria-expanded', String(open));
    if (toggle.classList.contains('mobile-menu-icon')) {
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  });
}
mobileToggles.forEach(toggle => {
  toggle.addEventListener('click', () => setNavigation(!navigation.classList.contains('visible')));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('visible')) {
    setNavigation(false);
    Array.from(mobileToggles).find(toggle => toggle.getClientRects().length)?.focus();
  }
});

const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });
const storageKey = 'pizzaish-cart';
let cart = [];
try {
  const storedCart = JSON.parse(localStorage.getItem(storageKey));
  if (Array.isArray(storedCart)) {
    cart = storedCart.filter(item => item && typeof item.name === 'string' && Number.isFinite(item.price));
  }
} catch {
  // The cart can still work for the current page when storage is unavailable.
}
const dialog = document.querySelector('.cart-dialog');
const items = dialog.querySelector('[data-cart-items]');
const total = dialog.querySelector('[data-cart-total]');
const counts = document.querySelectorAll('[data-cart-count]');
const toast = document.querySelector('.toast');
let toastTimer;

function renderCart() {
  counts.forEach(count => { count.textContent = cart.length; });
  items.replaceChildren();
  if (!cart.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Your cart is empty.';
    items.append(empty);
  }
  for (const [index, item] of cart.entries()) {
    const row = document.createElement('div');
    row.className = 'cart-line';
    const label = document.createElement('span');
    label.textContent = item.name + ' · ' + money.format(item.price);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', 'Remove ' + item.name);
    remove.addEventListener('click', () => {
      cart.splice(index, 1);
      saveCart();
    });
    row.append(label, remove);
    items.append(row);
  }
  total.textContent = 'Subtotal ' + money.format(cart.reduce((sum, item) => sum + item.price, 0));
}
function saveCart() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  } catch {
    // Keep the current page usable when storage is blocked or full.
  }
  renderCart();
}
function addToCart(name, price) {
  cart.push({ name, price });
  saveCart();
  clearTimeout(toastTimer);
  toast.textContent = 'Added to your cart';
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2100);
}
renderCart();
document.querySelectorAll('.cart-toggle,[data-open-cart]').forEach(button => {
  button.addEventListener('click', () => { if (!dialog.open) dialog.showModal(); });
});
document.querySelectorAll('.mobile-size-options').forEach(group => {
  const select = group.previousElementSibling.querySelector('select');
  const choices = group.querySelectorAll('button');
  select.addEventListener('change', () => {
    choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mobileSize === select.value)));
  });
  choices.forEach(button => button.addEventListener('click', () => {
    select.value = button.dataset.mobileSize;
    select.dispatchEvent(new Event('change'));
  }));
});
dialog.querySelector('.close-cart').addEventListener('click', () => dialog.close());
document.querySelectorAll('[data-add]').forEach(button => {
  button.addEventListener('click', () => {
    const size = button.closest('.card')?.querySelector('.size-choice select');
    const topping = button.closest('.card')?.querySelector('.side-options input:checked');
    const options = size ? size.selectedOptions[0].text.split(' · ')[0] : topping?.value;
    const label = options ? button.dataset.add + ' · ' + options : button.dataset.add;
    addToCart(label, size ? Number(size.value) : Number(button.dataset.price));
  });
});

const filters = document.querySelectorAll('[data-filter]');
const products = document.querySelectorAll('[data-category]');
filters.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    products.forEach(product => {
      product.hidden = category !== 'all' && category !== product.dataset.category;
    });
  });
});
const menuResults = document.querySelector('#menu-results');
document.querySelector('.sort-menu select')?.addEventListener('change', event => {
  const sorted = Array.from(products);
  if (event.target.value === 'name') {
    sorted.sort((a, b) => a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent));
  }
  menuResults.append(...sorted);
});
document.querySelectorAll('[data-menu-category]').forEach(link => {
  link.addEventListener('click', () => document.querySelector('[data-filter="' + link.dataset.menuCategory + '"]')?.click());
});
const menuEmpty = document.querySelector('.menu-empty');
filters.forEach(button => {
  button.addEventListener('click', () => {
    if (menuEmpty) menuEmpty.hidden = Array.from(products).some(product => !product.hidden);
  });
});
document.querySelectorAll('.favorite').forEach(button => {
  const active = () => button.getAttribute('aria-pressed') === 'true';
  const toggle = value => {
    button.setAttribute('aria-pressed', String(value));
    button.textContent = value ? '♥' : '♡';
  };
  const key = 'pizzaish-favorite:' + button.getAttribute('aria-label');
  try { toggle(localStorage.getItem(key) === 'true'); } catch {}
  button.addEventListener('click', () => {
    toggle(!active());
    try { localStorage.setItem(key, String(active())); } catch {}
  });
});
document.querySelectorAll('[data-job]').forEach(link => {
  link.addEventListener('click', () => {
    const position = document.querySelector('#apply-now select');
    if (position) position.value = link.dataset.job;
  });
});
const slideButtons = document.querySelectorAll('[data-slide]');
if (slideButtons.length) {
  const hero = document.querySelector('.home-hero');
  const photo = hero.querySelector('img');
  const title = hero.querySelector('h1');
  const copy = hero.querySelector('.hero-inner p');
  const cta = hero.querySelector('.actions a');
  const badge = hero.querySelector('.signature-badge');
  const slides = [
    ['home', 'Not Your<br><em>Ordinary Pizza.</em>', 'Bold flavours. Signature pizzas.<br>Made for Toronto.', 'menu.html', 'Order Online →'],
    ['build', 'Create Your<br><em>Perfect Pizza</em>', 'Pick your size, crust, sauce and favourite toppings.', 'build.html', 'Start Building →'],
    ['wings', 'Bold Flavours.<br><em>Big Wings.</em>', 'Crispy, juicy wings tossed in our signature sauces.', 'wings.html', 'Order Wings →'],
  ];
  const ctaIcon = cta.querySelector('i');
  slideButtons.forEach(button => button.addEventListener('click', () => {
    const [asset, heading, description, href, label] = slides[Number(button.dataset.slide)];
    photo.src = 'media/' + asset + '-hero.webp?v=2';
    title.innerHTML = heading;
    copy.innerHTML = description;
    cta.replaceChildren(label, ctaIcon);
    cta.href = href;
    badge.hidden = asset !== 'home';
    slideButtons.forEach(dot => dot.setAttribute('aria-pressed', String(dot === button)));
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const element of [photo, title, copy]) element.animate([{ opacity: .48 }, { opacity: 1 }], 240);
    }
  }));
}
document.querySelectorAll('[data-config]').forEach(form => {
  const layout = form.closest('.configure');
  const summary = layout.querySelector('[data-selection]');
  const subtotal = layout.querySelector('[data-total]');
  const submitTotal = layout.querySelector('[data-submit-total]');
  const quantity = form.elements.namedItem('Order Quantity');
  const secondFlavour = form.elements.namedItem('Second Flavour');
  const flavours = form.elements.namedItem('Flavour Count');
  const pizzaSizes = form.elements.namedItem('Size');
  const wingSizes = form.elements.namedItem('Quantity');
  const glutenFree = Array.from(form.elements).find(control => control.value === 'Gluten-Friendly');

  function selections() {
    const choices = [];
    for (const control of form.elements) {
      if (control.disabled || !control.name || control === quantity || control.name === 'Flavour Count') continue;
      if (control.matches('input:checked')) {
        choices.push({ group: control.name, value: control.value, cost: Number(control.dataset.cost || 0) });
      }
      if (control.tagName === 'SELECT' && control.value && !['Normal', 'No Upgrade'].includes(control.value)) {
        choices.push({ group: control.name, value: control.value, cost: Number(control.selectedOptions[0].dataset.cost || 0) });
      }
    }
    return choices;
  }
  function units() {
    return quantity ? Math.min(20, Math.max(1, Number.parseInt(quantity.value, 10) || 1)) : 1;
  }
  function priceOf(choices) {
    return choices.reduce((sum, choice) => sum + Math.round(choice.cost * 100), 0) * units() / 100;
  }
  function syncOptions() {
    if (secondFlavour) {
      const dual = Array.from(flavours).find(control => control.value === '2');
      dual.disabled = wingSizes.value === '6 Wings';
      if (dual.disabled && dual.checked) flavours.value = '1';
      secondFlavour.disabled = flavours.value !== '2';
      secondFlavour.hidden = secondFlavour.disabled;
      const firstFlavour = form.elements.namedItem('Flavour').value;
      for (const option of secondFlavour.options) option.disabled = option.value === firstFlavour;
      if (!secondFlavour.disabled && secondFlavour.value === firstFlavour) {
        secondFlavour.value = Array.from(secondFlavour.options).find(option => !option.disabled).value;
      }
    }
    if (glutenFree && pizzaSizes) {
      glutenFree.disabled = pizzaSizes.value !== '14″ Medium';
      if (glutenFree.disabled && glutenFree.checked) form.elements.namedItem('Crust').value = 'New York Thin';
    }
  }
  function updateSummary() {
    syncOptions();
    const choices = selections();
    summary.replaceChildren();
    for (const choice of choices) {
      const row = document.createElement('li');
      const key = document.createElement('span');
      const value = document.createElement('span');
      key.textContent = choice.group + ':';
      value.textContent = choice.value;
      row.append(key, value);
      summary.append(row);
    }
    subtotal.textContent = money.format(priceOf(choices));
    if (submitTotal) submitTotal.textContent = '– ' + subtotal.textContent;
  }
  layout.addEventListener('change', updateSummary);
  quantity?.addEventListener('input', updateSummary);
  layout.querySelectorAll('[data-quantity]').forEach(button => {
    button.addEventListener('click', () => {
      quantity.value = Math.min(20, Math.max(1, units() + Number(button.dataset.quantity)));
      updateSummary();
    });
  });
  form.addEventListener('reset', () => setTimeout(updateSummary, 0));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const choices = selections();
    const prefix = units() > 1 ? units() + ' × ' : '';
    const name = prefix + form.dataset.config + ' · ' + choices.map(choice => choice.value).join(', ');
    addToCart(name, priceOf(choices));
  });
  updateSummary();
});
document.querySelectorAll('.local-form').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    form.querySelector('.form-response').textContent = 'Online submission is currently unavailable.';
  });
});
