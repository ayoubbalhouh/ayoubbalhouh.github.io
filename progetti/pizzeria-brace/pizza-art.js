// Disegna una pizza in SVG partendo dalla lista degli ingredienti.
// Ogni pizza ha un "seed" fisso, così il disegno è sempre uguale.

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Punto casuale dentro un cerchio di raggio r
function spot(rand, r) {
  const a = rand() * Math.PI * 2;
  const d = Math.sqrt(rand()) * r;
  return [Math.cos(a) * d, Math.sin(a) * d];
}

// Cerchio "irregolare" (per salsa e bordo)
function blob(rand, r, wobble, points = 28) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r + (rand() - 0.5) * wobble;
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[(i + 1) % pts.length], p2 = pts[(i + 2) % pts.length];
    const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
    d += ` Q${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  return d + 'Z';
}

const TOPPINGS = {
  basil: (x, y, rot, s) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
      <path d="M-9 0 Q0 -8 9 0 Q0 8 -9 0Z" fill="#2e7d32"/><path d="M-8 0H8" stroke="#4caf50" stroke-width=".8"/></g>`,
  salami: (x, y, rot, s, rand) => `<g transform="translate(${x} ${y}) scale(${s})">
      <circle r="11" fill="#9f1d24"/><circle r="11" fill="none" stroke="#5e0f14" stroke-width="1.6" opacity=".7"/>
      ${[0, 1, 2, 3].map(() => `<circle cx="${((rand() - .5) * 14).toFixed(1)}" cy="${((rand() - .5) * 14).toFixed(1)}" r="1.4" fill="#f1b3a8"/>`).join('')}</g>`,
  olive: (x, y) => `<g transform="translate(${x} ${y})"><circle r="4.6" fill="#231f1c"/><circle r="1.8" fill="#5b4636"/></g>`,
  mushroom: (x, y, rot, s) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
      <path d="M-9 0 Q-9 -9 0 -9 Q9 -9 9 0Z" fill="#d8c09a"/><rect x="-3" y="-1" width="6" height="8" rx="2" fill="#e8d8bd"/></g>`,
  arugula: (x, y, rot, s) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
      <path d="M-10 0 L-6 -3 L-4 0 L0 -4 L2 0 L6 -3 L10 0 L6 3 L2 1 L0 4 L-4 1 L-6 3Z" fill="#3f8f2f"/></g>`,
  friarielli: (x, y, rot, s) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
      <path d="M-11 0 Q-4 -7 4 -4 Q11 0 4 4 Q-4 7 -11 0Z" fill="#1f5a24"/></g>`,
  prosciutto: (x, y, rot, s) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
      <path d="M-14 -4 Q-6 -10 2 -5 Q10 -9 14 -2 Q8 6 0 3 Q-8 8 -14 -4Z" fill="#e48c8c"/>
      <path d="M-10 -3 Q-3 -6 4 -3" stroke="#fbe3df" stroke-width="1.6" fill="none"/></g>`,
  cotto: (x, y, rot, s) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
      <rect x="-11" y="-7" width="22" height="14" rx="5" fill="#f2a9a0"/><rect x="-11" y="-7" width="22" height="14" rx="5" fill="none" stroke="#e48c8c"/></g>`,
  cherry: (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})">
      <circle r="7" fill="#d9302a"/><path d="M-5 -1 A5 5 0 0 1 5 -1" fill="#f0705c"/><circle r="1.2" cy="2" fill="#f6d36b"/></g>`,
  chili: (x, y, rot) => `<rect x="${x}" y="${y}" width="3" height="1.6" rx=".6" fill="#e3361f" transform="rotate(${rot} ${x} ${y})"/>`,
  sausage: (x, y, rot, s) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
      <path d="M-6 -3 Q-2 -7 4 -4 Q8 0 4 4 Q-2 6 -6 2Z" fill="#8a4a2b"/><circle cx="1" r="1.3" fill="#b8734c"/></g>`,
  onion: (x, y, rot) => `<path d="M${x - 7} ${y} A7 7 0 0 1 ${x + 7} ${y}" fill="none" stroke="#b77aa8" stroke-width="2.4" stroke-linecap="round" transform="rotate(${rot} ${x} ${y})"/>`,
  nduja: (x, y, rot, s, rand) => `<path d="${blob(rand, 7 * s, 5, 10)}" transform="translate(${x} ${y})" fill="#cf3d18"/>`,
  gorgonzola: (x, y, rot, s, rand) => `<path d="${blob(rand, 6 * s, 4, 9)}" transform="translate(${x} ${y})" fill="#f3efdc" stroke="#9fb3a0" stroke-width=".8"/>`,
  zucchini: (x, y) => `<g transform="translate(${x} ${y})"><circle r="7" fill="#3d7a35"/><circle r="5.6" fill="#e3e8b5"/><circle r="1.6" fill="#c8cf8a"/></g>`,
  oil: (x, y) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.4" fill="#ffe08a" opacity=".55"/>`,
  garlic: (x, y, rot) => `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="1.6" fill="#fff6dd" transform="rotate(${rot} ${x} ${y})"/>`,
};

// Quanti pezzi per ogni ingrediente
const COUNTS = { basil: 6, salami: 9, olive: 10, mushroom: 9, arugula: 22, friarielli: 14, prosciutto: 6, cotto: 7, cherry: 8, chili: 30, sausage: 14, onion: 9, nduja: 7, gorgonzola: 10, zucchini: 9, oil: 6, garlic: 12 };

function drawPizza(p, seed = 1) {
  const rand = rng(seed);
  const id = 'pz' + seed;
  const sauce = p.sauce === 'bianca' ? '#f3e6c4' : '#c8321c';
  let svg = `<svg viewBox="-112 -112 224 224" role="img" aria-label="${p.name || 'Pizza'}">
    <defs>
      <radialGradient id="${id}c" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#f6d08e"/><stop offset=".78" stop-color="#e3a457"/><stop offset="1" stop-color="#b8702f"/></radialGradient>
      <radialGradient id="${id}s" cx="50%" cy="50%" r="50%"><stop offset=".7" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    </defs>
    <circle r="110" fill="url(#${id}s)"/>
    <path d="${blob(rand, 100, 7)}" fill="url(#${id}c)"/>`;

  // bruciature sul cornicione
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2, d = 88 + rand() * 9;
    svg += `<ellipse cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d).toFixed(1)}" rx="${(2 + rand() * 5).toFixed(1)}" ry="${(1.5 + rand() * 3).toFixed(1)}" fill="#3b2516" opacity="${(.35 + rand() * .45).toFixed(2)}" transform="rotate(${(a * 57.3).toFixed(0)} ${(Math.cos(a) * d).toFixed(1)} ${(Math.sin(a) * d).toFixed(1)})"/>`;
  }

  svg += `<path d="${blob(rand, 82, 8)}" fill="${sauce}"/>`;
  if (p.sauce !== 'bianca') svg += `<path d="${blob(rand, 70, 10)}" fill="#b02a17" opacity=".35"/>`;

  // formaggio a chiazze
  if (p.cheese !== false) {
    for (let i = 0; i < 16; i++) {
      const [x, y] = spot(rand, 64);
      svg += `<path d="${blob(rand, 9 + rand() * 9, 6, 10)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" fill="#fdf1cf" opacity=".95"/>`;
    }
  }

  // burrata al centro
  if (p.toppings.includes('burrata')) {
    svg += `<circle r="24" fill="#000" opacity=".12" cy="3"/><path d="${blob(rand, 23, 4, 14)}" fill="#fffbf1"/><path d="${blob(rand, 12, 4, 10)}" fill="#f7f0de"/>`;
  }

  p.toppings.filter((t) => TOPPINGS[t]).forEach((t) => {
    for (let i = 0; i < COUNTS[t]; i++) {
      const [x, y] = spot(rand, 70);
      if (p.toppings.includes('burrata') && Math.hypot(x, y) < 26 && t !== 'basil') continue;
      svg += TOPPINGS[t](+x.toFixed(1), +y.toFixed(1), Math.round(rand() * 360), +(0.85 + rand() * 0.35).toFixed(2), rand);
    }
  });

  return svg + '</svg>';
}
