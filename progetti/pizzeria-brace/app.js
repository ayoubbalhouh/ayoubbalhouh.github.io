// ===== Utilità =====
const $ = (s) => document.querySelector(s);
const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const DAYS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const MIN_DELIVERY = 12;
const DELIVERY_FEE = 2;
const item = (id) => MENU.find((m) => m.id === id);
const fmtTime = (h) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;

// ===== Stato =====
const state = { cart: load(), mode: 'asporto' };

function load() {
  try {
    const c = JSON.parse(localStorage.getItem('brace-cart')) || {};
    Object.keys(c).forEach((k) => { if (!item(k)) delete c[k]; });
    return c;
  } catch { return {}; }
}
function save() { try { localStorage.setItem('brace-cart', JSON.stringify(state.cart)); } catch { /* niente storage */ } }

// ===== Orari =====
function nowHours() { const d = new Date(); return d.getHours() + d.getMinutes() / 60; }

function renderStatus() {
  const day = new Date().getDay();
  const h = HOURS[day];
  const now = nowHours();
  let text;
  if (h && now >= h[0] && now < h[1]) text = `Aperto ora · chiude alle ${fmtTime(h[1])}`;
  else if (h && now < h[0]) text = `Apre oggi alle ${fmtTime(h[0])} · ordina già adesso`;
  else {
    let d = (day + 1) % 7;
    while (!HOURS[d]) d = (d + 1) % 7;
    text = `Chiuso ora · riapre ${d === (day + 1) % 7 ? 'domani' : DAYS[d].toLowerCase()} alle ${fmtTime(HOURS[d][0])}`;
  }
  $('#openStatus').textContent = text;

  $('#hours').innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => `
    <li class="${d === day ? 'today' : ''}"><span>${DAYS[d]}</span><span>${HOURS[d] ? `${fmtTime(HOURS[d][0])} – ${fmtTime(HOURS[d][1])}` : 'Chiuso'}</span></li>`).join('');
}

// Fasce orarie ogni 15 minuti
function timeSlots() {
  const today = new Date().getDay();
  const now = nowHours();
  const slots = [];
  for (let offset = 0; offset < 7 && slots.length === 0; offset++) {
    const d = (today + offset) % 7;
    const h = HOURS[d];
    if (!h) continue;
    let start = offset === 0 ? Math.max(h[0], now + 0.5) : h[0];
    start = Math.ceil(start * 4) / 4;
    const label = offset === 0 ? 'Oggi' : offset === 1 ? 'Domani' : DAYS[d];
    for (let t = start; t <= h[1] - 0.25; t += 0.25) slots.push(`${label} ${fmtTime(t)}`);
    if (offset === 0 && now >= h[0] && now < h[1] - 0.5) slots.unshift('Prima possibile (~35 min)');
  }
  return slots;
}

// ===== Menu =====
function renderTabs() {
  $('#tabs').innerHTML = CATS.map((c, i) => `<a href="#cat-${c.id}" class="tab ${i === 0 ? 'active' : ''}" data-tab="${c.id}">${c.label}</a>`).join('');
}

function control(id) {
  const q = state.cart[id] || 0;
  return q === 0
    ? `<button class="add" data-inc="${id}" aria-label="Aggiungi ${item(id).name}">+</button>`
    : `<div class="stepper"><button data-dec="${id}" aria-label="Togli">−</button><span>${q}</span><button data-inc="${id}" aria-label="Aggiungi">+</button></div>`;
}

function renderMenu() {
  $('#menuList').innerHTML = CATS.map((c) => {
    const items = MENU.filter((m) => m.cat === c.id);
    const isPizza = items[0].toppings;
    return `
      <div class="cat" id="cat-${c.id}" data-cat="${c.id}">
        <h3 class="cat-title">${c.label}</h3>
        <div class="${isPizza ? 'pizzas' : 'rows'}">
          ${items.map((m) => isPizza ? `
            <article class="pizza-card ${state.cart[m.id] ? 'in-cart' : ''}" data-card="${m.id}">
              <div class="pizza-img">${drawPizza(m, m.seed)}</div>
              ${m.tags.includes('top') ? '<span class="ribbon">★ La più amata</span>' : ''}
              <div class="pizza-body">
                <div class="pizza-top">
                  <h4>${m.name}</h4>
                  <span class="price">${euro.format(m.price)}</span>
                </div>
                <p>${m.desc}</p>
                <div class="pizza-foot">
                  <div class="tags">${m.tags.filter((t) => t !== 'top').map((t) => `<span class="tag tag-${t}">${TAGS[t]}</span>`).join('')}</div>
                  <div class="ctrl" data-ctrl="${m.id}">${control(m.id)}</div>
                </div>
              </div>
            </article>` : `
            <div class="row-item" data-card="${m.id}">
              <span class="row-icon">${m.icon}</span>
              <div class="row-text"><h4>${m.name}</h4><p>${m.desc}</p></div>
              <span class="price">${euro.format(m.price)}</span>
              <div class="ctrl" data-ctrl="${m.id}">${control(m.id)}</div>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');
}

// Aggiorna solo i controlli che cambiano (niente ridisegno delle pizze)
function refreshControls() {
  document.querySelectorAll('[data-ctrl]').forEach((el) => {
    const id = el.dataset.ctrl;
    el.innerHTML = control(id);
    el.closest('[data-card]').classList.toggle('in-cart', !!state.cart[id]);
  });
}

// ===== Carrello =====
function setQty(id, q) {
  const before = state.cart[id] || 0;
  if (q <= 0) delete state.cart[id]; else state.cart[id] = Math.min(q, 30);
  save();
  refreshControls();
  renderOrder();
  if (q > before) {
    toast(`${item(id).name} aggiunta`);
    const bar = $('#orderBar'); bar.classList.remove('pop'); void bar.offsetWidth; bar.classList.add('pop');
  }
}

function totals() {
  const sub = Object.entries(state.cart).reduce((s, [id, q]) => s + item(id).price * q, 0);
  const fee = state.mode === 'consegna' && sub > 0 ? DELIVERY_FEE : 0;
  return { sub, fee, total: sub + fee, count: Object.values(state.cart).reduce((a, b) => a + b, 0) };
}

function renderOrder() {
  const { sub, fee, total, count } = totals();
  const entries = Object.entries(state.cart);

  $('#orderBar').hidden = count === 0;
  $('#obCount').textContent = count;
  $('#obTotal').textContent = euro.format(sub);

  $('#orderItems').innerHTML = entries.length ? entries.map(([id, q]) => {
    const m = item(id);
    return `
      <div class="oi">
        <div class="oi-img">${m.toppings ? drawPizza(m, m.seed) : `<span>${m.icon}</span>`}</div>
        <div class="oi-text"><strong>${m.name}</strong><span>${euro.format(m.price)}</span></div>
        ${control(id)}
      </div>`;
  }).join('') : `
    <div class="empty">
      <div class="empty-pizza">${drawPizza(MENU[0], 99)}</div>
      <p><strong>Il tuo ordine è vuoto.</strong><br>Aggiungi una pizza dal menu.</p>
      <button class="btn btn-ghost" data-close data-goto="#menu">Vai al menu</button>
    </div>`;
  $('#orderForm').hidden = entries.length === 0;

  $('#sumSub').textContent = euro.format(sub);
  $('#rowDelivery').hidden = fee === 0;
  $('#sumTotal').textContent = euro.format(total);
  const short = state.mode === 'consegna' && sub < MIN_DELIVERY;
  $('#minWarn').hidden = !short;
  $('#minWarn').textContent = short ? `Per la consegna l'ordine minimo è ${euro.format(MIN_DELIVERY)}: aggiungi ancora ${euro.format(MIN_DELIVERY - sub)}.` : '';
  $('#submitBtn').disabled = short;
  $('#submitBtn').textContent = `Invia ordine · ${euro.format(total)}`;
}

function renderSlots() {
  const slots = timeSlots();
  $('#timeSelect').innerHTML = slots.map((s) => `<option>${s}</option>`).join('');
}

// ===== Pannello =====
let lastFocus;
function openPanel() {
  $('#orderStep').hidden = false;
  $('#successStep').hidden = true;
  renderSlots();
  renderOrder();
  lastFocus = document.activeElement;
  const o = $('#orderPanel');
  o.hidden = false;
  requestAnimationFrame(() => o.classList.add('open'));
  document.body.classList.add('locked');
  setTimeout(() => o.querySelector('.close').focus(), 60);
}
function closePanel(goto) {
  const o = $('#orderPanel');
  o.classList.remove('open');
  document.body.classList.remove('locked');
  setTimeout(() => { o.hidden = true; if (goto) document.querySelector(goto).scrollIntoView({ behavior: 'smooth' }); }, 220);
  lastFocus?.focus({ preventScroll: true });
}

// ===== Toast =====
let tt;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 1600);
}

// ===== Eventi =====
document.addEventListener('click', (e) => {
  const t = e.target;
  const inc = t.closest('[data-inc]');
  const dec = t.closest('[data-dec]');
  if (inc) return setQty(inc.dataset.inc, (state.cart[inc.dataset.inc] || 0) + 1);
  if (dec) return setQty(dec.dataset.dec, (state.cart[dec.dataset.dec] || 0) - 1);
  if (t.closest('[data-open-order]')) return openPanel();
  const close = t.closest('[data-close]');
  if (close || t.id === 'orderPanel') return closePanel(close?.dataset.goto);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#orderPanel').hidden) closePanel(); });

document.querySelectorAll('input[name=mode]').forEach((r) => r.addEventListener('change', () => {
  state.mode = r.value;
  $('#addressFields').hidden = state.mode !== 'consegna';
  $('#checkout').indirizzo.required = state.mode === 'consegna';
  renderOrder();
}));

$('#checkout').addEventListener('input', (e) => e.target.classList.remove('invalid'));
$('#checkout').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  let ok = true;
  f.querySelectorAll('input[required]').forEach((i) => {
    const valid = i.value.trim() !== '' && i.checkValidity();
    i.classList.toggle('invalid', !valid);
    if (!valid) ok = false;
  });
  if (!ok) { f.querySelector('.invalid').focus(); return toast('Completa i campi evidenziati'); }

  const firstPizza = MENU.find((m) => state.cart[m.id] && m.toppings) || MENU[0];
  const when = f.orario.value.startsWith('Prima')
    ? `${state.mode === 'consegna' ? 'consegna' : 'ritiro'} tra circa 35 minuti`
    : `${state.mode === 'consegna' ? 'consegna' : 'ritiro'} ${f.orario.value.replace('Oggi', 'oggi alle').replace('Domani', 'domani alle')}`;

  $('#successPizza').innerHTML = drawPizza(firstPizza, firstPizza.seed);
  $('#sOrder').textContent = '#' + Math.floor(1000 + Math.random() * 9000);
  $('#sWhen').textContent = when;
  $('#sPhone').textContent = f.telefono.value;
  $('#sLast').textContent = state.mode === 'consegna' ? 'In consegna' : 'Pronto da ritirare';

  state.cart = {};
  save();
  f.reset();
  state.mode = 'asporto';
  $('#addressFields').hidden = true;
  refreshControls();
  renderOrder();
  $('#orderStep').hidden = true;
  $('#successStep').hidden = false;
});

// Tab attiva mentre scorri il menu
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === en.target.dataset.cat));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

// Header con sfondo dopo lo scroll
window.addEventListener('scroll', () => $('#header').classList.toggle('scrolled', scrollY > 20), { passive: true });

// ===== Avvio =====
$('#embers').innerHTML = Array.from({ length: 26 }, () =>
  `<span style="left:${(Math.random() * 100).toFixed(1)}%;animation-delay:${(Math.random() * 8).toFixed(2)}s;animation-duration:${(6 + Math.random() * 6).toFixed(2)}s"></span>`).join('');
renderStatus();
renderTabs();
renderMenu();
renderOrder();
document.querySelectorAll('.cat').forEach((c) => io.observe(c));
