// Anno nel footer
document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Effetto "macchina da scrivere" sul ruolo
const roles = ['Laravel & PHP', 'WordPress', 'JavaScript', 'Social & content'];
const typed = document.getElementById('typed');
if (!reduceMotion && typed) {
  let r = 0, i = roles[0].length, deleting = true;
  const tick = () => {
    typed.textContent = roles[r].slice(0, i);
    if (deleting) {
      if (--i === 0) { deleting = false; r = (r + 1) % roles.length; }
    } else if (++i === roles[r].length) {
      deleting = true;
      return setTimeout(tick, 1800);
    }
    setTimeout(tick, deleting ? 45 : 85);
  };
  setTimeout(tick, 2200);
}

// Barra di navigazione: sfondo dopo lo scroll e menu mobile
const nav = document.getElementById('nav');
const menuBtn = document.getElementById('menuBtn');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

menuBtn.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuBtn.setAttribute('aria-expanded', open);
});
document.querySelectorAll('#links a').forEach((a) => a.addEventListener('click', () => {
  document.body.classList.remove('menu-open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

// Link attivo in base alla sezione visibile
const sections = [...document.querySelectorAll('main section[id]')];
const links = [...document.querySelectorAll('#links a')];
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach((s) => io.observe(s));

// Selettore Sviluppo / Social, con link diretti #sviluppo e #social
const panels = ['sviluppo', 'social'];
function showPanel(name, scroll) {
  panels.forEach((p) => {
    document.getElementById('panel-' + p).hidden = p !== name;
    document.getElementById('tab-' + p).setAttribute('aria-selected', p === name);
  });
  if (name !== 'social') document.querySelectorAll('#panel-social video').forEach((v) => v.pause());
  if (scroll) document.getElementById('progetti').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}
document.querySelectorAll('.sw').forEach((b) => b.addEventListener('click', () => {
  showPanel(b.dataset.panel, false);
  history.replaceState(null, '', '#' + b.dataset.panel);
}));
const fromHash = () => { const h = location.hash.slice(1); if (panels.includes(h)) showPanel(h, true); };
addEventListener('hashchange', fromHash);
fromHash();

// Filtro dei progetti
const chips = document.querySelectorAll('.filters .chip');
const projects = document.querySelectorAll('.project');
chips.forEach((chip) => chip.addEventListener('click', () => {
  const f = chip.dataset.filter;
  chips.forEach((c) => c.classList.toggle('active', c === chip));
  let visible = 0;
  projects.forEach((p) => {
    const show = f === 'tutti' || p.dataset.cat.split(' ').includes(f);
    p.classList.toggle('hide', !show);
    if (show) visible++;
  });
  document.getElementById('emptyFilter').hidden = visible > 0;
}));

// Copia l'email negli appunti
const toastEl = document.getElementById('toast');
document.getElementById('copyEmail').addEventListener('click', async (e) => {
  const email = e.currentTarget.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    toastEl.textContent = 'Email copiata ✓';
  } catch {
    location.href = 'mailto:' + email;
    return;
  }
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1800);
});

// Animazione di entrata allo scroll
const revealer = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.section-head, .project, .skill, .about > *, .timeline li, .contact-inner').forEach((el) => {
  el.classList.add('reveal');
  revealer.observe(el);
});
