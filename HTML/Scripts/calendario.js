// calendario.js - script completo para inicialização e interatividade do FullCalendar

document.addEventListener('DOMContentLoaded', function () {
    console.log("✔️ DOMContentLoaded disparado. Iniciando calendario.js...");

    const calendarEl = document.getElementById('calendar');
    let viewDropdown; // será inicializado depois de renderizar o calendário

    if (!calendarEl) {
        console.warn("⚠️ Elemento #calendar não encontrado no DOM. FullCalendar não será inicializado.");
        // A lógica dos modais abaixo ainda será configurada, pois podem ser independentes.
    } else {
        console.log("👍 Elemento #calendar existe. Configurando FullCalendar...");
        try {
            const calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                height: '100%', // Considere testar 'auto' ou um valor fixo (ex: 650) se '100%' causar problemas
                locale: 'pt-br',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'viewMenu' // Botão customizado para o menu de visualizações
                },
                customButtons: {
                    viewMenu: {
                        text: '⋯',
                        click: () => {
                            if (viewDropdown) { // Garante que viewDropdown foi criado
                                viewDropdown.classList.toggle('show');
                            }
                        }
                    }
                },
                events: fetchEvents, // Função para buscar eventos (definida abaixo)
                dateClick: info => openEventModal({ // Ao clicar numa data
                    date: info.dateStr,
                    allDay: info.allDay
                }),
                eventClick: info => openEventModal({ // Ao clicar num evento existente
                    id: info.event.id,
                    title: info.event.title,
                    start: info.event.startStr,
                    end: info.event.endStr,
                    allDay: info.event.allDay
                })
            });

            calendar.render();
            console.log("✅ FullCalendar renderizado (ou tentativa concluída).");

            // --- INJEÇÃO DO BOTÃO ⋯ E DO DROPDOWN DE VIEWS ---
            const fcButton = document.querySelector('.fc-viewMenu-button');
            if (fcButton) {
                viewDropdown = document.createElement('div');
                viewDropdown.className = 'fc-view-dropdown';
                viewDropdown.innerHTML = `
                    <button data-view="dayGridMonth">Mês</button>
                    <button data-view="timeGridWeek">Semana</button>
                    <button data-view="timeGridDay">Dia</button>
                    <button data-view="listWeek">Lista</button>
                `;
                fcButton.appendChild(viewDropdown);

                viewDropdown.addEventListener('click', e => {
                    if (e.target.matches('button[data-view]')) {
                        calendar.changeView(e.target.getAttribute('data-view'));
                        if (viewDropdown) { // Garante que existe antes de tentar remover a classe
                            viewDropdown.classList.remove('show');
                        }
                    }
                });

                // Fecha o dropdown ao clicar em qualquer lugar fora dele e do botão que o abre
                document.addEventListener('click', e => {
                    if (viewDropdown && viewDropdown.classList.contains('show') && 
                        !fcButton.contains(e.target) && 
                        !viewDropdown.contains(e.target)) {
                        viewDropdown.classList.remove('show');
                    }
                });
            } else {
                console.warn("⚠️ Botão .fc-viewMenu-button do FullCalendar não encontrado. Dropdown de visualizações não será adicionado.");
            }
        } catch (error) {
            console.error("❌ ERRO CRÍTICO durante a inicialização/renderização do FullCalendar ou configuração do dropdown:", error);
        }
    }

    // =======================================================================================
    // --- LÓGICA DOS MODAIS DE ACESSO RÁPIDO (ADICIONADA CONFORME EXEMPLO) ---
    // =======================================================================================
    console.log("🚀 Configurando modais de acesso rápido...");

    // --- Modal Adicionar Disciplina (<dialog>) ---
    const modalDisciplina = document.getElementById('modalDisciplina');
    const quickAddDisciplinaBtn = document.getElementById('quickAddDisciplinaBtn');
    const fecharModalDisciplinaBtn = document.getElementById('fecharModalDisciplina'); // Assumindo ID do HTML da calendario.html
    const cancelarModalDisciplinaBtn = document.getElementById('cancelarModalDisciplina'); // Assumindo ID do HTML da calendario.html
    const formDisciplina = document.getElementById('formDisciplina');

    // console.log('🔎 Verificando Modal Disciplina:', modalDisciplina);
    // console.log('🔎 Verificando Botão Rápido Adicionar Disciplina:', quickAddDisciplinaBtn);

    if (quickAddDisciplinaBtn && modalDisciplina) {
        quickAddDisciplinaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('👍 Botão Rápido Adicionar Disciplina clicado.');
            if (formDisciplina) formDisciplina.reset();
            const modalLabel = modalDisciplina.querySelector('#modalDisciplinaLabel');
            if (modalLabel) modalLabel.textContent = 'Adicionar Disciplina';
            
            const disciplinaIdField = modalDisciplina.querySelector('#disciplinaId'); // Se houver um campo de ID
            if (disciplinaIdField) disciplinaIdField.value = '';

            modalDisciplina.showModal();
            // console.log('Modal Disciplina showModal() chamado.');
        });
    } else {
        if (!quickAddDisciplinaBtn) console.warn('⚠️ Botão "quickAddDisciplinaBtn" (disciplina) não encontrado.');
        if (quickAddDisciplinaBtn && !modalDisciplina) console.warn('⚠️ Modal "modalDisciplina" não encontrado, mas botão "quickAddDisciplinaBtn" existe.');
    }

    if (fecharModalDisciplinaBtn && modalDisciplina) {
        fecharModalDisciplinaBtn.addEventListener('click', () => {
            modalDisciplina.close();
            // console.log('Modal Disciplina fechado pelo botão X.');
        });
    }

    if (cancelarModalDisciplinaBtn && modalDisciplina) {
        cancelarModalDisciplinaBtn.addEventListener('click', () => {
            modalDisciplina.close();
            // console.log('Modal Disciplina fechado pelo botão Cancelar.');
        });
    }

    if (modalDisciplina) {
        modalDisciplina.addEventListener('click', (event) => {
            if (event.target === modalDisciplina) { // Clique no backdrop
                modalDisciplina.close();
                // console.log('Modal Disciplina fechado pelo clique no backdrop.');
            }
        });
    }

    // --- Modal Adicionar Tarefa/Prova (<dialog>) ---
    const modalTarefa = document.getElementById('modalTarefa');
    const quickAddTarefaBtn = document.getElementById('quickAddTarefaBtn');
    const fecharModalTarefaBtn = document.getElementById('fecharModalTarefa'); // Assumindo ID do HTML da calendario.html
    const cancelarModalTarefaBtn = document.getElementById('cancelarModalTarefa'); // Assumindo ID do HTML da calendario.html
    const formTarefa = document.getElementById('formTarefa');

    // console.log('🔎 Verificando Modal Tarefa:', modalTarefa);
    // console.log('🔎 Verificando Botão Rápido Adicionar Tarefa:', quickAddTarefaBtn);

    if (quickAddTarefaBtn && modalTarefa) {
        quickAddTarefaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('👍 Botão Rápido Adicionar Tarefa clicado.');
            if (formTarefa) formTarefa.reset();
            const modalLabel = modalTarefa.querySelector('#modalTarefaLabel');
            if (modalLabel) modalLabel.textContent = 'Adicionar Tarefa';
            
            // Adicionar lógica para popular select de disciplinas se necessário (exemplo: popularSelectDisciplinas())

            modalTarefa.showModal();
            // console.log('Modal Tarefa showModal() chamado.');
        });
    } else {
        if (!quickAddTarefaBtn) console.warn('⚠️ Botão "quickAddTarefaBtn" (tarefa) não encontrado.');
        if (quickAddTarefaBtn && !modalTarefa) console.warn('⚠️ Modal "modalTarefa" não encontrado, mas botão "quickAddTarefaBtn" existe.');
    }

    if (fecharModalTarefaBtn && modalTarefa) {
        fecharModalTarefaBtn.addEventListener('click', () => {
            modalTarefa.close();
            // console.log('Modal Tarefa fechado pelo botão X.');
        });
    }

    if (cancelarModalTarefaBtn && modalTarefa) {
        cancelarModalTarefaBtn.addEventListener('click', () => {
            modalTarefa.close();
            // console.log('Modal Tarefa fechado pelo botão Cancelar.');
        });
    }

    if (modalTarefa) {
        modalTarefa.addEventListener('click', (event) => {
            if (event.target === modalTarefa) { // Clique no backdrop
                modalTarefa.close();
                // console.log('Modal Tarefa fechado pelo clique no backdrop.');
            }
        });
    }
    
    // --- Modal Adicionar Anotação (Bootstrap Modal) ---
    // O HTML da calendario.html que você me mostrou NÃO TEM <div id="modalAnotacao">.
    // Se ele for adicionado ao HTML, este código funcionará.
    // Caso contrário, o botão "Adicionar Anotação" não abrirá um modal nesta página.
    const modalAnotacaoElement = document.getElementById('modalAnotacao');
    const quickAddAnotacaoBtn = document.getElementById('quickAddAnotacaoBtn');

    // console.log('🔎 Verificando Modal Anotação Element:', modalAnotacaoElement);
    // console.log('🔎 Verificando Botão Rápido Adicionar Anotação:', quickAddAnotacaoBtn);

    if (quickAddAnotacaoBtn) {
        quickAddAnotacaoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('👍 Botão Rápido Adicionar Anotação clicado.');
            if (!modalAnotacaoElement) {
                console.warn("⚠️ Botão 'Adicionar Anotação' clicado, mas o modal #modalAnotacao NÃO FOI ENCONTRADO no HTML desta página. Verifique se o HTML do modal está presente.");
                // Você poderia opcionalmente desabilitar o botão ou dar um feedback visual se o modal não existe
                // alert("Funcionalidade 'Adicionar Anotação' não está disponível nesta tela pois o modal correspondente não foi encontrado no HTML.");
            }
            // Se o modalAnotacaoElement existir E o botão tiver os atributos data-bs-toggle/target,
            // o Bootstrap cuidará de abri-lo. A lógica de reset está no listener 'show.bs.modal'.
        });
    } else {
        console.warn('⚠️ Botão "quickAddAnotacaoBtn" (anotação) não encontrado.');
    }

    if (modalAnotacaoElement) {
        console.log("👍 Modal #modalAnotacao encontrado. Configurando listeners de Bootstrap...");
        modalAnotacaoElement.addEventListener('show.bs.modal', () => {
            console.log('Modal Anotação (Bootstrap) está sendo aberto.');
            
            const tituloInput = modalAnotacaoElement.querySelector('#anotacaoTituloInput');
            const disciplinaInput = modalAnotacaoElement.querySelector('#anotacaoDisciplinaInput');
            const atividadeInput = modalAnotacaoElement.querySelector('#anotacaoAtividadeInput');
            const conteudoInput = modalAnotacaoElement.querySelector('#anotacaoConteudoInput');
            const idInput = modalAnotacaoElement.querySelector('#anotacaoIdInput');
            const modalLabel = modalAnotacaoElement.querySelector('#modalAnotacaoLabelTitulo');
            const editInfo = modalAnotacaoElement.querySelector('#modalAnotacaoEditInfo');

            if (tituloInput) tituloInput.value = '';
            if (disciplinaInput) disciplinaInput.value = '';
            if (atividadeInput) atividadeInput.value = '';
            if (conteudoInput) conteudoInput.value = '';
            if (idInput) idInput.value = ''; 

            if (modalLabel) modalLabel.textContent = 'Nova Anotação';
            if (editInfo) editInfo.textContent = 'Criando nova anotação';
        });

        modalAnotacaoElement.addEventListener('shown.bs.modal', () => {
            // console.log('Modal Anotação (Bootstrap) foi completamente aberto.');
            const tituloInput = modalAnotacaoElement.querySelector('#anotacaoTituloInput');
            if (tituloInput) {
                tituloInput.focus();
            }
        });
    } else {
        // Este aviso já é coberto pelo if (quickAddAnotacaoBtn && !modalAnotacaoElement)
        // if (quickAddAnotacaoBtn) console.warn('⚠️ Modal "modalAnotacao" (Bootstrap) não encontrado no HTML desta página.');
    }
    console.log("👍 Configuração dos modais de acesso rápido concluída.");

}); // Fim do DOMContentLoaded


/**
 * Busca eventos de uma API (exemplo, substitua pela sua lógica real).
 * @param {object} info - Informações sobre o intervalo de datas solicitado pelo FullCalendar.
 * @param {function} successCallback - Callback para passar os eventos carregados.
 * @param {function} failureCallback - Callback em caso de erro.
 */
function fetchEvents(info, successCallback, failureCallback) {
    console.log(`ℹ️ Buscando eventos de ${info.startStr} a ${info.endStr}`);
    // Exemplo com API placeholder. Adapte para sua API real.
    // const apiUrl = `/api/eventos?start=${info.startStr}&end=${info.endStr}`;
    
    // Usando dados mockados para exemplo, já que não temos uma API /api/eventos
    const mockEvents = [
        { 
            id: '1', 
            titulo: 'Prova de Cálculo III', 
            data_inicio: new Date(new Date(info.startStr).setDate(new Date(info.startStr).getDate() + 2)).toISOString().split('T')[0], 
            allDay: true, 
            tipo: 'prova' 
        },
        { 
            id: '2', 
            titulo: 'Entrega Projeto IA', 
            data_inicio: new Date(new Date(info.startStr).setDate(new Date(info.startStr).getDate() + 5)).toISOString().split('T')[0] + 'T14:00:00', 
            data_fim: new Date(new Date(info.startStr).setDate(new Date(info.startStr).getDate() + 5)).toISOString().split('T')[0] + 'T16:00:00', 
            allDay: false, 
            tipo: 'tarefa' 
        },
         { 
            id: '3', 
            titulo: 'Reunião Orientador TCC', 
            data_inicio: new Date(new Date(info.startStr).setDate(new Date(info.startStr).getDate() + 1)).toISOString().split('T')[0], 
            allDay: true, 
            tipo: 'reuniao' 
        },
    ];

    setTimeout(() => { // Simulando atraso da rede
        try {
            const events = mockEvents.map(evt => ({
                id: evt.id,
                title: evt.titulo,
                start: evt.data_inicio,
                end: evt.data_fim || null, // FullCalendar lida com null para 'end' se for allDay
                allDay: evt.allDay || false,
                classNames: evt.tipo ? ['event-' + evt.tipo] : [] // Para estilização customizada via CSS
                // você pode adicionar mais propriedades customizadas aqui e acessá-las em eventClick
            }));
            successCallback(events);
            console.log("✅ Eventos mockados carregados para o calendário.");
        } catch (err) {
            console.error('Erro ao processar eventos mockados:', err);
            failureCallback(err);
        }
    }, 500);

    /* Exemplo com fetch real (comente os dados mockados acima se for usar este):
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const events = data.map(evt => ({
                id: evt.id,
                title: evt.titulo,
                start: evt.data_inicio,
                end: evt.data_fim,
                allDay: evt.allDay || false,
                classNames: evt.tipo ? ['event-' + evt.tipo] : [] 
                // Mapeie outras propriedades conforme necessário
            }));
            successCallback(events);
            console.log("✅ Eventos carregados da API.");
        })
        .catch(err => {
            console.error('❌ Erro ao carregar eventos da API:', err);
            failureCallback(err); // Informa ao FullCalendar sobre a falha
        });
    */
}

/**
 * Abre um modal para visualização/edição de detalhes do evento.
 * (Esta função é um placeholder, você precisará do HTML de um modal com id="eventModal"
 * e da lógica para preenchê-lo e salvá-lo).
 * @param {object} eventData - Dados do evento clicado ou da data clicada.
 */
function openEventModal(eventData) {
    console.log("ℹ️ Tentando abrir modal de evento com dados:", eventData);
    const modalEl = document.getElementById('modalDetalhesTarefa'); // Você mencionou este ID em calendario.html

    if (modalEl) { // Se você tiver um modal genérico para detalhes de eventos/tarefas
        // Adapte o preenchimento do modal conforme a estrutura de eventData
        const modalTitle = modalEl.querySelector('#modalDetalhesTarefaLabel'); // ou um seletor similar
        const modalBody = modalEl.querySelector('#modalDetalhesTarefaConteudo'); // ou um seletor similar

        if (modalTitle) {
            modalTitle.textContent = eventData.title ? `Detalhes de: ${eventData.title}` : 'Novo Evento/Tarefa';
        }
        if (modalBody) {
            let content = `<p><strong>Data de Início:</strong> ${eventData.start ? new Date(eventData.start).toLocaleString() : new Date(eventData.date).toLocaleDateString()}</p>`;
            if (eventData.end) {
                content += `<p><strong>Data de Fim:</strong> ${new Date(eventData.end).toLocaleString()}</p>`;
            }
            content += `<p><strong>Dia Inteiro:</strong> ${eventData.allDay ? 'Sim' : 'Não'}</p>`;
            if (eventData.id) {
                 content += `<p><strong>ID:</strong> ${eventData.id}</p>`;
            }
            // Adicione mais campos conforme necessário
            modalBody.innerHTML = content;
        }

        // Se modalDetalhesTarefa for um <dialog>, use .showModal()
        if (typeof modalEl.showModal === 'function') {
            modalEl.showModal();
        } 
        // Se for um modal Bootstrap, instancie e mostre
        // else if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        //     const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        //     bsModal.show();
        // } 
        else {
            console.warn("⚠️ Modal #modalDetalhesTarefa não é um <dialog> nem um modal Bootstrap conhecido para ser aberto programaticamente desta forma.")
        }

    } else {
        console.warn(`⚠️ Modal com id="modalDetalhesTarefa" não encontrado no HTML para exibir detalhes do evento.`);
        // Como fallback, você pode usar um alert simples:
        // alert(`Evento: ${eventData.title || 'Nova Tarefa'}\nData: ${eventData.date || eventData.startStr}`);
    }
}