document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado. principal.js está executando.');

    // --- LÓGICA DO CARROSSEL DE DISCIPLINAS ---
    const btnNextCarousel = document.getElementById('nextCoursesBtn');
    const btnPrevCarousel = document.getElementById('prevCoursesBtn');
    const carouselWrapper = document.querySelector('.courses-carousel-wrapper');
    const carouselInner = document.getElementById('coursesContainer');

    if (btnNextCarousel && btnPrevCarousel && carouselWrapper && carouselInner) {
        const cards = Array.from(carouselInner.children);
        if (cards.length === 0) {
            if (btnPrevCarousel) btnPrevCarousel.disabled = true;
            if (btnNextCarousel) btnNextCarousel.disabled = true;
        }
        let carouselScrollAmount = 0;
        let currentScrollPosition = 0;

        function calculateDimensionsAndScrollAmount() {
            if (cards.length > 0) {
                const firstCard = cards[0];
                if (firstCard && window.getComputedStyle && carouselInner) {
                    const cardStyle = window.getComputedStyle(firstCard);
                    const cardMarginRight = parseFloat(cardStyle.marginRight) || 0;
                    const carouselGap = parseFloat(window.getComputedStyle(carouselInner).gap) || 16;
                    carouselScrollAmount = firstCard.offsetWidth + (carouselGap > 0 ? carouselGap : cardMarginRight);
                } else { carouselScrollAmount = 200; }
            } else { carouselScrollAmount = 0; }
        }

        function updateCarouselState() {
            if (!carouselInner || !carouselWrapper) return;
            const maxScrollPossible = Math.max(0, carouselInner.scrollWidth - carouselWrapper.offsetWidth);
            currentScrollPosition = Math.max(0, Math.min(currentScrollPosition, maxScrollPossible));
            carouselInner.style.transform = `translateX(-${currentScrollPosition}px)`;
            if (btnPrevCarousel) btnPrevCarousel.disabled = currentScrollPosition <= 0;
            if (btnNextCarousel) btnNextCarousel.disabled = currentScrollPosition >= maxScrollPossible - 1;
        }

        if (btnNextCarousel) {
            btnNextCarousel.addEventListener('click', () => {
                calculateDimensionsAndScrollAmount();
                const maxScrollPossible = Math.max(0, carouselInner.scrollWidth - carouselWrapper.offsetWidth);
                if (currentScrollPosition < maxScrollPossible) {
                    currentScrollPosition += carouselScrollAmount;
                    currentScrollPosition = Math.min(currentScrollPosition, maxScrollPossible);
                    updateCarouselState();
                }
            });
        }
        if (btnPrevCarousel) {
            btnPrevCarousel.addEventListener('click', () => {
                calculateDimensionsAndScrollAmount();
                if (currentScrollPosition > 0) {
                    currentScrollPosition -= carouselScrollAmount;
                    currentScrollPosition = Math.max(0, currentScrollPosition);
                    updateCarouselState();
                }
            });
        }
        function initializeCarousel() { calculateDimensionsAndScrollAmount(); currentScrollPosition = 0; updateCarouselState(); }
        initializeCarousel();
        let resizeTimeout;
        window.addEventListener('resize', () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(initializeCarousel, 250); });
    }

    // --- DADOS MOCKADOS PARA O DASHBOARD ---
    const disciplinasDashboard = [ // Usado para buscar nome da disciplina para tarefas e provas
        { id: "ART101", nome: "Fundamentos de Design Gráfico – ART101" },
        { id: "ITD201", nome: "Web Design Avançado – ITD201" },
        { id: "UXD301", nome: "Princípios de UX/UI Design – UXD301" },
        { id: "HD101", nome: "História do Design – HD101" }, // Adicionada para a prova de Redação
        { id: "AD202", nome: "Artes Digitais – AD202" }      // Adicionada para a prova de Ilustração
        // Adicione outras disciplinas conforme necessário
    ];

    const tarefasExemploDashboard = [
        { id: "T001dash", titulo: "Revisar slides aula 5", disciplinaId: "ART101", tipo: "Tarefa", dataEntrega: "2025-05-30", status: "A Fazer", horarioEntrega: "18:00" },
        { id: "T002dash", titulo: "Protótipo de Baixa Fidelidade", disciplinaId: "UXD301", tipo: "Tarefa", dataEntrega: "2025-06-05", status: "Em Andamento", horarioEntrega: "23:59" },
        { id: "T003dash", titulo: "Exercícios Cap 2 Web", disciplinaId: "ITD201", tipo: "Tarefa", dataEntrega: "2025-05-28", status: "A Fazer", horarioEntrega: "" },
        { id: "T004dash", titulo: "Pesquisar referências", disciplinaId: "ART101", tipo: "Tarefa", dataEntrega: "2025-06-10", status: "Agendada", horarioEntrega: "" }
    ];
    
    const provasDashboardDados = [
        { id: "P001", tituloProva: "Prova 1 - Fund. de Design Gráfico", dataOriginal: "2025-01-25", dataFormatada: "25 Jan 2025", horario: "19h30", local: "Design Studio A", status: "Concluída", disciplinaId: "ART101", tipo: "Prova", descricao: "Prova final sobre os conceitos de Gestalt, Teoria das Cores e Tipografia.", anotacoesVinculadas: [] },
        { id: "P002", tituloProva: "Avaliação Prática - Ilustração Digital", dataOriginal: "2025-02-05", dataFormatada: "05 Fev 2025", horario: "20h00", local: "Laboratório 2", status: "Concluída", disciplinaId: "AD202", tipo: "Prova", descricao: "Avaliação prática de técnicas de ilustração vetorial e pintura digital.", anotacoesVinculadas: [] },
        { id: "P003", tituloProva: "Prova Teórica - Princípios de UX/UI", dataOriginal: "2025-03-10", dataFormatada: "10 Mar 2025", horario: "19h25", local: "Design Lab 1", status: "Agendada", disciplinaId: "UXD301", tipo: "Prova", descricao: "Prova teórica cobrindo heurísticas de Nielsen, wireframing e prototipação.", anotacoesVinculadas: [{id: "A005", titulo: "Resumo Heurísticas"}] },
        { id: "P004", tituloProva: "Redação - História do Design", dataOriginal: "2025-04-12", dataFormatada: "12 Abr 2025", horario: "09h00", local: "Sala de Aula B", status: "Agendada", disciplinaId: "HD101", tipo: "Prova", descricao: "Prova discursiva sobre os principais movimentos do design do século XX.", anotacoesVinculadas: [] }
    ];

    // --- FUNÇÕES AUXILIARES DE FORMATAÇÃO E ESTILO (COPIADAS/ADAPTADAS DE TAREFAS.JS) ---
    function formatarDataParaWidget(dataStr) {
        if (!dataStr) return 'Sem data';
        const [year, month, day] = dataStr.split('-');
        const dataObj = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        return `${dataObj.getUTCDate()} ${meses[dataObj.getUTCMonth()]} ${dataObj.getUTCFullYear()}`;
    }

    function formatarDataHoraModal(dataStr, horaStr) {
        let formatted = formatarDataParaWidget(dataStr); // Usa a formatação de data do widget
        if (horaStr) {
            const [hour, minute] = horaStr.split(':');
            let h = parseInt(hour);
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            h = h ? h : 12;
            const formattedTime = `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
            formatted = formatted !== 'Sem data' ? `${formatted}, ${formattedTime}` : formattedTime;
        }
        return formatted || '-';
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Concluída': return 'bg-success-subtle text-success';
            case 'Agendada': case 'Em Andamento': return 'bg-info-subtle text-info';
            case 'A Fazer': return 'bg-warning-subtle text-warning';
            case 'Atrasada': return 'bg-danger-subtle text-danger';
            default: return 'bg-secondary-subtle text-secondary';
        }
    }
    function getStatusBorderClass(status) {
        switch (status) {
            case 'Concluída': return 'border-success-subtle';
            case 'Agendada': case 'Em Andamento': return 'border-info-subtle';
            case 'A Fazer': return 'border-warning-subtle';
            case 'Atrasada': return 'border-danger-subtle';
            default: return 'border-secondary-subtle';
        }
    }
    function getTipoBadgeClass(tipo) {
        if (tipo === "Prova") return 'bg-danger-subtle text-danger'; // Prova em vermelho
        return 'bg-primary-subtle text-primary'; // Tarefa em azul
    }

    // --- LÓGICA PARA LISTA DE TAREFAS NO DASHBOARD ---
    const listaTarefasDashboardEl = document.getElementById('listaTarefasDashboard');
    if (listaTarefasDashboardEl) {
        listaTarefasDashboardEl.innerHTML = '';
        const tarefasParaExibir = tarefasExemploDashboard.slice(0, 4);
        tarefasParaExibir.forEach(tarefa => {
            const disciplina = disciplinasDashboard.find(d => d.id === tarefa.disciplinaId);
            const divTarefa = document.createElement('div');
            divTarefa.className = `task-item border-start ${getStatusBorderClass(tarefa.status)}`;
            divTarefa.innerHTML = `
                <div class="d-flex justify-content-between">
                    <strong class="text-sm">${disciplina ? disciplina.nome.split('–')[0].trim() : 'Geral'}</strong>
                    <span class="badge ${getStatusBadgeClass(tarefa.status)} task-status">${tarefa.status}</span>
                </div>
                <small>${tarefa.titulo}</small>
                <small>Entrega: ${formatarDataParaWidget(tarefa.dataEntrega)}</small>
            `;
            divTarefa.style.cursor = 'pointer';
            divTarefa.addEventListener('click', () => {
                 // Ação para quando uma tarefa no widget é clicada
                 // Poderia chamar criarEExibirModalDetalhesProva se adaptado para tarefas
                const dadosTarefaParaModal = { // Adaptar dados da tarefa para o formato esperado pelo modal de prova
                    ...tarefa,
                    tituloProva: tarefa.titulo, // Renomear para o campo esperado pelo modal
                    disciplinaNome: disciplina ? disciplina.nome : 'Geral',
                    dataFormatada: formatarDataParaWidget(tarefa.dataEntrega) // Usa a data já formatada para widget
                };
                criarEExibirModalDetalhesProva(dadosTarefaParaModal, "Detalhes da Tarefa"); // Passa um título diferente
            });
            listaTarefasDashboardEl.appendChild(divTarefa);
        });
    }

    // --- LÓGICA PARA MODAL DE DETALHES DA PROVA (DINÂMICO) ---
    const tabelaProvasDashboard = document.getElementById('tabelaProvasDashboard');

    function criarEExibirModalDetalhesProva(dadosItem, tituloModal = "Detalhes da Prova") {
        const modalId = 'modalDetalhesDinamico'; // ID único para o modal dinâmico
        const modalExistente = document.getElementById(modalId);
        if (modalExistente) {
            modalExistente.remove();
        }

        const dialog = document.createElement('dialog');
        dialog.id = modalId;
        // Adiciona classes do Bootstrap para <dialog> se você tiver um polyfill ou quiser estilizar similarmente
        // dialog.classList.add('modal', 'fade'); // Exemplo, pode não ser necessário para <dialog>

        const disciplinaNomeCompleto = disciplinasDashboard.find(d => d.id === dadosItem.disciplinaId)?.nome || dadosItem.disciplinaNome || 'N/A';

        dialog.innerHTML = `
            <div class="modal-header-custom modal-header-studyflow">
                <div class="modal-title-wrapper">
                    <img src="../imgs/logo.png" class="modal-logo-icon" alt="StudyFlow Logo">
                    <h5 class="modal-title-custom">${tituloModal}</h5>
                </div>
                <button type="button" class="btn-close-custom" aria-label="Fechar"></button>
            </div>
            <div class="modal-body-custom">
                <dl class="row mb-3">
                    <dt class="col-sm-4">Título:</dt>
                    <dd class="col-sm-8">${dadosItem.tituloProva || dadosItem.titulo || '-'}</dd>

                    <dt class="col-sm-4">Disciplina:</dt>
                    <dd class="col-sm-8">${disciplinaNomeCompleto}</dd>

                    <dt class="col-sm-4">Tipo:</dt>
                    <dd class="col-sm-8"><span class="badge ${getTipoBadgeClass(dadosItem.tipo)}">${dadosItem.tipo}</span></dd>

                    <dt class="col-sm-4">Data & Horário:</dt>
                    <dd class="col-sm-8">${formatarDataHoraModal(dadosItem.dataOriginal || dadosItem.dataEntrega, dadosItem.horario)}</dd>
                    
                    ${dadosItem.local ? `<dt class="col-sm-4">Local:</dt><dd class="col-sm-8">${dadosItem.local}</dd>` : ''}

                    <dt class="col-sm-4">Status:</dt>
                    <dd class="col-sm-8"><span class="badge ${getStatusBadgeClass(dadosItem.status)}">${dadosItem.status}</span></dd>

                    ${dadosItem.descricao ? `
                    <dt class="col-sm-12 mt-3">Descrição:</dt>
                    <dd class="col-sm-12"><pre style="white-space: pre-wrap; word-wrap: break-word; font-family: inherit;">${dadosItem.descricao.replace(/\n/g, '<br>')}</pre></dd>
                    ` : ''}
                </dl>
                ${dadosItem.anotacoesVinculadas && dadosItem.anotacoesVinculadas.length > 0 ? `
                    <hr>
                    <h6>Anotações Vinculadas</h6>
                    <ul class="list-group list-group-flush">
                        ${dadosItem.anotacoesVinculadas.map(a => `<li class="list-group-item">${a.titulo}</li>`).join('')}
                    </ul>` : ''
                }
            </div>
            <div class="modal-footer-custom modal-footer-studyflow">
                <button type="button" class="btn btn-modal-ok">OK</button>
            </div>
        `;
        document.body.appendChild(dialog);

        const btnClose = dialog.querySelector('.btn-close-custom');
        const btnOk = dialog.querySelector('.btn-modal-ok');

        const fecharModal = () => {
            if (typeof dialog.close === 'function') {
                dialog.close(); // Fecha o <dialog>
            }
            // O listener 'close' abaixo cuidará da remoção do DOM
        };
        
        dialog.addEventListener('close', () => {
            dialog.remove(); // Remove o modal do DOM quando fechado
            console.log("Modal dinâmico removido.");
        });

        if (btnClose) btnClose.addEventListener('click', fecharModal);
        if (btnOk) btnOk.addEventListener('click', fecharModal);
        
        dialog.addEventListener('click', (event) => { // Fechar ao clicar no backdrop
            if (event.target === dialog) {
                fecharModal();
            }
        });

        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else {
            console.error("Elemento <dialog> não suporta showModal().");
            // Fallback para um modal Bootstrap se o <dialog> não for suportado
            // ou se você preferir usar o sistema de modal do Bootstrap.
            // Para isso, o HTML gerado precisaria ser uma estrutura de modal Bootstrap.
        }
    }

    if (tabelaProvasDashboard) {
        tabelaProvasDashboard.addEventListener('click', function(event) {
            const linhaClicada = event.target.closest('tr.clicavel-prova');
            if (linhaClicada) {
                const provaId = linhaClicada.dataset.provaId;
                const dadosProva = provasDashboardDados.find(p => p.id === provaId);
                if (dadosProva) {
                    criarEExibirModalDetalhesProva(dadosProva, "Detalhes da Prova");
                } else {
                    console.error("Dados da prova não encontrados para o ID:", provaId);
                }
            }
        });
    }
    // --- FIM DA LÓGICA DO MODAL DE DETALHES DA PROVA ---


    // --- EVENT LISTENERS PARA BOTÕES RÁPIDOS (PLACEHOLDERS/REDIRECIONAMENTOS) ---
    const setupQuickAddButton = (buttonId, pageUrl, modalIdToShow = null, openModalFn = null) => {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (openModalFn) {
                    openModalFn(); // Chama a função específica se fornecida
                } else if (modalIdToShow && document.getElementById(modalIdToShow) && window.bootstrap) {
                     // Tenta abrir um modal Bootstrap se o ID for fornecido e a função não
                    const modalEl = document.getElementById(modalIdToShow);
                    const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    // Idealmente, você teria uma função para limpar/preparar o modal aqui
                    bsModal.show();
                } else if (pageUrl) {
                    window.location.href = pageUrl;
                } else {
                    alert(`Botão ${buttonId} clicado - funcionalidade a ser implementada.`);
                }
            });
        }
    };

    setupQuickAddButton('quickAddDisciplinaBtn', './disciplinas.html', 'modalDisciplinaPlaceholder'); // Usa placeholder, idealmente teria uma função global ou um modal real aqui
    setupQuickAddButton('quickAddTarefaBtn', './tarefas.html'); // Redireciona para tarefas
    setupQuickAddButton('quickAddAnotacaoBtn', './anotacao.html', 'modalAnotacaoPlaceholder'); // Usa placeholder

    // Configuração do dropdown de usuário Bootstrap (se ainda não estiver em geral.js)
    var userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn && typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
        new bootstrap.Dropdown(userMenuBtn);
    }

    console.log('principal.js finalizado.');
});
