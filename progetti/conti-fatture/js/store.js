// ===== Dati: salvati nel localStorage del browser =====
const KEY = 'conti-data-v1';

const Store = {
  data: null,

  load() {
    try { this.data = JSON.parse(localStorage.getItem(KEY)); } catch { this.data = null; }
    if (!this.data) this.data = demoData();
    return this.data;
  },

  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch { /* storage pieno o bloccato */ }
  },

  reset() {
    this.data = demoData();
    this.save();
  },

  id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  },

  client(id) { return this.data.clients.find((c) => c.id === id); },
  invoice(id) { return this.data.invoices.find((i) => i.id === id); },

  nextNumber(year) {
    const nums = this.data.invoices.filter((i) => i.anno === year).map((i) => i.numero);
    return (nums.length ? Math.max(...nums) : 0) + 1;
  },

  upsertClient(c) {
    if (c.id) Object.assign(this.client(c.id), c);
    else this.data.clients.push({ ...c, id: this.id() });
    this.save();
  },

  upsertInvoice(inv) {
    if (inv.id && this.invoice(inv.id)) Object.assign(this.invoice(inv.id), inv);
    else {
      inv.id = this.id();
      this.data.invoices.push(inv);
    }
    this.save();
    return inv;
  },

  deleteInvoice(id) {
    this.data.invoices = this.data.invoices.filter((i) => i.id !== id);
    this.save();
  },

  deleteClient(id) {
    if (this.data.invoices.some((i) => i.clienteId === id)) return false;
    this.data.clients = this.data.clients.filter((c) => c.id !== id);
    this.save();
    return true;
  },
};

// ===== Calcoli =====
// Data in formato AAAA-MM-GG secondo l'ora locale (non UTC)
const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayISO = () => isoDate(new Date());

function addDays(iso, days) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

function totals(inv) {
  const imponibile = inv.righe.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.prezzo) || 0), 0);
  const iva = imponibile * (Number(inv.iva) || 0) / 100;
  return { imponibile, iva, totale: imponibile + iva };
}

// "scaduta" non si salva: si calcola dalla data di scadenza
function statusOf(inv) {
  if (inv.stato === 'inviata' && inv.scadenza < todayISO()) return 'scaduta';
  return inv.stato;
}

function numberLabel(inv) {
  return `${inv.anno}/${String(inv.numero).padStart(3, '0')}`;
}

// P.IVA italiana: 11 cifre con cifra di controllo (algoritmo di Luhn modificato)
function validPiva(piva) {
  if (!/^\d{11}$/.test(piva)) return false;
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    let n = Number(piva[i]);
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
}

// ===== Dati di esempio =====
function demoData() {
  const clients = [
    { id: 'c1', nome: 'Pasticceria Riva S.n.c.', piva: '01234567897', email: 'info@pasticceriariva.example', citta: 'Treviso' },
    { id: 'c2', nome: 'Officina Bici Lenta', piva: '04567890126', email: 'ciao@bicilenta.example', citta: 'Padova' },
    { id: 'c3', nome: 'Studio Dentistico Sorriso', piva: '02345678904', email: 'segreteria@sorriso.example', citta: 'Vicenza' },
    { id: 'c4', nome: 'Osteria al Ponte', piva: '03456789019', email: 'osteria@alponte.example', citta: 'Bassano del Grappa' },
    { id: 'c5', nome: 'Fiori di Brenta', piva: '05678901231', email: 'fiori@brenta.example', citta: 'Dolo' },
  ];
  const lavori = [
    ['Sito web vetrina', 1, 1200], ['Gestione social (mese)', 1, 450], ['Campagna Meta Ads (setup)', 1, 300],
    ['Shooting fotografico', 1, 380], ['Landing page', 1, 650], ['Manutenzione sito (mese)', 1, 90],
    ['Logo e immagine coordinata', 1, 800], ['Ore di consulenza', 4, 55],
  ];

  // generatore pseudo-casuale fisso: i dati demo sono sempre uguali
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

  const invoices = [];
  const today = new Date();
  const year = today.getFullYear();
  const counters = {};
  for (let m = 11; m >= 0; m--) {
    const perMonth = 2 + Math.floor(rand() * 3);
    for (let k = 0; k < perMonth; k++) {
      const d = new Date(today.getFullYear(), today.getMonth() - m, 2 + Math.floor(rand() * 25));
      if (d > today) continue;
      const data = isoDate(d);
      const anno = d.getFullYear();
      counters[anno] = (counters[anno] || 0) + 1;
      const righe = Array.from({ length: 1 + Math.floor(rand() * 2) }, () => {
        const l = lavori[Math.floor(rand() * lavori.length)];
        return { desc: l[0], qty: l[1], prezzo: l[2] };
      });
      const scadenza = addDays(data, 30);
      let stato = 'pagata';
      if (m === 0) stato = rand() < 0.5 ? 'inviata' : 'bozza';
      else if (m <= 2) stato = rand() < 0.45 ? 'inviata' : 'pagata';
      invoices.push({
        id: 'f' + anno + counters[anno], anno, numero: counters[anno],
        clienteId: clients[Math.floor(rand() * clients.length)].id,
        data, scadenza, righe, iva: 22, stato, note: '',
      });
    }
  }

  return {
    settings: { azienda: 'Mario Bianchi · Web & Marketing', piva: '06789012348', indirizzo: 'Via Roma 10, 35121 Padova', iban: 'IT60 X054 2811 1010 0000 0123 456', year },
    clients,
    invoices,
  };
}
