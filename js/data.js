/* =========================================================
   QuadraJá — dados mockados + ilustrações esportivas em SVG
   30 quadras determinísticas (sempre os mesmos dados).
   ========================================================= */

const SPORTS = [
  { id: 'society',      label: 'Futebol Society', short: 'Society',      kind: 'soccer' },
  { id: 'futsal',       label: 'Futsal',          short: 'Futsal',       kind: 'soccer' },
  { id: 'volei',        label: 'Vôlei',           short: 'Vôlei',        kind: 'volley' },
  { id: 'volei-praia',  label: 'Vôlei de praia',  short: 'Vôlei de praia', kind: 'volley' },
  { id: 'beach-tennis', label: 'Beach tennis',    short: 'Beach tennis', kind: 'tennis' },
  { id: 'basquete',     label: 'Basquete',        short: 'Basquete',     kind: 'basket' },
  { id: 'tenis',        label: 'Tênis',           short: 'Tênis',        kind: 'tennis' },
  { id: 'padel',        label: 'Padel',           short: 'Padel',        kind: 'tennis' },
  { id: 'poli',         label: 'Poliesportiva',   short: 'Poliesportiva', kind: 'basket' }
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
  { name: 'Curitiba',       uf: 'PR', sport: 'society' },
  { name: 'São Paulo',      uf: 'SP', sport: 'padel' },
  { name: 'Rio de Janeiro', uf: 'RJ', sport: 'volei-praia' },
  { name: 'Belo Horizonte', uf: 'MG', sport: 'basquete' }
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

/* ---------------------------------------------------------
   ILUSTRAÇÕES ESPORTIVAS
   Cada quadra é desenhada vista de cima, com as linhas
   oficiais da modalidade. Tudo em SVG, sem imagens externas.
   --------------------------------------------------------- */

/* Três "pisos" na paleta da marca: laranja, preto e branco */
const PAL = [
  { floor: '#FF5C00', court: '#E85400', line: '#FFFFFF', ball: '#000000', seam: '#FFFFFF', shade: '#000000' },
  { floor: '#000000', court: '#1C1C1C', line: '#FF5C00', ball: '#FF5C00', seam: '#000000', shade: '#FFFFFF' },
  { floor: '#F2F2F2', court: '#FFFFFF', line: '#000000', ball: '#FF5C00', seam: '#000000', shade: '#000000' }
];
const KIND = { society: 'soccer', futsal: 'soccer', volei: 'volley', 'volei-praia': 'volley', 'beach-tennis': 'tennis', basquete: 'basket', poli: 'basket', tenis: 'tennis', padel: 'tennis' };

/* Linhas da quadra num sistema 200 x 100 */
function courtLines(sp) {
  const R = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  const L = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`;
  const C = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  const outer = R(4, 4, 192, 92);
  const net = `<line x1="100" y1="0" x2="100" y2="100" stroke-width="2.4" stroke-dasharray="2 1.6"/>`;
  switch (sp) {
    case 'society':
      return outer + L(100, 4, 100, 96) + C(100, 50, 14) + R(4, 26, 26, 48) + R(170, 26, 26, 48) + R(4, 38, 10, 24) + R(186, 38, 10, 24) + R(0, 43, 4, 14) + R(196, 43, 4, 14);
    case 'futsal': case 'poli':
      return outer + L(100, 4, 100, 96) + C(100, 50, 13) + '<path d="M4 22A28 28 0 0 1 32 50A28 28 0 0 1 4 78M196 22A28 28 0 0 0 168 50A28 28 0 0 0 196 78"/>' + R(0, 43, 4, 14) + R(196, 43, 4, 14);
    case 'volei':
      return outer + net + L(68, 4, 68, 96) + L(132, 4, 132, 96);
    case 'volei-praia':
      return outer + net;
    case 'beach-tennis':
      return R(24, 10, 152, 80) + net;
    case 'basquete':
      return outer + L(100, 4, 100, 96) + C(100, 50, 12) + R(4, 34, 38, 32) + R(158, 34, 38, 32) + '<path d="M42 38A12 12 0 0 1 42 62M158 38A12 12 0 0 0 158 62"/>' + '<path d="M4 12H20A44 44 0 0 1 20 88H4M196 12H180A44 44 0 0 0 180 88H196"/>';
    case 'tenis':
      return outer + L(4, 15.5, 196, 15.5) + L(4, 84.5, 196, 84.5) + net + L(48, 15.5, 48, 84.5) + L(152, 15.5, 152, 84.5) + L(48, 50, 152, 50);
    case 'padel':
      return '<rect x="4" y="4" width="192" height="92" stroke-width="3"/>' + net + L(33, 4, 33, 96) + L(167, 4, 167, 96) + L(33, 50, 167, 50);
    default:
      return outer + L(100, 4, 100, 96);
  }
}

/* Bola desenhada em SVG (soccer, basket, volley, tennis) */
function ballSVG(kind, x, y, r, fill, stroke, sw = 3, patch = stroke) {
  const base = `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const g = (body) => `<g fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
  if (kind === 'soccer') {
    const pts = [0, 1, 2, 3, 4].map(i => { const a = (-90 + 72 * i) * Math.PI / 180; return [x + Math.cos(a) * r * .36, y + Math.sin(a) * r * .36]; });
    const out = [0, 1, 2, 3, 4].map(i => { const a = (-90 + 72 * i) * Math.PI / 180; return [x + Math.cos(a) * r * .98, y + Math.sin(a) * r * .98]; });
    const poly = `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${patch}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    return base + poly + g(pts.map((p, i) => `<line x1="${p[0]}" y1="${p[1]}" x2="${out[i][0]}" y2="${out[i][1]}"/>`).join(''));
  }
  if (kind === 'basket') {
    return base + g(`<line x1="${x}" y1="${y - r}" x2="${x}" y2="${y + r}"/><line x1="${x - r}" y1="${y}" x2="${x + r}" y2="${y}"/>` +
      `<path d="M${x - r * .72} ${y - r * .7}Q${x - r * .2} ${y} ${x - r * .72} ${y + r * .7}"/><path d="M${x + r * .72} ${y - r * .7}Q${x + r * .2} ${y} ${x + r * .72} ${y + r * .7}"/>`);
  }
  if (kind === 'volley') {
    const arm = a => `<path transform="rotate(${a} ${x} ${y})" d="M${x} ${y - r}Q${x + r * .95} ${y - r * .2} ${x + r * .2} ${y + r * .95}"/>`;
    return base + g(arm(0) + arm(120) + arm(240));
  }
  // tennis
  return base + g(`<path d="M${x - r * .72} ${y - r * .7}A${r * .95} ${r * .95} 0 0 1 ${x - r * .72} ${y + r * .7}"/><path d="M${x + r * .72} ${y - r * .7}A${r * .95} ${r * .95} 0 0 0 ${x + r * .72} ${y + r * .7}"/>`);
}

/* Pictograma de bola para a interface (herda a cor do texto) */
function sportIcon(id, cls = 'h-8 w-8') {
  const kind = KIND[id] || 'soccer';
  return `<svg viewBox="0 0 48 48" class="${cls}" aria-hidden="true">${ballSVG(kind, 24, 24, 20, 'none', 'currentColor', 2.6, 'currentColor')}</svg>`;
}

/* Foto-ilustração da quadra. variant 0..4 = enquadramentos diferentes */
function courtArt(sport, floor, pal, variant, seed) {
  const P = PAL[pal % 3];
  const kind = KIND[sport] || 'soccer';
  const rnd = seeded(seed * 131 + variant * 17 + 5);
  const V = [
    { s: 3.7, fx: 100, fy: 50, rot: 0 },    // quadra inteira
    { s: 7.2, fx: 36, fy: 50, rot: 0 },     // detalhe da área
    { s: 2.7, fx: 100, fy: 50, rot: 90 },   // quadra em pé
    { s: 9,   fx: 100, fy: 50, rot: -12 },  // centro / rede
    { s: 5.2, fx: 152, fy: 38, rot: 7 }     // canto, com a bola
  ][variant % 5];
  const floorCol = floor === 'areia' && pal % 3 === 0 ? '#FF8A3D' : P.floor;
  let b = `<rect width="800" height="600" fill="${floorCol}"/>`;
  b += `<g transform="translate(400 300) rotate(${V.rot}) scale(${V.s}) translate(${-V.fx} ${-V.fy})">`;
  b += `<rect x="0" y="0" width="200" height="100" fill="${P.court}"/>`;
  b += `<g fill="none" stroke="${P.line}" stroke-width="1.3" stroke-linecap="square">${courtLines(sport)}</g></g>`;
  // faixas de luz/sombra (holofote)
  const x1 = rnd() * 420, x2 = 380 + rnd() * 380;
  b += `<polygon points="${x1},0 ${x1 + 120},0 ${x1 - 100},600 ${x1 - 220},600" fill="${P.shade}" opacity=".09"/>`;
  b += `<polygon points="${x2},0 ${x2 + 60},0 ${x2 - 160},600 ${x2 - 220},600" fill="${P.shade}" opacity=".07"/>`;
  // bola
  if ([1, 3, 4].includes(variant % 5)) {
    const r = variant % 5 === 3 ? 74 : variant % 5 === 1 ? 44 : 40;
    const bx = variant % 5 === 3 ? 575 : variant % 5 === 1 ? 600 : 250;
    const by = variant % 5 === 3 ? 370 : variant % 5 === 1 ? 430 : 410;
    b += `<ellipse cx="${bx + r * .25}" cy="${by + r * .55}" rx="${r}" ry="${r * .34}" fill="#000" opacity=".3"/>`;
    b += ballSVG(kind, bx, by, r, P.ball, P.seam, Math.max(3, r * .07), P.seam);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">${b}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* Só as linhas da quadra (sem fundo), para texturas decorativas */
function courtLinesURI(sport, color, sw = 1.2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="${color}" stroke-width="${sw}">${courtLines(sport)}</g></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ---------------------------------------------------------
   QUADRAS
   --------------------------------------------------------- */
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

const COURTS = BASE.map((row, idx) => {
  const [name, sport, neighborhood, city, floor, price, size, capacity] = row;
  const id = idx + 1;
  const r = seeded(id * 97 + 13);
  const sp = SPORTS.find(s => s.id === sport);
  const uf = CITIES.find(c => c.name === city).uf;

  const amenities = [];
  AMENITIES.forEach(a => {
    let chance = 0.45;
    if (a.id === 'iluminacao') chance = 0.85;
    if (a.id === 'coberta') chance = ['cimento', 'madeira', 'borracha'].includes(floor) ? 0.8 : 0.2;
    if (a.id === 'churrasqueira') chance = sport === 'society' ? 0.6 : 0.25;
    if (r() < chance) amenities.push(a.id);
  });

  const slots = [];
  for (let h = 17; h <= 22; h++) if (r() < 0.62) slots.push(h);
  if (!slots.length) slots.push(20, 21);

  const rating = Math.round((4.0 + r() * 0.99) * 10) / 10;
  const pal = id % 3; // alterna piso laranja, preto e branco
  return {
    id, name, sport, sportLabel: sp.label, neighborhood, city, uf,
    street: `${STREETS[Math.floor(r() * STREETS.length)]}, ${100 + Math.floor(r() * 2800)}`,
    price, floor, floorLabel: FLOORS.find(f => f.id === floor).label,
    size, capacity, amenities, slots,
    rating, reviews: 12 + Math.floor(r() * 240),
    featured: id % 4 === 1 || id % 7 === 0,
    owner: OWNERS[Math.floor(r() * OWNERS.length)],
    phone: PHONES[Math.floor(r() * PHONES.length)],
    dist: Math.round((0.5 + r() * 14) * 10) / 10,
    mx: 8 + Math.floor(r() * 82), my: 10 + Math.floor(r() * 78),
    pal,
    photos: [0, 1, 2, 3, 4].map(v => courtArt(sport, floor, pal, v, id)),
    description: `${name} fica em ${neighborhood}, ${city}. Piso de ${FLOORS.find(f => f.id === floor).label.toLowerCase()}, ${size} m² e espaço para ${capacity} jogadores. Serve para racha entre amigos, treino, aula e confraternização.`
  };
});
