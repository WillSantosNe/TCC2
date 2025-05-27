document.addEventListener('DOMContentLoaded', function () {
    console.log("✔️ DOMContentLoaded disparado. Iniciando calendario.js...");

    const calendarEl = document.getElementById('calendar');
    let viewDropdown;
    let calendarInstance;

    // --- Dados Mockados para os Selects dos Modais (replicando de anotacao.js para este contexto) ---
    const disciplinasFixasParaModais = ["Nenhuma", "Cálculo I", "Programação Orientada a Objetos", "Engenharia de Software", "TCC 1", "Outra"];
    const atividadesPorDisciplinaParaModais = {
        "Nenhuma": ["Nenhuma"],
        "Cálculo I": ["Nenhuma", "Lista de Exercícios 1", "Prova P1", "Outra"],
        "Programação Orientada a Objetos": ["Nenhuma", "Projeto Prático 1", "Laboratório 3", "Outra"],
        "Engenharia de Software": ["Nenhuma", "Documentação", "Protótipo", "Outra"],
        "TCC 1": ["Nenhuma", "Definição do Tema", "Revisão Bibliográfica Inicial", "Desenvolvimento da Proposta", "Apresentação Parcial", "Outra"],
        "Outra": ["Nenhuma", "Atividade Genérica", "Outra"],
        "": ["Nenhuma"] // Default para quando nenhuma disciplina é selecionada
    };
    const atividadesPadraoParaModais = ["Nenhuma", "Outra"];

    // --- FUNÇÕES UTILITÁRIAS ---
    function popularSelect(selectElement, optionsArray, valorSelecionado = null) {
        if (!selectElement) {
            // console.warn("Elemento select não fornecido para popularSelect.");
            return;
        }
        selectElement.innerHTML = '';
        optionsArray.forEach(optText => {
            const option = document.createElement('option');
            option.value = optText;
            option.textContent = optText;
            if (valorSelecionado && optText === valorSelecionado) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
    }

    function getTipoBadgeClass(tipo) {
        if (!tipo) return 'bg-secondary-subtle text-secondary';
        const tipoLower = tipo.toLowerCase();
        if (tipoLower === "prova") return 'bg-danger-subtle text-danger';
        if (tipoLower === "tarefa") return 'bg-primary-subtle text-primary';
        if (tipoLower === "reuniao" || tipoLower === "reunião") return 'bg-success-subtle text-success';
        return 'bg-secondary-subtle text-secondary';
    }
    
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
                events: fetchEvents,
                dateClick: function (info) {
                    const dataFormatada = new Date(info.dateStr + 'T00:00:00'); // Força UTC para evitar problemas de fuso na formatação
                    openEventModal({ 
                        date: dataFormatada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }), 
                        allDay: info.allDay, 
                        title: 'Novo Evento para ' + dataFormatada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }) 
                    });
                },
                eventClick: function (info) {
                    openEventModal({
                        id: info.event.id, title: info.event.title, start: info.event.startStr, end: info.event.endStr,
                        allDay: info.event.allDay, description: info.event.extendedProps.description || '', tipo: info.event.extendedProps.tipo || ''
                    });
                }
            });
            calendarInstance.render();
            // console.log("✅ FullCalendar renderizado.");

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

    // --- LÓGICA PARA MODAIS DE ADIÇÃO (BOOTSTRAP) ---
    // Modal Adicionar Anotação
    const modalAnotacaoCalendarioEl = document.getElementById('modalAnotacaoCalendario');
    if (modalAnotacaoCalendarioEl) {
        const formAnotacao = modalAnotacaoCalendarioEl.querySelector('#formAnotacaoCalendario');
        const tituloInput = modalAnotacaoCalendarioEl.querySelector('#anotacaoCalTituloInput');
        const disciplinaSelect = modalAnotacaoCalendarioEl.querySelector('#anotacaoCalDisciplinaSelect');
        const atividadeSelect = modalAnotacaoCalendarioEl.querySelector('#anotacaoCalAtividadeSelect');
        const conteudoInput = modalAnotacaoCalendarioEl.querySelector('#anotacaoCalConteudoInput');
        const editInfo = modalAnotacaoCalendarioEl.querySelector('#modalAnotacaoCalEditInfo');
        const idInput = modalAnotacaoCalendarioEl.querySelector('#anotacaoCalIdInput');
        const modalLabel = modalAnotacaoCalendarioEl.querySelector('#modalAnotacaoCalendarioLabelTitulo');
        const salvarBtn = modalAnotacaoCalendarioEl.querySelector('#salvarAnotacaoCalBtn');


        function atualizarOpcoesAtividadeAnotacaoCalendario(disciplinaSelecionada, selectAtividadeEl, atividadePreSelecionada = "Nenhuma") {
            if (!selectAtividadeEl) return;
            const atividadesParaDisc = atividadesPorDisciplinaParaModais[disciplinaSelecionada] || atividadesPorDisciplinaParaModais["Nenhuma"] || atividadesPadraoParaModais;
            popularSelect(selectAtividadeEl, atividadesParaDisc, atividadePreSelecionada);
        }

        modalAnotacaoCalendarioEl.addEventListener('show.bs.modal', () => {
            console.log("Modal Anotação (Calendário) show.bs.modal");
            if (formAnotacao) formAnotacao.reset();
            if (idInput) idInput.value = ''; // Limpa ID para nova anotação
            if (tituloInput) tituloInput.classList.remove('is-invalid'); // Limpa validação anterior
            if (modalLabel) modalLabel.textContent = 'Nova Anotação';
            if (editInfo) editInfo.textContent = 'Criando nova anotação';
            
            popularSelect(disciplinaSelect, disciplinasFixasParaModais, "Nenhuma");
            atualizarOpcoesAtividadeAnotacaoCalendario(disciplinaSelect.value, atividadeSelect); // Popula atividades para "Nenhuma"

            if (conteudoInput && typeof tinymce !== 'undefined') {
                const editorId = conteudoInput.id;
                const existingEditor = tinymce.get(editorId);
                if (existingEditor) {
                    console.log("Destruindo editor TinyMCE existente antes de recriar:", editorId);
                    existingEditor.destroy();
                }
                
                console.log("Inicializando TinyMCE para:", editorId);
                tinymce.init({
                    selector: `#${editorId}`,
                    plugins: 'lists link image table code help wordcount autoresize',
                    toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image table | code | help',
                    menubar: 'edit view insert format tools table help',
                    height: 400, 
                    min_height: 400, 
                    autoresize_bottom_margin: 30,
                    branding: false, 
                    statusbar: false, 
                    setup: function(editor) {
                        editor.on('init', function() { editor.setContent(''); });
                        editor.on('OpenWindow', function(e) { if (typeof $ !=='undefined' && $('.tox-dialog-wrap').length && $('.modal.show').length){$('.tox-dialog-wrap').css('z-index',parseInt($('.modal.show').css('z-index')) + 100);}});
                    }
                }).catch(err => console.error("Erro ao inicializar TinyMCE para anotações no calendário:", err));
            } else if (!conteudoInput) {
                console.error("Textarea #" + (conteudoInput ? conteudoInput.id : "anotacaoCalConteudoInput") + " não encontrado para o TinyMCE.");
            } else if (typeof tinymce === 'undefined') {
                console.error("Objeto TinyMCE não está definido. Verifique o carregamento do script.");
            }
        });

        if (disciplinaSelect) {
            disciplinaSelect.addEventListener('change', function() {
                atualizarOpcoesAtividadeAnotacaoCalendario(this.value, atividadeSelect);
            });
        }

        modalAnotacaoCalendarioEl.addEventListener('shown.bs.modal', () => { if (tituloInput) tituloInput.focus(); });
        modalAnotacaoCalendarioEl.addEventListener('hidden.bs.modal', () => { 
            if (conteudoInput && tinymce.get(conteudoInput.id)) {
                tinymce.get(conteudoInput.id).destroy();
                console.log("Editor TinyMCE (Anotação Calendário) destruído.");
            }
        });
        
        if(salvarBtn) {
            salvarBtn.addEventListener('click', function(e) { // Mudado de 'submit' no form para 'click' no botão
                e.preventDefault(); 
                // Validação simples do título
                let isValid = true;
                if (!tituloInput || !tituloInput.value.trim()) {
                    if(tituloInput) tituloInput.classList.add('is-invalid');
                    const feedback = tituloInput ? tituloInput.nextElementSibling : null;
                    if(feedback && feedback.classList.contains('invalid-feedback')) feedback.textContent = "Título é obrigatório.";
                    isValid = false;
                } else {
                    if(tituloInput) tituloInput.classList.remove('is-invalid');
                }
                if (!isValid) return;

                const dadosAnotacao = {
                    id: idInput ? (idInput.value || 'ANOT_CAL_' + new Date().getTime()) : 'ANOT_CAL_' + new Date().getTime(),
                    titulo: tituloInput ? tituloInput.value : 'Sem Título',
                    disciplinaNome: disciplinaSelect ? (disciplinaSelect.value === "Nenhuma" ? "" : disciplinaSelect.value) : "",
                    atividadeVinculadaNome: atividadeSelect ? (atividadeSelect.value === "Nenhuma" ? "" : atividadeSelect.value) : "",
                    conteudo: (conteudoInput && tinymce.get(conteudoInput.id)) ? tinymce.get(conteudoInput.id).getContent() : (conteudoInput ? conteudoInput.value : ""),
                    dataCriacao: new Date().toISOString(),
                    ultimaModificacao: new Date().toISOString()
                };
                console.log("Salvando anotação (do calendário):", dadosAnotacao);
                alert("Anotação salva (simulado)! Verifique o console para os dados.");
                // Aqui você adicionaria a lógica para realmente salvar os dados (ex: localStorage, API)
                // E possivelmente adicionar o evento ao FullCalendar se a anotação tiver data/hora
                bootstrap.Modal.getInstance(modalAnotacaoCalendarioEl).hide();
            });
        }
    }

    // Modal Adicionar Disciplina
    const modalDisciplinaAdicaoEl = document.getElementById('modalDisciplinaAdicaoCalendario');
    if (modalDisciplinaAdicaoEl) {
        const form = modalDisciplinaAdicaoEl.querySelector('#formDisciplinaAdicaoCalendario');
        modalDisciplinaAdicaoEl.addEventListener('show.bs.modal', () => { if (form) form.reset(); });
        if (form) form.addEventListener('submit', (e) => { 
            e.preventDefault(); 
            // Adicionar validação aqui se necessário
            const nomeDisc = modalDisciplinaAdicaoEl.querySelector('#calDisciplinaNome').value;
            console.log("Salvando disciplina (do calendário):", { nome: nomeDisc });
            alert(`Salvar Disciplina: ${nomeDisc} (Lógica Pendente)`); 
            bootstrap.Modal.getInstance(modalDisciplinaAdicaoEl).hide(); 
        });
    }

    // Modal Adicionar Tarefa/Prova
    const modalTarefaAdicaoEl = document.getElementById('modalTarefaAdicaoCalendario');
    if (modalTarefaAdicaoEl) {
        const form = modalTarefaAdicaoEl.querySelector('#formTarefaAdicaoCalendario');
        modalTarefaAdicaoEl.addEventListener('show.bs.modal', () => { 
            if (form) form.reset(); 
            // Lógica para popular select de disciplinas neste modal, se houver
            // const calTarefaDisciplinaSelect = modalTarefaAdicaoEl.querySelector('#idDoSeuSelectDeDisciplinaParaTarefas');
            // if(calTarefaDisciplinaSelect) popularSelect(calTarefaDisciplinaSelect, disciplinasFixasParaModais.filter(d => d !== "Nenhuma"), "");
        });
        if (form) form.addEventListener('submit', (e) => { 
            e.preventDefault(); 
            const tituloTarefa = modalTarefaAdicaoEl.querySelector('#calTarefaTitulo').value;
            console.log("Salvando tarefa/prova (do calendário):", { titulo: tituloTarefa });
            alert(`Salvar Tarefa/Prova: ${tituloTarefa} (Lógica Pendente)`); 
            bootstrap.Modal.getInstance(modalTarefaAdicaoEl).hide(); 
        });
    }
    
    // Modal Detalhes Evento Calendário (<dialog>)
    const modalDetalhesEventoEl = document.getElementById('modalDetalhesEventoCalendario');
    const fecharModalDetalhesEventoBtn = document.getElementById('fecharModalDetalhesEvento');
    const okModalDetalhesEventoBtn = document.getElementById('okModalDetalhesEvento');
    if (fecharModalDetalhesEventoBtn && modalDetalhesEventoEl) fecharModalDetalhesEventoBtn.addEventListener('click', () => modalDetalhesEventoEl.close());
    if (okModalDetalhesEventoBtn && modalDetalhesEventoEl) okModalDetalhesEventoBtn.addEventListener('click', () => modalDetalhesEventoEl.close());
    if (modalDetalhesEventoEl) modalDetalhesEventoEl.addEventListener("click", e => { if (e.target === modalDetalhesEventoEl) modalDetalhesEventoEl.close(); });

    console.log("👍 calendario.js listeners e inicializações configurados.");
}); 

// --- FUNÇÕES GLOBAIS OU NO FINAL DO ARQUIVO (usadas pelo FullCalendar e Modais) ---
function fetchEvents(info, successCallback, failureCallback) {
    let hoje = new Date();
    const mockEvents = [
        { id: 'ev1', title: 'Prova Cálculo', start: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 2).toISOString().split('T')[0], allDay: true, tipo: 'prova', description: 'Capítulos 1 a 3.' },
        { id: 'ev2', title: 'Entrega POO', start: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 5).toISOString().split('T')[0] + 'T14:00:00', end: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 5).toISOString().split('T')[0] + 'T16:00:00', tipo: 'tarefa', description: 'Projeto final da disciplina.' },
        { id: 'ev3', title: 'Reunião TCC', start: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1).toISOString().split('T')[0], allDay: true, tipo: 'reuniao', description: 'Alinhar cronograma.' },
    ];
    setTimeout(() => {
        try {
            const events = mockEvents.map(evt => ({
                id: evt.id, title: evt.title, start: evt.start, end: evt.end || null,
                allDay: evt.allDay || false, classNames: evt.tipo ? ['event-' + evt.tipo.toLowerCase()] : [],
                extendedProps: { description: evt.description, tipo: evt.tipo }
            }));
            successCallback(events);
        } catch (err) { failureCallback(err); }
    }, 200);
}

function openEventModal(eventData) {
    const modalEl = document.getElementById('modalDetalhesEventoCalendario');
    if (!modalEl) { console.warn("Modal #modalDetalhesEventoCalendario não encontrado."); return; }
    const modalTitleEl = modalEl.querySelector('#modalDetalhesEventoLabel');
    const modalBodyEl = modalEl.querySelector('#modalDetalhesEventoConteudo');

    if (modalTitleEl) modalTitleEl.textContent = eventData.id ? `${eventData.title}` : (eventData.title || 'Novo Evento');
    if (modalBodyEl) {
        let content = `<p><strong>Início:</strong> ${eventData.start ? new Date(eventData.start).toLocaleString('pt-BR',{timeZone:'UTC'}) : (eventData.date ? eventData.date : 'N/A')}</p>`;
        if (eventData.end && eventData.start !== eventData.end) content += `<p><strong>Fim:</strong> ${new Date(eventData.end).toLocaleString('pt-BR',{timeZone:'UTC'})}</p>`;
        if (!eventData.id) { 
             content += `<p><strong>Dia Inteiro:</strong> ${eventData.allDay ? 'Sim' : 'Não (horário específico a definir)'}</p>`;
        } else { 
            content += `<p><strong>Dia Inteiro:</strong> ${eventData.allDay ? 'Sim' : 'Não'}</p>`;
        }
        if (eventData.description) content += `<p><strong>Descrição:</strong></p><pre style="white-space: pre-wrap; word-wrap: break-word; font-family: inherit; background-color: #f8f9fa; padding: 0.5rem; border-radius: 4px;">${eventData.description.replace(/\n/g, '<br>')}</pre>`;
        if (eventData.tipo) content += `<p><strong>Tipo:</strong> <span class="badge ${getTipoBadgeClass(eventData.tipo)}">${eventData.tipo.charAt(0).toUpperCase() + eventData.tipo.slice(1)}</span></p>`;
        modalBodyEl.innerHTML = content;
    }
    if (typeof modalEl.showModal === 'function') modalEl.showModal();
}
