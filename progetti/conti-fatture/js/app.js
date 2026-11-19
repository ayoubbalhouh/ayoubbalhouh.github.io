// ===== Utilità =====
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const view = $('#view');
const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const STATUS = { bozza: 'Bozza', inviata: 'Inviata', pagata: 'Pagata', scaduta: 'Scaduta' };

// Evita che testo inserito dall'utente diventi HTML
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

const badge = (inv) => { const s = statusOf(inv); return `<span class="badge b-${s}">${STATUS[s]}</span>`; };
const clientName = (id) => esc(Store.client(id)?.nome || 'Cliente eliminato');

// ===== Router (basato sull'hash: #/fatture, #/clienti, ...) =====
const ui = { filter: 'tutte', query: '' };

function router() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [section, id, action] = parts;

  $$('#menu a').forEach((a) => a.classList.toggle('active', a.dataset.route === (section || 'dashboard')));
  view.onclick = null;

  if (!section) renderDashboard();
  else if (section === 'fatture' && id === 'nuova') renderInvoiceForm();
  else if (section === 'fatture' && id && action === 'modifica') renderInvoiceForm(Store.invoice(id));
  else if (section === 'fatture' && id) renderInvoice(Store.invoice(id));
  else if (section === 'fatture') renderInvoices();
  else if (section === 'clienti') renderClients();
  else if (section === 'impostazioni') renderSettings();
  else renderDashboard();

  view.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

// ===== Panoramica =====
function renderDashboard() {
  const year = new Date().getFullYear();
  const inv = Store.data.invoices;
  const sum = (list) => list.reduce((s, i) => s + totals(i).totale, 0);

  const paidYear = inv.filter((i) => i.stato === 'pagata' && i.anno === year);
  const open = inv.filter((i) => statusOf(i) === 'inviata');
  const late = inv.filter((i) => statusOf(i) === 'scaduta');
  const activeClients = new Set(inv.filter((i) => i.data >= addDays(todayISO(), -180)).map((i) => i.clienteId)).size;

  // Fatturato degli ultimi 12 mesi (imponibile, escluse le bozze)
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, k) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + k, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const list = inv.filter((i) => i.stato !== 'bozza' && i.data.startsWith(key));
    return { label: MONTHS[d.getMonth()], value: list.reduce((s, i) => s + totals(i).imponibile, 0), current: k === 11 };
  });
  const max = Math.max(...months.map((m) => m.value), 1);
  const avg = months.reduce((s, m) => s + m.value, 0) / 12;

  const recent = [...inv].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);
  const due = [...late, ...open].sort((a, b) => a.scadenza.localeCompare(b.scadenza)).slice(0, 5);

  view.innerHTML = `
    <header class="page-head">
      <div><p class="eyebrow">Panoramica</p><h1>Ciao, ecco i tuoi conti</h1></div>
      <a href="#/fatture/nuova" class="btn">+ Nuova fattura</a>
    </header>

    <section class="kpis">
      <article class="kpi"><span>Incassato nel ${year}</span><strong>${euro.format(sum(paidYear))}</strong><em>${paidYear.length} fatture pagate</em></article>
      <article class="kpi"><span>Da incassare</span><strong>${euro.format(sum(open))}</strong><em>${open.length} fatture inviate</em></article>
      <article class="kpi ${late.length ? 'kpi-alert' : ''}"><span>Scadute</span><strong>${euro.format(sum(late))}</strong><em>${late.length ? `${late.length} da sollecitare` : 'Tutto in regola'}</em></article>
      <article class="kpi"><span>Clienti attivi</span><strong>${activeClients}</strong><em>negli ultimi 6 mesi</em></article>
    </section>

    <section class="card">
      <div class="card-head"><h2>Fatturato degli ultimi 12 mesi</h2><span class="muted small">Imponibile · media ${euro.format(avg)}/mese</span></div>
      <div class="bars" role="img" aria-label="Grafico del fatturato mensile">
        <div class="avg-line" style="bottom:${(avg / max) * 100}%"><span>media</span></div>
        ${months.map((m) => `
          <div class="bar-col ${m.current ? 'current' : ''}">
            <div class="bar" style="--h:${(m.value / max) * 100}%"><span class="bar-tip">${euro.format(m.value)}</span></div>
            <span class="bar-label">${m.label}</span>
          </div>`).join('')}
      </div>
    </section>

    <div class="grid-2">
      <section class="card">
        <div class="card-head"><h2>Da incassare</h2><a href="#/fatture" class="link" data-filter="tutte">Vedi tutte</a></div>
        ${due.length ? `<ul class="list">${due.map((i) => `
          <li><a href="#/fatture/${i.id}">
            <div><strong>${clientName(i.clienteId)}</strong><span class="muted small">${numberLabel(i)} · scade il ${fmtDate(i.scadenza)}</span></div>
            <div class="right"><strong>${euro.format(totals(i).totale)}</strong>${badge(i)}</div>
          </a></li>`).join('')}</ul>` : '<p class="empty">Nessuna fattura da incassare. 🎉</p>'}
      </section>
      <section class="card">
        <div class="card-head"><h2>Ultime fatture</h2><a href="#/fatture" class="link">Archivio</a></div>
        <ul class="list">${recent.map((i) => `
          <li><a href="#/fatture/${i.id}">
            <div><strong>${clientName(i.clienteId)}</strong><span class="muted small">${numberLabel(i)} · ${fmtDate(i.data)}</span></div>
            <div class="right"><strong>${euro.format(totals(i).totale)}</strong>${badge(i)}</div>
          </a></li>`).join('')}</ul>
      </section>
    </div>`;

  $$('[data-filter]', view).forEach((a) => a.addEventListener('click', () => { ui.filter = a.dataset.filter; }));
  requestAnimationFrame(() => $('.bars', view)?.classList.add('grow'));
}

// ===== Elenco fatture =====
function renderInvoices() {
  view.innerHTML = `
    <header class="page-head">
      <div><p class="eyebrow">Archivio</p><h1>Fatture</h1></div>
      <div class="head-actions">
        <button class="btn btn-ghost" id="exportCsv">⇩ Esporta CSV</button>
        <a href="#/fatture/nuova" class="btn">+ Nuova fattura</a>
      </div>
    </header>
    <div class="toolbar">
      <div class="chips" role="tablist">
        ${['tutte', 'bozza', 'inviata', 'scaduta', 'pagata'].map((f) => `<button class="chip ${ui.filter === f ? 'active' : ''}" data-f="${f}">${f === 'tutte' ? 'Tutte' : STATUS[f]}<em data-count="${f}"></em></button>`).join('')}
      </div>
      <input type="search" id="q" placeholder="Cerca cliente o numero…" value="${esc(ui.query)}" aria-label="Cerca">
    </div>
    <div class="card table-card"><div id="invoiceTable"></div></div>`;

  const draw = () => {
    const q = ui.query.trim().toLowerCase();
    const all = Store.data.invoices;
    $$('[data-count]', view).forEach((em) => {
      const f = em.dataset.count;
      em.textContent = f === 'tutte' ? all.length : all.filter((i) => statusOf(i) === f).length;
    });
    const list = all
      .filter((i) => ui.filter === 'tutte' || statusOf(i) === ui.filter)
      .filter((i) => !q || numberLabel(i).includes(q) || (Store.client(i.clienteId)?.nome || '').toLowerCase().includes(q))
      .sort((a, b) => b.data.localeCompare(a.data) || b.numero - a.numero);

    const total = list.reduce((s, i) => s + totals(i).totale, 0);
    $('#invoiceTable').innerHTML = list.length ? `
      <table class="table">
        <thead><tr><th>Numero</th><th>Cliente</th><th class="hide-sm">Data</th><th class="hide-sm">Scadenza</th><th class="num">Totale</th><th>Stato</th></tr></thead>
        <tbody>${list.map((i) => `
          <tr data-href="#/fatture/${i.id}" tabindex="0">
            <td class="mono">${numberLabel(i)}</td>
            <td><strong>${clientName(i.clienteId)}</strong></td>
            <td class="hide-sm">${fmtDate(i.data)}</td>
            <td class="hide-sm">${fmtDate(i.scadenza)}</td>
            <td class="num">${euro.format(totals(i).totale)}</td>
            <td>${badge(i)}</td>
          </tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="2">${list.length} fatture</td><td class="hide-sm"></td><td class="hide-sm"></td><td class="num">${euro.format(total)}</td><td></td></tr></tfoot>
      </table>` : '<p class="empty">Nessuna fattura trovata.</p>';
  };
  draw();

  $('.chips', view).addEventListener('click', (e) => {
    const b = e.target.closest('[data-f]');
    if (!b) return;
    ui.filter = b.dataset.f;
    $$('.chip', view).forEach((c) => c.classList.toggle('active', c === b));
    draw();
  });
  $('#q').addEventListener('input', (e) => { ui.query = e.target.value; draw(); });
  $('#invoiceTable').addEventListener('click', (e) => { const tr = e.target.closest('tr[data-href]'); if (tr) location.hash = tr.dataset.href; });
  $('#invoiceTable').addEventListener('keydown', (e) => { const tr = e.target.closest('tr[data-href]'); if (tr && e.key === 'Enter') location.hash = tr.dataset.href; });
  $('#exportCsv').addEventListener('click', exportCsv);
}

function exportCsv() {
  const rows = [['Numero', 'Data', 'Scadenza', 'Cliente', 'P.IVA', 'Imponibile', 'IVA', 'Totale', 'Stato']];
  Store.data.invoices.forEach((i) => {
    const t = totals(i);
    const c = Store.client(i.clienteId) || {};
    rows.push([numberLabel(i), i.data, i.scadenza, c.nome || '', c.piva || '', t.imponibile.toFixed(2), t.iva.toFixed(2), t.totale.toFixed(2), STATUS[statusOf(i)]]);
  });
  // Punto e virgola: è il separatore che Excel usa in italiano
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `fatture-${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV scaricato');
}

// ===== Dettaglio fattura (stampabile) =====
function renderInvoice(inv) {
  if (!inv) { view.innerHTML = '<p class="empty">Fattura non trovata. <a href="#/fatture" class="link">Torna all\'archivio</a></p>'; return; }
  const c = Store.client(inv.clienteId) || {};
  const s = Store.data.settings;
  const t = totals(inv);
  const st = statusOf(inv);

  view.innerHTML = `
    <header class="page-head no-print">
      <div><a href="#/fatture" class="back">← Fatture</a><h1>Fattura ${numberLabel(inv)} ${badge(inv)}</h1></div>
      <div class="head-actions">
        ${st === 'bozza' ? '<button class="btn" data-set="inviata">Segna come inviata</button>' : ''}
        ${st === 'inviata' || st === 'scaduta' ? '<button class="btn btn-green" data-set="pagata">✓ Segna come pagata</button>' : ''}
        ${st === 'pagata' ? '<button class="btn btn-ghost" data-set="inviata">Annulla pagamento</button>' : ''}
        <a href="#/fatture/${inv.id}/modifica" class="btn btn-ghost">Modifica</a>
        <button class="btn btn-ghost" id="print">⎙ PDF / Stampa</button>
        <details class="more"><summary class="btn btn-ghost" aria-label="Altre azioni">⋯</summary>
          <div class="more-menu"><button id="dup">Duplica</button><button id="del" class="danger">Elimina</button></div>
        </details>
      </div>
    </header>

    ${st === 'scaduta' ? `<p class="alert no-print">Questa fattura è scaduta il ${fmtDate(inv.scadenza)}. Puoi mandare un sollecito a <a href="mailto:${esc(c.email)}?subject=${encodeURIComponent('Sollecito fattura ' + numberLabel(inv))}">${esc(c.email || 'cliente')}</a>.</p>` : ''}

    <article class="paper">
      <div class="paper-head">
        <div><p class="paper-brand">${esc(s.azienda)}</p><p class="muted small">${esc(s.indirizzo)}<br>P.IVA ${esc(s.piva)}</p></div>
        <div class="paper-title"><h2>Fattura</h2><p>N. <strong>${numberLabel(inv)}</strong></p><p>Data ${fmtDate(inv.data)}</p></div>
      </div>
      <div class="paper-to">
        <p class="muted small">Destinatario</p>
        <p>${[`<strong>${esc(c.nome || '—')}</strong>`, c.citta && esc(c.citta), c.piva && `P.IVA ${esc(c.piva)}`].filter(Boolean).join('<br>')}</p>
      </div>
      <table class="table lines">
        <thead><tr><th>Descrizione</th><th class="num">Q.tà</th><th class="num">Prezzo</th><th class="num">Importo</th></tr></thead>
        <tbody>${inv.righe.map((r) => `<tr><td>${esc(r.desc)}</td><td class="num">${r.qty}</td><td class="num">${euro.format(r.prezzo)}</td><td class="num">${euro.format(r.qty * r.prezzo)}</td></tr>`).join('')}</tbody>
      </table>
      <div class="paper-totals">
        <div><span>Imponibile</span><span>${euro.format(t.imponibile)}</span></div>
        <div><span>IVA ${inv.iva}%</span><span>${euro.format(t.iva)}</span></div>
        <div class="grand"><span>Totale</span><span>${euro.format(t.totale)}</span></div>
      </div>
      <div class="paper-foot">
        <p><strong>Pagamento:</strong> bonifico entro il ${fmtDate(inv.scadenza)}<br>IBAN ${esc(s.iban)}</p>
        ${inv.note ? `<p class="muted">${esc(inv.note)}</p>` : ''}
      </div>
    </article>`;

  $$('[data-set]', view).forEach((b) => b.addEventListener('click', () => {
    inv.stato = b.dataset.set;
    if (inv.stato === 'pagata') inv.pagataIl = todayISO();
    Store.save();
    toast(inv.stato === 'pagata' ? 'Fattura segnata come pagata' : 'Stato aggiornato');
    renderInvoice(inv);
  }));
  $('#print').addEventListener('click', () => window.print());
  $('#dup').addEventListener('click', () => {
    const year = new Date().getFullYear();
    const copy = Store.upsertInvoice({
      ...structuredClone(inv), id: null, anno: year, numero: Store.nextNumber(year),
      data: todayISO(), scadenza: addDays(todayISO(), 30), stato: 'bozza',
    });
    toast(`Creata la bozza ${numberLabel(copy)}`);
    location.hash = `#/fatture/${copy.id}/modifica`;
  });
  $('#del').addEventListener('click', () => {
    if (!confirm(`Eliminare la fattura ${numberLabel(inv)}?`)) return;
    Store.deleteInvoice(inv.id);
    toast('Fattura eliminata');
    location.hash = '#/fatture';
  });
}

// ===== Nuova / modifica fattura =====
function renderInvoiceForm(existing) {
  const year = new Date().getFullYear();
  const inv = existing ? structuredClone(existing) : {
    anno: year, numero: Store.nextNumber(year), clienteId: '', data: todayISO(), scadenza: addDays(todayISO(), 30),
    righe: [{ desc: '', qty: 1, prezzo: 0 }], iva: 22, stato: 'bozza', note: '',
  };

  view.innerHTML = `
    <header class="page-head">
      <div><a href="${existing ? `#/fatture/${inv.id}` : '#/fatture'}" class="back">← Indietro</a><h1>${existing ? `Modifica ${numberLabel(inv)}` : 'Nuova fattura'}</h1></div>
    </header>
    <form class="card form" id="invForm" novalidate>
      <div class="grid-4">
        <label class="span-2">Cliente
          <div class="with-btn">
            <select name="clienteId" required>
              <option value="">Scegli un cliente…</option>
              ${Store.data.clients.map((c) => `<option value="${c.id}" ${c.id === inv.clienteId ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}
            </select>
            <button type="button" class="btn btn-ghost" id="addClient" title="Nuovo cliente">+</button>
          </div>
        </label>
        <label>Numero<input name="numero" type="number" min="1" value="${inv.numero}" required></label>
        <label>IVA %
          <select name="iva">${[22, 10, 4, 0].map((v) => `<option value="${v}" ${Number(inv.iva) === v ? 'selected' : ''}>${v}%</option>`).join('')}</select>
        </label>
        <label>Data<input name="data" type="date" value="${inv.data}" required></label>
        <label>Scadenza<input name="scadenza" type="date" value="${inv.scadenza}" required></label>
        <label class="span-2">Termini
          <div class="chips small-chips">${[0, 15, 30, 60].map((d) => `<button type="button" class="chip" data-days="${d}">${d ? d + ' giorni' : 'Immediato'}</button>`).join('')}</div>
        </label>
      </div>

      <h2 class="form-title">Voci</h2>
      <div class="lines-edit" id="lines"></div>
      <button type="button" class="btn btn-ghost" id="addLine">+ Aggiungi voce</button>

      <div class="form-bottom">
        <label class="note-field"><span>Note <span class="muted">(facoltativo)</span></span><textarea name="note" rows="3" placeholder="Es. Grazie per la fiducia!">${esc(inv.note)}</textarea></label>
        <div class="live-totals" id="liveTotals"></div>
      </div>
      <p class="form-error" id="formError"></p>
      <div class="form-actions">
        <button type="submit" class="btn btn-ghost" data-stato="bozza">Salva bozza</button>
        <button type="submit" class="btn" data-stato="inviata">Salva e segna come inviata</button>
      </div>
    </form>`;

  const form = $('#invForm');

  const drawLines = () => {
    $('#lines').innerHTML = inv.righe.map((r, k) => `
      <div class="line" data-k="${k}">
        <input class="l-desc" data-field="desc" value="${esc(r.desc)}" placeholder="Descrizione del lavoro" aria-label="Descrizione">
        <input class="l-qty" data-field="qty" type="number" min="0" step="0.5" value="${r.qty}" aria-label="Quantità">
        <input class="l-price" data-field="prezzo" type="number" min="0" step="0.01" value="${r.prezzo}" aria-label="Prezzo unitario">
        <span class="l-amount">${euro.format((Number(r.qty) || 0) * (Number(r.prezzo) || 0))}</span>
        <button type="button" class="l-del" data-del="${k}" aria-label="Rimuovi voce" ${inv.righe.length === 1 ? 'disabled' : ''}>×</button>
      </div>`).join('');
    drawTotals();
  };
  const drawTotals = () => {
    inv.iva = Number(form.iva.value);
    const t = totals(inv);
    $('#liveTotals').innerHTML = `
      <div><span>Imponibile</span><span>${euro.format(t.imponibile)}</span></div>
      <div><span>IVA ${inv.iva}%</span><span>${euro.format(t.iva)}</span></div>
      <div class="grand"><span>Totale</span><span>${euro.format(t.totale)}</span></div>`;
  };
  drawLines();

  $('#lines').addEventListener('input', (e) => {
    const line = e.target.closest('.line');
    const r = inv.righe[line.dataset.k];
    r[e.target.dataset.field] = e.target.dataset.field === 'desc' ? e.target.value : Number(e.target.value);
    $('.l-amount', line).textContent = euro.format((Number(r.qty) || 0) * (Number(r.prezzo) || 0));
    drawTotals();
  });
  $('#lines').addEventListener('click', (e) => {
    const k = e.target.closest('[data-del]')?.dataset.del;
    if (k === undefined) return;
    inv.righe.splice(Number(k), 1);
    drawLines();
  });
  $('#addLine').addEventListener('click', () => {
    inv.righe.push({ desc: '', qty: 1, prezzo: 0 });
    drawLines();
    $$('.l-desc', view).at(-1).focus();
  });
  form.iva.addEventListener('change', drawTotals);
  $$('[data-days]', form).forEach((b) => b.addEventListener('click', () => { form.scadenza.value = addDays(form.data.value || todayISO(), Number(b.dataset.days)); }));
  $('#addClient').addEventListener('click', () => openClientModal(null, (c) => {
    form.clienteId.insertAdjacentHTML('beforeend', `<option value="${c.id}">${esc(c.nome)}</option>`);
    form.clienteId.value = c.id;
  }));

  form.addEventListener('input', () => { $('#formError').textContent = ''; });
  form.addEventListener('change', () => { $('#formError').textContent = ''; });

  let submitStato = 'bozza';
  $$('[data-stato]', form).forEach((b) => b.addEventListener('click', () => { submitStato = b.dataset.stato; }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = [];
    const numero = Number(form.numero.value);
    const anno = Number((form.data.value || todayISO()).slice(0, 4));
    if (!form.clienteId.value) errors.push('scegli un cliente');
    if (!form.data.value || !form.scadenza.value) errors.push('inserisci data e scadenza');
    else if (form.scadenza.value < form.data.value) errors.push('la scadenza non può essere prima della data');
    if (!numero || numero < 1) errors.push('il numero deve essere maggiore di 0');
    else if (Store.data.invoices.some((i) => i.anno === anno && i.numero === numero && i.id !== inv.id)) errors.push(`il numero ${anno}/${String(numero).padStart(3, '0')} esiste già`);
    inv.righe = inv.righe.filter((r) => r.desc.trim() || r.prezzo);
    if (!inv.righe.length || inv.righe.some((r) => !r.desc.trim())) errors.push('ogni voce deve avere una descrizione');
    if (inv.righe.some((r) => r.qty <= 0 || r.prezzo < 0)) errors.push('quantità e prezzi devono essere positivi');

    if (errors.length) {
      if (!inv.righe.length) inv.righe.push({ desc: '', qty: 1, prezzo: 0 });
      drawLines();
      $('#formError').textContent = 'Controlla: ' + errors.join(', ') + '.';
      return;
    }

    Object.assign(inv, {
      clienteId: form.clienteId.value, numero, anno, data: form.data.value, scadenza: form.scadenza.value,
      iva: Number(form.iva.value), note: form.note.value.trim(),
      stato: existing && existing.stato === 'pagata' ? 'pagata' : submitStato,
    });
    const saved = Store.upsertInvoice(inv);
    toast(existing ? 'Fattura aggiornata' : `Fattura ${numberLabel(saved)} creata`);
    location.hash = `#/fatture/${saved.id}`;
  });
}

// ===== Clienti =====
function renderClients() {
  const stats = (id) => {
    const list = Store.data.invoices.filter((i) => i.clienteId === id && i.stato !== 'bozza');
    return {
      count: list.length,
      total: list.reduce((s, i) => s + totals(i).totale, 0),
      open: list.filter((i) => i.stato !== 'pagata').reduce((s, i) => s + totals(i).totale, 0),
    };
  };
  const clients = [...Store.data.clients].sort((a, b) => stats(b.id).total - stats(a.id).total);

  view.innerHTML = `
    <header class="page-head">
      <div><p class="eyebrow">Rubrica</p><h1>Clienti</h1></div>
      <button class="btn" id="newClient">+ Nuovo cliente</button>
    </header>
    <div class="clients">
      ${clients.map((c) => {
        const s = stats(c.id);
        return `
        <article class="card client">
          <div class="avatar">${esc(c.nome.trim().charAt(0).toUpperCase())}</div>
          <div class="client-info">
            <h2>${esc(c.nome)}</h2>
            <p class="muted small">${esc(c.citta || '—')}${c.piva ? ` · P.IVA ${esc(c.piva)}` : ''}</p>
            ${c.email ? `<a href="mailto:${esc(c.email)}" class="link small">${esc(c.email)}</a>` : ''}
          </div>
          <dl class="client-stats">
            <div><dt>Fatturato</dt><dd>${euro.format(s.total)}</dd></div>
            <div><dt>Da incassare</dt><dd class="${s.open ? 'warn' : ''}">${euro.format(s.open)}</dd></div>
            <div><dt>Fatture</dt><dd>${s.count}</dd></div>
          </dl>
          <div class="client-actions">
            <button class="btn btn-ghost btn-sm" data-edit="${c.id}">Modifica</button>
            <button class="link small danger" data-remove="${c.id}">Elimina</button>
          </div>
        </article>`;
      }).join('')}
    </div>`;

  $('#newClient').addEventListener('click', () => openClientModal(null, renderClients));
  // onclick (non addEventListener): così non si accumulano gestori a ogni ridisegno
  view.onclick = (e) => {
    const edit = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-remove]');
    if (edit) openClientModal(Store.client(edit.dataset.edit), renderClients);
    if (del) {
      const c = Store.client(del.dataset.remove);
      if (!confirm(`Eliminare ${c.nome}?`)) return;
      if (Store.deleteClient(c.id)) { toast('Cliente eliminato'); renderClients(); }
      else toast('Non puoi eliminare un cliente con fatture');
    }
  };
}

function openClientModal(client, onSave) {
  const dlg = $('#clientModal');
  const f = $('#clientForm');
  f.reset();
  $('#clientError').textContent = '';
  $('#clientModalTitle').textContent = client ? 'Modifica cliente' : 'Nuovo cliente';
  if (client) ['nome', 'piva', 'citta', 'email'].forEach((k) => { f[k].value = client[k] || ''; });

  f.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(['nome', 'piva', 'citta', 'email'].map((k) => [k, f[k].value.trim()]));
    const err = !data.nome ? 'Inserisci il nome.'
      : data.piva && !validPiva(data.piva) ? 'La partita IVA non è valida (11 cifre, con cifra di controllo).'
      : data.email && !f.email.checkValidity() ? "L'email non è valida."
      : '';
    if (err) { $('#clientError').textContent = err; return; }
    Store.upsertClient(client ? { ...data, id: client.id } : data);
    const saved = client ? Store.client(client.id) : Store.data.clients.at(-1);
    dlg.close();
    toast(client ? 'Cliente aggiornato' : 'Cliente aggiunto');
    onSave?.(saved);
  };
  $('#clientCancel').onclick = () => dlg.close();
  dlg.showModal();
  f.nome.focus();
}

// ===== Impostazioni =====
function renderSettings() {
  const s = Store.data.settings;
  view.innerHTML = `
    <header class="page-head"><div><p class="eyebrow">Impostazioni</p><h1>I tuoi dati</h1></div></header>
    <form class="card form narrow" id="setForm">
      <p class="muted">Questi dati compaiono in alto su ogni fattura.</p>
      <label>Nome o ragione sociale<input name="azienda" value="${esc(s.azienda)}" required></label>
      <label>Indirizzo<input name="indirizzo" value="${esc(s.indirizzo)}"></label>
      <div class="two">
        <label>Partita IVA<input name="piva" value="${esc(s.piva)}" maxlength="11"></label>
        <label>IBAN<input name="iban" value="${esc(s.iban)}"></label>
      </div>
      <p class="form-error" id="setError"></p>
      <div class="form-actions"><button class="btn">Salva</button></div>
    </form>
    <section class="card narrow danger-zone">
      <h2>Dati di esempio</h2>
      <p class="muted">Cancella tutte le modifiche e ricarica clienti e fatture di esempio.</p>
      <button class="btn btn-danger" id="resetData">Ripristina dati demo</button>
    </section>`;

  $('#setForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.piva.value && !validPiva(f.piva.value.trim())) { $('#setError').textContent = 'La partita IVA non è valida.'; return; }
    Object.assign(s, { azienda: f.azienda.value.trim(), indirizzo: f.indirizzo.value.trim(), piva: f.piva.value.trim(), iban: f.iban.value.trim() });
    Store.save();
    $('#setError').textContent = '';
    toast('Impostazioni salvate');
  });
  $('#resetData').addEventListener('click', () => {
    if (!confirm('Ripristinare i dati di esempio? Le tue modifiche andranno perse.')) return;
    Store.reset();
    toast('Dati demo ripristinati');
    location.hash = '#/';
  });
}

// ===== Avvio =====
Store.load();
Store.save();
addEventListener('hashchange', router);
router();
