# Spinta · Landing page per un'agenzia di marketing

Landing page per un'agenzia di marketing digitale (inventata), realizzata da **Ayoub Balhouh**.
Unisce sviluppo front-end e competenze di digital marketing: è pensata per **convertire visite in richieste di preventivo** e per **misurare** ogni passo.

## Funzionalità
- Modulo preventivo in 3 passi con barra di avanzamento, slider del budget e validazione per ogni passo
- Prezzi mensili/annuali con sconto calcolato, scelta del pacchetto ricordata nel modulo
- **Tracciamento conversioni** in stile Google Tag Manager: `dataLayer` con eventi `page_view`, `cta_click`, `pricing_toggle`, `select_plan`, `form_start`, `form_step`, `generate_lead`
- **Parametri UTM** (`utm_source`, `utm_medium`, `utm_campaign`) salvati per la sessione e allegati alla richiesta
- Pannello di debug degli eventi: aggiungi `?debug=1` all'indirizzo
- SEO: meta description, Open Graph, URL canonico, dati strutturati schema.org (`ProfessionalService`)
- Animazioni allo scroll, contatori, grafico SVG animato; rispetta "riduci animazioni"
- FAQ accessibili con `<details>`, menu mobile, layout responsive

Prova: `index.html?debug=1&utm_source=instagram&utm_campaign=natale`

## Tecnologie
HTML5, CSS3, JavaScript vanilla. Nessuna libreria.

> Progetto demo: agenzia, clienti e risultati sono inventati. Nessun dato viene inviato.
