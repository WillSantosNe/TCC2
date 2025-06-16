// calendario.js
document.addEventListener('DOMContentLoaded', function () {
    console.log("✔️ DOMContentLoaded disparado. Iniciando calendario.js...");

    const calendarEl = document.getElementById('calendar');
    let viewDropdown;
    let calendarInstance;

    // --- DADOS MOCADOS PARA O CALENDÁRIO e GLOBALIZADOS PARA OS MODAIS ---
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
        { id: "T018", titulo: "Trabalho de Grafos", disciplinaId: "CS101", tipo: "Tarefa", dataEntrega: "2025-07-01", status: "A Fazer", descricao: "Implementar algoritmos de travessia em grafos (BFS, DFS)." },
        { id: "T019", titulo: "Relatório de Simulação de Redes", disciplinaId: "CS102", tipo: "Tarefa", dataEntrega: "2025-07-03", status: "Em Andamento", descricao: "Analisar resultados de simulação com NS3." }
    ];


    // --- GLOBALIZAÇÃO DOS DADOS PARA OS MODAIS COMPARTILHADOS ---
    window.listaDisciplinas = disciplinasDoCalendario;
    window.listaTarefas = tarefasDoCalendario;

    window.disciplinasFixasParaSelects = [
        { id: "", nome: "Selecione..." },
        ...disciplinasDoCalendario.map(d => ({id: d.id, nome: d.nome}))
    ];
    
    window.atividadesPorDisciplinaParaSelects = {
        "": [{id: "", nome: "Nenhuma"}],
        "Nenhuma": [{id: "", nome: "Nenhuma"}],
        ...Object.fromEntries(
            disciplinasDoCalendario.map(d => [
                d.id,
                [{id: "", nome: "Nenhuma"}]
                    .concat(tarefasDoCalendario.filter(t => t.disciplinaId === d.id).map(t => ({id: t.id, nome: t.titulo})))
            ])
        ),
        "TCC 1": [{id: "", nome: "Nenhuma"}, {id: "TCC1_Proj", nome: "Revisão Bibliográfica"}, {id: "TCC1_Def", nome: "Defesa da Monografia"}],
        "Outra": [{id: "", nome: "Nenhuma"}, {id: "OUTRA_Gen", nome: "Atividade Geral"}]
    };
    window.atividadesPadraoParaSelects = [{id: "", nome: "Nenhuma"}];

    // --- FUNÇÕES UTILITÁRIAS (GLOBALIZADAS) ---
    if (typeof window.popularSelect === 'undefined') {
        window.popularSelect = function (element, options, selectedValue = null) {
            if (!element) {
                console.warn("Elemento select não encontrado para popularSelect.", element);
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
        }
    }
    
    window.formatarData = (dataStr) => {
        if (!dataStr) return '-';
        const [year,month,day]=dataStr.split('-');
        const d=new Date(dataStr + 'T00:00:00');
        return new Intl.DateTimeFormat('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(d);
    };

    window.formatarDataParaWidget = (dataStr) => {
        if (!dataStr) return 'Sem data';
        const [y,m,d]=dataStr.split('-');
        const dt=new Date(Date.UTC(Number(y),Number(m)-1,Number(d)));
        const meses=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov", "Dez"];
        return `${dt.getUTCDate()} ${meses[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
    };

    window.getStatusBadgeClass = (s) => {
        switch(s){
            case'Concluída':return'bg-success-subtle text-success';
            case'Agendada':case'Em Andamento':case'A Fazer':return'bg-info-subtle text-info';
            case'Atrasada':return'bg-danger-subtle text-danger';
            default:return'bg-secondary-subtle text-secondary';
        }
    };
    
    // Esta função retorna as CLASSES CSS do Bootstrap para os badges.
    window.getTipoBadgeClass = (tipo) => {
        if (!tipo) return 'bg-secondary-subtle text-secondary';
        const tipoLower = tipo.toLowerCase();
        switch (tipoLower) {
            case "prova": return 'bg-danger-subtle text-danger'; // Vermelho para Prova
            case "tarefa": return 'bg-primary-subtle text-primary'; // Azul para Tarefa
            case "reuniao":
            case "reunião": return 'bg-success-subtle text-success'; // Verde para Reunião (se houver)
            default: return 'bg-secondary-subtle text-secondary'; // Cinza para outros
        }
    };

    // Nova função para retornar a COR PRIMÁRIA do evento no FullCalendar.
    // Usaremos as variáveis CSS customizadas definidas em calendario.css
    window.getEventColor = (tipo) => {
        if (!tipo) return 'var(--event-fc-default)'; // Cor padrão do Bootstrap secondary
        const tipoLower = tipo.toLowerCase();
        switch (tipoLower) {
            case "prova": return 'var(--event-fc-prova)';   // Cor definida em calendario.css para Prova
            case "tarefa": return 'var(--event-fc-tarefa)'; // Cor definida em calendario.css para Tarefa
            case "reuniao":
            case "reunião": return 'var(--event-fc-reuniao)'; // Cor definida em calendario.css para Reunião
            default: return 'var(--event-fc-default)'; // Cor padrão
        }
    };


    // --- FULLCALENDAR LÓGICA ---
    if (!calendarEl) {
        console.warn("⚠️ Elemento #calendar não encontrado no DOM. FullCalendar não será inicializado.");
    } else {
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
                    // Usamos a função global para a cor de fundo e borda do evento
                    backgroundColor: window.getEventColor(tarefa.tipo), 
                    borderColor: window.getEventColor(tarefa.tipo),     
                    // Adiciona uma classe com prefixo 'event-tipo-' para estilização CSS fina
                    classNames: ['event-tipo-' + tarefa.tipo.toLowerCase()], 
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
                    
                    if (clickedEventData && window.abrirModalDetalhesAtividade) {
                        window.abrirModalDetalhesAtividade({
                            id: clickedEventData.id,
                            titulo: clickedEventData.titulo,
                            disciplinaId: clickedEventData.disciplinaId,
                            tipo: clickedEventData.tipo,
                            dataEntrega: clickedEventData.dataEntrega,
                            status: clickedEventData.status,
                            descricao: clickedEventData.descricao
                        });
                    } else {
                        console.warn("Dados do evento não encontrados ou abrirModalDetalhesAtividade não disponível.");
                    }
                }
            });
            calendarInstance.render();
            console.log("✅ FullCalendar renderizado.");

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
        } catch (error) { console.error("❌ ERRO no FullCalendar:", error); }
    }

    // --- FUNÇÃO abrirModalDetalhesAtividade (Globalizada, como em outras páginas) ---
    // Esta função exibe o modal #modalDetalhesAtividade e espera os mesmos seletores e formatação.
    // É crucial que seja a mesma função que você tem em principal.js e tarefas.js para este modal.
    // O ideal é que esta função seja única e global (ex: em geral.js) para evitar duplicação.
    // Para garantir que funcione neste arquivo, a incluímos aqui se não estiver já no window.
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

    console.log("👍 calendario.js listeners e inicializações configurados.");
});
