// calendario.js (VERSÃO ATUALIZADA E PADRONIZADA)

// =========================================================================
// == DADOS E FUNÇÕES GLOBAIS (Carregados Imediatamente) ====================
// =========================================================================
// Definidos fora do 'DOMContentLoaded' para garantir que estejam disponíveis 
// para outros scripts (como os de modais) assim que o arquivo for carregado.

console.log("✔️ calendario.js: Definindo dados e funções globais...");

const disciplinasDoCalendario = [
    { id: "CS101", nome: "Algoritmos e Estrutura de Dados" },
    { id: "CS102", nome: "Redes de Computadores" },
    { id: "CS103", nome: "Banco de Dados" },
    { id: "CS104", nome: "Inteligência Artificial" },
    { id: "CS105", nome: "Compiladores" }
];

const tarefasDoCalendario = [
    { id: "T001", titulo: "Complexidade e Estruturas Lineares", disciplinaId: "CS101", tipo: "Prova", dataEntrega: "2025-06-23", status: "Agendada", descricao: "Estudar capítulos 1 a 3 do livro Cormen. Foco em complexidade Big-O." },
    { id: "T006", titulo: "Camadas de Transporte e Aplicação", disciplinaId: "CS102", tipo: "Prova", dataEntrega: "2025-06-24", status: "Agendada", descricao: "Foco em protocolos TCP, UDP e HTTP." },
    { id: "T010", titulo: "SQL e Normalização", disciplinaId: "CS103", tipo: "Prova", dataEntrega: "2025-06-25", status: "Agendada", descricao: "Praticar joins e entender as formas normais (1FN, 2FN, 3FN)." },
    { id: "T013", titulo: "Machine Learning e Redes Neurais", disciplinaId: "CS104", tipo: "Prova", dataEntrega: "2025-06-26", status: "Agendada", descricao: "Revisar conceitos de regressão linear e redes neurais convolucionais." },
    { id: "T017", titulo: "Análise Léxica e Sintática", disciplinaId: "CS105", tipo: "Prova", dataEntrega: "2025-06-29", status: "Agendada", descricao: "Implementar um analisador léxico simples em Python." },
];

// --- Globalização dos dados para outros scripts ---
window.listaDisciplinas = disciplinasDoCalendario;
window.listaTarefas = tarefasDoCalendario;

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

window.formatarData = (dataStr) => {
    if (!dataStr) return '-';
    const d = new Date(dataStr + 'T00:00:00');
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
};

window.getStatusBadgeClass = (s) => {
    switch(s){
        case 'Concluída': return 'bg-success-subtle text-success';
        case 'Agendada': return 'bg-primary-subtle text-primary';
        case 'Em Andamento': return 'bg-info-subtle text-info';
        case 'A Fazer': return 'bg-warning-subtle text-warning';
        case 'Atrasada': return 'bg-danger-subtle text-danger';
        default: return 'bg-secondary-subtle text-secondary';
    }
};

window.getTipoBadgeClass = (tipo) => {
    if (!tipo) return 'bg-secondary-subtle text-secondary';
    const tipoLower = tipo.toLowerCase();
    switch (tipoLower) {
        case "prova": return 'bg-danger-subtle text-danger';
        case "tarefa": return 'bg-primary-subtle text-primary';
        case "reuniao": case "reunião": return 'bg-success-subtle text-success';
        default: return 'bg-secondary-subtle text-secondary';
    }
};

window.getEventColor = (tipo) => {
    if (!tipo) return 'var(--event-fc-default)';
    const tipoLower = tipo.toLowerCase();
    switch (tipoLower) {
        case "prova": return 'var(--event-fc-prova)';
        case "tarefa": return 'var(--event-fc-tarefa)';
        case "reuniao": case "reunião": return 'var(--event-fc-reuniao)';
        default: return 'var(--event-fc-default)';
    }
};


// =========================================================================
// == LÓGICA DA PÁGINA DE CALENDÁRIO (Executada após o DOM carregar) =======
// =========================================================================
document.addEventListener('DOMContentLoaded', function () {
    console.log("✔️ DOMContentLoaded: Iniciando lógica da página de calendário...");

    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.warn("⚠️ Elemento #calendar não encontrado no DOM. FullCalendar não será inicializado.");
        return;
    }

    let viewDropdown;
    let calendarInstance;

    try {
        calendarInstance = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            height: '100%',
            locale: 'pt-br',
            headerToolbar: { left: 'prev,next today', center: 'title', right: 'viewMenuCustomButton' },
            customButtons: {
                viewMenuCustomButton: { text: '⋯', click: () => { if (viewDropdown) viewDropdown.classList.toggle('show'); } }
            },
            events: window.listaTarefas.map(tarefa => ({
                id: tarefa.id,
                title: tarefa.titulo,
                start: tarefa.dataEntrega,
                allDay: true,
                backgroundColor: window.getEventColor(tarefa.tipo),
                borderColor: window.getEventColor(tarefa.tipo),
                classNames: ['event-tipo-' + (tarefa.tipo || 'default').toLowerCase()],
                extendedProps: {
                    disciplinaId: tarefa.disciplinaId,
                    tipo: tarefa.tipo,
                    status: tarefa.status,
                    description: tarefa.descricao
                }
            })),
            dateClick: function (info) {
                console.log("Data clicada no calendário:", info.dateStr);
            },
            eventClick: function (info) {
                console.log("Evento clicado:", info.event.id);
                const clickedEventData = window.listaTarefas.find(t => t.id === info.event.id);
                
                if (clickedEventData && typeof window.abrirModalDetalhesAtividade !== 'undefined') {
                    window.abrirModalDetalhesAtividade(clickedEventData);
                } else {
                    console.warn("Dados do evento não encontrados ou a função global abrirModalDetalhesAtividade não está disponível.");
                }
            }
        });
        calendarInstance.render();
        console.log("✅ FullCalendar renderizado.");

        // Lógica para o menu de visualização customizado
        const fcToolbarChunk = document.querySelector('.fc-header-toolbar .fc-toolbar-chunk:last-child');
        const viewMenuButton = fcToolbarChunk ? fcToolbarChunk.querySelector('.fc-viewMenuCustomButton-button') : null;
        if (viewMenuButton) {
            viewDropdown = document.createElement('div');
            viewDropdown.className = 'fc-view-dropdown';
            viewDropdown.innerHTML = `<button data-view="dayGridMonth">Mês</button><button data-view="timeGridWeek">Semana</button><button data-view="timeGridDay">Dia</button><button data-view="listWeek">Lista</button>`;
            viewMenuButton.parentNode.style.position = 'relative';
            viewMenuButton.parentNode.appendChild(viewDropdown);
            viewDropdown.addEventListener('click', e => { if (e.target.matches('button[data-view]')) { calendarInstance.changeView(e.target.getAttribute('data-view')); if (viewDropdown) viewDropdown.classList.remove('show'); } });
            document.addEventListener('click', e => { if (viewDropdown && viewDropdown.classList.contains('show') && !viewMenuButton.contains(e.target) && !viewDropdown.contains(e.target)) { viewDropdown.classList.remove('show'); } });
        }
    } catch (error) { console.error("❌ ERRO ao inicializar o FullCalendar:", error); }

    // Garante que a função para abrir o modal de detalhes da atividade exista
    if (typeof window.abrirModalDetalhesAtividade === 'undefined') {
        window.abrirModalDetalhesAtividade = function (tarefaData) {
            const modalDetalhesAtividadeEl = document.getElementById('modalDetalhesAtividade');
            if (!modalDetalhesAtividadeEl) { console.warn("Modal #modalDetalhesAtividade não encontrado."); return; }
            
            const detalheAtividadeNome = modalDetalhesAtividadeEl.querySelector('#detalhe-atividade-nome');
            const detalheAtividadeDisciplina = modalDetalhesAtividadeEl.querySelector('#detalhe-atividade-disciplina');
            const detalheAtividadeTipo = modalDetalhesAtividadeEl.querySelector('#detalhe-atividade-tipo');
            const detalheAtividadeData = modalDetalhesAtividadeEl.querySelector('#detalhe-atividade-data');
            const detalheAtividadeStatus = modalDetalhesAtividadeEl.querySelector('#detalhe-atividade-status');
            const detalheAtividadeDescricao = modalDetalhesAtividadeEl.querySelector('#detalhe-atividade-descricao');

            const disciplinaObj = window.listaDisciplinas.find(d => d.id === tarefaData.disciplinaId);

            detalheAtividadeNome.textContent = tarefaData.titulo || "Detalhes da Atividade";
            detalheAtividadeDisciplina.textContent = disciplinaObj ? disciplinaObj.nome : 'Não especificada';
            detalheAtividadeTipo.innerHTML = `<span class="badge ${window.getTipoBadgeClass(tarefaData.tipo)}">${tarefaData.tipo || '-'}</span>`;
            detalheAtividadeData.textContent = window.formatarData(tarefaData.dataEntrega); 
            detalheAtividadeStatus.innerHTML = `<span class="badge ${window.getStatusBadgeClass(tarefaData.status)}">${tarefaData.status || '-'}</span>`;
            detalheAtividadeDescricao.textContent = tarefaData.descricao || 'Nenhuma descrição fornecida.';
            
            const bsModalDetalhesAtividade = new bootstrap.Modal(modalDetalhesAtividadeEl);
            bsModalDetalhesAtividade.show();
        }
    }
});