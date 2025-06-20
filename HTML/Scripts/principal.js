// principal.js (VERSÃO ATUALIZADA E CORRIGIDA)

// =========================================================================
// == DADOS E FUNÇÕES GLOBAIS (Carregados Imediatamente) ====================
// =========================================================================
// Definidos fora do 'DOMContentLoaded' para garantir que estejam disponíveis
// para outros scripts (como os de modais) assim que o arquivo for carregado.

console.log("✔️ principal.js: Definindo dados e funções globais...");

const disciplinasDashboard = [
    { id: "CS101", nome: "Algoritmos e Estrutura de Dados", descricao: "Estudo de algoritmos fundamentais...", professor: "Prof. Jango", periodo: "2025.1", status: "Ativa" },
    { id: "CS102", nome: "Redes de Computadores", descricao: "Princípios de redes, modelo OSI...", professor: "Prof. João Paulo", periodo: "2025.1", status: "Ativa" },
    { id: "CS103", nome: "Banco de Dados", descricao: "Modelagem de dados, SQL...", professor: "Prof. Jason", periodo: "2025.1", status: "Ativa" },
    { id: "CS104", nome: "Inteligência Artificial", descricao: "Introdução à IA, busca...", professor: "Prof. Pryzado", periodo: "2025.2", status: "Em Andamento" },
    { id: "CS105", nome: "Compiladores", descricao: "Teoria e prática da construção de compiladores...", professor: "Prof. Ada L.", periodo: "2025.2", status: "Em Andamento" },
];

const provasDashboardDados = [
    { id: "P001", tituloProva: "Complexidade e Estruturas Lineares", dataOriginal: "2025-05-28", status: "Concluída", disciplinaId: "CS101", tipo: "Prova", descricao: "Prova sobre análise de complexidade (Big O), Filas, Pilhas e Listas." },
    { id: "P002", tituloProva: "SQL e Normalização", dataOriginal: "2025-06-15", status: "Em Andamento", disciplinaId: "CS103", tipo: "Prova", descricao: "Avaliação sobre consultas SQL avançadas e formas normais (1FN, 2FN, 3FN)." },
    { id: "P003", tituloProva: "Camadas de Transporte e Aplicação", dataOriginal: "2025-06-28", status: "Em Andamento", disciplinaId: "CS102", tipo: "Prova", descricao: "Prova teórica sobre os protocolos TCP, UDP, HTTP, DNS e FTP." },
    { id: "P004", tituloProva: "Análise Léxica e Sintática", dataOriginal: "2025-07-10", status: "Em Andamento", disciplinaId: "CS105", tipo: "Prova", descricao: "Prova prática sobre criação de analisadores com Flex e Bison." }
];

// --- Globalização dos dados ---
window.listaDisciplinas = disciplinasDashboard;

// ===== CORREÇÃO APLICADA AQUI =====
// A lista de tarefas agora é criada apenas com os dados das provas,
// já que a lista de tarefas do dashboard foi removida.
window.listaTarefas = provasDashboardDados.map(p => ({
    id: p.id,
    titulo: p.tituloProva,
    disciplinaId: p.disciplinaId,
    tipo: p.tipo,
    dataEntrega: p.dataOriginal,
    status: p.status,
    descricao: p.descricao
}));
// ===================================

// --- Estruturas de dados para os dropdowns dos modais (Formato Corrigido) ---
window.disciplinasFixasParaSelects = window.listaDisciplinas.map(d => ({ id: d.id, nome: d.nome }));
window.atividadesPorDisciplinaParaSelects = Object.fromEntries(
    window.listaDisciplinas.map(d => [
        d.id,
        window.listaTarefas.filter(t => t.disciplinaId === d.id).map(t => ({ id: t.id, nome: t.titulo }))
    ])
);
window.atividadesPadraoParaSelects = window.listaTarefas.map(t => ({ id: t.id, nome: t.titulo }));

// --- Funções Utilitárias Globais Padronizadas ---
window.popularSelect = function (element, options, selectedValue = null, placeholderText = 'Selecione...') {
    if (!element) {
        console.warn("Elemento select não encontrado para popular:", element);
        return;
    }
    element.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = placeholderText;
    element.appendChild(defaultOption);
    options.forEach(option => {
        const optElement = document.createElement('option');
        const value = (typeof option === 'object' && option !== null) ? option.id : option;
        const textContent = (typeof option === 'object' && option !== null) ? (option.nome || option.titulo) : option;
        optElement.value = value;
        optElement.textContent = textContent;
        element.appendChild(optElement);
    });
    if (selectedValue) {
        element.value = selectedValue;
    } else {
        defaultOption.selected = true;
    }
};

window.formatarDataParaWidget = (dataStr) => {
    if (!dataStr) return 'Sem data';
    const [y, m, d] = dataStr.split('-');
    const dt = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${dt.getUTCDate()} ${meses[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
};

window.getStatusBadgeClass = (s) => {
    switch(s) {
        case 'Concluída': return 'bg-success-subtle text-success';
        case 'Agendada': case 'Em Andamento': return 'bg-info-subtle text-info';
        case 'A Fazer': return 'bg-warning-subtle text-warning';
        case 'Atrasada': return 'bg-danger-subtle text-danger';
        default: return 'bg-secondary-subtle text-secondary';
    }
};

window.getStatusBadgeClassDisciplina = (s) => {
    switch (s) {
        case 'Ativa': return 'bg-success-subtle text-success';
        case 'Em Andamento': return 'bg-info-subtle text-info';
        case 'Concluída': return 'bg-secondary-subtle text-secondary';
        case 'Agendada': return 'bg-primary-subtle text-primary';
        default: return 'bg-light-subtle text-dark';
    }
};

window.getStatusBorderClass = (s) => {
    switch (s) {
        case 'Concluída': return 'border-success-subtle';
        case 'Agendada': case 'Em Andamento': return 'border-info-subtle';
        case 'A Fazer': return 'border-warning-subtle';
        case 'Atrasada': return 'border-danger-subtle';
        default: return 'border-secondary-subtle';
    }
};

window.getTipoBadgeClass = (t) => {
    if (t === "Prova") return 'bg-danger-subtle text-danger';
    return 'bg-primary-subtle text-primary';
};


// =========================================================================
// == LÓGICA DA PÁGINA DO DASHBOARD (Executada após o DOM carregar) =======
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("✔️ DOMContentLoaded: Iniciando lógica da página principal...");

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

    // --- LÓGICA DO CARROSSEL DE DISCIPLINAS ---
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

    // --- RENDERIZAÇÃO DOS WIDGETS ---
    const listaTarefasDashboardEl = document.getElementById('listaTarefasDashboard');
    if (listaTarefasDashboardEl) {
        listaTarefasDashboardEl.innerHTML = '';
        // O widget de tarefas agora pode ficar vazio se não houver tarefas, o que é o comportamento esperado.
        window.listaTarefas.filter(t => t.tipo === "Tarefa").slice(0, 4).forEach(tarefa => {
            const disc = window.listaDisciplinas.find(d => d.id === tarefa.disciplinaId);
            const div = document.createElement('div');
            div.className = `task-item border-start ${window.getStatusBorderClass(tarefa.status)}`;
            div.innerHTML = `<div class="d-flex justify-content-between"><strong class="text-sm">${disc ? disc.nome : 'Geral'}</strong><span class="badge ${window.getStatusBadgeClass(tarefa.status)}">${tarefa.status}</span></div><small>${tarefa.titulo}</small><small>Entrega: ${window.formatarDataParaWidget(tarefa.dataEntrega)}</small>`;
            div.style.cursor = 'pointer';
            div.addEventListener('click', () => abrirModalDetalhesAtividade(tarefa));
            listaTarefasDashboardEl.appendChild(div);
        });
    }

    const tabelaProvasDashboard = document.getElementById('tabelaProvasDashboard');
    if (tabelaProvasDashboard) {
        tabelaProvasDashboard.innerHTML = '';
        window.listaTarefas.filter(t => t.tipo === "Prova").forEach(prova => {
            const disc = window.listaDisciplinas.find(d => d.id === prova.disciplinaId);
            const tr = document.createElement('tr');
            tr.className = 'clicavel-prova';
            tr.style.cursor = 'pointer';
            tr.innerHTML = `<td>${prova.titulo}</td><td>${disc ? disc.nome : 'N/A'}</td><td>${window.formatarDataParaWidget(prova.dataEntrega)}</td><td><span class="badge ${window.getStatusBadgeClass(prova.status)}">${prova.status}</span></td>`;
            tr.addEventListener('click', () => {
                abrirModalDetalhesAtividade(prova);
            });
            tabelaProvasDashboard.appendChild(tr);
        });
    }
    
    // --- LÓGICA DE CLIQUE NOS CARDS DE DISCIPLINA ---
    if (coursesContainer) {
        coursesContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.course-card');
            if (card && card.dataset.disciplinaId) {
                abrirModalDetalhesDisciplina(card.dataset.disciplinaId);
            }
        });
    }

    // --- FUNÇÕES PARA EXIBIR MODAIS DE DETALHES ---
    function abrirModalDetalhesAtividade(dadosItem) {
        if (!modalDetalhesAtividade) return;
        const disc = window.listaDisciplinas.find(d => d.id === dadosItem.disciplinaId);
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
        const dados = window.listaDisciplinas.find(d => d.id === disciplinaId);
        if (!dados) return;
        detalheDisciplinaNome.textContent = dados.nome;
        detalheDisciplinaDescricao.textContent = dados.descricao || 'Nenhuma descrição fornecida.';
        detalheDisciplinaProfessor.textContent = dados.professor || '-';
        detalheDisciplinaPeriodo.textContent = dados.periodo || '-';
        detalheDisciplinaStatus.innerHTML = `<span class="badge ${window.getStatusBadgeClassDisciplina(dados.status)}">${dados.status}</span>`;
        const bsModal = new bootstrap.Modal(modalDetalhesDisciplina);
        bsModal.show();
    }
    
    // --- MODAIS DE ADIÇÃO RÁPIDA (SIDEBAR) ---
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
});