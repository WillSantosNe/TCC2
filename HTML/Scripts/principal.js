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

    // --- LÓGICA PARA ABRIR E FECHAR MODAIS DOS BOTÕES RÁPIDOS ---

    // --- Modal Adicionar Disciplina ---
    const modalDisciplina = document.getElementById('modalDisciplina');
    const quickAddDisciplinaBtn = document.getElementById('quickAddDisciplinaBtn');
    const fecharModalDisciplinaBtn = document.getElementById('fecharModalDisciplina');
    const cancelarModalDisciplinaBtn = document.getElementById('cancelarModalDisciplina');
    const formDisciplina = document.getElementById('formDisciplina');

    console.log('Verificando Modal Disciplina:', modalDisciplina);
    console.log('Verificando Botão Rápido Adicionar Disciplina:', quickAddDisciplinaBtn);

    if (quickAddDisciplinaBtn && modalDisciplina) {
        quickAddDisciplinaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botão Rápido Adicionar Disciplina clicado.');
            if (formDisciplina) formDisciplina.reset();
            const modalLabel = modalDisciplina.querySelector('#modalDisciplinaLabel');
            if (modalLabel) modalLabel.textContent = 'Adicionar Disciplina';
            
            const disciplinaIdField = modalDisciplina.querySelector('#disciplinaId');
            if (disciplinaIdField) disciplinaIdField.value = '';

            modalDisciplina.showModal();
            console.log('Modal Disciplina showModal() chamado.');
        });
    } else {
        if (!quickAddDisciplinaBtn) console.error('Botão "quickAddDisciplinaBtn" não encontrado para o modal.');
        if (!modalDisciplina) console.error('Modal "modalDisciplina" não encontrado.');
    }

    if (fecharModalDisciplinaBtn && modalDisciplina) {
        fecharModalDisciplinaBtn.addEventListener('click', () => {
            modalDisciplina.close();
            console.log('Modal Disciplina fechado pelo botão X.');
        });
    }

    if (cancelarModalDisciplinaBtn && modalDisciplina) {
        cancelarModalDisciplinaBtn.addEventListener('click', () => {
            modalDisciplina.close();
            console.log('Modal Disciplina fechado pelo botão Cancelar.');
        });
    }

    if (modalDisciplina) {
        modalDisciplina.addEventListener('click', (event) => {
            if (event.target === modalDisciplina) { // Clique no backdrop
                modalDisciplina.close();
                console.log('Modal Disciplina fechado pelo clique no backdrop.');
            }
        });
    }

    // --- Modal Adicionar Tarefa/Prova ---
    const modalTarefa = document.getElementById('modalTarefa');
    const quickAddTarefaBtn = document.getElementById('quickAddTarefaBtn');
    const fecharModalTarefaBtn = document.getElementById('fecharModalTarefa');
    const cancelarModalTarefaBtn = document.getElementById('cancelarModalTarefa');
    const formTarefa = document.getElementById('formTarefa');

    console.log('Verificando Modal Tarefa:', modalTarefa);
    console.log('Verificando Botão Rápido Adicionar Tarefa:', quickAddTarefaBtn);

    if (quickAddTarefaBtn && modalTarefa) {
        quickAddTarefaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botão Rápido Adicionar Tarefa clicado.');
            if (formTarefa) formTarefa.reset();
            const modalLabel = modalTarefa.querySelector('#modalTarefaLabel');
            if (modalLabel) modalLabel.textContent = 'Adicionar Tarefa';
            
            // Lógica para popular o select de disciplinas (tarefaDisciplina) pode ser chamada aqui
            // popularSelectDisciplinas(document.getElementById('tarefaDisciplina'));

            modalTarefa.showModal();
            console.log('Modal Tarefa showModal() chamado.');
        });
    } else {
        if (!quickAddTarefaBtn) console.error('Botão "quickAddTarefaBtn" não encontrado para o modal.');
        if (!modalTarefa) console.error('Modal "modalTarefa" não encontrado.');
    }

    if (fecharModalTarefaBtn && modalTarefa) {
        fecharModalTarefaBtn.addEventListener('click', () => {
            modalTarefa.close();
            console.log('Modal Tarefa fechado pelo botão X.');
        });
    }

    if (cancelarModalTarefaBtn && modalTarefa) {
        cancelarModalTarefaBtn.addEventListener('click', () => {
            modalTarefa.close();
            console.log('Modal Tarefa fechado pelo botão Cancelar.');
        });
    }

    if (modalTarefa) {
        modalTarefa.addEventListener('click', (event) => {
            if (event.target === modalTarefa) { // Clique no backdrop
                modalTarefa.close();
                console.log('Modal Tarefa fechado pelo clique no backdrop.');
            }
        });
    }

    // --- Modal Adicionar Anotação (placeholder) ---
    const quickAddAnotacaoBtn = document.getElementById('quickAddAnotacaoBtn');
    console.log('Verificando Botão Rápido Adicionar Anotação:', quickAddAnotacaoBtn);
    if (quickAddAnotacaoBtn) {
        quickAddAnotacaoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botão Rápido Adicionar Anotação clicado.');
            alert('Funcionalidade "Adicionar Anotação" ainda não implementada ou modal não definido.');
        });
    } else {
        console.error('Botão "quickAddAnotacaoBtn" não encontrado para o modal.');
    }

    // NOTAS FINAIS:
    // A lógica de SALVAR os dados dos formulários dos modais
    // (formDisciplina, formTarefa) ainda precisa ser gerenciada,
    // seja neste script ou garantida por `disciplinas.js` / `tarefas.js` se incluídos.
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