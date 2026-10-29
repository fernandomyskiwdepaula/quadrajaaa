/* =========================================================
   QuadraJá — dados mockados
   Gera 30 quadras determinísticas (sempre os mesmos dados).
   ========================================================= */

const SPORTS = [
  { id: 'society',      label: 'Futebol Society', short: 'Futebol',       emoji: '⚽' },
  { id: 'futsal',       label: 'Futsal',          short: 'Futsal',        emoji: '🥅' },
  { id: 'volei',        label: 'Vôlei',           short: 'Vôlei',         emoji: '🏐' },
  { id: 'volei-praia',  label: 'Vôlei de praia',  short: 'Vôlei de praia', emoji: '🏖️' },
  { id: 'beach-tennis', label: 'Beach tennis',    short: 'Beach tennis',  emoji: '🎾' },
  { id: 'basquete',     label: 'Basquete',        short: 'Basquete',      emoji: '🏀' },
  { id: 'tenis',        label: 'Tênis',           short: 'Tênis',         emoji: '🎾' },
  { id: 'padel',        label: 'Padel',           short: 'Padel',         emoji: '🏓' },
  { id: 'poli',         label: 'Poliesportiva',   short: 'Poliesportiva', emoji: '🏟️' }
];

const FLOORS = [
  { id: 'grama-sintetica', label: 'Grama sintética' },
  { id: 'grama-natural',   label: 'Grama natural' },
  { id: 'areia',           label: 'Areia' },
  { id: 'cimento',         label: 'Cimento' },
  { id: 'madeira',         label: 'Madeira' },
  { id: 'saibro',          label: 'Saibro' },
  { id: 'borracha',        label: 'Quadra de borracha' }
];

const AMENITIES = [
  { id: 'iluminacao',    label: 'Iluminação noturna',   icon: 'lightbulb' },
  { id: 'vestiario',     label: 'Vestiário',            icon: 'shirt' },
  { id: 'chuveiro',      label: 'Chuveiro',             icon: 'shower-head' },
  { id: 'estacionamento',label: 'Estacionamento',       icon: 'car' },
  { id: 'lanchonete',    label: 'Lanchonete/bar',       icon: 'utensils' },
  { id: 'churrasqueira', label: 'Churrasqueira',        icon: 'flame' },
  { id: 'arquibancada',  label: 'Arquibancada',         icon: 'users' },
  { id: 'coberta',       label: 'Quadra coberta',       icon: 'umbrella' },
  { id: 'bola-coletes',  label: 'Aluguel de bola/coletes', icon: 'circle-dot' },
  { id: 'wifi',          label: 'Wi-Fi',                icon: 'wifi' },
  { id: 'acessibilidade',label: 'Acessibilidade',       icon: 'accessibility' }
];

const CITIES = [
  { name: 'Curitiba',       uf: 'PR' },
  { name: 'São Paulo',      uf: 'SP' },
  { name: 'Rio de Janeiro', uf: 'RJ' },
  { name: 'Belo Horizonte', uf: 'MG' }
];

/* Gerador pseudoaleatório com semente (mulberry32) */
function seeded(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* [nome, esporte, bairro, cidade, piso, preço/h, m², capacidade] */
const BASE = [
  ['Arena Batel Society',       'society',      'Batel',            'Curitiba', 'grama-sintetica', 160, 800, 14],
  ['Campo do Água Verde',       'society',      'Água Verde',       'Curitiba', 'grama-sintetica', 140, 750, 14],
  ['Ginásio Portão Futsal',     'futsal',       'Portão',           'Curitiba', 'cimento',         110, 450, 10],
  ['Quadra Santa Felicidade',   'futsal',       'Santa Felicidade', 'Curitiba', 'borracha',        120, 440, 10],
  ['Vôlei Clube Bigorrilho',    'volei',        'Bigorrilho',       'Curitiba', 'madeira',         100, 280, 12],
  ['Areia Mossunguê',           'volei-praia',  'Mossunguê',        'Curitiba', 'areia',            80, 250, 8],
  ['Beach Arena Ecoville',      'beach-tennis', 'Ecoville',         'Curitiba', 'areia',            90, 200, 4],
  ['Basket Center Centro Cívico','basquete',    'Centro Cívico',    'Curitiba', 'madeira',         130, 420, 10],
  ['Tênis Park Cabral',         'tenis',        'Cabral',           'Curitiba', 'saibro',          150, 260, 4],
  ['Padel House Juvevê',        'padel',        'Juvevê',           'Curitiba', 'grama-sintetica', 170, 200, 4],
  ['Ginásio Poliesportivo Boqueirão','poli',    'Boqueirão',        'Curitiba', 'madeira',         190, 900, 20],
  ['Campo Novo Mundo FC',       'society',      'Novo Mundo',       'Curitiba', 'grama-natural',   180, 1000, 14],
  ['Society Hauer Premium',     'society',      'Hauer',            'Curitiba', 'grama-sintetica', 130, 700, 14],
  ['Futsal Cajuru Indoor',      'futsal',       'Cajuru',           'Curitiba', 'cimento',          90, 420, 10],
  ['Beach Sports Campo Comprido','beach-tennis','Campo Comprido',   'Curitiba', 'areia',            75, 190, 4],
  ['Padel Club Alto da XV',     'padel',        'Alto da XV',       'Curitiba', 'grama-sintetica', 150, 200, 4],
  ['Arena Vila Madalena',       'society',      'Vila Madalena',    'São Paulo','grama-sintetica', 260, 850, 14],
  ['Quadra Pinheiros Futsal',   'futsal',       'Pinheiros',        'São Paulo','borracha',        220, 460, 10],
  ['Padel Moema Club',          'padel',        'Moema',            'São Paulo','grama-sintetica', 280, 200, 4],
  ['Basquete Vila Mariana',     'basquete',     'Vila Mariana',     'São Paulo','madeira',         210, 430, 10],
  ['Tênis Itaim Court',         'tenis',        'Itaim Bibi',       'São Paulo','saibro',          240, 270, 4],
  ['Poli Tatuapé',              'poli',         'Tatuapé',          'São Paulo','madeira',         230, 880, 20],
  ['Vôlei de Praia Ipanema',    'volei-praia',  'Ipanema',          'Rio de Janeiro','areia',      120, 260, 8],
  ['Beach Tennis Barra',        'beach-tennis', 'Barra da Tijuca',  'Rio de Janeiro','areia',      140, 200, 4],
  ['Society Recreio Arena',     'society',      'Recreio',          'Rio de Janeiro','grama-sintetica',200, 820, 14],
  ['Futsal Tijuca Indoor',      'futsal',       'Tijuca',           'Rio de Janeiro','cimento',    150, 440, 10],
  ['Arena Savassi Society',     'society',      'Savassi',          'Belo Horizonte','grama-sintetica',170, 780, 14],
  ['Padel Lourdes',             'padel',        'Lourdes',          'Belo Horizonte','grama-sintetica',190, 200, 4],
  ['Vôlei Pampulha',            'volei',        'Pampulha',         'Belo Horizonte','madeira',    110, 290, 12],
  ['Basquete Funcionários',     'basquete',     'Funcionários',     'Belo Horizonte','borracha',   125, 410, 10]
];

const OWNERS = ['Arena Esportes Ltda', 'Clube Esportivo Aurora', 'Grupo Jogue Bem', 'Espaço Atleta', 'Complexo Esportivo Vitória', 'Quadras do Parque', 'Sport Center Total'];
const STREETS = ['Rua das Palmeiras', 'Av. República Argentina', 'Rua Bom Jesus', 'Av. Presidente Kennedy', 'Rua Padre Anchieta', 'Rua Mateus Leme', 'Av. Brasil', 'Rua XV de Novembro', 'Rua Saldanha Marinho', 'Av. das Américas'];
const PHONES = ['41999990001', '41999990002', '11999990003', '21999990004', '31999990005'];

/* Foto de placeholder (picsum, determinística por semente) */
function courtImg(id, i, w = 800, h = 600) {
  return `https://picsum.photos/seed/quadraja-${id}-${i}/${w}/${h}`;
}

const COURTS = BASE.map((row, idx) => {
  const [name, sport, neighborhood, city, floor, price, size, capacity] = row;
  const id = idx + 1;
  const r = seeded(id * 97 + 13);
  const sp = SPORTS.find(s => s.id === sport);
  const uf = CITIES.find(c => c.name === city).uf;

  // Comodidades: algumas sempre presentes, outras sorteadas
  const amenities = [];
  AMENITIES.forEach(a => {
    let chance = 0.45;
    if (a.id === 'iluminacao') chance = 0.85;
    if (a.id === 'coberta') chance = ['cimento', 'madeira', 'borracha'].includes(floor) ? 0.8 : 0.2;
    if (a.id === 'churrasqueira') chance = sport === 'society' ? 0.6 : 0.25;
    if (r() < chance) amenities.push(a.id);
  });

  // Horários livres hoje (a partir de 17h)
  const slots = [];
  for (let h = 17; h <= 22; h++) if (r() < 0.62) slots.push(h);
  if (!slots.length) slots.push(20, 21);

  const rating = Math.round((4.0 + r() * 0.99) * 10) / 10;
  return {
    id, name, sport, sportLabel: sp.label, neighborhood, city, uf,
    street: `${STREETS[Math.floor(r() * STREETS.length)]}, ${100 + Math.floor(r() * 2800)}`,
    price, floor, floorLabel: FLOORS.find(f => f.id === floor).label,
    size, capacity, amenities, slots,
    rating, reviews: 12 + Math.floor(r() * 240),
    featured: id % 4 === 1 || id % 7 === 0,
    owner: OWNERS[Math.floor(r() * OWNERS.length)],
    phone: PHONES[Math.floor(r() * PHONES.length)],
    dist: Math.round((0.5 + r() * 14) * 10) / 10,   // km (fictício)
    mx: 8 + Math.floor(r() * 82), my: 10 + Math.floor(r() * 78), // posição do pin no mapa estático
    photos: [1, 2, 3, 4, 5].map(i => courtImg(id, i)),
    description: `${name} é um espaço ${sp.label.toLowerCase()} localizado em ${neighborhood}, ${city}. Piso de ${FLOORS.find(f => f.id === floor).label.toLowerCase()}, ${size} m² e capacidade para ${capacity} jogadores. Ideal para rachas com os amigos, treinos, aulas e confraternizações.`
  };
});