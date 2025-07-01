// static/js/principal.js (CORRIGIDO)
document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
    const btnNextCarousel = document.getElementById('nextCoursesBtn');
    const btnPrevCarousel = document.getElementById('prevCoursesBtn');
    const carouselWrapper = document.querySelector('.courses-carousel-wrapper');
    const coursesContainer = document.getElementById('coursesContainer');

    // --- LÓGICA DO CARROSSEL DE DISCIPLINAS ---
    // Esta lógica opera sobre os elementos que o Flask/Jinja2 já renderizou no HTML.
    if (btnNextCarousel && btnPrevCarousel && carouselWrapper && coursesContainer) {
        let carouselScrollAmount = 0;
        let currentScrollPosition = 0;
        
        const calculateDimensionsAndScrollAmount = () => {
            const cards = Array.from(coursesContainer.children);
            if (cards.length > 0) {
                const firstCard = cards.find(c => c.classList.contains('course-card'));
                if (firstCard) {
                    const cardStyle = window.getComputedStyle(firstCard);
                    const cardMarginRight = parseFloat(cardStyle.marginRight) || 0;
                    const carouselGap = parseFloat(window.getComputedStyle(coursesContainer).gap) || 16;
                    carouselScrollAmount = firstCard.offsetWidth + (carouselGap > 0 ? carouselGap : cardMarginRight);
                } else {
                    carouselScrollAmount = 236; // Um valor padrão
                }
            } else {
                carouselScrollAmount = 0;
            }
        };

        const updateCarouselState = () => {
            if (!coursesContainer || !carouselWrapper) return;
            const maxScrollPossible = Math.max(0, coursesContainer.scrollWidth - carouselWrapper.offsetWidth);
            currentScrollPosition = Math.max(0, Math.min(currentScrollPosition, maxScrollPossible));
            coursesContainer.style.transform = `translateX(-${currentScrollPosition}px)`;
            if (btnPrevCarousel) btnPrevCarousel.disabled = currentScrollPosition <= 0;
            if (btnNextCarousel) btnNextCarousel.disabled = currentScrollPosition >= maxScrollPossible - 1;
        };

        btnNextCarousel.addEventListener('click', () => {
            calculateDimensionsAndScrollAmount();
            const max = Math.max(0, coursesContainer.scrollWidth - carouselWrapper.offsetWidth);
            if (currentScrollPosition < max) {
                currentScrollPosition = Math.min(currentScrollPosition + carouselScrollAmount, max);
                updateCarouselState();
            }
        });
        
        btnPrevCarousel.addEventListener('click', () => {
            calculateDimensionsAndScrollAmount();
            if (currentScrollPosition > 0) {
                currentScrollPosition = Math.max(0, currentScrollPosition - carouselScrollAmount);
                updateCarouselState();
            }
        });
        
        // Inicializa o carrossel após a página carregar
        setTimeout(() => {
            calculateDimensionsAndScrollAmount();
            updateCarouselState();
        }, 200);

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                calculateDimensionsAndScrollAmount();
                updateCarouselState();
            }, 250);
        });
    }

    // --- LÓGICA PARA ABRIR MODAL DE DETALHES DA DISCIPLINA ---
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
            const disciplinaId = card.dataset.disciplinaId;
            // A lógica para buscar dados via API e preencher este modal será o próximo passo.
            console.log(`Clicou na disciplina com ID: ${disciplinaId}. A implementação do modal de detalhes virá a seguir.`);
        });
    });

    // *** A LÓGICA QUE IMPEDIA O ENVIO DOS FORMULÁRIOS DOS MODAIS FOI REMOVIDA ***
    // Agora, os formulários usarão a ação padrão definida no HTML:
    // <form method="POST" action="{{ url_for('criar_disciplina') }}">
    // Isso garante que os dados sejam enviados para o Flask.
});
