/* =========================================================
   QuadraJá — search.js (busca / listagem)
   Filtros, ordenação, paginação, grade/lista, mapa e skeleton.
   ========================================================= */
const PRICE_MAX = 300;
const PAGE_SIZE = { grid: 9, list: 6 };

/* ---------- Estado ---------- */
const params = new URLSearchParams(location.search);
const state = {
  sports: new Set(params.get('sport') ? [params.get('sport')] : []),
  city: 'Curitiba',
  q: '',
  min: 0, max: PRICE_MAX,
  floors: new Set(), amenities: new Set(),
  rating: 0, players: +params.get('players') || 0,
  date: params.get('date') || '',
  from: params.get('start') ? +params.get('start') : null,
  to: params.get('end') ? +params.get('end') : null,
  fav: params.get('fav') === '1',
  sort: 'relevance', view: 'grid', page: 1
};
// "q" da home: se for o nome de uma cidade, vira cidade; senão, busca por bairro/rua em todo o país
(function parseQuery() {
  const q = params.get('q') || '';
  const hit = CITIES.find(c => norm(c.name) === norm(q));
  if (hit) state.city = hit.name;
  else if (q) { state.city = ''; state.q = q; }
  if (state.fav) state.city = '';
})();

/* ---------- Filtro e ordenação ---------- */
function matches(c) {
  const s = state;
  if (s.fav && !getFavs().includes(c.id)) return false;
  if (s.city && c.city !== s.city) return false;
  if (s.q) {
    const t = norm(s.q);
    if (![c.name, c.neighborhood, c.street, c.city, c.sportLabel].some(x => norm(x).includes(t))) return false;
  }
  if (s.sports.size && !s.sports.has(c.sport)) return false;
  if (c.price < s.min || c.price > s.max) return false;
  if (s.floors.size && !s.floors.has(c.floor)) return false;
  for (const a of s.amenities) if (!c.amenities.includes(a)) return false;
  if (s.rating && c.rating < s.rating) return false;
  if (s.players && c.capacity < s.players) return false;
  if (s.from != null || s.to != null) {
    const f = s.from ?? 0, t = s.to ?? 24;
    if (!c.slots.some(h => h >= f && h < t)) return false;
  }
  return true;
}
function getResults() {
  const list = COURTS.filter(matches);
  const sorts = {
    'relevance':  (a, b) => (b.featured - a.featured) || (b.rating - a.rating),
    'price-asc':  (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'rating':     (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    'dist':       (a, b) => a.dist - b.dist
  };
  return list.sort(sorts[state.sort]);
}
function activeFilterCount() {
  const s = state;
  return s.sports.size + s.floors.size + s.amenities.size + (s.min > 0 || s.max < PRICE_MAX ? 1 : 0) +
    (s.rating ? 1 : 0) + (s.players ? 1 : 0) + (s.date || s.from != null || s.to != null ? 1 : 0) + (s.q ? 1 : 0);
}

/* ---------- Sidebar de filtros (construída uma vez, sincronizada pelo estado) ---------- */
function buildFilters() {
  // histograma: 20 faixas de preço
  const bins = Array(20).fill(0);
  COURTS.forEach(c => bins[Math.min(19, Math.floor(c.price / (PRICE_MAX / 20)))]++);
  const maxBin = Math.max(...bins);
  const hist = bins.map((n, i) => `<span data-bin="${i}" class="flex-1 bg-ink" style="height:${Math.max(6, (n / maxBin) * 100)}%"></span>`).join('');

  const section = (id, title, body) => `<section id="${id}" aria-labelledby="${id}-t"><h3 id="${id}-t" class="display mb-2 text-2xl leading-none">${title}</h3>${body}</section>`;
  $('#filters-body').innerHTML = [
    section('f-sport', 'Esporte', `<div class="grid grid-cols-3 gap-2">${SPORTS.map(s => `
      <button type="button" data-sport="${s.id}" aria-pressed="false" class="chip !h-auto !min-w-0 !flex-col !gap-1 !px-0.5 !py-2 text-center !text-[13px] !whitespace-normal break-words">${sportIcon(s.id, 'h-7 w-7')}${s.short}</button>`).join('')}</div>`),
    section('f-q', 'Bairro ou rua', `
      <div class="flex items-center gap-2 border-2 border-ink px-3 focus-within:outline focus-within:outline-[3px] focus-within:outline-fire">
        ${icon('map-pin', 'h-5 w-5')}
        <label for="f-q-input" class="sr-only">Buscar bairro ou rua</label>
        <input id="f-q-input" type="search" class="h-11 w-full bg-transparent outline-none" placeholder="Buscar bairro ou rua" autocomplete="off">
      </div>
      <div id="f-city-tag" class="mt-2"></div>`),
    section('f-price', 'Preço por hora', `
      <p class="mb-2 text-sm text-ash">Sem a taxa de serviço</p>
      <div id="hist" class="flex h-14 items-end gap-0.5" aria-hidden="true">${hist}</div>
      <div class="dual"><div class="track"></div><div class="fill" id="pr-fill"></div>
        <input type="range" id="pr-min" min="0" max="${PRICE_MAX}" step="5" value="0" aria-label="Preço mínimo por hora">
        <input type="range" id="pr-max" min="0" max="${PRICE_MAX}" step="5" value="${PRICE_MAX}" aria-label="Preço máximo por hora"></div>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <div><label for="pr-min-n" class="text-sm text-ash">Mínimo</label><input id="pr-min-n" type="number" min="0" max="${PRICE_MAX}" class="mt-1 h-11 w-full border-2 border-ink px-3" placeholder="R$ 0"></div>
        <div><label for="pr-max-n" class="text-sm text-ash">Máximo</label><input id="pr-max-n" type="number" min="0" max="${PRICE_MAX}" class="mt-1 h-11 w-full border-2 border-ink px-3" placeholder="R$ ${PRICE_MAX}+"></div>
      </div>`),
    section('f-floor', 'Tipo de piso', `<div class="space-y-2">${FLOORS.map(f => `
      <label class="flex cursor-pointer items-center gap-2"><input type="checkbox" data-floor="${f.id}" class="h-5 w-5 accent-[#FF5C00]">${f.label}</label>`).join('')}</div>`),
    section('f-amen', 'Comodidades', `<div class="space-y-2">${AMENITIES.map(a => `
      <label class="flex cursor-pointer items-center gap-2"><input type="checkbox" data-amen="${a.id}" class="h-5 w-5 accent-[#FF5C00]">${icon(a.icon, 'h-4 w-4 text-ash')}${a.label}</label>`).join('')}</div>`),
    section('f-cap', 'Jogadores', `<div class="flex flex-wrap gap-2">${[0, 4, 10, 14, 20].map(n => `
      <button type="button" data-cap="${n}" aria-pressed="false" class="chip">${n ? n + '+' : 'Qualquer'}</button>`).join('')}</div>`),
    section('f-rating', 'Nota mínima', `<div class="flex flex-wrap gap-2">${[0, 3, 4, 4.5].map(n => `
      <button type="button" data-rating="${n}" aria-pressed="false" class="chip">${n ? String(n).replace('.', ',') + '+' : 'Todas'}</button>`).join('')}</div>`),
    section('f-avail', 'Disponibilidade', `
      <label for="f-date" class="text-sm text-ash">Data</label>
      <input id="f-date" type="date" min="${new Date().toISOString().slice(0, 10)}" class="mb-2 mt-1 h-11 w-full border-2 border-ink px-3">
      <div class="grid grid-cols-2 gap-2">
        <div><label for="f-from" class="text-sm text-ash">Das</label><select id="f-from" class="mt-1 h-11 w-full border-2 border-ink bg-white px-2">${hourOptions('', 'Início')}</select></div>
        <div><label for="f-to" class="text-sm text-ash">Até</label><select id="f-to" class="mt-1 h-11 w-full border-2 border-ink bg-white px-2">${hourOptions('', 'Fim')}</select></div>
      </div>`)
  ].join('');
}

/* Reflete o estado na interface dos filtros */
function syncFilters() {
  const s = state;
  $$('[data-sport]').forEach(b => b.setAttribute('aria-pressed', s.sports.has(b.dataset.sport)));
  $$('[data-floor]').forEach(i => i.checked = s.floors.has(i.dataset.floor));
  $$('[data-amen]').forEach(i => i.checked = s.amenities.has(i.dataset.amen));
  $$('[data-cap]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.cap === s.players));
  $$('[data-rating]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.rating === s.rating));
  $('#f-q-input').value = s.q;
  $('#f-date').value = s.date;
  $('#f-from').value = s.from ?? '';
  $('#f-to').value = s.to ?? '';
  $('#f-city-tag').innerHTML = s.city
    ? `<span class="inline-flex items-center gap-1 bg-ink px-3 py-1 text-sm font-semibold text-white">Em ${s.city}<button type="button" id="city-remove" class="p-0.5 hover:text-fire" aria-label="Remover filtro de cidade ${s.city}">${icon('x', 'h-4 w-4')}</button></span>` : '';
  refreshIcons();
  syncPrice();
}
function syncPrice() {
  const { min, max } = state;
  $('#pr-min').value = min; $('#pr-max').value = max;
  $('#pr-min-n').value = min > 0 ? min : '';
  $('#pr-max-n').value = max < PRICE_MAX ? max : '';
  $('#pr-fill').style.left = (min / PRICE_MAX * 100) + '%';
  $('#pr-fill').style.right = (100 - max / PRICE_MAX * 100) + '%';
  $$('#hist [data-bin]').forEach(b => {
    const lo = +b.dataset.bin * (PRICE_MAX / 20), hi = lo + PRICE_MAX / 20;
    const inside = hi > min && lo < max;
    b.style.background = inside ? '#FF5C00' : '#CFCFCF';
  });
}

/* ---------- Chips de filtro rápido ---------- */
function renderChips() {
  const s = state, n = activeFilterCount();
  const chip = (attrs, label, active) =>
    `<button type="button" class="chip ${active ? 'is-active' : ''}" ${attrs} aria-pressed="${active}">${label}</button>`;
  $('#chips').innerHTML = [
    chip('data-chip-open="f-sport"', `${icon('goal')}Esporte${s.sports.size ? ` <b>${s.sports.size}</b>` : ''}`, s.sports.size > 0),
    chip('data-chip-open="f-floor"', `${icon('layers')}Piso${s.floors.size ? ` <b>${s.floors.size}</b>` : ''}`, s.floors.size > 0),
    chip('data-chip-amen="coberta"', `${icon('umbrella')}Coberta`, s.amenities.has('coberta')),
    chip('data-chip-amen="iluminacao"', `${icon('lightbulb')}Iluminação`, s.amenities.has('iluminacao')),
    chip('data-chip-open="f-price"', `${icon('banknote')}Preço`, s.min > 0 || s.max < PRICE_MAX),
    `<button type="button" class="chip !bg-ink !text-white" data-chip-open="f-sport">${icon('sliders-horizontal')}Mais filtros${n ? ` <span class="bg-fire px-1.5 text-ink">${n}</span>` : ''}</button>`
  ].join('');
  $('#filters-count').textContent = n ? `(${n})` : '';
  $('#fab-count').textContent = n || '';
  $('#fab-count').classList.toggle('hidden', !n);
  refreshIcons();
}

/* ---------- Resultados ---------- */
const skeletonCard = () => state.view === 'grid'
  ? `<div class="border-2 border-ink"><div class="skeleton aspect-[4/3]"></div><div class="space-y-3 p-4"><div class="skeleton h-4 w-2/3"></div><div class="skeleton h-8 w-1/2"></div><div class="skeleton h-4 w-full"></div><div class="skeleton h-11 w-full"></div></div></div>`
  : `<div class="flex flex-col border-2 border-ink sm:flex-row"><div class="skeleton h-56 sm:w-[340px]"></div><div class="flex-1 space-y-3 p-5"><div class="skeleton h-6 w-1/2"></div><div class="skeleton h-4 w-1/3"></div><div class="skeleton h-4 w-3/4"></div><div class="skeleton h-10 w-1/4"></div></div></div>`;
const containerClass = () => state.view === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-5';

const emptyHTML = () => `
  <div class="mx-auto max-w-md border-2 border-ink p-8 text-center">
    <img src="${courtArt('futsal', '', 0, 2, 3)}" alt="" class="mx-auto h-40 w-full border-2 border-ink object-cover">
    <h2 class="display mt-5 text-4xl leading-none">Nenhuma quadra com esses filtros</h2>
    <p class="mt-2 text-ash">Tire alguns filtros ou procure em outra cidade.</p>
    <button type="button" id="empty-clear" class="btn btn-fire mt-4">Limpar filtros</button>
  </div>`;

let renderToken = 0;
function render({ resetPage = true, delay = 300 } = {}) {
  if (resetPage) state.page = 1;
  renderChips();
  const token = ++renderToken;
  const res = $('#results');
  const size = PAGE_SIZE[state.view];
  res.className = containerClass();
  res.innerHTML = Array.from({ length: Math.min(size, 6) }, skeletonCard).join(''); // skeleton loading
  res.setAttribute('aria-busy', 'true');

  setTimeout(() => {
    if (token !== renderToken) return;              // ignora renders antigos
    const all = getResults();
    const pages = Math.max(1, Math.ceil(all.length / size));
    state.page = Math.min(state.page, pages);
    const slice = all.slice((state.page - 1) * size, state.page * size);

    // título e breadcrumb
    const cityObj = CITIES.find(c => c.name === state.city);
    const where = state.fav ? 'nos seus favoritos' : state.city ? `em ${state.city} – ${cityObj.uf}` : state.q ? `para “${state.q}”` : 'em todo o Brasil';
    $('#results-title').textContent = `${all.length} ${all.length === 1 ? 'quadra' : 'quadras'} para alugar ${where}`;
    $('#bc-city').textContent = state.fav ? 'Favoritos' : (state.city || 'Todo o Brasil');
    document.title = `${all.length} quadras ${where} — QuadraJá`;

    res.removeAttribute('aria-busy');
    if (!all.length) { res.className = ''; res.innerHTML = emptyHTML(); $('#pagination').innerHTML = ''; return; }
    res.className = containerClass();
    res.innerHTML = slice.map(state.view === 'grid' ? courtCardGrid : courtCardList).join('');
    renderPagination(pages);
    refreshIcons();
  }, delay);
}
function renderPagination(pages) {
  if (pages <= 1) { $('#pagination').innerHTML = ''; return; }
  const btn = (p, label, disabled, current) =>
    `<button type="button" data-page="${p}" ${disabled ? 'disabled' : ''} ${current ? 'aria-current="page"' : ''} class="display grid h-11 min-w-[44px] place-items-center border-2 border-ink px-3 text-xl ${current ? 'bg-ink text-white' : 'hover:bg-fire'} disabled:opacity-30">${label}</button>`;
  let h = btn(state.page - 1, '‹', state.page === 1);
  for (let p = 1; p <= pages; p++) h += btn(p, p, false, p === state.page);
  h += btn(state.page + 1, '›', state.page === pages);
  $('#pagination').innerHTML = h;
}

/* ---------- Gaveta de filtros (mobile) e navegação até seção ---------- */
const isMobile = () => window.matchMedia('(max-width: 1023px)').matches;
function openFilters(sectionId) {
  if (isMobile()) { $('#filters').classList.add('open'); $('#filters-backdrop').classList.remove('hidden'); document.body.classList.add('overflow-hidden'); }
  if (sectionId) setTimeout(() => $('#' + sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
  $('#filters').focus({ preventScroll: true });
}
function closeFilters() {
  $('#filters').classList.remove('open');
  $('#filters-backdrop').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}
function clearFilters() {
  Object.assign(state, { sports: new Set(), floors: new Set(), amenities: new Set(), min: 0, max: PRICE_MAX, rating: 0, players: 0, date: '', from: null, to: null, q: '', fav: false });
  state.city = 'Curitiba';
  syncFilters(); render();
}

/* ---------- Mapa (placeholder estático com pins de preço) ---------- */
function openMap() {
  const list = getResults().slice(0, 18);
  $('#map-canvas').style.backgroundImage = `url("${courtLinesURI('society', '#000000', .5)}")`;
  $('#map-canvas').style.backgroundSize = 'cover';
  $('#map-canvas').innerHTML = list.length
    ? list.map(c => `<a href="quadra.html?id=${c.id}" class="display absolute -translate-x-1/2 -translate-y-1/2 border-2 border-ink bg-fire px-2 py-0.5 text-xl leading-6 text-ink hover:z-10 hover:bg-ink hover:text-white" style="left:${c.mx}%;top:${c.my}%" title="${c.name}" aria-label="${c.name}, ${brl(c.price)} por hora">${brl(c.price)}</a>`).join('')
    : '<p class="absolute inset-0 grid place-items-center text-ash">Nenhuma quadra para mostrar.</p>';
  openModal('map-modal');
}

/* ---------- Eventos ---------- */
function bindEvents() {
  const fb = $('#filters');
  fb.addEventListener('click', e => {
    const sp = e.target.closest('[data-sport]');
    if (sp) { const id = sp.dataset.sport; state.sports.has(id) ? state.sports.delete(id) : state.sports.add(id); syncFilters(); render(); return; }
    const cap = e.target.closest('[data-cap]');
    if (cap) { state.players = +cap.dataset.cap; syncFilters(); render(); return; }
    const rt = e.target.closest('[data-rating]');
    if (rt) { state.rating = +rt.dataset.rating; syncFilters(); render(); return; }
    if (e.target.closest('#city-remove')) { state.city = ''; syncFilters(); render(); }
  });
  fb.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.floor) { t.checked ? state.floors.add(t.dataset.floor) : state.floors.delete(t.dataset.floor); render(); }
    else if (t.dataset.amen) { t.checked ? state.amenities.add(t.dataset.amen) : state.amenities.delete(t.dataset.amen); render(); }
    else if (t.id === 'f-date') { state.date = t.value; render(); }
    else if (t.id === 'f-from') { state.from = t.value === '' ? null : +t.value; render(); }
    else if (t.id === 'f-to') { state.to = t.value === '' ? null : +t.value; render(); }
  });
  let qTimer;
  $('#f-q-input').addEventListener('input', e => { state.q = e.target.value.trim(); clearTimeout(qTimer); qTimer = setTimeout(() => render(), 250); });

  // preço: sliders e inputs numéricos
  $('#pr-min').addEventListener('input', e => { state.min = Math.min(+e.target.value, state.max); syncPrice(); debouncedRender(); });
  $('#pr-max').addEventListener('input', e => { state.max = Math.max(+e.target.value, state.min); syncPrice(); debouncedRender(); });
  $('#pr-min-n').addEventListener('change', e => { state.min = Math.min(Math.max(0, +e.target.value || 0), state.max); syncPrice(); render(); });
  $('#pr-max-n').addEventListener('change', e => { const v = e.target.value === '' ? PRICE_MAX : +e.target.value; state.max = Math.max(Math.min(PRICE_MAX, v), state.min); syncPrice(); render(); });

  $('#filters-clear').addEventListener('click', clearFilters);
  $('#filters-apply').addEventListener('click', () => { closeFilters(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  $('#filters-close').addEventListener('click', closeFilters);
  $('#filters-backdrop').addEventListener('click', closeFilters);
  $('#fab-filters').addEventListener('click', () => openFilters());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFilters(); });

  // chips rápidos
  $('#chips').addEventListener('click', e => {
    const open = e.target.closest('[data-chip-open]');
    if (open) return openFilters(open.dataset.chipOpen);
    const am = e.target.closest('[data-chip-amen]');
    if (am) { const id = am.dataset.chipAmen; state.amenities.has(id) ? state.amenities.delete(id) : state.amenities.add(id); syncFilters(); render(); }
  });

  // ordenar, visualização, mapa, alerta
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
  const setView = v => {
    state.view = v;
    $('#view-grid').setAttribute('aria-pressed', v === 'grid'); $('#view-list').setAttribute('aria-pressed', v === 'list');
    $('#view-grid').className = 'grid h-9 w-10 place-items-center ' + (v === 'grid' ? 'bg-ink text-white' : 'hover:bg-chalk');
    $('#view-list').className = 'grid h-9 w-10 place-items-center ' + (v === 'list' ? 'bg-ink text-white' : 'hover:bg-chalk');
    render();
  };
  $('#view-grid').addEventListener('click', () => setView('grid'));
  $('#view-list').addEventListener('click', () => setView('list'));
  setView('grid');
  $('#btn-map').addEventListener('click', openMap);
  $('#btn-alert').addEventListener('click', () => toast('Alerta criado. Avisaremos quando surgir quadra nova com esses filtros.', 'success'));

  // paginação e estado vazio
  document.addEventListener('click', e => {
    const pg = e.target.closest('[data-page]');
    if (pg && !pg.disabled) { state.page = +pg.dataset.page; render({ resetPage: false, delay: 150 }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    if (e.target.closest('#empty-clear')) clearFilters();
  });
  // remover favorito enquanto vê "Favoritos"
  document.addEventListener('favs:changed', () => { if (state.fav) render({ resetPage: false, delay: 0 }); });
}
let priceTimer;
function debouncedRender() { clearTimeout(priceTimer); priceTimer = setTimeout(() => render(), 200); }

/* ---------- Inicialização ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderHeader({ tabs: false });
  $('#compact-search').innerHTML = searchBarHTML({
    sport: params.get('sport') || '', q: params.get('q') || '', date: state.date,
    start: params.get('start') || '', end: params.get('end') || '', players: state.players
  }, true);
  // na página de busca a barra atualiza o estado sem recarregar
  bindSearchBar(v => {
    state.sports = new Set(v.sport ? [v.sport] : []);
    const hit = CITIES.find(c => norm(c.name) === norm(v.q));
    state.city = hit ? hit.name : (v.q ? '' : 'Curitiba');
    state.q = hit ? '' : v.q;
    state.date = v.date; state.from = v.start ? +v.start : null; state.to = v.end ? +v.end : null; state.players = +v.players || 0;
    syncFilters(); render();
  });
  buildFilters();
  bindEvents();
  syncFilters();
  render({ delay: 400 });
  updateFavCount();
  refreshIcons();
});
