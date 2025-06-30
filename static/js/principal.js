document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
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
    
    const btnNextCarousel = document.getElementById('nextCoursesBtn');
    const btnPrevCarousel = document.getElementById('prevCoursesBtn');
    const carouselWrapper = document.querySelector('.courses-carousel-wrapper');
    const coursesContainer = document.getElementById('coursesContainer');


    // --- DADOS GLOBAIS (COMPLETOS) ---
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

    // --- ORGANIZAÇÃO DOS DADOS GLOBAIS ---
    window.listaDisciplinas = disciplinasDashboard;
    window.listaTarefas = [...tarefasExemploDashboard, ...provasDashboardDados.map(p => ({ id: p.id, titulo: p.tituloProva, disciplinaId: p.disciplinaId, tipo: p.tipo, dataEntrega: p.dataOriginal, status: p.status, descricao: p.descricao }))];
    window.disciplinasFixasParaSelects = disciplinasDashboard.map(d => ({id: d.id, nome: d.nome}));
    window.tiposParaSelects = [ { id: 'Tarefa', nome: 'Tarefa' }, { id: 'Prova', nome: 'Prova' } ];
    window.statusParaSelects = [ { id: 'A Fazer', nome: 'A fazer' }, { id: 'Em Andamento', nome: 'Em Andamento' }, { id: 'Concluída', nome: 'Concluída' } ];
    
    const apenasProvasParaSelect = provasDashboardDados.map(p => ({ id: p.id, titulo: p.tituloProva, disciplinaId: p.disciplinaId }));
    window.provasPorDisciplinaParaSelects = Object.fromEntries(
        disciplinasDashboard.map(d => [
            d.id, 
            apenasProvasParaSelect.filter(p => p.disciplinaId === d.id)
        ])
    );

    // --- FUNÇÕES AUXILIARES GLOBAIS ---
    const formatarDataParaWidget = (dataStr) => { if (!dataStr) return 'Sem data'; const [y,m,d]=dataStr.split('-'); const dt=new Date(Date.UTC(Number(y),Number(m)-1,Number(d))); const meses=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]; return `${dt.getUTCDate()} ${meses[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`; };
    const getStatusBadgeClass = (s) => { switch(s){ case'Concluída':return'bg-success-subtle text-success'; case'Agendada':case'Em Andamento':return'bg-info-subtle text-info'; case'A Fazer':return'bg-warning-subtle text-warning'; case'Atrasada':return'bg-danger-subtle text-danger'; default:return'bg-secondary-subtle text-secondary'; } };
    const getStatusBadgeClassDisciplina = (s) => { switch(s){ case 'Ativa': return'bg-success-subtle text-success'; case 'Em Andamento': return'bg-info-subtle text-info'; case 'Concluída': return'bg-secondary-subtle text-secondary'; case 'Agendada': return'bg-primary-subtle text-primary'; default: return'bg-light-subtle text-dark'; } };
    const getStatusBorderClass = (s) => { switch(s){ case'Concluída':return'border-success-subtle'; case'Agendada':case'Em Andamento':return'border-info-subtle'; case'A Fazer':return'border-warning-subtle'; case'Atrasada':return'border-danger-subtle'; default:return'border-secondary-subtle'; } };
    const getTipoBadgeClass = (t) => { if(t==="Prova")return'bg-danger-subtle text-danger'; return'bg-primary-subtle text-primary'; };

    // --- FUNÇÃO PARA POPULAR MENUS (SELECTS) ---
    function popularSelect(selectEl, dataArr, selectedId = null, defaultOptionText = "Selecione...") {
        if (!selectEl) return;
        selectEl.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = defaultOptionText;
        selectEl.appendChild(defaultOption);
        dataArr.forEach(item => {
            const o = document.createElement('option');
            o.value = item.id;
            o.textContent = item.nome || item.titulo;
            if (selectedId && item.id === selectedId) {
                o.selected = true;
            }
            selectEl.appendChild(o);
        });
        if (!selectEl.value) {
            defaultOption.selected = true;
        }
    }

    // --- FUNÇÃO DO EDITOR DE TEXTO TINYMCE ---
    function inicializarTinyMCE(selectorId, initialContent = '') {
        if (typeof tinymce === 'undefined') {
            console.error("TinyMCE script não carregado.");
            const textarea = document.getElementById(selectorId);
            if (textarea) {
                textarea.value = initialContent;
                textarea.style.display = 'block';
            }
            return;
        }
        const existingEditor = tinymce.get(selectorId);
        if (existingEditor) { existingEditor.destroy(); }
        tinymce.init({
            selector: `#${selectorId}`,
            plugins: 'lists link image table code help wordcount autoresize',
            toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image table | code',
            menubar: 'edit view insert format tools table help',
            height: 400,
            min_height: 400,
            branding: false,
            statusbar: false,
            setup: (editor) => {
                editor.on('init', () => editor.setContent(initialContent || ''));
            },
        }).catch(err => console.error('Erro ao inicializar TinyMCE:', err));
    }

    // =========================================================================
    // LÓGICA DE RENDERIZAÇÃO E MODAIS
    // =========================================================================

    // --- LÓGICA DO CARROSSEL ---
    if (btnNextCarousel && btnPrevCarousel && carouselWrapper && coursesContainer) {
        let carouselScrollAmount = 0;
        let currentScrollPosition = 0;
        function calculateDimensionsAndScrollAmount() {
            const cards = Array.from(coursesContainer.children);
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
        
        window.initializeCarousel = function() {
             calculateDimensionsAndScrollAmount(); 
             currentScrollPosition = 0; 
             updateCarouselState(); 
        }
        
        let resizeTimeout;
        window.addEventListener('resize', () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(window.initializeCarousel, 250); });
    }

    // --- RENDERIZAÇÃO DOS WIDGETS ---
    const listaTarefasDashboardEl = document.getElementById('listaTarefasDashboard');
    if (listaTarefasDashboardEl) {
        listaTarefasDashboardEl.innerHTML = '';
        tarefasExemploDashboard.forEach(tarefa => {
            const disc = disciplinasDashboard.find(d => d.id === tarefa.disciplinaId);
            const div = document.createElement('div');
            div.className = `task-item border-start ${getStatusBorderClass(tarefa.status)}`;
            div.innerHTML = `<div class="d-flex justify-content-between"><strong class="text-sm">${disc ? disc.nome : 'Geral'}</strong><span class="badge ${getStatusBadgeClass(tarefa.status)}">${tarefa.status}</span></div><small>${tarefa.titulo}</small><small>Entrega: ${formatarDataParaWidget(tarefa.dataEntrega)}</small>`;
            div.style.cursor = 'pointer';
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
            tr.innerHTML = `<td>${prova.tituloProva}</td><td>${disc ? disc.nome : 'N/A'}</td><td>${formatarDataParaWidget(prova.dataOriginal)}</td><td><span class="badge ${getStatusBadgeClass(prova.status)}">${prova.status}</span></td>`;
            tr.addEventListener('click', () => {
                const dadosNormalizados = { titulo: prova.tituloProva, disciplinaId: prova.disciplinaId, tipo: prova.tipo, dataEntrega: prova.dataOriginal, status: prova.status, descricao: prova.descricao };
                abrirModalDetalhesAtividade(dadosNormalizados);
            });
            tabelaProvasDashboard.appendChild(tr);
        });
    }
    
    // --- LÓGICA DE CLIQUE E RENDERIZAÇÃO DOS CARDS DE DISCIPLINA ---
    if (coursesContainer) {
        coursesContainer.innerHTML = ''; 
        disciplinasDashboard.forEach((disciplina, index) => {
            const card = document.createElement('div');
            const colorClassNumber = (index % 5) + 1;
            card.className = `course-card course-${colorClassNumber}`; 
            card.dataset.disciplinaId = disciplina.id;
            card.innerHTML = `
                <strong>${disciplina.nome}</strong>
                <span>${disciplina.professor}</span>
            `;
            card.addEventListener('click', () => abrirModalDetalhesDisciplina(disciplina.id));
            coursesContainer.appendChild(card);
        });
        
        if (typeof window.initializeCarousel === 'function') {
            window.initializeCarousel();
        }
    }

    // --- FUNÇÕES PARA EXIBIR MODAIS DE DETALHES ---
    function abrirModalDetalhesAtividade(dadosItem) {
        if (!modalDetalhesAtividade) return;
        const disc = disciplinasDashboard.find(d => d.id === dadosItem.disciplinaId);
        detalheAtividadeNome.textContent = dadosItem.titulo || "Detalhes";
        detalheAtividadeDisciplina.textContent = disc ? disc.nome : 'N/A';
        detalheAtividadeTipo.innerHTML = `<span class="badge ${getTipoBadgeClass(dadosItem.tipo)}">${dadosItem.tipo}</span>`;
        detalheAtividadeData.textContent = formatarDataParaWidget(dadosItem.dataEntrega);
        detalheAtividadeStatus.innerHTML = `<span class="badge ${getStatusBadgeClass(dadosItem.status)}">${dadosItem.status}</span>`;
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
        detalheDisciplinaStatus.innerHTML = `<span class="badge ${getStatusBadgeClassDisciplina(dados.status)}">${dados.status}</span>`;
        const bsModal = new bootstrap.Modal(modalDetalhesDisciplina);
        bsModal.show();
    }
    
    // --- LÓGICA DO MODAL "ADICIONAR DISCIPLINA" ---
    const modalDisciplinaAdicaoPrincipalEl = document.getElementById('modalDisciplinaAdicaoPrincipal');
    if (modalDisciplinaAdicaoPrincipalEl) {
        const form = modalDisciplinaAdicaoPrincipalEl.querySelector('form');
        modalDisciplinaAdicaoPrincipalEl.addEventListener('show.bs.modal', () => {
            if (form) form.reset();
        }); 
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                // alert("Salvar Disciplina (lógica a ser implementada)");
                bootstrap.Modal.getInstance(modalDisciplinaAdicaoPrincipalEl).hide();
            });
        }
    }

    // --- LÓGICA DO MODAL "NOVA ANOTAÇÃO" ---
    const modalAnotacaoEl = document.getElementById('modalAnotacaoPrincipal');
    if (modalAnotacaoEl) {
        const anotacaoDisciplinaSelect = document.getElementById('principalAnotacaoDisciplinaSelect');
        const anotacaoAtividadeSelect = document.getElementById('principalAnotacaoAtividadeSelect');
        const formAnotacao = document.getElementById('formAnotacaoPrincipal');

        function atualizarOpcoesAtividade(disciplinaId) {
            if (!anotacaoAtividadeSelect) return;

            // ========================================================
            // == CORREÇÃO FINAL APLICADA AQUI ========================
            // ========================================================
            // Se uma disciplina for selecionada, filtra as provas.
            // Se NENHUMA for selecionada, mostra TODAS as provas.
            const atividadesFiltradas = disciplinaId 
                ? (window.provasPorDisciplinaParaSelects[disciplinaId] || [])
                : apenasProvasParaSelect; // ANTES: []

            // O campo agora começa habilitado
            anotacaoAtividadeSelect.disabled = false;
            
            popularSelect(anotacaoAtividadeSelect, atividadesFiltradas, null, "Selecione...");
        }

        modalAnotacaoEl.addEventListener('show.bs.modal', function () {
            if (formAnotacao) formAnotacao.reset();
            popularSelect(anotacaoDisciplinaSelect, window.disciplinasFixasParaSelects, null, "Selecione...");
            atualizarOpcoesAtividade(null); // Chama a função corrigida
            inicializarTinyMCE('principalAnotacaoConteudoInput', '');
        });

        if (anotacaoDisciplinaSelect) {
            anotacaoDisciplinaSelect.addEventListener('change', function() {
                atualizarOpcoesAtividade(this.value);
            });
        }
        
        modalAnotacaoEl.addEventListener('hidden.bs.modal', function() {
            const editor = tinymce.get('principalAnotacaoConteudoInput');
            if (editor) {
                editor.destroy();
            }
        });
    }

    // --- LÓGICA DO MODAL "ADICIONAR TAREFA/PROVA" ---
    const modalTarefaProvaEl = document.getElementById('modalTarefaPrincipalQuickAdd');
    if (modalTarefaProvaEl) {
        const formTarefaProva = document.getElementById('formTarefaPrincipalQuickAdd');
        const tarefaDisciplinaSelect = document.getElementById('principalTarefaDisciplinaQuickAdd');
        
        modalTarefaProvaEl.addEventListener('show.bs.modal', () => {
            if (formTarefaProva) formTarefaProva.reset();
            popularSelect(tarefaDisciplinaSelect, window.disciplinasFixasParaSelects, null, "Selecione...");
        });

        if (formTarefaProva) {
            formTarefaProva.addEventListener('submit', (e) => {
                e.preventDefault();
                alert("Salvar Tarefa/Prova (lógica a ser implementada)");
                const modalInstance = bootstrap.Modal.getInstance(modalTarefaProvaEl);
                if(modalInstance) modalInstance.hide();
            });
        }
    }
});
