const mobileToggle = document.querySelector('.mobile-toggle');
const navigation = document.querySelector('#navigation');
mobileToggle.addEventListener('click', () => {
  const open = navigation.classList.toggle('visible');
  mobileToggle.setAttribute('aria-expanded', String(open));
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
const count = document.querySelector('[data-cart-count]');
const toast = document.querySelector('.toast');
let toastTimer;

function renderCart() {
  count.textContent = cart.length;
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
document.querySelector('.cart-toggle').addEventListener('click', () => dialog.showModal());
dialog.querySelector('.close-cart').addEventListener('click', () => dialog.close());
document.querySelectorAll('[data-add]').forEach(button => {
  button.addEventListener('click', () => addToCart(button.dataset.add, Number(button.dataset.price)));
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
document.querySelectorAll('[data-config]').forEach(form => {
  const layout = form.closest('.configure');
  const summary = layout.querySelector('[data-selection]');
  const subtotal = layout.querySelector('[data-total]');
  function selections() {
    return Array.from(form.querySelectorAll('input:checked'));
  }
  function priceOf(choices) {
    return choices.reduce((sum, item) => sum + Number(item.dataset.cost), 0);
  }
  function updateSummary() {
    const choices = selections();
    summary.replaceChildren();
    choices.forEach(choice => {
      const item = document.createElement('li');
      item.textContent = choice.value;
      summary.append(item);
    });
    subtotal.textContent = money.format(priceOf(choices));
  }
  form.addEventListener('change', updateSummary);
  form.addEventListener('reset', () => setTimeout(updateSummary, 0));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const choices = selections();
    const name = form.dataset.config + ' · ' + choices.map(choice => choice.value).join(', ');
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
