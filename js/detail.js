/* =========================================================
   QuadraJá — detail.js (detalhe da quadra + reserva)
   ========================================================= */
const id = +new URLSearchParams(location.search).get('id') || 1;
const court = COURTS.find(c => c.id === id) || COURTS[0];

const booking = {
  date: new Date(),         // data selecionada
  month: new Date(),        // mês exibido no calendário
  start: null,              // hora inicial escolhida
  dur: 1                    // duração (h)
};
const OPEN_HOUR = 7, CLOSE_HOUR = 23;   // horários de início possíveis: 7h até 22h
const isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const sameDay = (a, b) => isoDate(a) === isoDate(b);
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

/* Ocupação determinística por quadra/data/hora (simula agenda) */
function isBusy(date, hour) {
  const key = `${court.id}-${isoDate(date)}-${hour}`;
  let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  // hoje: horários livres do mock (court.slots) são sempre livres; demais seguem o hash
  if (sameDay(date, new Date()) && court.slots.includes(hour)) return false;
  if (sameDay(date, new Date()) && hour <= new Date().getHours()) return true; // já passou
  return h % 100 < 38;
}
const slotFree = (hour) => hour >= OPEN_HOUR && hour < CLOSE_HOUR && !isBusy(booking.date, hour);
function canBook(start, dur) {
  for (let h = start; h < start + dur; h++) if (!slotFree(h)) return false;
  return true;
}

/* ---------- Página ---------- */
function renderPage() {
  const c = court, sp = sportById(c.sport);
  document.title = `${c.name} — ${c.city}/${c.uf} | QuadraJá`;
  const reviews = [
    ['Rafael M.', 5, 'Quadra muito bem cuidada e iluminação excelente. Atendimento nota 10.'],
    ['Camila T.', 4, 'Ótima estrutura. O vestiário poderia ter mais ganchos, mas o resto é perfeito.'],
    ['João P.', 5, 'Reservamos para o racha da firma e foi tudo tranquilo. Voltaremos!'],
    ['Letícia S.', 4, 'Fácil de achar e com estacionamento. Piso em ótimo estado.']
  ];
  const similar = COURTS.filter(x => x.id !== c.id && (x.sport === c.sport || x.city === c.city)).sort((a, b) => (b.sport === c.sport) - (a.sport === c.sport) || b.rating - a.rating).slice(0, 3);

  $('#detail').innerHTML = `
  <nav class="text-xs text-brand" aria-label="Você está em">
    <ol class="flex flex-wrap items-center gap-2"><li><a class="hover:underline" href="index.html">Início</a></li><li class="text-muted" aria-hidden="true">›</li><li><a class="hover:underline" href="busca.html">Quadras</a></li><li class="text-muted" aria-hidden="true">›</li><li><a class="hover:underline" href="busca.html?q=${encodeURIComponent(c.city)}">${c.city}</a></li><li class="text-muted" aria-hidden="true">›</li><li class="text-ink" aria-current="page">${c.name}</li></ol>
  </nav>

  <!-- Título -->
  <div class="mt-3 flex flex-wrap items-start justify-between gap-3">
    <div>
      <p class="text-xs font-semibold uppercase tracking-wide text-brand">${sp.emoji} ${c.sportLabel}</p>
      <h1 class="text-2xl sm:text-3xl">${c.name}</h1>
      <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        ${ratingHTML(c)}
        <span class="flex items-center gap-1 text-gray-600">${icon('map-pin')}${c.street} — ${c.neighborhood}, ${c.city}/${c.uf}</span>
        <span class="flex items-center gap-1 font-semibold">${verified}${c.owner} <span class="font-normal text-muted">· anunciante verificado</span></span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button type="button" id="btn-share" class="flex h-10 items-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold hover:bg-mist">${icon('share-2')}Compartilhar</button>
      ${favBtn(c, '!h-10 !w-10')}
    </div>
  </div>

  <!-- Galeria em mosaico -->
  <div class="relative mt-4 grid h-[260px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-[420px]">
    ${c.photos.map((p, i) => `
      <button type="button" data-photo="${i}" class="${i === 0 ? 'col-span-4 row-span-2 sm:col-span-2' : 'hidden sm:block'} overflow-hidden bg-line" aria-label="Ampliar foto ${i + 1}">
        <img src="${p}" alt="${c.name} — foto ${i + 1}" ${i === 0 ? '' : 'loading="lazy"'} class="h-full w-full object-cover transition duration-300 hover:scale-105" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
      </button>`).join('')}
    <button type="button" data-photo="0" class="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold shadow hover:bg-mist">${icon('images')}Ver todas as fotos</button>
  </div>

  <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
    <!-- Coluna esquerda -->
    <div class="space-y-8">
      <section aria-labelledby="sobre"><h2 id="sobre" class="text-xl">Sobre o espaço</h2>
        <p class="mt-2 text-gray-700">${c.description}</p>
        <ul class="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <li class="rounded-xl bg-mist p-3"><span class="text-muted">Dimensão</span><br><b>${c.size} m²</b></li>
          <li class="rounded-xl bg-mist p-3"><span class="text-muted">Piso</span><br><b>${c.floorLabel}</b></li>
          <li class="rounded-xl bg-mist p-3"><span class="text-muted">Capacidade</span><br><b>${c.capacity} jogadores</b></li>
          <li class="rounded-xl bg-mist p-3"><span class="text-muted">Modalidade</span><br><b>${c.sportLabel}</b></li>
        </ul></section>

      <section aria-labelledby="comod"><h2 id="comod" class="text-xl">Comodidades</h2>
        <ul class="mt-3 grid gap-3 sm:grid-cols-2">
          ${AMENITIES.map(a => {
            const has = c.amenities.includes(a.id);
            return `<li class="flex items-center gap-3 ${has ? '' : 'text-gray-400 line-through'}">${icon(a.icon, 'h-5 w-5 ' + (has ? 'text-brand' : ''))}${a.label}${has ? '' : '<span class="sr-only"> (indisponível)</span>'}</li>`;
          }).join('')}
        </ul></section>

      <section aria-labelledby="regras"><h2 id="regras" class="text-xl">Regras de uso</h2>
        <ul class="mt-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>Chegue com 10 minutos de antecedência; o horário reservado inclui o aquecimento.</li>
          <li>Use calçado adequado ao piso (${c.floorLabel.toLowerCase()}).</li>
          <li>Respeite a capacidade máxima de ${c.capacity} jogadores em quadra.</li>
          <li>Proibido fumar e uso de recipientes de vidro na área de jogo.</li>
        </ul></section>

      <section aria-labelledby="cancel"><h2 id="cancel" class="text-xl">Política de cancelamento</h2>
        <div class="mt-3 rounded-xl border border-line p-4 text-gray-700">
          <p><b class="text-sport">Cancelamento grátis</b> até 24 horas antes do horário reservado.</p>
          <p class="mt-1">Entre 24h e 6h antes: reembolso de 50%. Menos de 6h: sem reembolso.</p>
        </div></section>

      <section aria-labelledby="aval"><h2 id="aval" class="text-xl">Avaliações</h2>
        <p class="mt-1">${ratingHTML(c)}</p>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          ${reviews.map(r => `<figure class="rounded-xl border border-line p-4"><div class="text-gold" aria-label="${r[1]} de 5 estrelas">${'★'.repeat(r[1])}${'☆'.repeat(5 - r[1])}</div><blockquote class="mt-1 text-sm text-gray-700">${r[2]}</blockquote><figcaption class="mt-2 text-sm font-semibold">${r[0]}</figcaption></figure>`).join('')}
        </div></section>

      <section aria-labelledby="mapa"><h2 id="mapa" class="text-xl">Localização</h2>
        <div class="relative mt-3 h-64 overflow-hidden rounded-2xl bg-[#DDE8F3]" style="background-image:linear-gradient(#cbd9ea 1px,transparent 1px),linear-gradient(90deg,#cbd9ea 1px,transparent 1px);background-size:40px 40px" role="img" aria-label="Mapa ilustrativo com a localização de ${c.name}">
          <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-navy px-3 py-1 text-sm font-extrabold text-white shadow-lg">${brl(c.price)}</span>
        </div>
        <p class="mt-2 text-sm text-muted">${c.street} — ${c.neighborhood}, ${c.city}/${c.uf}</p></section>
    </div>

    <!-- Coluna direita: card de reserva (sticky) -->
    <aside class="lg:sticky lg:top-24 lg:self-start" aria-label="Reserva">
      <div id="booking-card" class="rounded-2xl border border-line bg-white p-5 shadow-lg"></div>
    </aside>
  </div>

  <section class="mt-12" aria-labelledby="sim"><h2 id="sim" class="text-2xl">Quadras semelhantes</h2>
    <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${similar.map(courtCardGrid).join('')}</div></section>`;
}

/* ---------- Card de reserva ---------- */
function renderBooking() {
  const c = court;
  const today = startOfToday();
  const m = booking.month, y = m.getFullYear(), mo = m.getMonth();
  const first = new Date(y, mo, 1), daysIn = new Date(y, mo + 1, 0).getDate();
  const canPrev = new Date(y, mo, 1) > new Date(today.getFullYear(), today.getMonth(), 1);
  const monthName = m.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  let cal = '';
  for (let i = 0; i < first.getDay(); i++) cal += '<span></span>';
  for (let d = 1; d <= daysIn; d++) {
    const dt = new Date(y, mo, d), past = dt < today, sel = sameDay(dt, booking.date);
    cal += `<button type="button" data-day="${isoDate(dt)}" ${past ? 'disabled' : ''} aria-label="${dt.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}" ${sel ? 'aria-pressed="true"' : ''}
      class="grid h-9 place-items-center rounded-full text-sm ${sel ? 'bg-brand font-bold text-white' : past ? 'text-gray-300' : 'hover:bg-mist'}">${d}</button>`;
  }

  // grade de horários
  let slots = '';
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    const busy = !slotFree(h);
    const sel = booking.start != null && h >= booking.start && h < booking.start + booking.dur;
    slots += `<button type="button" data-hour="${h}" ${busy ? 'disabled aria-label="' + h + 'h ocupado"' : `aria-label="${h}h disponível"`} ${sel ? 'aria-pressed="true"' : ''}
      class="slot ${busy ? 'slot-busy' : sel ? 'slot-sel' : 'slot-free'}">${h}h</button>`;
  }

  const sub = booking.start != null ? c.price * booking.dur : 0;
  const f = booking.start != null ? Math.round(sub * 0.07) : 0;
  const ready = booking.start != null;

  $('#booking-card').innerHTML = `
    <p class="price text-3xl">${brl(c.price)}<span class="text-base font-medium text-muted"> /hora</span></p>
    <p class="text-xs text-muted">Taxa de serviço de 7% aplicada no total</p>

    <h3 class="mt-4 text-sm font-bold">1. Escolha a data</h3>
    <div class="mt-2 rounded-xl border border-line p-3">
      <div class="mb-2 flex items-center justify-between">
        <button type="button" id="cal-prev" ${canPrev ? '' : 'disabled'} class="rounded-full p-1.5 hover:bg-mist disabled:opacity-30" aria-label="Mês anterior">${icon('chevron-left')}</button>
        <span class="text-sm font-semibold capitalize" aria-live="polite">${monthName}</span>
        <button type="button" id="cal-next" class="rounded-full p-1.5 hover:bg-mist" aria-label="Próximo mês">${icon('chevron-right')}</button>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center text-xs text-muted" aria-hidden="true">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => `<span>${d}</span>`).join('')}</div>
      <div class="mt-1 grid grid-cols-7 gap-1 text-center" role="group" aria-label="Dias do mês">${cal}</div>
    </div>

    <h3 class="mt-4 text-sm font-bold">2. Duração</h3>
    <div class="mt-2 flex gap-2" role="group" aria-label="Duração">
      ${[1, 2, 3].map(n => `<button type="button" data-dur="${n}" aria-pressed="${booking.dur === n}" class="chip flex-1 justify-center ${booking.dur === n ? 'is-active' : ''}">${n}h</button>`).join('')}
    </div>

    <h3 class="mt-4 text-sm font-bold">3. Horário de início</h3>
    <div class="mt-2 grid grid-cols-4 gap-2">${slots}</div>
    <div class="mt-2 flex flex-wrap gap-3 text-xs text-muted">
      <span class="flex items-center gap-1"><i class="h-3 w-3 rounded bg-green-200"></i>Livre</span>
      <span class="flex items-center gap-1"><i class="h-3 w-3 rounded bg-gray-200"></i>Ocupado</span>
      <span class="flex items-center gap-1"><i class="h-3 w-3 rounded bg-brand"></i>Selecionado</span>
    </div>

    <dl class="mt-4 space-y-1 border-t border-line pt-4 text-sm">
      <div class="flex justify-between"><dt>${ready ? `${brl(c.price)} × ${booking.dur}h` : 'Subtotal'}</dt><dd>${ready ? brl(sub) : '—'}</dd></div>
      <div class="flex justify-between"><dt>Taxa de serviço</dt><dd>${ready ? brl(f) : '—'}</dd></div>
      <div class="flex justify-between pt-2 text-base font-extrabold"><dt>Total</dt><dd>${ready ? brl(sub + f) : '—'}</dd></div>
    </dl>
    ${ready ? `<p class="mt-2 text-xs text-muted">${booking.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}, das ${booking.start}h às ${booking.start + booking.dur}h</p>` : ''}

    <button type="button" id="btn-reserve" class="mt-4 h-12 w-full rounded-lg bg-brand font-bold text-white hover:bg-[#0856cc] disabled:cursor-not-allowed disabled:opacity-50" ${ready ? '' : 'disabled'}>Reservar agora</button>
    <a href="${waLink(c)}" target="_blank" rel="noopener" class="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-sport bg-green-50 font-bold text-sport hover:bg-green-100">${icon('message-circle', 'h-5 w-5')}Conversar no WhatsApp</a>`;
  refreshIcons();
  renderMobileBar();
}
function renderMobileBar() {
  const bar = $('#mobile-bar');
  bar.classList.remove('hidden'); bar.classList.add('flex');
  bar.innerHTML = `<div><p class="price text-xl leading-none">${brl(court.price)}<span class="text-sm font-medium text-muted">/hora</span></p><p class="text-xs text-muted">${ratingHTML(court).replace(/\(\d+ avaliações\)/, '')}</p></div>
    <button type="button" id="mb-go" class="h-11 rounded-lg bg-brand px-6 font-bold text-white">Ver horários</button>`;
}

/* ---------- Lightbox ---------- */
let lb = 0;
function showLightbox(i) {
  lb = (i + court.photos.length) % court.photos.length;
  $('#lb-img').src = court.photos[lb];
  $('#lb-img').alt = `${court.name} — foto ${lb + 1}`;
  $('#lb-cap').textContent = `${lb + 1} / ${court.photos.length}`;
}

/* ---------- Eventos ---------- */
function bindDetail() {
  document.addEventListener('click', e => {
    const ph = e.target.closest('[data-photo]');
    if (ph) { showLightbox(+ph.dataset.photo); openModal('lightbox'); return; }

    const day = e.target.closest('[data-day]');
    if (day && !day.disabled) {
      const [y, m, d] = day.dataset.day.split('-').map(Number);
      booking.date = new Date(y, m - 1, d); booking.start = null; renderBooking(); return;
    }
    if (e.target.closest('#cal-prev')) { booking.month = new Date(booking.month.getFullYear(), booking.month.getMonth() - 1, 1); renderBooking(); return; }
    if (e.target.closest('#cal-next')) { booking.month = new Date(booking.month.getFullYear(), booking.month.getMonth() + 1, 1); renderBooking(); return; }

    const dur = e.target.closest('[data-dur]');
    if (dur) {
      booking.dur = +dur.dataset.dur;
      if (booking.start != null && !canBook(booking.start, booking.dur)) { booking.start = null; toast('Escolha um novo horário para essa duração', 'info'); }
      renderBooking(); return;
    }
    const hr = e.target.closest('[data-hour]');
    if (hr && !hr.disabled) {
      const h = +hr.dataset.hour;
      if (!canBook(h, booking.dur)) { toast(`Não há ${booking.dur}h seguidas livres a partir das ${h}h`, 'error'); return; }
      booking.start = h; renderBooking(); return;
    }
    if (e.target.closest('#btn-reserve') && booking.start != null) {
      const total = court.price * booking.dur, f = Math.round(total * 0.07);
      try {
        const list = JSON.parse(localStorage.getItem('quadraja:reservas') || '[]');
        list.push({ court: court.id, date: isoDate(booking.date), start: booking.start, dur: booking.dur, total: total + f });
        localStorage.setItem('quadraja:reservas', JSON.stringify(list));
      } catch { /* ignora */ }
      toast(`Reserva confirmada! ${booking.start}h–${booking.start + booking.dur}h · ${brl(total + f)}`, 'success');
      booking.start = null; renderBooking(); return;
    }
    if (e.target.closest('#mb-go')) { $('#booking-card').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (e.target.closest('#btn-share')) {
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => toast('Link copiado!', 'success'), () => toast('Não foi possível copiar o link', 'error'));
    }
  });
  $('#lb-prev').addEventListener('click', () => showLightbox(lb - 1));
  $('#lb-next').addEventListener('click', () => showLightbox(lb + 1));
  document.addEventListener('keydown', e => {
    if ($('#lightbox').classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') showLightbox(lb - 1);
    if (e.key === 'ArrowRight') showLightbox(lb + 1);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader({ tabs: false });
  renderPage();
  renderBooking();
  bindDetail();
  updateFavCount();
  refreshIcons();
});