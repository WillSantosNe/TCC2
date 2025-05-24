document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado. principal.js está executando.');

    // --- SUA LÓGICA ORIGINAL E DETALHADA DO CARROSSEL DE DISCIPLINAS ---
    const btnNextCarousel = document.getElementById('nextCoursesBtn'); // Renomeado para evitar conflito de escopo se 'btnNext' fosse usado globalmente
    const btnPrevCarousel = document.getElementById('prevCoursesBtn'); // Renomeado para evitar conflito de escopo
    const carouselWrapper = document.querySelector('.courses-carousel-wrapper');
    const carouselInner = document.getElementById('coursesContainer');

    if (btnNextCarousel && btnPrevCarousel && carouselWrapper && carouselInner) {
        const cards = carouselInner.children;
        if (cards.length === 0) {
            if(btnPrevCarousel) btnPrevCarousel.disabled = true;
            if(btnNextCarousel) btnNextCarousel.disabled = true;
        }

        let carouselScrollAmount = 0; // Renomeado para evitar conflito
        let currentScrollPosition = 0;

        function calculateDimensionsAndScrollAmount() {
            if (cards.length > 0) {
                const firstCard = cards[0];
                if (firstCard && window.getComputedStyle && carouselInner) {
                    const cardStyle = window.getComputedStyle(firstCard);
                    const cardMarginRight = parseFloat(cardStyle.marginRight) || 0;
                    const carouselGap = parseFloat(window.getComputedStyle(carouselInner).gap) || 0;
                    
                    carouselScrollAmount = firstCard.offsetWidth + (carouselGap > 0 ? carouselGap : cardMarginRight);
                } else {
                    carouselScrollAmount = 200; // Fallback
                }
            } else {
                carouselScrollAmount = 0;
            }
        }

        function updateCarouselState() {
            if (!carouselInner || !carouselWrapper) return;

            const maxScrollPossible = carouselInner.scrollWidth - carouselWrapper.offsetWidth;
            currentScrollPosition = Math.max(0, Math.min(currentScrollPosition, maxScrollPossible));
            carouselInner.style.transform = `translateX(-${currentScrollPosition}px)`;

            if(btnPrevCarousel) btnPrevCarousel.disabled = currentScrollPosition <= 0;
            if(btnNextCarousel) btnNextCarousel.disabled = currentScrollPosition >= maxScrollPossible -1; // -1 for float precision
        }

        if (btnNextCarousel) {
            btnNextCarousel.addEventListener('click', () => {
                calculateDimensionsAndScrollAmount(); 
                const maxScrollPossible = carouselInner.scrollWidth - carouselWrapper.offsetWidth;
                if (currentScrollPosition < maxScrollPossible) {
                    currentScrollPosition += carouselScrollAmount;
                    if (currentScrollPosition > maxScrollPossible) {
                        currentScrollPosition = maxScrollPossible;
                    }
                    updateCarouselState();
                }
            });
        }

        if (btnPrevCarousel) {
            btnPrevCarousel.addEventListener('click', () => {
                calculateDimensionsAndScrollAmount();
                if (currentScrollPosition > 0) {
                    currentScrollPosition -= carouselScrollAmount;
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
        console.log('Sua lógica original do carrossel configurada.');
    } else {
        console.warn('Elementos do carrossel (nextCoursesBtn, prevCoursesBtn, .courses-carousel-wrapper, coursesContainer) não encontrados para sua lógica original.');
    } // Fim da sua lógica do carrossel

    // --- LÓGICA DE MANIPULAÇÃO DO DROPDOWN DE USUÁRIO (ORIGINAL SUA) ---
    var userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn && typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
        new bootstrap.Dropdown(userMenuBtn);
        console.log('Dropdown de usuário configurado.');
    } else {
        console.warn('Botão do menu de usuário (userMenuBtn) ou Bootstrap Dropdown não encontrado/inicializado.');
    }
});

/*
// Função exemplo para popular select (você precisará adaptar à sua fonte de dados)
function popularSelectDisciplinas(selectElement) {
    if (!selectElement) {
        console.error('Elemento select para disciplinas não encontrado para popular.');
        return;
    }
    selectElement.innerHTML = '<option value="">Selecione a disciplina...</option>';
    // const disciplinasCadastradas = JSON.parse(localStorage.getItem('disciplinasDB')) || [];
    // disciplinasCadastradas.forEach(disciplina => {
    //     const option = document.createElement('option');
    //     option.value = disciplina.id;
    //     option.textContent = disciplina.nome;
    //     selectElement.appendChild(option);
    // });
}
*/
