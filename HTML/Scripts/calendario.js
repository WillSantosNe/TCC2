// calendario.js - script completo para inicialização e interatividade do FullCalendar

document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    // const switcherBtn  = document.createElement('button'); // Não utilizado no código fornecido.
    let viewDropdown; // será inicializado depois de renderizar o calendário

    // Verifica se o elemento do calendário existe
    if (calendarEl) {
        // Inicializa o calendário
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            height: '100%',
            locale: 'pt-br',

            // Apenas o botão de menu customizado aparece
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'viewMenu'
            },

            customButtons: {
                viewMenu: {
                    text: '⋯',
                    click: () => {
                        // alterna a exibição do dropdown que foi injetado abaixo
                        if (viewDropdown) {
                            viewDropdown.classList.toggle('show');
                        }
                    }
                }
            },

            events: fetchEvents,

            dateClick: info => openEventModal({
                date: info.dateStr,
                allDay: info.allDay
            }),

            eventClick: info => openEventModal({
                id: info.event.id,
                title: info.event.title,
                start: info.event.startStr,
                end: info.event.endStr,
                allDay: info.event.allDay
            })
        });

        calendar.render();

        // --- INJEÇÃO DO BOTÃO ⋯ E DO DROPDOWN DE VIEWS ---
        // encontra o botão que o FullCalendar gerou
        const fcButton = document.querySelector('.fc-viewMenu-button');

        if (fcButton) {
            // cria o dropdown e injeta dentro do botão
            viewDropdown = document.createElement('div');
            viewDropdown.className = 'fc-view-dropdown';
            viewDropdown.innerHTML = `
                <button data-view="dayGridMonth">Mês</button>
                <button data-view="timeGridWeek">Semana</button>
                <button data-view="timeGridDay">Dia</button>
                <button data-view="listWeek">Lista</button>
            `;
            fcButton.appendChild(viewDropdown);

            // ao clicar numa opção, muda a visualização e fecha
            viewDropdown.addEventListener('click', e => {
                if (e.target.matches('button[data-view]')) {
                    calendar.changeView(e.target.getAttribute('data-view'));
                    viewDropdown.classList.remove('show');
                }
            });

            // fecha o dropdown ao clicar em qualquer lugar fora dele
            document.addEventListener('click', e => {
                // Adiciona verificação para viewDropdown existir
                if (viewDropdown && fcButton && !fcButton.contains(e.target) && viewDropdown.classList.contains('show')) {
                    viewDropdown.classList.remove('show');
                }
            });
        } else {
            console.warn("Botão .fc-viewMenu-button do FullCalendar não encontrado para injetar dropdown de visualizações.");
        }
    } else {
        console.warn("Elemento #calendar não encontrado. FullCalendar não foi inicializado.");
    }

    // =======================================================================================
    // --- INÍCIO DO CÓDIGO DOS MODAIS DE ACESSO RÁPIDO (ADICIONADO) ---
    // =======================================================================================

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
        if (!quickAddDisciplinaBtn) console.warn('Botão "quickAddDisciplinaBtn" (acesso rápido disciplina) não encontrado.');
        // Não mostrar erro se o modal não existir, apenas se o botão existir e o modal não.
        if (quickAddDisciplinaBtn && !modalDisciplina) console.warn('Modal "modalDisciplina" não encontrado, mas botão "quickAddDisciplinaBtn" existe.');
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
        if (!quickAddTarefaBtn) console.warn('Botão "quickAddTarefaBtn" (acesso rápido tarefa) não encontrado.');
        if (quickAddTarefaBtn && !modalTarefa) console.warn('Modal "modalTarefa" não encontrado, mas botão "quickAddTarefaBtn" existe.');
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
    
    // --- Modal Adicionar Anotação (Bootstrap Modal) ---
    const modalAnotacaoElement = document.getElementById('modalAnotacao');
    const quickAddAnotacaoBtn = document.getElementById('quickAddAnotacaoBtn'); // Botão na sidebar

    console.log('Verificando Modal Anotação Element:', modalAnotacaoElement);
    console.log('Verificando Botão Rápido Adicionar Anotação:', quickAddAnotacaoBtn);

    if (quickAddAnotacaoBtn) { // Listener para o botão de adicionar anotação
        quickAddAnotacaoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botão Rápido Adicionar Anotação clicado.');
            // Se o modalAnotacaoElement existir e o botão *não* tiver data-bs-toggle,
            // você precisaria chamar o .show() do Bootstrap aqui.
            // Ex: if(modalAnotacaoElement) {
            //         const bsModal = bootstrap.Modal.getInstance(modalAnotacaoElement) || new bootstrap.Modal(modalAnotacaoElement);
            //         bsModal.show();
            //     }
            // Como o botão deve ter data-bs-toggle="modal", o Bootstrap o abrirá.
            // A lógica de reset está no listener 'show.bs.modal' abaixo.
        });
    } else {
        console.warn('Botão "quickAddAnotacaoBtn" (acesso rápido anotação) não encontrado.');
    }

    if (modalAnotacaoElement) { // Listeners para o modal de anotação
        modalAnotacaoElement.addEventListener('show.bs.modal', () => {
            console.log('Modal Anotação está sendo aberto (evento show.bs.modal).');
            
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
            console.log('Modal Anotação foi completamente aberto (evento shown.bs.modal).');
            const tituloInput = modalAnotacaoElement.querySelector('#anotacaoTituloInput');
            if (tituloInput) {
                tituloInput.focus();
            }
        });

        modalAnotacaoElement.addEventListener('hide.bs.modal', () => {
            console.log('Modal Anotação está sendo fechado (evento hide.bs.modal).');
        });

        modalAnotacaoElement.addEventListener('hidden.bs.modal', () => {
            console.log('Modal Anotação foi completamente fechado (evento hidden.bs.modal).');
        });
    } else {
        // Só avisa se o botão existir, mas o modal não.
        if(quickAddAnotacaoBtn) console.warn('Modal "modalAnotacao" não encontrado, mas botão "quickAddAnotacaoBtn" existe.');
    }

    // =======================================================================================
    // --- FIM DO CÓDIGO DOS MODAIS DE ACESSO RÁPIDO ---
    // =======================================================================================

}); // Fim do DOMContentLoaded