/* Configuração do Tailwind CDN — carregar logo após o script do Tailwind.
   Paleta: preto, laranja e branco. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: '#000000',     // preto
        fire: '#FF5C00',    // laranja quadra
        ember: '#BF3F00',   // laranja escuro (texto sobre branco, contraste AA)
        chalk: '#F2F2F2',   // branco-giz
        ash: '#595959'      // cinza de apoio
      },
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        display: ['"Big Shoulders Display"', 'Impact', 'sans-serif']
      }
    }
  }
};
