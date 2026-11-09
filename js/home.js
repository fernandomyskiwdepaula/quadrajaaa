/* =========================================================
   QuadraJá — home.js
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  renderHeader({ tabs: true, activeSport: '' });

  /* Textura de linhas de quadra no fundo do hero */
  $('#hero-lines').style.backgroundImage = `url("${courtLinesURI('basquete', '#FF5C00', 1.4)}")`;

  /* Foto-ilustração do hero, com um "ingresso" de reserva por cima */
  const hot = COURTS[12]; // Society Hauer Premium
  $('#hero-art').innerHTML = `
    <img src="${courtArt('basquete', 'madeira', 0, 4, 8)}" alt="Quadra de basquete vista de cima, com a bola perto da linha de três pontos" class="hero-photo aspect-[4/3] w-full object-cover">
    <a href="quadra.html?id=${hot.id}" class="absolute -bottom-5 left-2 max-w-[250px] border-2 border-white bg-ink p-3 text-white hover:bg-fire hover:text-ink lg:left-0">
      <span class="block text-sm font-semibold">Vago hoje, ${hot.slots[0]}h</span>
      <span class="display block text-2xl leading-[.95]">${hot.name}</span>
      <span class="mt-1 block text-sm">${hot.neighborhood}, ${hot.city}</span>
      <span class="display mt-1 block text-3xl leading-none">${brl(hot.price)}<span class="ml-1 text-base normal-case">/hora</span></span>
    </a>`;

  /* Barra de busca do hero — envia os parâmetros por querystring para busca.html */
  $('#hero-search').innerHTML = searchBarHTML({}, false);
  bindSearchBar();

  /* Esportes: blocos de placar alternando laranja, preto e branco */
  const sportList = ['society', 'futsal', 'volei', 'beach-tennis', 'basquete', 'padel', 'tenis', 'poli'].map(sportById);
  const tone = [
    'bg-fire text-ink hover:bg-ink hover:text-white',
    'bg-ink text-white hover:bg-fire hover:text-ink',
    'bg-white text-ink hover:bg-fire'
  ];
  $('#sports').innerHTML = sportList.map((s, i) => {
    const n = COURTS.filter(c => c.sport === s.id).length;
    // alterna as cores em tabuleiro: linha 1 começa laranja, linha 2 começa preto
    const t = tone[(i + Math.floor(i / 4)) % 3];
    return `
    <a href="busca.html?sport=${s.id}" class="group flex min-h-[170px] flex-col justify-between p-4 transition-colors ${t}">
      ${sportIcon(s.id, 'h-14 w-14')}
      <span><span class="display block text-3xl leading-[.95]">${s.short}</span><span class="text-sm font-semibold">${n} ${n === 1 ? 'quadra' : 'quadras'}</span></span>
    </a>`;
  }).join('');

  /* Cidades: pôster com a quadra e o nome embaixo */
  $('#cities').innerHTML = CITIES.map((ci, i) => {
    const n = COURTS.filter(c => c.city === ci.name).length;
    return `
    <a href="busca.html?q=${encodeURIComponent(ci.name)}" class="lift block border-2 border-ink bg-white">
      <div class="aspect-[4/5] overflow-hidden border-b-2 border-ink sm:aspect-[4/3]"><img src="${courtArt(ci.sport, '', i, i % 2 ? 3 : 0, 40 + i)}" alt="Quadra de ${sportById(ci.sport).label.toLowerCase()} em ${ci.name}, vista de cima" loading="lazy" class="h-full w-full object-cover"></div>
      <div class="bg-ink p-3 text-white"><h3 class="display text-3xl leading-[.9]">${ci.name}</h3><span class="mt-1 block text-sm font-semibold text-fire">${n} quadras</span></div>
    </a>`;
  }).join('');

  /* Carrossel horizontal de destaques (mesmo card da grade) */
  const feats = COURTS.filter(c => c.featured).slice(0, 6);
  const track = $('#featured');
  track.innerHTML = feats.map(c => `<div class="w-[290px] shrink-0 snap-start sm:w-[330px]">${courtCardGrid({ ...c, featured: true })}</div>`).join('');
  const scrollBy = dir => track.scrollBy({ left: dir * 350, behavior: 'smooth' });
  $('#feat-prev').addEventListener('click', () => scrollBy(-1));
  $('#feat-next').addEventListener('click', () => scrollBy(1));

  /* Formulário "Anuncie seu espaço" */
  $('#a-sport').innerHTML = SPORTS.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
  $('#anuncie-form').addEventListener('submit', e => {
    e.preventDefault();
    e.target.reset();
    toast('Cadastro enviado. Nossa equipe responde em até 1 dia útil.', 'success');
  });

  /* FAQ em accordion */
  const faqs = [
    ['Como funciona o pagamento?', 'Você paga online, com Pix ou cartão, na hora da reserva. O valor só é repassado ao dono da quadra depois do jogo.'],
    ['Posso cancelar uma reserva?', 'Pode. Cada espaço tem sua regra, mas em geral o cancelamento é grátis até 24 horas antes do horário reservado.'],
    ['Como sei se o horário está livre?', 'A página de cada quadra mostra a agenda: horários livres em branco, ocupados riscados em cinza.'],
    ['Posso levar mais gente do que o informado?', 'Cada quadra tem um limite de jogadores por segurança. Ele aparece nas regras de uso, na página do espaço.'],
    ['Como anuncio minha quadra?', 'Preencha o formulário “Cadastre seu espaço”, nesta página. Não há mensalidade: a taxa é cobrada só sobre as reservas feitas.']
  ];
  $('#faq-list').innerHTML = faqs.map(([q, a], i) => `
    <div class="faq-item border-b-2 border-ink">
      <h3><button type="button" class="flex w-full items-center justify-between gap-4 py-4 text-left text-xl font-bold" aria-expanded="false" aria-controls="faq-${i}" id="faq-btn-${i}">
        ${q}<span class="faq-plus shrink-0" aria-hidden="true"><i data-lucide="plus" class="h-6 w-6"></i></span></button></h3>
      <div class="faq-panel" id="faq-${i}" role="region" aria-labelledby="faq-btn-${i}"><div><p class="pb-4 text-lg text-ash">${a}</p></div></div>
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
