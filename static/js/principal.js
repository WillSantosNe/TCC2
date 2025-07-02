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
                    carouselScrollAmount = 236; // Um valor padrão caso o cálculo falhe
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

            // Faz uma chamada para a nossa nova API no back-end
            fetch(`/api/disciplina/${disciplinaId}`)
                .then(response => {
                    // Se a resposta não for OK (ex: 404 ou 401), lança um erro
                    if (!response.ok) {
                        throw new Error('Falha ao buscar dados da disciplina. Status: ' + response.status);
                    }
                    return response.json(); // Converte a resposta em JSON
                })
                .then(data => {
                    // Pega os elementos do modal de detalhes
                    const modalEl = document.getElementById('modalDetalhesDisciplina');
                    const nomeEl = modalEl.querySelector('#detalhe-disciplina-nome');
                    const descEl = modalEl.querySelector('#detalhe-disciplina-descricao');
                    const profEl = modalEl.querySelector('#detalhe-disciplina-professor');
                    const periodoEl = modalEl.querySelector('#detalhe-disciplina-periodo');
                    const statusEl = modalEl.querySelector('#detalhe-disciplina-status');

                    // Preenche o modal com os dados recebidos da API
                    nomeEl.textContent = data.nome;
                    descEl.textContent = data.descricao || 'Nenhuma descrição fornecida.';
                    profEl.textContent = data.professor || '-';
                    periodoEl.textContent = data.periodo || '-';

                    // Lógica para aplicar a classe de cor correta ao status
                    const statusClassMap = {
                        "A FAZER": "bg-warning-subtle text-warning",
                        "EM ANDAMENTO": "bg-info-subtle text-info",
                        "CONCLUIDA": "bg-success-subtle text-success",
                        "ATRASADA": "bg-danger-subtle text-danger"
                    };
                    // Opcional: use .name se a API enviar o nome do Enum, ou .value se enviar o valor.
                    // Baseado no seu código, a API de disciplina envia o .value.
                    const statusKey = data.status.toUpperCase().replace(' ', '_').replace('Í', 'I'); // Normaliza a chave para corresponder
                    
                    // Mapeamento das chaves normalizadas para as classes de cor
                    const statusKeyMap = {
                        "ATIVA": "bg-warning-subtle text-warning",
                        "EM_ANDAMENTO": "bg-info-subtle text-info",
                        "CONCLUIDA": "bg-success-subtle text-success"
                    };

                    const statusClass = statusKeyMap[statusKey] || "bg-light"; // Busca no novo mapa
                    statusEl.innerHTML = `<span class="badge ${statusClass}">${data.status}</span>`;

                    // Abre o modal
                    const bsModal = new bootstrap.Modal(modalEl);
                    bsModal.show();
                })
                .catch(error => {
                    console.error('Erro ao buscar detalhes da disciplina:', error);
                    alert('Não foi possível carregar os detalhes da disciplina.');
                });
        });
    });

    // --- LÓGICA PARA ABRIR MODAL DE DETALHES DA ATIVIDADE (TAREFA/PROVA) ---
    // (CONFIRME QUE SEU CÓDIGO ESTÁ AQUI DENTRO)
    document.querySelectorAll('.atividade-clicavel').forEach(item => {
        item.addEventListener('click', () => {
            const atividadeId = item.dataset.atividadeId;

            fetch(`/api/atividade/${atividadeId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Falha ao buscar dados da atividade. Status: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    // Pega os elementos do modal de detalhes da atividade
                    const modalEl = document.getElementById('modalDetalhesAtividade');
                    const nomeEl = modalEl.querySelector('#detalhe-atividade-nome');
                    const disciplinaEl = modalEl.querySelector('#detalhe-atividade-disciplina');
                    const tipoEl = modalEl.querySelector('#detalhe-atividade-tipo .badge');
                    const dataEl = modalEl.querySelector('#detalhe-atividade-data');
                    const statusEl = modalEl.querySelector('#detalhe-atividade-status .badge');
                    const descEl = modalEl.querySelector('#detalhe-atividade-descricao');

                    // Preenche o modal com os dados recebidos da API
                    nomeEl.textContent = data.titulo;
                    disciplinaEl.textContent = data.disciplina_nome;
                    dataEl.textContent = data.data_entrega;
                    descEl.textContent = data.descricao || 'Nenhuma descrição fornecida.';

                    // Lógica para o TIPO (Tarefa ou Prova)
                    tipoEl.textContent = data.tipo;
                    tipoEl.className = 'badge'; 
                    if (data.tipo === 'PROVA') {
                        tipoEl.classList.add('bg-danger-subtle', 'text-danger');
                    } else {
                        tipoEl.classList.add('bg-primary-subtle', 'text-primary');
                    }

                    // Lógica para o STATUS
                    statusEl.textContent = data.status.replace('_', ' ');
                    statusEl.className = 'badge'; 
                    const statusKey = data.status.replace('_', ' ');
                    const statusClassMap = {
                        "A FAZER": "bg-warning-subtle text-warning",
                        "EM ANDAMENTO": "bg-info-subtle text-info",
                        "CONCLUIDA": "bg-success-subtle text-success"
                    };
                    const statusClass = statusClassMap[statusKey] || "bg-secondary-subtle text-secondary";
                    statusClass.split(' ').forEach(cls => statusEl.classList.add(cls));

                    // Abre o modal
                    const bsModal = new bootstrap.Modal(modalEl);
                    bsModal.show();
                })
                .catch(error => {
                    console.error('Erro ao buscar detalhes da atividade:', error);
                    alert('Não foi possível carregar os detalhes da atividade.');
                });
        });
    });
});
