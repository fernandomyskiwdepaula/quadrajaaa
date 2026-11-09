/* =========================================================
   QuadraJá — app.js (componentes e utilidades compartilhados)
   Depende de: data.js, Lucide (CDN)
   ========================================================= */

/* ---------- Utilitários ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const brl = n => 'R$ ' + Number(n).toLocaleString('pt-BR');
const norm = s => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const fee = price => Math.round(price * 0.07);             // taxa de serviço (7%)
const icon = (name, cls = 'h-4 w-4') => `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;
const refreshIcons = () => { if (window.lucide) window.lucide.createIcons(); };
const sportById = id => SPORTS.find(s => s.id === id);

/* ---------- Favoritos (localStorage) ---------- */
const FAV_KEY = 'quadraja:favs';
function getFavs() { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } }
function setFavs(list) { try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch { /* storage indisponível */ } }
function updateFavCount() {
  const n = getFavs().length;
  $$('[data-fav-count]').forEach(el => { el.textContent = n; el.classList.toggle('hidden', n === 0); });
}
function toggleFav(id) {
  let favs = getFavs();
  const on = !favs.includes(id);
  favs = on ? [...favs, id] : favs.filter(f => f !== id);
  setFavs(favs);
  $$(`[data-fav="${id}"]`).forEach(b => b.setAttribute('aria-pressed', on));
  updateFavCount();
  toast(on ? 'Quadra salva nos favoritos' : 'Quadra tirada dos favoritos', on ? 'success' : 'info');
  document.dispatchEvent(new CustomEvent('favs:changed', { detail: { id, on } }));
}
const favBtn = (c, extra = '') => `<button type="button" class="fav-btn ${extra}" data-fav="${c.id}" aria-pressed="${getFavs().includes(c.id)}" aria-label="Favoritar ${c.name}">${icon('heart', 'h-5 w-5')}</button>`;

/* ---------- Toast ---------- */
function toast(msg, type = 'info') {
  let box = $('#toasts');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toasts';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.className = 'fixed bottom-24 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2 px-4 lg:bottom-6';
    document.body.appendChild(box);
  }
  const el = document.createElement('div');
  el.className = `toast bg-ink px-4 py-3 text-base font-semibold text-white ${type === 'error' ? 'outline outline-2 outline-fire' : ''}`;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

/* ---------- Modais ---------- */
let lastFocus = null;
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  lastFocus = document.activeElement;
  m.classList.remove('hidden'); m.classList.add('flex');
  document.body.classList.add('overflow-hidden');
  refreshIcons();
  const f = m.querySelector('input, button, select, a');
  if (f) setTimeout(() => f.focus(), 30);
}
function closeModal(id) {
  const m = typeof id === 'string' ? document.getElementById(id) : id;
  if (!m) return;
  m.classList.add('hidden'); m.classList.remove('flex');
  if (!$$('[data-modal]:not(.hidden)').length) document.body.classList.remove('overflow-hidden');
  if (lastFocus) lastFocus.focus();
}

/* ---------- Logotipo: bola de futebol + nome ---------- */
const logoHTML = (cls = 'text-white', ball = '#FF5C00') => `
  <a href="index.html" class="flex items-center gap-2 ${cls}" aria-label="QuadraJá — página inicial">
    <svg viewBox="0 0 48 48" class="h-9 w-9" aria-hidden="true">${ballSVG('soccer', 24, 24, 21, ball, '#000', 2.6, '#000')}</svg>
    <span class="display text-[1.9rem] leading-none">QuadraJá</span>
  </a>`;

/* ---------- Header (sticky) com abas opcionais ---------- */
function renderHeader({ tabs = false, activeSport = '' } = {}) {
  const host = $('#site-header');
  if (!host) return;
  const tabItems = [{ id: '', short: 'Todos' }, ...['society', 'futsal', 'volei', 'beach-tennis', 'basquete', 'tenis', 'padel'].map(sportById)];
  const tabsHTML = tabs ? `
    <nav class="mx-auto max-w-7xl overflow-x-auto px-4 no-scrollbar" aria-label="Modalidades">
      <ul class="flex gap-6">
        ${tabItems.map(t => `
          <li><a href="${t.id ? 'busca.html?sport=' + t.id : 'busca.html'}" ${t.id === activeSport ? 'aria-current="page"' : ''}
            class="block whitespace-nowrap border-b-4 py-2.5 text-base font-semibold hover:border-white ${t.id === activeSport ? 'border-fire' : 'border-transparent'}">${t.short}</a></li>`).join('')}
      </ul>
    </nav>` : '';
  host.innerHTML = `
  <header class="sticky top-0 z-40 bg-ink text-white">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
      ${logoHTML()}
      <nav class="hidden items-center gap-7 text-base font-semibold md:flex" aria-label="Principal">
        <a class="hover:text-fire" href="busca.html">Quadras</a>
        <a class="hover:text-fire" href="index.html#como-funciona">Como funciona</a>
        <a class="hover:text-fire" href="index.html#anuncie">Anuncie seu espaço</a>
      </nav>
      <div class="flex items-center gap-2 sm:gap-3">
        <span class="hidden px-2 text-sm font-semibold text-white/70 sm:block" title="Valores em reais">BRL</span>
        <a href="index.html#faq" class="hidden p-2 hover:text-fire sm:block" aria-label="Ajuda">${icon('circle-help', 'h-5 w-5')}</a>
        <a href="busca.html?fav=1" class="relative p-2 hover:text-fire" aria-label="Meus favoritos">
          ${icon('heart', 'h-5 w-5')}
          <span data-fav-count class="absolute -right-0.5 -top-0.5 hidden min-w-[18px] bg-fire px-1 text-center text-[12px] font-bold leading-[18px] text-ink">0</span>
        </a>
        <button type="button" data-open-modal="login-modal" data-auth-tab="signup" class="btn btn-ghost btn-sm hidden sm:inline-flex">Cadastre-se</button>
        <button type="button" data-open-modal="login-modal" data-auth-tab="login" class="btn btn-fire btn-sm hidden border-fire sm:inline-flex">Entrar</button>
        <button type="button" id="menu-btn" class="p-2 md:hidden" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobile-menu">${icon('menu', 'h-6 w-6')}</button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden border-t border-white/20 px-4 py-3 md:hidden">
      <a class="block py-2 font-semibold" href="busca.html">Quadras</a>
      <a class="block py-2 font-semibold" href="index.html#como-funciona">Como funciona</a>
      <a class="block py-2 font-semibold" href="index.html#anuncie">Anuncie seu espaço</a>
      <div class="mt-2 flex gap-2">
        <button type="button" data-open-modal="login-modal" data-auth-tab="signup" class="btn btn-ghost btn-sm flex-1">Cadastre-se</button>
        <button type="button" data-open-modal="login-modal" data-auth-tab="login" class="btn btn-fire btn-sm flex-1 border-fire">Entrar</button>
      </div>
    </div>
    ${tabsHTML}
    <div class="h-1 bg-fire"></div>
  </header>`;
  const btn = $('#menu-btn'), menu = $('#mobile-menu');
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden') === false;
    btn.setAttribute('aria-expanded', open);
  });
}

/* ---------- Footer ---------- */
function renderFooter() {
  const host = $('#site-footer');
  if (!host) return;
  const col = (title, links) => `
    <div><h3 class="display mb-3 text-xl text-fire">${title}</h3>
    <ul class="space-y-2 text-base text-white/80">${links.map(l => `<li><a class="hover:text-white hover:underline" href="${l[1]}">${l[0]}</a></li>`).join('')}</ul></div>`;
  host.innerHTML = `
  <footer class="bg-ink text-white">
    <div class="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
      ${col('QuadraJá', [['Sobre nós', '#'], ['Carreiras', '#'], ['Imprensa', '#'], ['Blog', '#']])}
      ${col('Modalidades', [['Futebol society', 'busca.html?sport=society'], ['Futsal', 'busca.html?sport=futsal'], ['Beach tennis', 'busca.html?sport=beach-tennis'], ['Padel', 'busca.html?sport=padel']])}
      ${col('Para donos de espaço', [['Anuncie seu espaço', 'index.html#anuncie'], ['Central do anunciante', '#'], ['Preços e taxas', '#'], ['Dicas de gestão', '#']])}
      ${col('Ajuda', [['Central de ajuda', 'index.html#faq'], ['Política de cancelamento', '#'], ['Termos de uso', '#'], ['Privacidade', '#']])}
    </div>
    <div class="border-t border-white/20">
      <div class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-6 md:flex-row md:items-center">
        <div>${logoHTML()}<p class="mt-2 text-sm text-white/70">© ${new Date().getFullYear()} QuadraJá. Marca fictícia, feita para demonstração.</p></div>
        <div class="flex items-center gap-2">
          <a href="#" aria-label="Instagram" class="border-2 border-white/40 p-2 hover:border-fire hover:text-fire">${icon('instagram', 'h-5 w-5')}</a>
          <a href="#" aria-label="Facebook" class="border-2 border-white/40 p-2 hover:border-fire hover:text-fire">${icon('facebook', 'h-5 w-5')}</a>
          <a href="#" aria-label="YouTube" class="border-2 border-white/40 p-2 hover:border-fire hover:text-fire">${icon('youtube', 'h-5 w-5')}</a>
        </div>
        <p class="text-sm font-semibold text-white/80">Pague com Pix, crédito ou débito</p>
      </div>
    </div>
  </footer>`;
}

/* ---------- Modal de Login/Cadastro ---------- */
function renderAuthModal() {
  const div = document.createElement('div');
  div.id = 'login-modal';
  div.setAttribute('data-modal', '');
  div.setAttribute('role', 'dialog');
  div.setAttribute('aria-modal', 'true');
  div.setAttribute('aria-labelledby', 'auth-title');
  div.className = 'fixed inset-0 z-[90] hidden items-center justify-center bg-black/70 p-4';
  div.innerHTML = `
    <div class="relative w-full max-w-md border-4 border-ink bg-white p-6" style="box-shadow:10px 10px 0 #FF5C00">
      <button type="button" data-close-modal class="absolute right-3 top-3 p-2 hover:bg-chalk" aria-label="Fechar">${icon('x', 'h-5 w-5')}</button>
      <h2 id="auth-title" class="display text-4xl leading-[.95]">Entre para reservar</h2>
      <div class="mt-4 grid grid-cols-2 border-2 border-ink" role="tablist">
        <button type="button" role="tab" data-auth-switch="login" class="py-2 font-semibold" aria-selected="true">Entrar</button>
        <button type="button" role="tab" data-auth-switch="signup" class="py-2 font-semibold" aria-selected="false">Criar conta</button>
      </div>
      <form id="auth-form" class="mt-4 space-y-3">
        <div id="auth-name-wrap" class="hidden">
          <label for="auth-name" class="mb-1 block text-sm font-semibold">Nome completo</label>
          <input id="auth-name" type="text" autocomplete="name" class="h-12 w-full border-2 border-ink px-3">
        </div>
        <div>
          <label for="auth-email" class="mb-1 block text-sm font-semibold">E-mail</label>
          <input id="auth-email" type="email" required autocomplete="email" class="h-12 w-full border-2 border-ink px-3" placeholder="voce@email.com">
        </div>
        <div>
          <label for="auth-pass" class="mb-1 block text-sm font-semibold">Senha</label>
          <input id="auth-pass" type="password" required minlength="6" autocomplete="current-password" class="h-12 w-full border-2 border-ink px-3">
        </div>
        <button type="submit" id="auth-submit" class="btn btn-fire w-full">Entrar</button>
        <button type="button" id="auth-google" class="btn btn-line w-full !font-sans !text-base !normal-case">
          <svg viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.5z"/><path fill="#34A853" d="M12 22c2.8 0 5.1-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.2 13.6a6 6 0 0 1 0-3.8V7.1H2.7a10 10 0 0 0 0 9.2z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.9 1.5l2.9-2.9A10 10 0 0 0 2.7 7.1l3.5 2.7C7 7.8 9.3 6 12 6z"/></svg>
          Continuar com Google</button>
      </form>
    </div>`;
  document.body.appendChild(div);

  const setTab = tab => {
    const signup = tab === 'signup';
    $$('[data-auth-switch]', div).forEach(b => {
      const on = b.dataset.authSwitch === tab;
      b.setAttribute('aria-selected', on);
      b.className = 'py-2 font-semibold ' + (on ? 'bg-ink text-white' : 'hover:bg-chalk');
    });
    $('#auth-name-wrap').classList.toggle('hidden', !signup);
    $('#auth-submit').textContent = signup ? 'Criar conta' : 'Entrar';
  };
  setTab('login');
  div.addEventListener('click', e => {
    const sw = e.target.closest('[data-auth-switch]');
    if (sw) setTab(sw.dataset.authSwitch);
  });
  $('#auth-form').addEventListener('submit', e => {
    e.preventDefault();
    closeModal(div);
    toast('Você entrou (login simulado nesta demonstração)', 'success');
  });
  $('#auth-google').addEventListener('click', () => { closeModal(div); toast('Login com Google simulado nesta demonstração', 'success'); });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-auth-tab]');
    if (t) setTab(t.dataset.authTab);
  });
}

/* ---------- Carrossel de imagens (HTML) ---------- */
function carouselHTML(c, max = 4) {
  const photos = c.photos.slice(0, max);
  return `
  <div class="carousel" data-carousel data-index="0" data-count="${photos.length}">
    <div class="carousel-track">
      ${photos.map((p, i) => `<img src="${p}" alt="${c.name}, vista ${i + 1} da quadra de ${c.sportLabel.toLowerCase()}" loading="lazy">`).join('')}
    </div>
    <div class="carousel-dots" aria-hidden="true">${photos.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
    <button type="button" class="carousel-btn left-0" data-carousel-dir="-1" aria-label="Foto anterior">${icon('chevron-left')}</button>
    <button type="button" class="carousel-btn right-0" data-carousel-dir="1" aria-label="Próxima foto">${icon('chevron-right')}</button>
  </div>`;
}
function moveCarousel(root, dir) {
  const n = +root.dataset.count;
  const i = (+root.dataset.index + dir + n) % n;
  root.dataset.index = i;
  $('.carousel-track', root).style.transform = `translateX(-${i * 100}%)`;
  $$('.carousel-dots i', root).forEach((d, k) => d.classList.toggle('on', k === i));
}

/* ---------- Peças reutilizadas pelos cards ---------- */
const waLink = c => `https://wa.me/55${c.phone}?text=${encodeURIComponent('Olá! Quero reservar a quadra "' + c.name + '" pelo QuadraJá.')}`;
const featuredBadge = `<span class="display inline-block bg-fire px-2 py-0.5 text-base leading-tight text-ink">Super Destaque</span>`;
const verified = `<span title="Anunciante verificado">${icon('badge-check', 'h-4 w-4')}</span>`;
/* Nota no estilo placar: número em bloco laranja */
const ratingHTML = (c, withCount = true) => `<span class="inline-flex items-center gap-2 text-sm"><span class="display bg-fire px-1.5 text-xl leading-7 text-ink" aria-label="Nota ${String(c.rating).replace('.', ',')} de 5">${String(c.rating).replace('.', ',')}</span>${withCount ? `<span class="text-ash">${c.reviews} avaliações</span>` : ''}</span>`;
const slotChips = c => c.slots.slice(0, 4).map(h => `<span class="display border-2 border-ink px-1.5 text-base leading-6">${h}h</span>`).join('');
const featRow = (c, full = true) => `
  <ul class="flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
    <li class="flex items-center gap-1.5" title="Dimensão">${icon('ruler')}${c.size} m²</li>
    <li class="flex items-center gap-1.5" title="Piso">${icon('layers')}${c.floorLabel}</li>
    <li class="flex items-center gap-1.5" title="Capacidade">${icon('users')}${c.capacity} jogadores</li>
    ${c.amenities.includes('estacionamento') ? `<li class="flex items-center gap-1.5" title="Estacionamento">${icon('car')}${full ? 'Estacionamento' : ''}</li>` : ''}
    ${c.amenities.includes('iluminacao') ? `<li class="flex items-center gap-1.5" title="Iluminação">${icon('lightbulb')}${full ? 'Iluminação' : ''}</li>` : ''}
  </ul>`;

/* ---------- CARD EM LISTA (horizontal) ---------- */
function courtCardList(c) {
  return `
  <article data-href="quadra.html?id=${c.id}" class="lift relative flex cursor-pointer flex-col border-2 border-ink bg-white sm:flex-row">
    <div class="h-56 shrink-0 border-b-2 border-ink sm:h-auto sm:min-h-[270px] sm:w-[340px] sm:border-b-0 sm:border-r-2">${carouselHTML(c)}</div>
    ${c.featured ? `<div class="absolute left-0 top-4 z-30">${featuredBadge}</div>` : ''}
    <div class="flex flex-1 flex-col gap-2 p-4 sm:p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="flex items-center gap-1.5 text-sm font-semibold text-ember">${sportIcon(c.sport, 'h-4 w-4')}${c.sportLabel}</p>
          <h3 class="display mt-0.5 text-[1.7rem] leading-[.95]"><a href="quadra.html?id=${c.id}" class="hover:underline">${c.name}</a></h3>
        </div>
        ${favBtn(c)}
      </div>
      <div>
        <p class="font-bold">${c.neighborhood}, ${c.city}/${c.uf}</p>
        <p class="text-[15px] text-ash">${c.street}</p>
      </div>
      ${featRow(c)}
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        ${ratingHTML(c)}
        <div class="flex items-center gap-1.5"><span class="text-sm text-ash">Vago hoje</span>${slotChips(c)}</div>
      </div>
      <div class="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
        <div>
          <p class="display text-5xl leading-none">${brl(c.price)}<span class="ml-1 text-xl normal-case text-ash">/hora</span></p>
          <p class="mt-1 text-sm text-ash">Taxa de serviço ${brl(fee(c.price))}</p>
        </div>
        <div class="flex items-center gap-2">
          <a href="${waLink(c)}" target="_blank" rel="noopener" class="btn btn-line !min-h-[48px] !px-3" aria-label="Chamar ${c.name} no WhatsApp">${icon('message-circle', 'h-5 w-5')}</a>
          <a href="quadra.html?id=${c.id}" class="btn btn-fire">Reservar</a>
        </div>
      </div>
    </div>
  </article>`;
}

/* ---------- CARD EM GRADE (vertical) ---------- */
function courtCardGrid(c) {
  return `
  <article data-href="quadra.html?id=${c.id}" class="lift flex h-full cursor-pointer flex-col border-2 border-ink bg-white">
    <div class="relative aspect-[4/3] w-full border-b-2 border-ink">
      <div class="absolute inset-0">${carouselHTML(c)}</div>
      ${c.featured ? `<div class="absolute left-0 top-4 z-30">${featuredBadge}</div>` : ''}
      <p class="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center gap-1.5 bg-ink px-3 py-1.5 text-sm font-semibold text-white">${verified}<span class="truncate">${c.owner}</span></p>
    </div>
    <div class="flex flex-1 flex-col gap-2 p-4">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="flex items-center gap-1.5 text-sm font-semibold text-ember">${sportIcon(c.sport, 'h-4 w-4')}${c.sportLabel}</p>
          <h3 class="display mt-0.5 text-2xl leading-[.95]">${c.name}</h3>
        </div>
        ${favBtn(c)}
      </div>
      <p class="display text-4xl leading-none">${brl(c.price)}<span class="ml-1 text-lg normal-case text-ash">/hora</span></p>
      <p class="text-sm text-ash">Taxa de serviço ${brl(fee(c.price))}</p>
      ${featRow(c, false)}
      <div class="mt-1 flex items-center justify-between gap-2">
        <div class="min-w-0"><p class="truncate font-bold">${c.neighborhood}, ${c.city}</p><p class="truncate text-sm text-ash">${c.street}</p></div>
        ${ratingHTML(c, false)}
      </div>
      <a href="quadra.html?id=${c.id}" class="btn btn-ink mt-auto w-full">Ver horários</a>
    </div>
  </article>`;
}

/* ---------- Barra de busca (home = grande, busca = compacta) ---------- */
function hourOptions(selected, placeholder) {
  let o = `<option value="">${placeholder}</option>`;
  for (let h = 6; h <= 23; h++) o += `<option value="${h}" ${String(selected) === String(h) ? 'selected' : ''}>${String(h).padStart(2, '0')}:00</option>`;
  return o;
}
function searchBarHTML(v = {}, compact = false) {
  const today = new Date().toISOString().slice(0, 10);
  const players = +v.players || 0;
  return `
  <form id="search-form" class="sb ${compact ? 'sb--compact' : 'sb--hero'}" role="search" aria-label="Buscar quadras">
    <div class="sb-field">
      ${sportIcon('society', 'h-6 w-6 shrink-0')}
      <div class="sb-body"><label class="sb-label" for="sb-sport">Esporte</label>
        <select id="sb-sport" class="sb-input"><option value="">Todos os esportes</option>
          ${SPORTS.map(s => `<option value="${s.id}" ${v.sport === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}</select></div>
    </div>
    <div class="sb-field sb-wide">
      ${icon('map-pin', 'h-6 w-6 shrink-0')}
      <div class="sb-body"><label class="sb-label" for="sb-q">Cidade ou bairro</label>
        <input id="sb-q" class="sb-input" type="text" placeholder="Ex.: Curitiba, Batel" value="${(v.q || '').replace(/"/g, '&quot;')}" autocomplete="off"></div>
    </div>
    <div class="sb-field">
      ${icon('calendar', 'h-6 w-6 shrink-0')}
      <div class="sb-body"><label class="sb-label" for="sb-date">Data</label>
        <input id="sb-date" class="sb-input" type="date" min="${today}" value="${v.date || ''}"></div>
    </div>
    <div class="sb-field">
      ${icon('clock', 'h-6 w-6 shrink-0')}
      <div class="sb-body"><span class="sb-label" id="sb-time-label">Horário de início e fim</span>
        <div class="flex items-center gap-1" role="group" aria-labelledby="sb-time-label">
          <select id="sb-start" class="sb-input" aria-label="Horário de início">${hourOptions(v.start, 'Início')}</select>
          <span aria-hidden="true">–</span>
          <select id="sb-end" class="sb-input" aria-label="Horário de término">${hourOptions(v.end, 'Fim')}</select>
        </div></div>
    </div>
    <div class="sb-field">
      ${icon('users', 'h-6 w-6 shrink-0')}
      <div class="sb-body"><span class="sb-label" id="sb-pl-label">Jogadores</span>
        <div class="flex items-center gap-2" role="group" aria-labelledby="sb-pl-label">
          <button type="button" class="sb-step" data-step="-1" aria-label="Diminuir jogadores">−</button>
          <output id="sb-players-out" class="min-w-[4.5rem] text-center font-semibold" aria-live="polite">${players ? players : 'Qualquer'}</output>
          <button type="button" class="sb-step" data-step="1" aria-label="Aumentar jogadores">+</button>
          <input type="hidden" id="sb-players" value="${players}">
        </div></div>
    </div>
    <button type="submit" class="sb-btn">Pesquisar</button>
  </form>`;
}
/* Liga eventos da barra. onSubmit recebe os valores; padrão: navegar para busca.html */
function bindSearchBar(onSubmit) {
  const form = $('#search-form');
  if (!form) return;
  const out = $('#sb-players-out'), hid = $('#sb-players');
  $$('[data-step]', form).forEach(b => b.addEventListener('click', () => {
    const n = Math.min(40, Math.max(0, (+hid.value || 0) + (+b.dataset.step)));
    hid.value = n; out.textContent = n || 'Qualquer';
  }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const vals = {
      sport: $('#sb-sport').value, q: $('#sb-q').value.trim(), date: $('#sb-date').value,
      start: $('#sb-start').value, end: $('#sb-end').value, players: +hid.value || ''
    };
    if (onSubmit) return onSubmit(vals);
    const p = new URLSearchParams();
    Object.entries(vals).forEach(([k, val]) => { if (val !== '' && val != null) p.set(k, val); });
    location.href = 'busca.html' + (p.toString() ? '?' + p : '');
  });
}

/* ---------- Eventos globais (delegação) ---------- */
document.addEventListener('click', e => {
  const fav = e.target.closest('[data-fav]');
  if (fav) { e.preventDefault(); e.stopPropagation(); toggleFav(+fav.dataset.fav); return; }

  const dir = e.target.closest('[data-carousel-dir]');
  if (dir) { e.preventDefault(); e.stopPropagation(); moveCarousel(dir.closest('[data-carousel]'), +dir.dataset.carouselDir); return; }

  const open = e.target.closest('[data-open-modal]');
  if (open) { openModal(open.dataset.openModal); return; }

  const close = e.target.closest('[data-close-modal]');
  if (close) { closeModal(close.closest('[data-modal]')); return; }

  if (e.target.matches('[data-modal]')) { closeModal(e.target); return; }

  // Card inteiro clicável (ignora links e botões internos)
  const card = e.target.closest('[data-href]');
  if (card && !e.target.closest('a, button, input, select, label')) location.href = card.dataset.href;
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $$('[data-modal]:not(.hidden)').forEach(closeModal);
});

/* Inicialização comum */
document.addEventListener('DOMContentLoaded', () => {
  renderFooter();
  renderAuthModal();
  updateFavCount();
  refreshIcons();
});
