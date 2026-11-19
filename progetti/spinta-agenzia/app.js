// ===== Tracciamento (stile Google Tag Manager) =====
window.dataLayer = window.dataLayer || [];
const debugOn = new URLSearchParams(location.search).has('debug');

function track(event, params = {}) {
  const entry = { event, ...params, ts: new Date().toLocaleTimeString('it-IT') };
  window.dataLayer.push(entry);
  if (debugOn) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${event}</strong> ${Object.entries(params).map(([k, v]) => `<span>${k}: ${v}</span>`).join('')}`;
    document.getElementById('debugList').prepend(li);
  }
}

if (debugOn) {
  document.getElementById('debug').hidden = false;
  document.getElementById('debugClose').onclick = () => { document.getElementById('debug').hidden = true; };
}

// Salva i parametri UTM della visita (es. ?utm_source=instagram) per allegarli al preventivo
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'];
function readUtm() {
  const params = new URLSearchParams(location.search);
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem('utm')) || {}; } catch { /* storage non disponibile */ }
  UTM_KEYS.forEach((k) => { if (params.get(k)) saved[k] = params.get(k); });
  try { sessionStorage.setItem('utm', JSON.stringify(saved)); } catch { /* niente */ }
  return saved;
}
const utm = readUtm();
track('page_view', { page: 'home', source: utm.utm_source || 'diretto' });

// ===== Header e menu mobile =====
const header = document.getElementById('header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10), { passive: true });

const menuBtn = document.getElementById('menuBtn');
menuBtn.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuBtn.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => {
  document.body.classList.remove('menu-open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

// Click sui pulsanti principali
document.querySelectorAll('[data-track]').forEach((el) => el.addEventListener('click', () => track('cta_click', { position: el.dataset.track })));

// ===== Animazioni allo scroll =====
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealer = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el));

function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const dec = Number(el.dataset.decimals || 0);
  const suffix = el.dataset.suffix || '';
  const fmt = (n) => n.toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
  if (reduceMotion) { el.textContent = fmt(target); return; }
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / 1400);
    el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
setTimeout(() => {
  document.querySelector('.dash').classList.add('drawn');
  document.querySelectorAll('[data-count]').forEach(countUp);
}, 300);

// ===== Prezzi mensili / annuali =====
const fmtEuro = (n) => n.toLocaleString('it-IT') + ' €';
document.querySelectorAll('[data-billing]').forEach((btn) => btn.addEventListener('click', () => {
  const yearly = btn.dataset.billing === 'yearly';
  document.querySelectorAll('[data-billing]').forEach((b) => {
    b.classList.toggle('active', b === btn);
    b.setAttribute('aria-checked', b === btn);
  });
  document.querySelectorAll('[data-price]').forEach((el) => {
    const base = Number(el.dataset.price);
    el.textContent = fmtEuro(yearly ? Math.round(base * 0.85 / 10) * 10 : base);
  });
  track('pricing_toggle', { billing: yearly ? 'annuale' : 'mensile' });
}));

// Scelta di un pacchetto: lo ricordiamo nel modulo
const form = document.getElementById('quote');
document.querySelectorAll('[data-plan]').forEach((a) => a.addEventListener('click', () => {
  form.piano.value = a.dataset.plan;
  const note = document.getElementById('qPlan');
  note.hidden = false;
  note.textContent = `Pacchetto selezionato: ${a.dataset.plan}`;
  track('select_plan', { plan: a.dataset.plan });
}));

// ===== Modulo preventivo in 3 passi =====
let step = 1;
let started = false;
const TOTAL = 3;
const budget = document.getElementById('budget');
const budgetOut = document.getElementById('budgetOut');

function showStep(n) {
  step = n;
  form.querySelectorAll('.q-step').forEach((fs) => { fs.hidden = Number(fs.dataset.step) !== n; });
  document.getElementById('qBar').style.width = `${(n / TOTAL) * 100}%`;
  document.getElementById('qLabel').textContent = `Passo ${n} di ${TOTAL}`;
  document.getElementById('qBack').hidden = n === 1;
  document.getElementById('qNext').textContent = n === TOTAL ? 'Invia la richiesta' : 'Avanti →';
}

function validateStep(n) {
  const fs = form.querySelector(`.q-step[data-step="${n}"]`);
  let ok = true;
  if (n === 1) {
    const any = form.querySelectorAll('input[name=servizi]:checked').length > 0;
    fs.querySelector('[data-error=servizi]').classList.toggle('show', !any);
    ok = any;
  }
  fs.querySelectorAll('input[required]').forEach((input) => {
    const valid = input.type === 'checkbox' ? input.checked : input.value.trim() !== '' && input.checkValidity();
    input.closest('label').classList.toggle('invalid', !valid);
    if (!valid) ok = false;
  });
  return ok;
}

budget.addEventListener('input', () => {
  const v = Number(budget.value);
  budgetOut.textContent = v >= 3000 ? '3.000 €+' : fmtEuro(v);
  budget.style.setProperty('--fill', `${((v - budget.min) / (budget.max - budget.min)) * 100}%`);
});
budget.dispatchEvent(new Event('input'));

form.addEventListener('change', (e) => {
  if (!started) { started = true; track('form_start'); }
  e.target.closest('label')?.classList.remove('invalid');
  if (e.target.name === 'servizi') form.querySelector('[data-error=servizi]').classList.remove('show');
});
form.addEventListener('input', (e) => e.target.closest('label')?.classList.remove('invalid'));

document.getElementById('qBack').addEventListener('click', () => showStep(step - 1));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateStep(step)) {
    form.querySelector('.invalid input, .invalid textarea')?.focus();
    return;
  }
  if (step < TOTAL) {
    track('form_step', { step: step + 1 });
    return showStep(step + 1);
  }

  UTM_KEYS.forEach((k) => { form[k].value = utm[k] || ''; });
  const data = Object.fromEntries(new FormData(form));
  data.servizi = [...form.querySelectorAll('input[name=servizi]:checked')].map((i) => i.value).join(', ');

  // In un sito vero qui ci sarebbe: fetch('/api/lead', { method: 'POST', body: JSON.stringify(data) })
  track('generate_lead', { servizi: data.servizi, budget: data.budget, piano: data.piano || '—', source: data.utm_source || 'diretto' });

  document.getElementById('doneName').textContent = data.nome.split(' ')[0];
  document.getElementById('doneEmail').textContent = data.email;
  document.getElementById('doneCompany').textContent = data.azienda;
  form.hidden = true;
  document.getElementById('quoteDone').hidden = false;
});

document.getElementById('qReset').addEventListener('click', () => {
  form.reset();
  budget.dispatchEvent(new Event('input'));
  document.getElementById('qPlan').hidden = true;
  started = false;
  showStep(1);
  document.getElementById('quoteDone').hidden = true;
  form.hidden = false;
});

showStep(1);
