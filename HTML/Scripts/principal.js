// principal.js
document.addEventListener('DOMContentLoaded', () => {
  const btnNext = document.getElementById('nextCoursesBtn');
  const btnPrev = document.getElementById('prevCoursesBtn');
  const carouselWrapper = document.querySelector('.courses-carousel-wrapper'); // Wrapper com overflow:hidden
  const carouselInner = document.getElementById('coursesContainer');     // Contêiner interno que se move

  if (!btnNext || !btnPrev || !carouselWrapper || !carouselInner) {
    // console.warn('Elementos do carrossel de disciplinas não encontrados.');
    return;
  }

  const cards = carouselInner.children;
  if (cards.length === 0) {
    if(btnPrev) btnPrev.disabled = true;
    if(btnNext) btnNext.disabled = true;
    return;
  }

  let cardWidthPlusGap = 0; // Largura de um card + seu gap (se o gap for por margem)
  let scrollAmount = 0;     // Quanto rolar por clique
  let currentScrollPosition = 0; // Posição atual de scroll em pixels

  function calculateDimensions() {
    if (cards.length > 0) {
        const firstCard = cards[0];
        const cardStyle = window.getComputedStyle(firstCard);
        // Se você usa 'gap' no flex container, a largura do card é só offsetWidth.
        // Se você usa margin-right no card, precisa incluir.
        // Para 'gap', o scrollAmount será mais simples.
        cardWidthPlusGap = firstCard.offsetWidth + parseFloat(cardStyle.marginRight || 0); // Adiciona marginRight se existir

        // Quanto rolar: a largura de UM card (incluindo sua margem se houver, ou apenas offsetWidth se usar flex-gap)
        scrollAmount = firstCard.offsetWidth + (parseFloat(window.getComputedStyle(carouselInner).gap) || 0);
        // Se você quiser rolar por N cards:
        // const cardsToScroll = 1; // Mude para 2, 3, 4 etc. se quiser rolar mais de um card por vez
        // scrollAmount = 0;
        // for(let i=0; i<cardsToScroll; i++) {
        //    if(cards[i]) {
        //        scrollAmount += cards[i].offsetWidth + (parseFloat(window.getComputedStyle(carouselInner).gap) || 0)
        //    }
        // }
        // scrollAmount -= (parseFloat(window.getComputedStyle(carouselInner).gap) || 0); // Remove o último gap

        // console.log("Card effective width for scroll (card + gap):", scrollAmount);
    }
  }

  function updateCarouselState() {
    if (!carouselInner || !btnPrev || !btnNext || !carouselWrapper) return;

    const maxScrollPossible = carouselInner.scrollWidth - carouselWrapper.offsetWidth;

    // Garante que currentScrollPosition não exceda os limites
    currentScrollPosition = Math.max(0, Math.min(currentScrollPosition, maxScrollPossible));

    carouselInner.style.transform = `translateX(-${currentScrollPosition}px)`;

    btnPrev.disabled = currentScrollPosition <= 0;
    // Para o botão 'next', desabilitar se o scroll restante for menor que um pequeno threshold
    // ou se currentScrollPosition estiver muito próximo do máximo.
    btnNext.disabled = currentScrollPosition >= maxScrollPossible -1; // -1 para margem de erro de float

    // console.log("Scroll:", currentScrollPosition, "MaxScroll:", maxScrollPossible, "PrevD:", btnPrev.disabled, "NextD:", btnNext.disabled);
  }

  btnNext.addEventListener('click', () => {
    const maxScrollPossible = carouselInner.scrollWidth - carouselWrapper.offsetWidth;
    if (currentScrollPosition < maxScrollPossible) {
      currentScrollPosition += scrollAmount;
      updateCarouselState();
    }
  });

  btnPrev.addEventListener('click', () => {
    if (currentScrollPosition > 0) {
      currentScrollPosition -= scrollAmount;
      updateCarouselState();
    }
  });

  function initializeCarousel() {
    calculateDimensions();
    currentScrollPosition = 0; // Garante que comece do início
    updateCarouselState();
  }

  initializeCarousel();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // console.log("Window resized, re-initializing carousel.");
        initializeCarousel(); // Re-calcula e reseta
    }, 250);
  });
});
