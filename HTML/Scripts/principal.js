// principal.js
document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS (mantidos) ---
    const modalDetalhesAtividade = document.getElementById('modalDetalhesAtividade');
    const detalheAtividadeNome = document.getElementById('detalhe-atividade-nome');
    const detalheAtividadeDisciplina = document.getElementById('detalhe-atividade-disciplina');
    const detalheAtividadeTipo = document.getElementById('detalhe-atividade-tipo');
    const detalheAtividadeData = document.getElementById('detalhe-atividade-data');
    const detalheAtividadeStatus = document.getElementById('detalhe-atividade-status');
    const detalheAtividadeDescricao = document.getElementById('detalhe-atividade-descricao');

    const modalDetalhesDisciplina = document.getElementById("modalDetalhesDisciplina");
    const detalheDisciplinaNome = document.getElementById("detalhe-disciplina-nome");
    const detalheDisciplinaDescricao = document.getElementById("detalhe-disciplina-descricao");
    const detalheDisciplinaProfessor = document.getElementById("detalhe-disciplina-professor");
    const detalheDisciplinaPeriodo = document.getElementById("detalhe-disciplina-periodo");
    const detalheDisciplinaStatus = document.getElementById("detalhe-disciplina-status");

    // --- LÓGICA DO CARROSSEL DE DISCIPLINAS (mantida) ---
    const btnNextCarousel = document.getElementById('nextCoursesBtn');
    const btnPrevCarousel = document.getElementById('prevCoursesBtn');
    const carouselWrapper = document.querySelector('.courses-carousel-wrapper');
    const coursesContainer = document.getElementById('coursesContainer');

    if (btnNextCarousel && btnPrevCarousel && carouselWrapper && coursesContainer) {
        const cards = Array.from(coursesContainer.children);
        if (cards.length === 0) {
            if (btnPrevCarousel) btnPrevCarousel.disabled = true;
            if (btnNextCarousel) btnNextCarousel.disabled = true;
        }
        let carouselScrollAmount = 0;
        let currentScrollPosition = 0;
        function calculateDimensionsAndScrollAmount() {
            if (cards.length > 0) {
                const firstCard = cards[0];
                if (firstCard && window.getComputedStyle && coursesContainer) {
                    const cardStyle = window.getComputedStyle(firstCard);
                    const cardMarginRight = parseFloat(cardStyle.marginRight) || 0;
                    const carouselGap = parseFloat(window.getComputedStyle(coursesContainer).gap) || 16;
                    carouselScrollAmount = firstCard.offsetWidth + (carouselGap > 0 ? carouselGap : cardMarginRight);
                } else { carouselScrollAmount = 220 + 16; }
            } else { carouselScrollAmount = 0; }
        }
        function updateCarouselState() {
            if (!coursesContainer || !carouselWrapper) return;
            const maxScrollPossible = Math.max(0, coursesContainer.scrollWidth - carouselWrapper.offsetWidth);
            currentScrollPosition = Math.max(0, Math.min(currentScrollPosition, maxScrollPossible));
            coursesContainer.style.transform = `translateX(-${currentScrollPosition}px)`;
            if (btnPrevCarousel) btnPrevCarousel.disabled = currentScrollPosition <= 0;
            if (btnNextCarousel) btnNextCarousel.disabled = currentScrollPosition >= maxScrollPossible - 1;
        }
        if (btnNextCarousel) btnNextCarousel.addEventListener('click', () => { calculateDimensionsAndScrollAmount(); const max = Math.max(0,coursesContainer.scrollWidth - carouselWrapper.offsetWidth); if(currentScrollPosition < max){ currentScrollPosition = Math.min(currentScrollPosition + carouselScrollAmount, max); updateCarouselState();}});
        if (btnPrevCarousel) btnPrevCarousel.addEventListener('click', () => { calculateDimensionsAndScrollAmount(); if(currentScrollPosition > 0){ currentScrollPosition = Math.max(0, currentScrollPosition - carouselScrollAmount); updateCarouselState();}});
        function initializeCarousel() { calculateDimensionsAndScrollAmount(); currentScrollPosition = 0; updateCarouselState(); }
        initializeCarousel();
        let resizeTimeout;
        window.addEventListener('resize', () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(initializeCarousel, 250); });
    }

    // --- DADOS MOCADOS (AGORA GLOBALIZADOS PARA principal.html) ---
    // Estes dados *devem ser consistentes* com os de tarefas.js se representarem a mesma fonte de dados.
    const disciplinasDashboard = [
        { id: "CS101", nome: "Algoritmos e Estrutura de Dados", descricao: "Estudo de algoritmos fundamentais, estruturas de dados como listas, filas, pilhas, árvores e grafos, e análise de complexidade.", professor: "Prof. Jango", periodo: "2025.1", status: "Ativa" },
        { id: "CS102", nome: "Redes de Computadores", descricao: "Princípios de redes, modelo OSI, TCP/IP, protocolos de aplicação, camada de transporte e segurança de redes.", professor: "Prof. João Paulo", periodo: "2025.1", status: "Ativa" },
        { id: "CS103", nome: "Banco de Dados", descricao: "Modelagem de dados, SQL, normalização, transações e sistemas de gerenciamento de bancos de dados relacionais e NoSQL.", professor: "Prof. Jason", periodo: "2025.1", status: "Ativa" },
        { id: "CS104", nome: "Inteligência Artificial", descricao: "Introdução à IA, busca, representação de conhecimento, aprendizado de máquina e redes neurais.", professor: "Prof. Pryzado", periodo: "2025.2", status: "Em Andamento" },
        { id: "CS105", nome: "Compiladores", descricao: "Teoria e prática da construção de compiladores, incluindo análise léxica, sintática e semântica, e geração de código.", professor: "Prof. Ada L.", periodo: "2025.2", status: "Em Andamento" },
    ];

    const tarefasExemploDashboard = [
        { id: "T001dash", titulo: "Implementação de Fila e Pilha", disciplinaId: "CS101", tipo: "Tarefa", dataEntrega: "2025-06-18", status: "Em Andamento", descricao: "Implementar as estruturas de dados Fila e Pilha em Java, incluindo testes de unidade." },
        { id: "T002dash", titulo: "Análise de Pacotes com Wireshark", disciplinaId: "CS102", tipo: "Tarefa", dataEntrega: "2025-06-22", status: "A Fazer", descricao: "Capturar e analisar o handshake TCP de uma conexão HTTPS." },
        { id: "T003dash", titulo: "Projeto de Modelagem MER", disciplinaId: "CS103", tipo: "Tarefa", dataEntrega: "2025-06-25", status: "A Fazer", descricao: "Criar o Modelo Entidade-Relacionamento para um sistema acadêmico." },
        { id: "T004dash", titulo: "Trabalho sobre Classificação com CNN", disciplinaId: "CS104", tipo: "Tarefa", dataEntrega: "2025-07-05", status: "Em Andamento", descricao: "Desenvolver e treinar uma Rede Neural Convolucional para classificar imagens." }
    ];

    const provasDashboardDados = [
        { id: "P001", tituloProva: "Complexidade e Estruturas Lineares", dataOriginal: "2025-05-28", status: "Concluída", disciplinaId: "CS101", tipo: "Prova", descricao: "Prova sobre análise de complexidade (Big O), Filas, Pilhas e Listas." },
        { id: "P002", tituloProva: "SQL e Normalização", dataOriginal: "2025-06-15", status: "Em Andamento", disciplinaId: "CS103", tipo: "Prova", descricao: "Avaliação sobre consultas SQL avançadas e formas normais (1FN, 2FN, 3FN)." },
        { id: "P003", tituloProva: "Camadas de Transporte e Aplicação", dataOriginal: "2025-06-28", status: "Em Andamento", disciplinaId: "CS102", tipo: "Prova", descricao: "Prova teórica sobre os protocolos TCP, UDP, HTTP, DNS e FTP." },
        { id: "P004", tituloProva: "Análise Léxica e Sintática", dataOriginal: "2025-07-10", status: "Em Andamento", disciplinaId: "CS105", tipo: "Prova", descricao: "Prova prática sobre criação de analisadores com Flex e Bison." }
    ];

    // --- GLOBALIZAÇÃO DOS DADOS PARA ANOTAÇÕES E OUTROS SCRIPTS ---
    window.listaDisciplinas = disciplinasDashboard; 
    window.listaTarefas = tarefasExemploDashboard.concat(provasDashboardDados.map(p => ({
        id: p.id,
        titulo: p.tituloProva,
        disciplinaId: p.disciplinaId,
        tipo: p.tipo,
        dataEntrega: p.dataOriginal,
        status: p.status,
        descricao: p.descricao
    }))); 

    window.disciplinasFixasParaSelects = [
        ...disciplinasDashboard.map(d => ({id: d.id, nome: d.nome}))
    ];
    
    window.atividadesPorDisciplinaParaSelects = { 
        "": [{id: "", nome: "Nenhuma"}], 
        "Nenhuma": [{id: "", nome: "Nenhuma"}], 
        ...Object.fromEntries(
            disciplinasDashboard.map(d => [
                d.id, 
                [{id: "", nome: "Nenhuma"}]
                    .concat(window.listaTarefas.filter(t => t.disciplinaId === d.id).map(t => ({id: t.id, nome: t.titulo})))
            ])
        ),
        "TCC 1": [{id: "", nome: "Nenhuma"}, {id: "TCC1_Proj", nome: "Revisão Bibliográfica"}, {id: "TCC1_Def", nome: "Defesa da Monografia"}],
        "Outra": [{id: "", nome: "Nenhuma"}, {id: "OUTRA_Gen", nome: "Atividade Geral"}]
    };
    window.atividadesPadraoParaSelects = [{id: "", nome: "Nenhuma"}]; 

    // --- FUNÇÕES AUXILIARES (GLOBALIZADAS) ---
    // Funções de formatação e obtenção de classes de badge
    window.formatarDataParaWidget = (dataStr) => { 
        if (!dataStr) return 'Sem data'; 
        const [y,m,d]=dataStr.split('-'); 
        const dt=new Date(Date.UTC(Number(y),Number(m)-1,Number(d))); 
        const meses=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]; 
        return `${dt.getUTCDate()} ${meses[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`; 
    };
    
    window.getStatusBadgeClass = (s) => { 
        switch(s){
            case'Concluída':return'bg-success-subtle text-success';
            case'Agendada':case'Em Andamento':return'bg-info-subtle text-info';
            case'A Fazer':return'bg-warning-subtle text-warning';
            case'Atrasada':return'bg-danger-subtle text-danger';
            default:return'bg-secondary-subtle text-secondary';
        }
    };
    
    window.getStatusBadgeClassDisciplina = (s) => { 
        switch(s){
            case 'Ativa': return'bg-success-subtle text-success'; 
            case 'Em Andamento': return'bg-info-subtle text-info'; 
            case 'Concluída': return'bg-secondary-subtle text-secondary'; 
            case 'Agendada': return'bg-primary-subtle text-primary'; 
            default: return'bg-light-subtle text-dark';
        }
    };
    
    window.getStatusBorderClass = (s) => { 
        switch(s){
            case'Concluída':return'border-success-subtle';
            case'Agendada':case'Em Andamento':return'border-info-subtle';
            case'A Fazer':return'border-warning-subtle';
            case'Atrasada':return'border-danger-subtle';
            default:return'border-secondary-subtle';
        }
    };
    
    window.getTipoBadgeClass = (t) => { 
        if(t==="Prova")return'bg-danger-subtle text-danger';
        return'bg-primary-subtle text-primary';
    };

    // A função popularSelect, crucial para preencher os selects dinamicamente.
    // Garanta que ela seja definida apenas uma vez, idealmente em geral.js ou aqui se não estiver lá.
    // Como geral.js é carregado primeiro, se popularSelect estiver lá, esta definição pode ser removida.
    // Para segurança, mantemos a verificação.
    if (typeof window.popularSelect === 'undefined') { 
        window.popularSelect = function (element, options, selectedValue = null) {
            if (!element) {
                console.warn("Elemento select não encontrado para popular:", element);
                return;
            }
            element.innerHTML = '';
            
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Selecione...";
            defaultOption.disabled = true;
            defaultOption.selected = (selectedValue === null || selectedValue === ''); 
            element.appendChild(defaultOption);

            options.forEach(option => {
                const optElement = document.createElement('option');
                const value = (typeof option === 'object' && option !== null) ? option.id : option;
                const textContent = (typeof option === 'object' && option !== null) ? option.nome : option;

                optElement.value = value;
                optElement.textContent = textContent;

                if (selectedValue !== null && (String(value) === String(selectedValue) || String(textContent) === String(selectedValue))) {
                    optElement.selected = true;
                    defaultOption.selected = false; 
                }
                element.appendChild(optElement);
            });
        };
    }


    // --- RENDERIZAÇÃO DOS WIDGETS (mantida) ---
    const listaTarefasDashboardEl = document.getElementById('listaTarefasDashboard');
    if (listaTarefasDashboardEl) {
        listaTarefasDashboardEl.innerHTML = '';
        // Filtra para mostrar apenas tarefas (não provas) e limita a 4 para o widget
        window.listaTarefas.filter(t => t.tipo === "Tarefa").slice(0, 4).forEach(tarefa => {
            const disc = disciplinasDashboard.find(d => d.id === tarefa.disciplinaId);
            const div = document.createElement('div');
            div.className = `task-item border-start ${window.getStatusBorderClass(tarefa.status)}`;
            div.innerHTML = `<div class="d-flex justify-content-between"><strong class="text-sm">${disc ? disc.nome : 'Geral'}</strong><span class="badge ${window.getStatusBadgeClass(tarefa.status)}">${tarefa.status}</span></div><small>${tarefa.titulo}</small><small>Entrega: ${window.formatarDataParaWidget(tarefa.dataEntrega)}</small>`;
            div.style.cursor = 'pointer';
            // Certifique-se de que a função para abrir o modal de detalhes esteja disponível
            div.addEventListener('click', () => abrirModalDetalhesAtividade(tarefa));
            listaTarefasDashboardEl.appendChild(div);
        });
    }

    const tabelaProvasDashboard = document.getElementById('tabelaProvasDashboard');
    if (tabelaProvasDashboard) {
        tabelaProvasDashboard.innerHTML = '';
        provasDashboardDados.forEach(prova => {
            const disc = disciplinasDashboard.find(d => d.id === prova.disciplinaId);
            const tr = document.createElement('tr');
            tr.className = 'clicavel-prova';
            tr.style.cursor = 'pointer';
            tr.innerHTML = `<td>${prova.tituloProva}</td><td>${disc ? disc.nome : 'N/A'}</td><td>${window.formatarDataParaWidget(prova.dataOriginal)}</td><td><span class="badge ${window.getStatusBadgeClass(prova.status)}">${prova.status}</span></td>`;
            tr.addEventListener('click', () => {
                const dadosNormalizados = { titulo: prova.tituloProva, disciplinaId: prova.disciplinaId, tipo: prova.tipo, dataEntrega: prova.dataOriginal, status: prova.status, descricao: prova.descricao };
                abrirModalDetalhesAtividade(dadosNormalizados);
            });
            tabelaProvasDashboard.appendChild(tr);
        });
    }
    
    // --- LÓGICA DE CLIQUE NOS CARDS DE DISCIPLINA (mantida) ---
    if (coursesContainer) {
        coursesContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.course-card');
            if (card && card.dataset.disciplinaId) {
                abrirModalDetalhesDisciplina(card.dataset.disciplinaId);
            }
        });
    }

    // --- FUNÇÕES PARA EXIBIR MODAIS DE DETALHES (mantidas) ---
    function abrirModalDetalhesAtividade(dadosItem) {
        if (!modalDetalhesAtividade) return;
        const disc = disciplinasDashboard.find(d => d.id === dadosItem.disciplinaId);
        detalheAtividadeNome.textContent = dadosItem.titulo || "Detalhes";
        detalheAtividadeDisciplina.textContent = disc ? disc.nome : 'N/A';
        detalheAtividadeTipo.innerHTML = `<span class="badge ${window.getTipoBadgeClass(dadosItem.tipo)}">${dadosItem.tipo}</span>`;
        detalheAtividadeData.textContent = window.formatarDataParaWidget(dadosItem.dataEntrega);
        detalheAtividadeStatus.innerHTML = `<span class="badge ${window.getStatusBadgeClass(dadosItem.status)}">${dadosItem.status}</span>`;
        detalheAtividadeDescricao.textContent = dadosItem.descricao || 'Nenhuma descrição fornecida.';
        const bsModal = new bootstrap.Modal(modalDetalhesAtividade);
        bsModal.show();
    }

    function abrirModalDetalhesDisciplina(disciplinaId) {
        if (!modalDetalhesDisciplina) return;
        const dados = disciplinasDashboard.find(d => d.id === disciplinaId);
        if (!dados) return;
        detalheDisciplinaNome.textContent = dados.nome;
        detalheDisciplinaDescricao.textContent = dados.descricao || 'Nenhuma descrição fornecida.';
        detalheDisciplinaProfessor.textContent = dados.professor || '-';
        detalheDisciplinaPeriodo.textContent = dados.periodo || '-';
        detalheDisciplinaStatus.innerHTML = `<span class="badge ${window.getStatusBadgeClassDisciplina(dados.status)}">${dados.status}</span>`;
        const bsModal = new bootstrap.Modal(modalDetalhesDisciplina);
        bsModal.show();
    }
    
    // --- MODAIS DE ADIÇÃO RÁPIDA (SIDEBAR) (mantidos) ---
    const modalDisciplinaAdicaoPrincipalEl = document.getElementById('modalDisciplinaAdicaoPrincipal');
    if (modalDisciplinaAdicaoPrincipalEl) {
        const form = modalDisciplinaAdicaoPrincipalEl.querySelector('#formDisciplinaPrincipal');
        modalDisciplinaAdicaoPrincipalEl.addEventListener('show.bs.modal', () => {
            if (form) form.reset();
            form.classList.remove('was-validated');
            form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        });
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!form.checkValidity()) {
                    e.stopPropagation();
                    form.classList.add('was-validated');
                    return;
                }
                alert("Salvar Disciplina (lógica a ser implementada)");
                bootstrap.Modal.getInstance(modalDisciplinaAdicaoPrincipalEl).hide();
            });
        }
    }

    // REMOVIDO: A lógica antiga de modalTarefaAdicaoPrincipal foi removida,
    // pois agora usaremos o modal compartilhado via tarefaRapidaModal.js
});
