// ===== Utilità =====
const $ = (sel) => document.querySelector(sel);
const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const FREE_SHIPPING = 39;
const SHIPPING_COST = 4.9;
const COD_FEE = 2;

// ===== Stato =====
const state = {
  category: 'tutti',
  query: '',
  sort: 'consigliati',
  cart: loadCart(),      // { idProdotto: quantità }
  modalProduct: null,
  modalQty: 1,
};

function loadCart() {
  try { return JSON.parse(localStorage.getItem('gn-cart')) || {}; } catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem('gn-cart', JSON.stringify(state.cart)); } catch { /* storage non disponibile */ }
}
const findProduct = (id) => PRODUCTS.find((p) => p.id === Number(id));
const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id).label;

// ===== Immagini prodotto (SVG generati, nessun file esterno) =====
function productArt(p, fill = false) {
  const label = `
    <rect x="72" y="100" width="56" height="50" rx="4" fill="#fff"/>
    <rect x="82" y="112" width="36" height="4" rx="2" fill="${p.color}"/>
    <rect x="86" y="122" width="28" height="3" rx="1.5" fill="${p.color}" opacity=".45"/>
    <rect x="90" y="131" width="20" height="3" rx="1.5" fill="${p.color}" opacity=".45"/>`;
  const shapes = {
    bag: `
      <path d="M60 62h80l8 108a8 8 0 0 1-8 8H60a8 8 0 0 1-8-8z" fill="${p.color}"/>
      <rect x="58" y="44" width="84" height="20" rx="3" fill="${p.color}"/>
      <rect x="58" y="60" width="84" height="4" fill="#000" opacity=".18"/>
      <path d="M100 66v108" stroke="#fff" stroke-opacity=".08" stroke-width="30"/>`,
    tin: `
      <rect x="62" y="62" width="76" height="116" rx="8" fill="${p.color}"/>
      <rect x="58" y="48" width="84" height="20" rx="5" fill="${p.color}"/>
      <rect x="58" y="64" width="84" height="4" fill="#000" opacity=".2"/>
      <rect x="62" y="70" width="12" height="104" fill="#fff" opacity=".08"/>`,
    box: `
      <rect x="52" y="68" width="96" height="110" rx="6" fill="${p.color}"/>
      <path d="M52 74a6 6 0 0 1 6-6h84a6 6 0 0 1 6 6v8H52z" fill="#000" opacity=".15"/>
      <rect x="52" y="82" width="96" height="3" fill="#fff" opacity=".12"/>`,
  };
  return `<svg viewBox="0 0 200 200" ${fill ? 'preserveAspectRatio="xMidYMid slice"' : ''} role="img" aria-label="${p.name}">
    <rect width="200" height="200" fill="${p.bg}"/>
    <ellipse cx="100" cy="182" rx="56" ry="6" fill="#000" opacity=".08"/>
    ${shapes[p.shape]}${label}
  </svg>`;
}

// ===== Filtri e prodotti =====
function renderFilters() {
  $('#filters').innerHTML = CATEGORIES.map((c) => `
    <button class="chip ${c.id === state.category ? 'active' : ''}" data-cat="${c.id}" role="tab"
      aria-selected="${c.id === state.category}">${c.label}</button>`).join('');
}

function visibleProducts() {
  const q = state.query.trim().toLowerCase();
  const list = PRODUCTS.filter((p) =>
    (state.category === 'tutti' || p.category === state.category) &&
    (!q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)));

  const sorters = {
    'consigliati': (a, b) => a.rank - b.rank,
    'prezzo-asc': (a, b) => a.price - b.price,
    'prezzo-desc': (a, b) => b.price - a.price,
    'nome': (a, b) => a.name.localeCompare(b.name, 'it'),
  };
  return list.sort(sorters[state.sort]);
}

function renderProducts() {
  const list = visibleProducts();
  $('#products').innerHTML = list.map((p) => `
    <article class="product">
      <button class="product-img" data-open="${p.id}" aria-label="Dettagli ${p.name}">
        ${productArt(p)}
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      </button>
      <div class="product-body">
        <p class="product-cat">${categoryLabel(p.category)} · ${p.weight}</p>
        <h3><button data-open="${p.id}">${p.name}</button></h3>
        <div class="product-foot">
          <span class="price">${euro.format(p.price)}</span>
          <button class="add" data-add="${p.id}" aria-label="Aggiungi ${p.name} al carrello">+ Aggiungi</button>
        </div>
      </div>
    </article>`).join('');
  $('#empty').hidden = list.length > 0;
  $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'prodotto' : 'prodotti'}`;
}

// ===== Carrello =====
function addToCart(id, qty = 1) {
  state.cart[id] = (state.cart[id] || 0) + qty;
  saveCart();
  renderCart();
  const btn = $('#openCart');
  btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  toast(`${findProduct(id).name} aggiunto al carrello`);
}

function setQty(id, qty) {
  if (qty <= 0) delete state.cart[id];
  else state.cart[id] = qty;
  saveCart();
  renderCart();
}

function cartTotals() {
  const subtotal = Object.entries(state.cart)
    .reduce((sum, [id, qty]) => sum + findProduct(id).price * qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING_COST;
  return { subtotal, shipping, total: subtotal + shipping };
}

function renderCart() {
  const entries = Object.entries(state.cart).filter(([id]) => findProduct(id));
  const count = entries.reduce((n, [, q]) => n + q, 0);
  $('#cartCount').textContent = count;
  $('#cartCount').classList.toggle('show', count > 0);

  $('#cartItems').innerHTML = entries.length ? entries.map(([id, qty]) => {
    const p = findProduct(id);
    return `
      <div class="cart-item">
        <div class="ci-img">${productArt(p)}</div>
        <div class="ci-info">
          <p class="ci-name">${p.name}</p>
          <p class="muted small">${p.weight} · ${euro.format(p.price)}</p>
          <div class="qty qty-sm">
            <button data-dec="${id}" aria-label="Meno">−</button><span>${qty}</span><button data-inc="${id}" aria-label="Più">+</button>
          </div>
        </div>
        <div class="ci-side">
          <strong>${euro.format(p.price * qty)}</strong>
          <button class="link" data-remove="${id}">Rimuovi</button>
        </div>
      </div>`;
  }).join('') : `
    <div class="cart-empty">
      <p>Il carrello è vuoto.</p>
      <button class="btn btn-ghost" data-close>Continua lo shopping</button>
    </div>`;

  const { subtotal, shipping, total } = cartTotals();
  $('#subtotal').textContent = euro.format(subtotal);
  $('#shipping').textContent = shipping === 0 ? 'Gratis' : euro.format(shipping);
  $('#total').textContent = euro.format(total);
  $('#cartFoot').hidden = entries.length === 0;

  const missing = FREE_SHIPPING - subtotal;
  $('#shippingText').innerHTML = missing > 0
    ? `Ti mancano <strong>${euro.format(missing)}</strong> per la spedizione gratuita`
    : '🎉 Hai diritto alla <strong>spedizione gratuita</strong>';
  $('#shippingFill').style.width = `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%`;
}

// ===== Finestre (modali e carrello) =====
let lastFocus = null;
function openLayer(el) {
  document.querySelectorAll('.overlay:not([hidden])').forEach((o) => { if (o !== el) closeLayer(o, false); });
  lastFocus = document.activeElement;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('open'));
  document.body.classList.add('locked');
  setTimeout(() => el.querySelector('.close')?.focus(), 50);
}
function closeLayer(el, restoreFocus = true) {
  el.classList.remove('open');
  setTimeout(() => { el.hidden = true; }, 200);
  if (!document.querySelector('.overlay.open')) document.body.classList.remove('locked');
  if (restoreFocus) lastFocus?.focus();
}

function openProduct(id) {
  const p = findProduct(id);
  state.modalProduct = p;
  state.modalQty = 1;
  $('#pmImage').innerHTML = productArt(p);
  $('#pmCategory').textContent = `${categoryLabel(p.category)} · ${p.weight}`;
  $('#pmTitle').textContent = p.name;
  $('#pmPrice').textContent = euro.format(p.price);
  $('#pmDesc').textContent = p.desc;
  $('#pmDetails').innerHTML = p.details.map((d) => `<li>${d}</li>`).join('');
  $('#pmQty').textContent = 1;
  openLayer($('#productModal'));
}

// ===== Checkout =====
function openCheckout() {
  $('#checkoutStep').hidden = false;
  $('#successStep').hidden = true;
  updateCheckoutTotal();
  openLayer($('#checkoutModal'));
}
function updateCheckoutTotal() {
  const cod = $('#checkoutForm').pagamento.value === 'contrassegno' ? COD_FEE : 0;
  $('#coTotal').textContent = euro.format(cartTotals().total + cod);
}

function validate(form) {
  let ok = true;
  form.querySelectorAll('input[required]').forEach((input) => {
    const valid = input.value.trim() !== '' && input.checkValidity();
    input.classList.toggle('invalid', !valid);
    if (!valid) ok = false;
  });
  return ok;
}

// ===== Toast =====
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ===== Eventi =====
$('#filters').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-cat]');
  if (!btn) return;
  state.category = btn.dataset.cat;
  renderFilters();
  renderProducts();
});
$('#search').addEventListener('input', (e) => { state.query = e.target.value; renderProducts(); });
$('#sort').addEventListener('change', (e) => { state.sort = e.target.value; renderProducts(); });

document.addEventListener('click', (e) => {
  const t = e.target;
  const open = t.closest('[data-open]');
  const add = t.closest('[data-add]');
  if (add) return addToCart(Number(add.dataset.add));
  if (open) return openProduct(open.dataset.open);
  if (t.closest('[data-inc]')) { const id = t.closest('[data-inc]').dataset.inc; return setQty(id, state.cart[id] + 1); }
  if (t.closest('[data-dec]')) { const id = t.closest('[data-dec]').dataset.dec; return setQty(id, state.cart[id] - 1); }
  if (t.closest('[data-remove]')) return setQty(t.closest('[data-remove]').dataset.remove, 0);
  if (t.closest('[data-close]') || t.classList.contains('overlay')) {
    const layer = t.closest('.overlay');
    if (layer) closeLayer(layer);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const layer = document.querySelector('.overlay.open');
    if (layer) closeLayer(layer);
  }
});

$('#openCart').addEventListener('click', () => openLayer($('#cartDrawer')));
$('#goCheckout').addEventListener('click', openCheckout);

$('#pmMinus').addEventListener('click', () => { state.modalQty = Math.max(1, state.modalQty - 1); $('#pmQty').textContent = state.modalQty; });
$('#pmPlus').addEventListener('click', () => { state.modalQty = Math.min(20, state.modalQty + 1); $('#pmQty').textContent = state.modalQty; });
$('#pmAdd').addEventListener('click', () => {
  addToCart(state.modalProduct.id, state.modalQty);
  closeLayer($('#productModal'));
});

$('#checkoutForm').addEventListener('change', updateCheckoutTotal);
$('#checkoutForm').addEventListener('input', (e) => e.target.classList.remove('invalid'));
$('#checkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  if (!validate(form)) return toast('Controlla i campi evidenziati');
  $('#orderId').textContent = '#GN' + Math.floor(100000 + Math.random() * 900000);
  $('#orderEmail').textContent = form.email.value;
  state.cart = {};
  saveCart();
  renderCart();
  form.reset();
  $('#checkoutStep').hidden = true;
  $('#successStep').hidden = false;
});

// ===== Avvio =====
$('#heroArt').innerHTML = [PRODUCTS[0], PRODUCTS[3], PRODUCTS[5]]
  .map((p) => `<div class="hero-card">${productArt(p, true)}</div>`).join('');
renderFilters();
renderProducts();
renderCart();
