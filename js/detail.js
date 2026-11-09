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
  const c = court;
  document.title = `${c.name} — ${c.city}/${c.uf} | QuadraJá`;
  const reviews = [
    ['Rafael', 5, 'Quadra bem cuidada e iluminação excelente. O atendimento resolveu tudo rápido.'],
    ['Camila', 4, 'Boa estrutura. O vestiário poderia ter mais ganchos, mas o resto é ótimo.'],
    ['João', 5, 'Reservamos para o racha da firma e foi tudo tranquilo. Vamos voltar.'],
    ['Letícia', 4, 'Fácil de achar, tem estacionamento e o piso está em ótimo estado.']
  ];
  const similar = COURTS.filter(x => x.id !== c.id && (x.sport === c.sport || x.city === c.city)).sort((a, b) => (b.sport === c.sport) - (a.sport === c.sport) || b.rating - a.rating).slice(0, 3);
  const h2 = 'display text-3xl leading-none';

  $('#detail').innerHTML = `
  <nav class="text-sm" aria-label="Você está em">
    <ol class="flex flex-wrap items-center gap-2"><li><a class="text-ember underline" href="index.html">Início</a></li><li aria-hidden="true">/</li><li><a class="text-ember underline" href="busca.html">Quadras</a></li><li aria-hidden="true">/</li><li><a class="text-ember underline" href="busca.html?q=${encodeURIComponent(c.city)}">${c.city}</a></li><li aria-hidden="true">/</li><li aria-current="page">${c.name}</li></ol>
  </nav>

  <!-- Título -->
  <div class="mt-4 flex flex-wrap items-start justify-between gap-3">
    <div>
      <p class="flex items-center gap-1.5 font-semibold text-ember">${sportIcon(c.sport, 'h-5 w-5')}${c.sportLabel}</p>
      <h1 class="display text-5xl leading-[.9] sm:text-7xl">${c.name}</h1>
      <div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        ${ratingHTML(c)}
        <span class="flex items-center gap-1.5">${icon('map-pin')}${c.street}, ${c.neighborhood}, ${c.city}/${c.uf}</span>
        <span class="flex items-center gap-1.5 font-semibold">${verified}${c.owner}, anunciante verificado</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button type="button" id="btn-share" class="btn btn-line btn-sm">${icon('share-2')}Compartilhar</button>
      ${favBtn(c, '!h-10')}
    </div>
  </div>

  <!-- Galeria em mosaico -->
  <div class="relative mt-5 grid h-[260px] grid-cols-4 grid-rows-2 gap-1 border-2 border-ink bg-ink sm:h-[440px]">
    ${c.photos.map((p, i) => `
      <button type="button" data-photo="${i}" class="${i === 0 ? 'col-span-4 row-span-2 sm:col-span-2' : 'hidden sm:block'} overflow-hidden bg-chalk" aria-label="Ampliar foto ${i + 1}">
        <img src="${p}" alt="${c.name}, vista ${i + 1} da quadra" ${i === 0 ? '' : 'loading="lazy"'} class="h-full w-full object-cover">
      </button>`).join('')}
    <button type="button" data-photo="0" class="btn btn-line btn-sm absolute bottom-3 right-3">${icon('images')}Ver as 5 fotos</button>
  </div>

  <div class="mt-10 grid gap-10 lg:grid-cols-[1fr_390px]">
    <!-- Coluna esquerda -->
    <div class="space-y-10">
      <section aria-labelledby="sobre"><h2 id="sobre" class="${h2}">Sobre o espaço</h2>
        <p class="mt-3 max-w-2xl text-lg">${c.description}</p>
        <dl class="mt-5 grid grid-cols-2 gap-px border-2 border-ink bg-ink sm:grid-cols-4">
          <div class="bg-white p-3"><dt class="text-sm text-ash">Dimensão</dt><dd class="display text-3xl leading-none">${c.size} m²</dd></div>
          <div class="bg-white p-3"><dt class="text-sm text-ash">Piso</dt><dd class="display text-3xl leading-none">${c.floorLabel}</dd></div>
          <div class="bg-white p-3"><dt class="text-sm text-ash">Capacidade</dt><dd class="display text-3xl leading-none">${c.capacity} jogadores</dd></div>
          <div class="bg-white p-3"><dt class="text-sm text-ash">Esporte</dt><dd class="display text-3xl leading-none">${c.sportLabel}</dd></div>
        </dl></section>

      <section aria-labelledby="comod"><h2 id="comod" class="${h2}">Comodidades</h2>
        <ul class="mt-4 grid gap-3 sm:grid-cols-2">
          ${AMENITIES.map(a => {
            const has = c.amenities.includes(a.id);
            return `<li class="flex items-center gap-3 ${has ? 'font-semibold' : 'text-ash line-through'}">${icon(a.icon, 'h-5 w-5 ' + (has ? 'text-ember' : ''))}${a.label}${has ? '' : '<span class="sr-only"> (não tem)</span>'}</li>`;
          }).join('')}
        </ul></section>

      <section aria-labelledby="regras"><h2 id="regras" class="${h2}">Regras de uso</h2>
        <ul class="mt-3 list-disc space-y-1 pl-5 text-lg">
          <li>Chegue 10 minutos antes: o aquecimento conta no horário reservado.</li>
          <li>Use calçado adequado ao piso (${c.floorLabel.toLowerCase()}).</li>
          <li>O limite é de ${c.capacity} jogadores em quadra.</li>
          <li>Não é permitido fumar nem levar garrafas de vidro para a área de jogo.</li>
        </ul></section>

      <section aria-labelledby="cancel"><h2 id="cancel" class="${h2}">Cancelamento</h2>
        <div class="mt-3 border-l-8 border-fire bg-chalk p-4 text-lg">
          <p><b>Grátis</b> até 24 horas antes do horário reservado.</p>
          <p class="mt-1">De 24h a 6h antes, devolvemos 50%. Com menos de 6h, não há reembolso.</p>
        </div></section>

      <section aria-labelledby="aval"><h2 id="aval" class="${h2}">Avaliações</h2>
        <p class="mt-2">${ratingHTML(c)}</p>
        <div class="mt-4 grid gap-6 sm:grid-cols-2">
          ${reviews.map(r => `<figure class="border-t-4 border-ink pt-3"><blockquote class="text-lg leading-snug">“${r[2]}”</blockquote><figcaption class="mt-2 font-semibold">${r[0]}, nota ${r[1]}</figcaption></figure>`).join('')}
        </div></section>

      <section aria-labelledby="mapa"><h2 id="mapa" class="${h2}">Como chegar</h2>
        <div id="detail-map" class="relative mt-4 h-64 overflow-hidden border-2 border-ink bg-fire" role="img" aria-label="Mapa ilustrativo com a localização de ${c.name}">
          <span class="display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-ink bg-ink px-3 py-1 text-2xl text-white">${brl(c.price)}</span>
        </div>
        <p class="mt-2 text-ash">${c.street}, ${c.neighborhood}, ${c.city}/${c.uf}</p></section>
    </div>

    <!-- Coluna direita: card de reserva (fixo ao rolar) -->
    <aside class="lg:sticky lg:top-24 lg:self-start" aria-label="Reserva">
      <div id="booking-card" class="border-4 border-ink bg-white p-5" style="box-shadow:10px 10px 0 #FF5C00"></div>
    </aside>
  </div>

  <section class="mt-14" aria-labelledby="sim"><h2 id="sim" class="display text-5xl leading-[.9]">Quadras parecidas</h2>
    <div class="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">${similar.map(courtCardGrid).join('')}</div></section>`;
  $('#detail-map').style.backgroundImage = `url("${courtLinesURI(c.sport, '#000000', .6)}")`;
  $('#detail-map').style.backgroundSize = 'cover';
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
      class="grid h-9 place-items-center font-semibold ${sel ? 'bg-ink text-white' : past ? 'text-[#BDBDBD]' : 'hover:bg-fire'}">${d}</button>`;
  }

  // grade de horários
  let slots = '';
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    const busy = !slotFree(h);
    const sel = booking.start != null && h >= booking.start && h < booking.start + booking.dur;
    slots += `<button type="button" data-hour="${h}" ${busy ? 'disabled aria-label="' + h + 'h ocupado"' : `aria-label="${h}h livre"`} ${sel ? 'aria-pressed="true"' : ''}
      class="slot ${busy ? 'slot-busy' : sel ? 'slot-sel' : 'slot-free'}">${h}h</button>`;
  }

  const sub = booking.start != null ? c.price * booking.dur : 0;
  const f = booking.start != null ? Math.round(sub * 0.07) : 0;
  const ready = booking.start != null;
  const step = 'display text-2xl leading-none';

  $('#booking-card').innerHTML = `
    <p class="display text-6xl leading-none">${brl(c.price)}<span class="ml-1 text-xl normal-case text-ash">/hora</span></p>
    <p class="text-sm text-ash">A taxa de serviço (7%) entra no total.</p>

    <h3 class="${step} mt-5">Data</h3>
    <div class="mt-2 border-2 border-ink p-3">
      <div class="mb-2 flex items-center justify-between">
        <button type="button" id="cal-prev" ${canPrev ? '' : 'disabled'} class="p-1.5 hover:bg-fire disabled:opacity-30" aria-label="Mês anterior">${icon('chevron-left')}</button>
        <span class="font-bold capitalize" aria-live="polite">${monthName}</span>
        <button type="button" id="cal-next" class="p-1.5 hover:bg-fire" aria-label="Próximo mês">${icon('chevron-right')}</button>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center text-sm text-ash" aria-hidden="true">${['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => `<span>${d}</span>`).join('')}</div>
      <div class="mt-1 grid grid-cols-7 gap-1 text-center" role="group" aria-label="Dias do mês">${cal}</div>
    </div>

    <h3 class="${step} mt-5">Quanto tempo</h3>
    <div class="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Duração">
      ${[1, 2, 3].map(n => `<button type="button" data-dur="${n}" aria-pressed="${booking.dur === n}" class="chip display !text-xl ${booking.dur === n ? 'is-active' : ''}">${n}h</button>`).join('')}
    </div>

    <h3 class="${step} mt-5">Horário de início</h3>
    <div class="mt-2 grid grid-cols-4 gap-2">${slots}</div>
    <p class="mt-2 text-sm text-ash">Riscado em cinza: já reservado.</p>

    <dl class="mt-4 space-y-1 border-t-2 border-ink pt-4">
      <div class="flex justify-between"><dt>${ready ? `${brl(c.price)} × ${booking.dur}h` : 'Subtotal'}</dt><dd>${ready ? brl(sub) : '—'}</dd></div>
      <div class="flex justify-between"><dt>Taxa de serviço</dt><dd>${ready ? brl(f) : '—'}</dd></div>
      <div class="flex items-end justify-between pt-1"><dt class="font-bold">Total</dt><dd class="display text-4xl leading-none">${ready ? brl(sub + f) : '—'}</dd></div>
    </dl>
    ${ready ? `<p class="mt-2 text-sm text-ash">${booking.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}, das ${booking.start}h às ${booking.start + booking.dur}h</p>` : '<p class="mt-2 text-sm text-ash">Escolha um horário para ver o total.</p>'}

    <button type="button" id="btn-reserve" class="btn btn-fire mt-4 w-full" ${ready ? '' : 'disabled'}>Reservar agora</button>
    <a href="${waLink(c)}" target="_blank" rel="noopener" class="btn btn-line mt-2 w-full">${icon('message-circle', 'h-5 w-5')}Falar no WhatsApp</a>`;
  refreshIcons();
  renderMobileBar();
}
function renderMobileBar() {
  const bar = $('#mobile-bar');
  bar.classList.remove('hidden'); bar.classList.add('flex');
  bar.innerHTML = `<p class="display text-3xl leading-none">${brl(court.price)}<span class="ml-1 text-base normal-case text-white/70">/hora</span></p>
    <button type="button" id="mb-go" class="btn btn-fire btn-sm">Ver horários</button>`;
}

/* ---------- Galeria ampliada ---------- */
let lb = 0;
function showLightbox(i) {
  lb = (i + court.photos.length) % court.photos.length;
  $('#lb-img').src = court.photos[lb];
  $('#lb-img').alt = `${court.name}, vista ${lb + 1} da quadra`;
  $('#lb-cap').textContent = `${lb + 1} de ${court.photos.length}`;
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
      if (booking.start != null && !canBook(booking.start, booking.dur)) { booking.start = null; toast('Escolha outro horário de início para essa duração', 'info'); }
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
      toast(`Reserva confirmada: ${booking.start}h às ${booking.start + booking.dur}h, ${brl(total + f)}`, 'success');
      booking.start = null; renderBooking(); return;
    }
    if (e.target.closest('#mb-go')) { $('#booking-card').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (e.target.closest('#btn-share')) {
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => toast('Link copiado', 'success'), () => toast('Não foi possível copiar o link', 'error'));
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
