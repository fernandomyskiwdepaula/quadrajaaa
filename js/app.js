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
const FALLBACK_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#0B2A5B"/><stop offset="1" stop-color="#16A34A"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><circle cx="400" cy="300" r="70" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="6"/></svg>');
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
  toast(on ? 'Quadra adicionada aos favoritos' : 'Quadra removida dos favoritos', on ? 'success' : 'info');
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
  const colors = { success: 'bg-sport', info: 'bg-navy', error: 'bg-red-600' };
  const el = document.createElement('div');
  el.className = `toast rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${colors[type] || colors.info}`;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3200);
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

/* ---------- Logotipo (texto + ícone de bola) ---------- */
const logoHTML = (cls = 'text-white') => `
  <a href="index.html" class="flex items-center gap-2 text-2xl font-extrabold tracking-tight ${cls}" aria-label="QuadraJá — página inicial">
    <span class="grid h-9 w-9 place-items-center rounded-full bg-gold text-navy">${icon('volleyball', 'h-5 w-5')}</span>
    <span>Quadra<span class="text-gold">Já</span></span>
  </a>`;

/* ---------- Header (sticky) com abas opcionais ---------- */
function renderHeader({ tabs = false, activeSport = '' } = {}) {
  const host = $('#site-header');
  if (!host) return;
  const tabItems = [{ id: '', short: 'Todos', emoji: '🏆' }, ...['society', 'futsal', 'volei', 'beach-tennis', 'basquete', 'tenis', 'padel'].map(sportById)];
  const tabsHTML = tabs ? `
    <nav class="mx-auto max-w-7xl overflow-x-auto px-4 pb-3 no-scrollbar" aria-label="Modalidades">
      <ul class="flex gap-2">
        ${tabItems.map(t => `
          <li><a href="${t.id ? 'busca.html?sport=' + t.id : 'busca.html'}" ${t.id === activeSport ? 'aria-current="page"' : ''}
            class="flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-white/10 ${t.id === activeSport ? 'border-white bg-white/10' : 'border-transparent'}">
            <span aria-hidden="true">${t.emoji}</span>${t.short}</a></li>`).join('')}
      </ul>
    </nav>` : '';
  host.innerHTML = `
  <header class="sticky top-0 z-40 bg-navy text-white shadow-md">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
      ${logoHTML()}
      <nav class="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Principal">
        <a class="hover:text-gold" href="busca.html">Quadras</a>
        <a class="hover:text-gold" href="index.html#como-funciona">Como funciona</a>
        <a class="hover:text-gold" href="index.html#anuncie">Anuncie seu espaço</a>
      </nav>
      <div class="flex items-center gap-2 sm:gap-3">
        <button type="button" class="hidden items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium hover:bg-white/10 sm:flex" aria-label="Moeda: real brasileiro">🇧🇷 BRL</button>
        <a href="index.html#faq" class="hidden rounded-full p-2 hover:bg-white/10 sm:block" aria-label="Ajuda">${icon('circle-help', 'h-5 w-5')}</a>
        <a href="busca.html?fav=1" class="relative rounded-full p-2 hover:bg-white/10" aria-label="Meus favoritos">
          ${icon('heart', 'h-5 w-5')}
          <span data-fav-count class="absolute -right-0.5 -top-0.5 hidden min-w-[18px] rounded-full bg-gold px-1 text-center text-[11px] font-bold leading-[18px] text-navy">0</span>
        </a>
        <button type="button" data-open-modal="login-modal" data-auth-tab="signup" class="hidden rounded-md border border-white px-3 py-1.5 text-sm font-semibold hover:bg-white/10 sm:block">Cadastre-se</button>
        <button type="button" data-open-modal="login-modal" data-auth-tab="login" class="hidden rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-navy hover:bg-gray-100 sm:block">Entrar</button>
        <button type="button" id="menu-btn" class="rounded-lg p-2 hover:bg-white/10 md:hidden" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobile-menu">${icon('menu', 'h-6 w-6')}</button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden border-t border-white/10 px-4 py-3 md:hidden">
      <a class="block py-2" href="busca.html">Quadras</a>
      <a class="block py-2" href="index.html#como-funciona">Como funciona</a>
      <a class="block py-2" href="index.html#anuncie">Anuncie seu espaço</a>
      <div class="mt-2 flex gap-2">
        <button type="button" data-open-modal="login-modal" data-auth-tab="signup" class="flex-1 rounded-md border border-white py-2 text-sm font-semibold">Cadastre-se</button>
        <button type="button" data-open-modal="login-modal" data-auth-tab="login" class="flex-1 rounded-md bg-white py-2 text-sm font-semibold text-navy">Entrar</button>
      </div>
    </div>
    ${tabsHTML}
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
    <div><h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-gold">${title}</h3>
    <ul class="space-y-2 text-sm text-white/80">${links.map(l => `<li><a class="hover:text-white hover:underline" href="${l[1]}">${l[0]}</a></li>`).join('')}</ul></div>`;
  host.innerHTML = `
  <footer class="bg-navy text-white">
    <div class="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
      ${col('QuadraJá', [['Sobre nós', '#'], ['Carreiras', '#'], ['Imprensa', '#'], ['Blog', '#']])}
      ${col('Modalidades', [['Futebol society', 'busca.html?sport=society'], ['Futsal', 'busca.html?sport=futsal'], ['Beach tennis', 'busca.html?sport=beach-tennis'], ['Padel', 'busca.html?sport=padel']])}
      ${col('Para donos de espaço', [['Anuncie seu espaço', 'index.html#anuncie'], ['Central do anunciante', '#'], ['Preços e taxas', '#'], ['Dicas de gestão', '#']])}
      ${col('Ajuda', [['Central de ajuda', 'index.html#faq'], ['Política de cancelamento', '#'], ['Termos de uso', '#'], ['Privacidade', '#']])}
    </div>
    <div class="border-t border-white/10">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-white/70 md:flex-row">
        <div>${logoHTML()}<p class="mt-2">© ${new Date().getFullYear()} QuadraJá. Marca fictícia para fins de demonstração.</p></div>
        <div class="flex items-center gap-3">
          <a href="#" aria-label="Instagram" class="rounded-full bg-white/10 p-2 hover:bg-white/20">${icon('instagram', 'h-5 w-5')}</a>
          <a href="#" aria-label="Facebook" class="rounded-full bg-white/10 p-2 hover:bg-white/20">${icon('facebook', 'h-5 w-5')}</a>
          <a href="#" aria-label="YouTube" class="rounded-full bg-white/10 p-2 hover:bg-white/20">${icon('youtube', 'h-5 w-5')}</a>
        </div>
        <div class="flex items-center gap-2 text-xs font-semibold" aria-label="Formas de pagamento">
          <span class="rounded bg-white px-2 py-1 text-navy">Pix</span>
          <span class="rounded bg-white px-2 py-1 text-navy">Crédito</span>
          <span class="rounded bg-white px-2 py-1 text-navy">Débito</span>
        </div>
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
  div.className = 'fixed inset-0 z-[90] hidden items-center justify-center bg-black/60 p-4';
  div.innerHTML = `
    <div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <button type="button" data-close-modal class="absolute right-3 top-3 rounded-full p-2 hover:bg-gray-100" aria-label="Fechar">${icon('x', 'h-5 w-5')}</button>
      <div class="mb-1">${logoHTML('text-navy')}</div>
      <h2 id="auth-title" class="mt-4 text-xl font-bold">Entre ou crie sua conta</h2>
      <div class="mt-4 grid grid-cols-2 rounded-xl bg-mist p-1 text-sm font-semibold" role="tablist">
        <button type="button" role="tab" data-auth-switch="login" class="rounded-lg py-2" aria-selected="true">Entrar</button>
        <button type="button" role="tab" data-auth-switch="signup" class="rounded-lg py-2" aria-selected="false">Cadastrar</button>
      </div>
      <form id="auth-form" class="mt-4 space-y-3">
        <div id="auth-name-wrap" class="hidden">
          <label for="auth-name" class="mb-1 block text-sm font-medium">Nome completo</label>
          <input id="auth-name" type="text" autocomplete="name" class="w-full rounded-lg border border-gray-300 px-3 py-2.5">
        </div>
        <div>
          <label for="auth-email" class="mb-1 block text-sm font-medium">E-mail</label>
          <input id="auth-email" type="email" required autocomplete="email" class="w-full rounded-lg border border-gray-300 px-3 py-2.5" placeholder="voce@email.com">
        </div>
        <div>
          <label for="auth-pass" class="mb-1 block text-sm font-medium">Senha</label>
          <input id="auth-pass" type="password" required minlength="6" autocomplete="current-password" class="w-full rounded-lg border border-gray-300 px-3 py-2.5">
        </div>
        <button type="submit" id="auth-submit" class="w-full rounded-lg bg-brand py-3 font-bold text-white hover:bg-[#0856cc]">Entrar</button>
        <div class="flex items-center gap-3 text-xs text-muted"><span class="h-px flex-1 bg-line"></span>ou<span class="h-px flex-1 bg-line"></span></div>
        <button type="button" id="auth-google" class="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 font-semibold hover:bg-mist">
          <svg viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.5z"/><path fill="#34A853" d="M12 22c2.8 0 5.1-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.800-4.300H2.700v2.700A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.200 13.600a6 6 0 0 1 0-3.800V7.100H2.700a10 10 0 0 0 0 9.200z"/><path fill="#EA4335" d="M12 6c1.500 0 2.800.5 3.900 1.500l2.900-2.900A10 10 0 0 0 2.700 7.100l3.500 2.700C7 7.800 9.300 6 12 6z"/></svg>
          Continuar com Google</button>
      </form>
    </div>`;
  document.body.appendChild(div);

  const setTab = tab => {
    const signup = tab === 'signup';
    $$('[data-auth-switch]', div).forEach(b => {
      const on = b.dataset.authSwitch === tab;
      b.setAttribute('aria-selected', on);
      b.className = 'rounded-lg py-2 ' + (on ? 'bg-white shadow text-navy' : 'text-muted');
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
    toast('Login simulado com sucesso (demonstração)', 'success');
  });
  $('#auth-google').addEventListener('click', () => { closeModal(div); toast('Login com Google simulado (demonstração)', 'success'); });
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
      ${photos.map((p, i) => `<img src="${p}" alt="${c.name} — foto ${i + 1}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">`).join('')}
    </div>
    <button type="button" class="carousel-btn left-2" data-carousel-dir="-1" aria-label="Foto anterior">${icon('chevron-left')}</button>
    <button type="button" class="carousel-btn right-2" data-carousel-dir="1" aria-label="Próxima foto">${icon('chevron-right')}</button>
  </div>`;
}
function moveCarousel(root, dir) {
  const n = +root.dataset.count;
  const i = (+root.dataset.index + dir + n) % n;
  root.dataset.index = i;
  $('.carousel-track', root).style.transform = `translateX(-${i * 100}%)`;
}

/* ---------- Peças reutilizadas pelos cards ---------- */
const waLink = c => `https://wa.me/55${c.phone}?text=${encodeURIComponent('Olá! Tenho interesse em reservar a quadra "' + c.name + '" pelo QuadraJá.')}`;
const featuredBadge = `<span class="rounded-md bg-gold px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-navy">Super Destaque</span>`;
const verified = `<span class="text-brand" title="Anunciante verificado">${icon('badge-check', 'h-4 w-4')}</span>`;
const ratingHTML = c => `<span class="inline-flex items-center gap-1 text-sm font-semibold"><span class="text-gold" aria-hidden="true">★</span>${String(c.rating).replace('.', ',')}<span class="font-normal text-muted">(${c.reviews} avaliações)</span></span>`;
const slotChips = c => c.slots.slice(0, 4).map(h => `<span class="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">${h}h</span>`).join('');
const featRow = (c, full = true) => `
  <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
    <li class="flex items-center gap-1.5" title="Dimensão">${icon('ruler')}${c.size} m²</li>
    <li class="flex items-center gap-1.5" title="Piso">${icon('layers')}${c.floorLabel}</li>
    <li class="flex items-center gap-1.5" title="Capacidade">${icon('users')}${c.capacity}</li>
    ${c.amenities.includes('estacionamento') ? `<li class="flex items-center gap-1.5" title="Estacionamento">${icon('car')}${full ? 'Estac.' : ''}</li>` : ''}
    ${c.amenities.includes('iluminacao') ? `<li class="flex items-center gap-1.5" title="Iluminação">${icon('lightbulb')}${full ? 'Iluminação' : ''}</li>` : ''}
  </ul>`;

/* ---------- CARD EM LISTA (horizontal) ---------- */
function courtCardList(c) {
  return `
  <article data-href="quadra.html?id=${c.id}" class="card-hover relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-white sm:flex-row">
    <div class="h-56 shrink-0 sm:h-auto sm:min-h-[260px] sm:w-[340px]">${carouselHTML(c)}</div>
    ${c.featured ? `<div class="absolute left-3 top-3 z-10">${featuredBadge}</div>` : ''}
    <div class="flex flex-1 flex-col gap-2 p-4 sm:p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wide text-brand">${sportById(c.sport).emoji} ${c.sportLabel}</p>
          <h3 class="mt-0.5 text-lg leading-snug"><a href="quadra.html?id=${c.id}" class="hover:underline">${c.name}</a></h3>
        </div>
        ${favBtn(c)}
      </div>
      <div>
        <p class="font-bold">${c.neighborhood}, ${c.city}/${c.uf}</p>
        <p class="text-sm text-muted">${c.street}</p>
      </div>
      ${featRow(c)}
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        ${ratingHTML(c)}
        <div class="flex items-center gap-1.5"><span class="text-xs text-muted">Hoje:</span>${slotChips(c)}</div>
      </div>
      <div class="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
        <div>
          <p class="price text-3xl leading-none">${brl(c.price)}<span class="text-base font-medium text-muted">/hora</span></p>
          <p class="mt-1 text-xs text-muted">Taxa de serviço ${brl(fee(c.price))}</p>
        </div>
        <div class="flex items-center gap-2">
          <a href="${waLink(c)}" target="_blank" rel="noopener" class="grid h-11 w-11 place-items-center rounded-lg border border-sport bg-green-50 text-sport hover:bg-green-100" aria-label="Chamar ${c.name} no WhatsApp">${icon('message-circle', 'h-5 w-5')}</a>
          <a href="quadra.html?id=${c.id}" class="flex h-11 items-center rounded-lg bg-brand px-6 font-bold text-white hover:bg-[#0856cc]">Reservar</a>
        </div>
      </div>
    </div>
  </article>`;
}

/* ---------- CARD EM GRADE (vertical, estilo Zap) ---------- */
function courtCardGrid(c) {
  return `
  <article data-href="quadra.html?id=${c.id}" class="card-hover flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-white">
    <div class="relative aspect-[4/3] w-full">
      <div class="absolute inset-0">${carouselHTML(c)}</div>
      <div class="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10 text-white">
        ${c.featured ? `<div class="mb-1">${featuredBadge}</div>` : ''}
        <p class="flex items-center gap-1 text-sm font-semibold"><span class="text-sky-300">${icon('badge-check', 'h-4 w-4')}</span><span class="truncate">${c.owner}</span></p>
      </div>
    </div>
    <div class="flex flex-1 flex-col gap-2 p-4">
      <p class="text-xs text-muted">${sportById(c.sport).emoji} ${c.sportLabel} · ${c.name}</p>
      <div class="flex items-center justify-between gap-2">
        <p class="price text-2xl leading-none">${brl(c.price)} <span class="text-sm font-medium text-muted">/hora</span></p>
        ${favBtn(c)}
      </div>
      <p class="text-xs text-muted">Taxa de serviço ${brl(fee(c.price))} · ${ratingHTML(c).replace(/\(\d+ avaliações\)/, '')}</p>
      ${featRow(c, false)}
      <div class="mt-1">
        <p class="font-bold">${c.neighborhood}, ${c.city}</p>
        <p class="text-sm text-muted">${c.street}</p>
      </div>
      <a href="quadra.html?id=${c.id}" class="mt-auto flex h-11 items-center justify-center rounded-lg bg-brand font-bold text-white hover:bg-[#0856cc]">Ver horários</a>
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
  <form id="search-form" class="sb ${compact ? 'sb--compact' : ''}" role="search" aria-label="Buscar quadras">
    <div class="sb-field">
      <span class="text-navy">${icon('trophy', 'h-5 w-5')}</span>
      <div class="sb-body"><label class="sb-label" for="sb-sport">Modalidade</label>
        <select id="sb-sport" class="sb-input"><option value="">Todas as modalidades</option>
          ${SPORTS.map(s => `<option value="${s.id}" ${v.sport === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}</select></div>
    </div>
    <div class="sb-field sb-wide">
      <span class="text-navy">${icon('map-pin', 'h-5 w-5')}</span>
      <div class="sb-body"><label class="sb-label" for="sb-q">Cidade ou bairro</label>
        <input id="sb-q" class="sb-input" type="text" placeholder="Ex.: Curitiba, Batel…" value="${(v.q || '').replace(/"/g, '&quot;')}" autocomplete="off"></div>
    </div>
    <div class="sb-field">
      <span class="text-navy">${icon('calendar', 'h-5 w-5')}</span>
      <div class="sb-body"><label class="sb-label" for="sb-date">Data</label>
        <input id="sb-date" class="sb-input" type="date" min="${today}" value="${v.date || ''}"></div>
    </div>
    <div class="sb-field">
      <span class="text-navy">${icon('clock', 'h-5 w-5')}</span>
      <div class="sb-body"><span class="sb-label" id="sb-time-label">Horário (início – fim)</span>
        <div class="flex items-center gap-1" role="group" aria-labelledby="sb-time-label">
          <select id="sb-start" class="sb-input" aria-label="Horário de início">${hourOptions(v.start, 'Início')}</select>
          <span aria-hidden="true">–</span>
          <select id="sb-end" class="sb-input" aria-label="Horário de término">${hourOptions(v.end, 'Fim')}</select>
        </div></div>
    </div>
    <div class="sb-field">
      <span class="text-navy">${icon('users', 'h-5 w-5')}</span>
      <div class="sb-body"><span class="sb-label" id="sb-pl-label">Jogadores</span>
        <div class="flex items-center gap-2" role="group" aria-labelledby="sb-pl-label">
          <button type="button" class="sb-step" data-step="-1" aria-label="Diminuir jogadores">−</button>
          <output id="sb-players-out" class="min-w-[4.5rem] text-center text-[.95rem] font-medium" aria-live="polite">${players ? players : 'Qualquer'}</output>
          <button type="button" class="sb-step" data-step="1" aria-label="Aumentar jogadores">+</button>
          <input type="hidden" id="sb-players" value="${players}">
        </div></div>
    </div>
    <button type="submit" class="sb-btn">Pesquisar</button>
  </form>`;
}
/* Liga eventos da barra. onSubmit recebe um objeto com os valores; padrão: navegar para busca.html */
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