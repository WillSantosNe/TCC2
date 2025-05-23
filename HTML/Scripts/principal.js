document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica existente do Carrossel de Disciplinas ---
    const btnNext = document.getElementById('nextCoursesBtn');
    const btnPrev = document.getElementById('prevCoursesBtn');
    const carouselWrapper = document.querySelector('.courses-carousel-wrapper');
    const carouselInner = document.getElementById('coursesContainer');

    if (btnNext && btnPrev && carouselWrapper && carouselInner) {
        const cards = carouselInner.children;
        if (cards.length === 0) {
            if(btnPrev) btnPrev.disabled = true;
            if(btnNext) btnNext.disabled = true;
        }

        let scrollAmount = 0;
        let currentScrollPosition = 0;

        function calculateDimensionsAndScrollAmount() {
            if (cards.length > 0) {
                const firstCard = cards[0];
                // Ensure firstCard and its style are accessible
                if (firstCard && window.getComputedStyle && carouselInner) {
                    const cardStyle = window.getComputedStyle(firstCard);
                    const cardMarginRight = parseFloat(cardStyle.marginRight) || 0;
                    const carouselGap = parseFloat(window.getComputedStyle(carouselInner).gap) || 0;
                    
                    scrollAmount = firstCard.offsetWidth + (carouselGap > 0 ? carouselGap : cardMarginRight);
                } else {
                    scrollAmount = 200; // Fallback scroll amount
                }
            } else {
                scrollAmount = 0;
            }
        }

        function updateCarouselState() {
            if (!carouselInner || !carouselWrapper) return; // Basic guard

            const maxScrollPossible = carouselInner.scrollWidth - carouselWrapper.offsetWidth;
            currentScrollPosition = Math.max(0, Math.min(currentScrollPosition, maxScrollPossible));
            carouselInner.style.transform = `translateX(-${currentScrollPosition}px)`;

            if(btnPrev) btnPrev.disabled = currentScrollPosition <= 0;
            if(btnNext) btnNext.disabled = currentScrollPosition >= maxScrollPossible -1; // -1 for float precision
        }

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                calculateDimensionsAndScrollAmount(); 
                const maxScrollPossible = carouselInner.scrollWidth - carouselWrapper.offsetWidth;
                if (currentScrollPosition < maxScrollPossible) {
                    currentScrollPosition += scrollAmount;
                    if (currentScrollPosition > maxScrollPossible) {
                        currentScrollPosition = maxScrollPossible;
                    }
                    updateCarouselState();
                }
            });
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                calculateDimensionsAndScrollAmount();
                if (currentScrollPosition > 0) {
                    currentScrollPosition -= scrollAmount;
                    if (currentScrollPosition < 0) {
                        currentScrollPosition = 0;
                    }
                    updateCarouselState();
                }
            });
        }

        function initializeCarousel() {
            calculateDimensionsAndScrollAmount();
            currentScrollPosition = 0; 
            updateCarouselState();
        }

        initializeCarousel(); 

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                initializeCarousel(); 
            }, 250);
        });
    } // Fim da lógica do carrossel

    // --- LÓGICA DE MANIPULAÇÃO DO DROPDOWN DE USUÁRIO ---
    var userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn && typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
        new bootstrap.Dropdown(userMenuBtn);
    }

    // Nota: O botão #abrirModalNovaDisciplina na sidebar da principal.html
    // terá seu evento de clique gerenciado por disciplinas.js,
    // pois disciplinas.js é carregado e anexa um listener a esse ID globalmente.
    // As funções de modal (abrirModalFormDisciplina, etc.) e os seletores de elementos
    // do modal (modalDisciplina, formDisciplina, etc.) também virão de disciplinas.js.
    // Certifique-se que disciplinas.js não tenha código que dependa estritamente
    // de elementos que SÓ existem em disciplinas.html (como a tabela DataTable),
    // ou que ele falhe graciosamente se esses elementos não forem encontrados.
    // A submissão do formulário no disciplinas.js irá adicionar à `listaDisciplinas`
    // (que é mockada em disciplinas.js) e mostrar um alerta.
});
