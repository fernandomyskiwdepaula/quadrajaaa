/* =========================================================
   QuadraJá — home.js
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  renderHeader({ tabs: true, activeSport: '' });

  /* Barra de busca do hero — envia parâmetros por querystring para busca.html */
  $('#hero-search').innerHTML = searchBarHTML({}, false);
  bindSearchBar();

  /* Cidades em destaque */
  $('#cities').innerHTML = CITIES.map(ci => {
    const n = COURTS.filter(c => c.city === ci.name).length;
    return `
    <a href="busca.html?q=${encodeURIComponent(ci.name)}" class="card-hover group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-line sm:aspect-[4/3]">
      <img src="https://picsum.photos/seed/quadraja-city-${encodeURIComponent(ci.name)}/600/500" alt="Vista de ${ci.name}" loading="lazy" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" onerror="this.src='${FALLBACK_IMG}'">
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
      <div class="absolute bottom-3 left-4 text-white"><h3 class="text-xl font-bold">${ci.name}</h3><p class="text-sm">${n} quadras</p></div>
    </a>`;
  }).join('');

  /* Modalidades populares */
  const sportList = ['society', 'futsal', 'volei', 'beach-tennis', 'basquete', 'padel', 'tenis', 'poli'].map(sportById);
  $('#sports').innerHTML = sportList.map(s => {
    const n = COURTS.filter(c => c.sport === s.id).length;
    return `
    <a href="busca.html?sport=${s.id}" class="card-hover flex flex-col items-center gap-2 rounded-2xl border border-line bg-white p-4 text-center">
      <span class="text-4xl" aria-hidden="true">${s.emoji}</span>
      <span class="text-sm font-bold">${s.short === 'Futebol' ? 'Society' : s.short}</span>
      <span class="text-xs text-muted">${n} quadras</span>
    </a>`;
  }).join('');

  /* Carrossel horizontal de destaques (6 cards, mesmo componente da grade) */
  const feats = COURTS.filter(c => c.featured).slice(0, 6);
  const track = $('#featured');
  track.innerHTML = feats.map(c => `<div class="w-[280px] shrink-0 snap-start sm:w-[320px]">${courtCardGrid({ ...c, featured: true })}</div>`).join('');
  const scrollBy = dir => track.scrollBy({ left: dir * 340, behavior: 'smooth' });
  $('#feat-prev').addEventListener('click', () => scrollBy(-1));
  $('#feat-next').addEventListener('click', () => scrollBy(1));

  /* Formulário "Anuncie seu espaço" */
  $('#a-sport').innerHTML = SPORTS.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
  $('#anuncie-form').addEventListener('submit', e => {
    e.preventDefault();
    e.target.reset();
    toast('Cadastro enviado! Nossa equipe entrará em contato.', 'success');
  });

  /* FAQ em accordion */
  const faqs = [
    ['Como funciona o pagamento?', 'Você paga online com Pix ou cartão no momento da reserva. O valor é repassado ao anunciante após o jogo.'],
    ['Posso cancelar uma reserva?', 'Sim. Cada espaço define sua política; em geral o cancelamento é gratuito até 24 horas antes do horário reservado.'],
    ['Como sei se o horário está disponível?', 'A página de cada quadra mostra a agenda em tempo real: horários livres em verde e ocupados em cinza.'],
    ['Posso levar mais jogadores que o informado?', 'Cada quadra tem uma capacidade máxima por segurança. Consulte as regras de uso na página do espaço.'],
    ['Como anuncio meu espaço?', 'Preencha o formulário da seção “Anuncie seu espaço”. Sem mensalidade: a taxa é cobrada apenas sobre reservas feitas.']
  ];
  $('#faq-list').innerHTML = faqs.map(([q, a], i) => `
    <div class="faq-item">
      <h3><button type="button" class="flex w-full items-center justify-between gap-4 p-4 text-left font-semibold" aria-expanded="false" aria-controls="faq-${i}" id="faq-btn-${i}">
        ${q}<span class="faq-chevron" aria-hidden="true"><i data-lucide="chevron-down" class="h-5 w-5"></i></span></button></h3>
      <div class="faq-panel" id="faq-${i}" role="region" aria-labelledby="faq-btn-${i}"><div><p class="px-4 pb-4 text-gray-600">${a}</p></div></div>
    </div>`).join('');
  $('#faq-list').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    const open = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });

  updateFavCount();
  refreshIcons();
});