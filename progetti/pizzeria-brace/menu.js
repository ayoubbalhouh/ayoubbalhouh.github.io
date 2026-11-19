// Menu della pizzeria. "toppings" serve per disegnare la pizza.
const MENU = [
  { id: 'margherita', cat: 'classiche', name: 'Margherita', price: 7, tags: ['veg'], seed: 11,
    desc: 'Pomodoro San Marzano, fior di latte, basilico, olio EVO', sauce: 'rossa', toppings: ['basil', 'oil'] },
  { id: 'marinara', cat: 'classiche', name: 'Marinara', price: 6, tags: ['veg'], seed: 12, cheese: false,
    desc: 'Pomodoro, aglio, origano, olio EVO', sauce: 'rossa', toppings: ['garlic', 'basil', 'oil'] },
  { id: 'diavola', cat: 'classiche', name: 'Diavola', price: 8.5, tags: ['piccante'], seed: 13,
    desc: 'Pomodoro, fior di latte, salame piccante, peperoncino', sauce: 'rossa', toppings: ['salami', 'chili'] },
  { id: 'capricciosa', cat: 'classiche', name: 'Capricciosa', price: 9.5, tags: [], seed: 14,
    desc: 'Pomodoro, fior di latte, cotto, funghi, olive nere', sauce: 'rossa', toppings: ['cotto', 'mushroom', 'olive'] },
  { id: 'funghi', cat: 'classiche', name: 'Funghi', price: 8, tags: ['veg'], seed: 15,
    desc: 'Pomodoro, fior di latte, funghi champignon, prezzemolo', sauce: 'rossa', toppings: ['mushroom', 'basil'] },
  { id: 'quattro', cat: 'classiche', name: '4 Formaggi', price: 9, tags: ['veg'], seed: 16,
    desc: 'Fior di latte, gorgonzola, fontina, parmigiano', sauce: 'bianca', toppings: ['gorgonzola'] },

  { id: 'brace', cat: 'speciali', name: 'La Brace', price: 12, tags: ['piccante', 'top'], seed: 21,
    desc: '’Nduja calabrese, burrata, pomodoro, basilico', sauce: 'rossa', toppings: ['burrata', 'nduja', 'basil'] },
  { id: 'crudo', cat: 'speciali', name: 'Crudo e Burrata', price: 12.5, tags: ['top'], seed: 22,
    desc: 'Burrata, prosciutto crudo 24 mesi, rucola, pomodorini', sauce: 'bianca', toppings: ['burrata', 'prosciutto', 'arugula', 'cherry'] },
  { id: 'salsiccia', cat: 'speciali', name: 'Salsiccia e Friarielli', price: 11, tags: [], seed: 23,
    desc: 'Fior di latte, salsiccia, friarielli napoletani', sauce: 'bianca', toppings: ['friarielli', 'sausage'] },
  { id: 'ortolana', cat: 'speciali', name: 'Ortolana', price: 10, tags: ['veg'], seed: 24,
    desc: 'Pomodoro, fior di latte, zucchine, cipolla rossa, pomodorini, olive', sauce: 'rossa', toppings: ['zucchini', 'onion', 'cherry', 'olive'] },

  { id: 'cola', cat: 'bevande', name: 'Coca-Cola', price: 3, desc: 'Lattina 33 cl', icon: '🥤' },
  { id: 'birra', cat: 'bevande', name: 'Birra artigianale', price: 5.5, desc: 'Bionda, bottiglia 33 cl', icon: '🍺' },
  { id: 'acqua', cat: 'bevande', name: 'Acqua naturale', price: 2, desc: 'Bottiglia 50 cl', icon: '💧' },
  { id: 'tiramisu', cat: 'dolci', name: 'Tiramisù', price: 5, desc: 'Fatto in casa, con mascarpone fresco', icon: '🍰' },
  { id: 'cannolo', cat: 'dolci', name: 'Cannolo siciliano', price: 4, desc: 'Ricotta di pecora e gocce di cioccolato', icon: '🥐' },
];

const CATS = [
  { id: 'classiche', label: 'Classiche' },
  { id: 'speciali', label: 'Speciali' },
  { id: 'bevande', label: 'Bevande' },
  { id: 'dolci', label: 'Dolci' },
];

const TAGS = { veg: 'Vegetariana', piccante: 'Piccante', top: 'La più amata' };

// Orari di apertura (0 = domenica)
const HOURS = { 0: [18.5, 23.5], 1: null, 2: [18.5, 23], 3: [18.5, 23], 4: [18.5, 23], 5: [18.5, 23.5], 6: [18.5, 23.5] };
