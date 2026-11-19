# Conti · Fatture e clienti

Web app per gestire fatture, clienti e incassi, pensata per freelance e piccole imprese italiane. Realizzata da **Ayoub Balhouh**.

## Funzionalità
- **Panoramica**: incassato dell'anno, da incassare, fatture scadute, clienti attivi e grafico del fatturato degli ultimi 12 mesi con la media
- **Fatture**: numerazione progressiva per anno (es. 2026/035), voci con quantità e prezzo, IVA 22/10/4/0%, totali calcolati in tempo reale
- **Stati**: bozza → inviata → pagata; "scaduta" è calcolata dalla data di scadenza, con link per mandare un sollecito
- Filtri per stato, ricerca per cliente o numero, **esportazione CSV** compatibile con Excel (separatore `;`)
- **PDF**: layout di stampa dedicato, basta "Salva come PDF" dal browser
- Duplica fattura, modifica, elimina
- **Clienti**: fatturato e importi da incassare per cliente, controllo della **partita IVA italiana** (cifra di controllo)
- Dati salvati nel browser (localStorage), con dati di esempio ripristinabili
- Navigazione con router basato sull'hash, responsive con barra di navigazione in basso su mobile

## Tecnologie
HTML5, CSS3, JavaScript vanilla (nessuna libreria). `<dialog>` nativo, `Intl.NumberFormat` per gli importi, `@media print` per il PDF.

## Struttura
- `js/store.js` – dati, salvataggio, calcoli (totali, stato, P.IVA) e dati demo
- `js/app.js` – router e schermate

> Progetto demo: aziende e importi sono inventati.
