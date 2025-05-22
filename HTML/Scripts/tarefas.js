document.addEventListener("DOMContentLoaded", function () {
    // --- SELETORES DE ELEMENTOS ---
    const modalTarefa = document.querySelector("#modalTarefa");
    const abrirModalNovaTarefaBtnOriginal = document.querySelector("#abrirModalNovaTarefa");
    const fecharModalTarefaBtn = document.querySelector("#fecharModalTarefa");
    const cancelarModalTarefaBtn = document.querySelector("#cancelarModalTarefa");
    const formTarefa = document.querySelector("#formTarefa");
    const modalTarefaLabel = document.querySelector("#modalTarefaLabel");

    const tarefaTituloInput = document.getElementById('tarefaTitulo');
    const tarefaDisciplinaSelect = document.getElementById('tarefaDisciplina');
    const tarefaTipoSelect = document.getElementById('tarefaTipo');
    const tarefaDataEntregaInput = document.getElementById('tarefaDataEntrega');
    const tarefaHorarioEntregaInput = document.getElementById('tarefaHorarioEntrega');
    const tarefaStatusSelect = document.getElementById('tarefaStatus');
    const tarefaDescricaoInput = document.getElementById('tarefaDescricao');

    const modalDetalhes = document.querySelector("#modalDetalhesTarefa");
    const fecharModalDetalhesBtn = document.querySelector("#fecharModalDetalhesTarefa");
    const okModalDetalhesBtn = document.querySelector("#okModalDetalhesTarefa");
    const modalDetalhesConteudo = document.querySelector("#modalDetalhesTarefaConteudo");
    const modalDetalhesTarefaLabel = document.querySelector("#modalDetalhesTarefaLabel");
    const listaAnotacoesTarefaUl = document.getElementById('listaAnotacoesTarefa');
    const addAnotacaoTarefaBtn = document.getElementById('addAnotacaoTarefa');
    const gerenciarCompartilhamentoTarefaBtn = document.getElementById('gerenciarCompartilhamentoTarefa');


    let tabelaTarefasDt;
    let resizeDebounceTimer;

    // --- DADOS MOCADOS (Substitua por dados reais da API) ---
    const listaDisciplinas = [
        { id: "ART101", nome: "Fundamentos de Design Gráfico – ART101" },
        { id: "ITD201", nome: "Web Design Avançado – ITD201" },
        { id: "UXD301", nome: "Princípios de UX/UI Design – UXD301" },
        { id: "ANI301", nome: "Técnicas de Animação 3D – ANI301" },
        { id: "HAR202", nome: "História da Arte – HAR202" },
        { id: "PHO110", nome: "Fotografia Digital – PHO110" },
        { id: "CCO200", nome: "Programação Orientada a Objetos – CCO200" },
        { id: "CCO210", nome: "Banco de Dados – CCO210" },
        { id: "CCO300", nome: "Redes de Computadores – CCO300" },
        { id: "CCO401", nome: "Inteligência Artificial – CCO401" },
        { id: "CCO310", nome: "Engenharia de Software – CCO310" },
        { id: "UXD205", nome: "Design de Interação – UXD205" },
        { id: "MKT300", nome: "Marketing Digital – MKT300" },
        { id: "MOB400", nome: "Desenvolvimento Mobile – MOB400" },
        { id: "SEG500", nome: "Segurança da Informação – SEG500" },
    ];

    const listaTarefas = [
        {
            id: "T001",
            titulo: "Estudar para Prova de Fundamentos de Design Gráfico",
            disciplinaId: "ART101",
            tipo: "Prova",
            dataEntrega: "2025-01-25",
            horarioEntrega: "19:30",
            status: "Concluída",
            descricao: "Revisar capítulos 1 a 5 e slides da aula 3. Local: Design Studio A.",
            anotacoesVinculadas: [
                { id: "A001", titulo: "Resumo Cap. 1-2", conteudo: "Principios basicos de design." },
                { id: "A002", titulo: "Dúvidas Prova", conteudo: "Questões sobre cor e tipografia." }
            ]
        },
        {
            id: "T002",
            titulo: "Entregar Projeto de UX/UI Design",
            disciplinaId: "UXD301",
            tipo: "Tarefa",
            dataEntrega: "2025-03-10",
            horarioEntrega: "23:59",
            status: "Agendada",
            descricao: "Finalizar protótipo de alta fidelidade e preparar apresentação. Equipe: João, Maria.",
            anotacoesVinculadas: []
        },
        {
            id: "T003",
            titulo: "Fazer Leitura do Capítulo 3",
            disciplinaId: "CCO200",
            tipo: "Tarefa",
            dataEntrega: "2025-03-05",
            horarioEntrega: "09:00",
            status: "A Fazer",
            descricao: "Ler sobre classes e objetos em POO.",
            anotacoesVinculadas: []
        },
        {
            id: "T004",
            titulo: "Preparar apresentação para a banca",
            disciplinaId: "",
            tipo: "Tarefa",
            dataEntrega: "2025-06-15",
            horarioEntrega: "10:00",
            status: "Em Andamento",
            descricao: "Reunir todos os materiais do TCC e criar slides. Não pertence a uma disciplina específica.",
            anotacoesVinculadas: []
        }
    ];


    // --- FUNÇÕES DE VALIDAÇÃO E FEEDBACK DE ERRO ---
    function displayFieldError(inputElement, message) {
        clearFieldError(inputElement);
        inputElement.classList.add('is-invalid');
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'invalid-feedback d-block';
        inputElement.parentElement.insertBefore(feedbackDiv, inputElement.nextElementSibling);
        feedbackDiv.textContent = message;
    }

    function clearFieldError(inputElement) {
        inputElement.classList.remove('is-invalid');
        const feedbackElement = inputElement.parentElement.querySelector('.invalid-feedback.d-block');
        if (feedbackElement) {
            feedbackElement.remove();
        }
    }

    function validateFormTarefa() {
        let isValid = true;
        const fieldsToValidate = [
            { element: tarefaTituloInput, message: "Por favor, informe o título da tarefa." },
            { element: tarefaTipoSelect, message: "Por favor, selecione o tipo da tarefa." },
            { element: tarefaDataEntregaInput, message: "Por favor, informe a data de entrega." },
            { element: tarefaStatusSelect, message: "Por favor, selecione o status." }
        ];

        fieldsToValidate.forEach(field => {
            clearFieldError(field.element);
            if (!field.element.value || (field.element.value === "" && field.element.tagName === "SELECT")) {
                displayFieldError(field.element, field.message);
                isValid = false;
            }
        });
        return isValid;
    }

    // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS E UI ---
    function popularDisciplinasSelect() {
        if (!tarefaDisciplinaSelect) return;
        while (tarefaDisciplinaSelect.options.length > 1) {
            tarefaDisciplinaSelect.remove(1);
        }
        listaDisciplinas.forEach(disciplina => {
            const option = new Option(disciplina.nome, disciplina.id);
            tarefaDisciplinaSelect.add(option);
        });
    }

    // --- INICIALIZAÇÃO DO DATATABLE ---
    function inicializarDataTable() {
        if (!window.jQuery || !$.fn.DataTable) {
            console.error("jQuery ou DataTables não carregado!");
            return null;
        }

        if ($.fn.DataTable.isDataTable('#tabelaTarefas')) {
            $('#tabelaTarefas').DataTable().destroy();
            $('#tabelaTarefas tbody').empty();
        }

        tabelaTarefasDt = $('#tabelaTarefas').DataTable({
            responsive: {
                details: {
                    type: 'column',
                    target: 0 // A primeira coluna (dtr-control) será o alvo da responsividade
                }
            },
            dom:
                '<"row dt-custom-header align-items-center mb-3"' +
                    '<"col-12 col-md-auto me-md-auto"f>' + // Filtro de busca
                    '<"col-12 col-md-auto dt-buttons-container">' + // Container para botões e filtros customizados
                '>' +
                't' + // Tabela
                '<"row mt-3 align-items-center"' +
                    '<"col-sm-12 col-md-5"i>' + // Info de paginação
                    '<"col-sm-12 col-md-7 dataTables_paginate_wrapper"p>' + // Paginação
                '>',
            paging: false,
            scrollY: '450px',
            scrollCollapse: true,
            lengthChange: false,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json',
                search: "",
                searchPlaceholder: "Buscar tarefas...",
                info: "Total de _TOTAL_ tarefas",
                infoEmpty: "Nenhuma tarefa encontrada",
                infoFiltered: "(filtrado de _MAX_ tarefas)",
                paginate: {
                    first: "Primeiro",
                    last: "Último",
                    next: "Próximo",
                    previous: "Anterior"
                }
            },
            columnDefs: [
                // Nova coluna para o controle responsivo (+/-)
                { orderable: false, className: 'dtr-control', targets: 0 },
                // Colunas de dados
                { responsivePriority: 1, targets: 1 }, // Título da Tarefa
                { responsivePriority: 1, targets: 2 }, // Disciplina (Alta prioridade para sempre mostrar)
                { responsivePriority: 2, targets: 3 }, // Tipo
                { responsivePriority: 3, targets: 4 }, // Data de Entrega
                { responsivePriority: 4, targets: 5 }, // Status
                // Coluna de Ações (não deve ser o alvo da responsividade e sempre visível)
                { orderable: false, className: "dt-actions-column no-export", targets: -1, responsivePriority: 10000 } // Garante que Ações esteja sempre visível
            ],
            data: listaTarefas.map(tarefa => {
                const disciplinaNome = listaDisciplinas.find(d => d.id === tarefa.disciplinaId)?.nome || '-';
                const dataHoraFormatada = formatarDataHoraParaTabela(tarefa.dataEntrega, tarefa.horarioEntrega);
                const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(tarefa.status)}">${tarefa.status}</span>`;
                const tipoBadgeHtml = `<span class="badge ${getTipoBadgeClass(tarefa.tipo)}">${tarefa.tipo}</span>`;

                const dropdownHtml = `
                    <div class="dropdown">
                        <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da tarefa" data-bs-popper-boundary="window">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item btn-detalhar-tarefa" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-eye me-2"></i>Detalhar Tarefa</a></li>
                            <li><a class="dropdown-item btn-marcar-concluida" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-check-circle me-2"></i>Marcar Concluída</a></li>
                            <li><a class="dropdown-item btn-marcar-pendente" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-arrow-counterclockwise me-2"></i>Marcar Pendente</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item btn-edit-tarefa" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-pencil-square me-2"></i>Editar Tarefa</a></li>
                            <li><a class="dropdown-item btn-remover-tarefa text-danger" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-trash me-2"></i>Remover Tarefa</a></li>
                        </ul>
                    </div>`;

                return [
                    '', // Coluna para o dtr-control
                    tarefa.titulo,
                    disciplinaNome,
                    tipoBadgeHtml,
                    dataHoraFormatada,
                    statusBadgeHtml,
                    dropdownHtml
                ];
            }),
            initComplete: function (settings, json) {
                const api = this.api();
                const searchInput = $('#tabelaTarefas_filter input');
                searchInput.addClass('form-control form-control-sm').attr('aria-label', 'Buscar tarefas na tabela');
                $('#tabelaTarefas_filter label').contents().filter(function() {
                    return this.nodeType === 3;
                }).remove();

                const buttonsContainer = $('.dt-buttons-container');
                if (abrirModalNovaTarefaBtnOriginal && buttonsContainer.length) {
                    if($('#abrirModalNovaTarefaDt').length === 0) {
                        const abrirModalNovaTarefaBtnClone = abrirModalNovaTarefaBtnOriginal.cloneNode(true);
                        abrirModalNovaTarefaBtnClone.id = 'abrirModalNovaTarefaDt';
                        $(abrirModalNovaTarefaBtnClone).off('click').on('click', (e) => {
                            e.preventDefault();
                            abrirModalFormTarefa();
                        });
                        buttonsContainer.append(abrirModalNovaTarefaBtnClone);
                    }
                    abrirModalNovaTarefaBtnOriginal.style.display = 'none';
                }

                // --- Adicionar filtros customizados (Tipo e Disciplina) ---
                const filterHtml = `
                    <select id="filterTipoTarefa" class="form-select dt-filter-select">
                        <option value="">Todos os Tipos</option>
                        <option value="Tarefa">Tarefa</option>
                        <option value="Prova">Prova</option>
                    </select>
                    <select id="filterDisciplina" class="form-select dt-filter-select">
                        <option value="">Todas as Disciplinas</option>
                        </select>`;

                buttonsContainer.prepend(filterHtml);

                const filterDisciplinaSelect = $('#filterDisciplina');
                listaDisciplinas.forEach(disciplina => {
                    filterDisciplinaSelect.append(new Option(disciplina.nome, disciplina.nome));
                });

                $('#filterTipoTarefa').on('change', function() {
                    const tipo = $(this).val();
                    api.column(3).search(tipo ? '^' + tipo + '$' : '', true, false).draw();
                });

                $('#filterDisciplina').on('change', function() {
                    const disciplina = $(this).val();
                    api.column(2).search(disciplina ? '^' + disciplina + '$' : '', true, false).draw();
                });
                // --- Fim dos filtros customizados ---

                // Armazenar dados completos no TR (para detalhes e edições)
                $('#tabelaTarefas tbody tr').each(function(index) {
                    const rowData = listaTarefas[index];
                    $(this).data('completo', rowData);
                });

                // --- Lógica para mover o dropdown ao abrir/fechar ---
                $('#tabelaTarefas tbody').off('show.bs.dropdown hide.bs.dropdown');
                $('body').off('show.bs.dropdown hide.bs.dropdown', '.dropdown-menu');

                $('#tabelaTarefas tbody').on('show.bs.dropdown', '.dropdown', function (e) {
                    const $dropdown = $(this);
                    const $dropdownMenu = $dropdown.find('.dropdown-menu');

                    $dropdownMenu.data('bs-dropdown-original-parent', $dropdown);
                    $dropdownMenu.data('bs-dropdown-toggle-button', $(e.target));
                    $dropdownMenu.appendTo('body');

                    const bsDropdown = bootstrap.Dropdown.getInstance(e.target);
                    if (bsDropdown && bsDropdown._popper) {
                        bsDropdown._popper.update();
                    }
                });

                $('body').on('hide.bs.dropdown', '.dropdown-menu', function (e) {
                    const $dropdownMenu = $(this);
                    const $originalParent = $dropdownMenu.data('bs-dropdown-original-parent');

                    if ($originalParent && !$dropdownMenu.parent().is($originalParent)) {
                        $dropdownMenu.prependTo($originalParent);
                        $dropdownMenu.removeData('bs-dropdown-original-parent');
                        $dropdownMenu.removeData('bs-dropdown-toggle-button');
                    }
                });
                // --- FIM Lógica para mover o dropdown ---
            }
        });

        $(window).off('resize.dtTarefasGlobal').on('resize.dtTarefasGlobal', function () {
            clearTimeout(resizeDebounceTimer);
            resizeDebounceTimer = setTimeout(function () {
                if (tabelaTarefasDt) {
                    tabelaTarefasDt.columns.adjust().responsive.recalc();
                }
            }, 250);
        });

        return tabelaTarefasDt;
    }


    // --- GERENCIAMENTO DO MODAL DE ADICIONAR/EDITAR TAREFA ---
    function abrirModalFormTarefa(isEditMode = false, dadosTarefa = null, targetTr = null) {
        formTarefa.reset();
        const fieldsToClearValidation = [
            tarefaTituloInput, tarefaDisciplinaSelect, tarefaTipoSelect, tarefaDataEntregaInput,
            tarefaHorarioEntregaInput, tarefaStatusSelect, tarefaDescricaoInput
        ];
        fieldsToClearValidation.forEach(clearFieldError);

        delete formTarefa.dataset.tarefaId;
        delete formTarefa.dataset.rowIndex;

        popularDisciplinasSelect();

        modalTarefaLabel.textContent = isEditMode ? "Editar Tarefa" : "Adicionar Tarefa";

        if (isEditMode && dadosTarefa) {
            tarefaTituloInput.value = dadosTarefa.titulo || '';
            tarefaDisciplinaSelect.value = dadosTarefa.disciplinaId || '';
            tarefaTipoSelect.value = dadosTarefa.tipo || '';
            tarefaDataEntregaInput.value = dadosTarefa.dataEntrega || '';
            tarefaHorarioEntregaInput.value = dadosTarefa.horarioEntrega || '';
            tarefaStatusSelect.value = dadosTarefa.status || 'A Fazer';
            tarefaDescricaoInput.value = dadosTarefa.descricao || '';

            formTarefa.dataset.tarefaId = dadosTarefa.id;
            if (tabelaTarefasDt && targetTr) {
                formTarefa.dataset.rowIndex = tabelaTarefasDt.row(targetTr).index();
            }
        } else {
            tarefaDisciplinaSelect.value = "";
            tarefaTipoSelect.value = "";
            tarefaStatusSelect.value = "A Fazer";
        }

        if (modalTarefa && typeof modalTarefa.showModal === 'function') {
            modalTarefa.showModal();
        } else if (window.bootstrap && modalTarefa) {
             const bsModal = bootstrap.Modal.getInstance(modalTarefa) || new bootstrap.Modal(modalTarefa);
             bsModal.show();
        } else {
            console.error("modalTarefa não é um elemento <dialog> válido ou Bootstrap Modal não está disponível.");
        }
    }

    function fecharModalFormTarefa() {
        if (modalTarefa && typeof modalTarefa.close === 'function') {
             modalTarefa.close();
        } else if (window.bootstrap && modalTarefa) {
            const bsModal = bootstrap.Modal.getInstance(modalTarefa);
            if (bsModal) bsModal.hide();
        }

        formTarefa.reset();
        const fieldsToClearValidation = [
            tarefaTituloInput, tarefaDisciplinaSelect, tarefaTipoSelect, tarefaDataEntregaInput,
            tarefaHorarioEntregaInput, tarefaStatusSelect, tarefaDescricaoInput
        ];
        fieldsToClearValidation.forEach(clearFieldError);
        delete formTarefa.dataset.tarefaId;
        delete formTarefa.dataset.rowIndex;
    }

    if (fecharModalTarefaBtn) fecharModalTarefaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormTarefa(); });
    if (cancelarModalTarefaBtn) cancelarModalTarefaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormTarefa(); });
    if (modalTarefa) modalTarefa.addEventListener("click", e => {
        if (e.target === modalTarefa && typeof modalTarefa.close === 'function') {
            fecharModalFormTarefa();
        }
    });

    // --- GERENCIAMENTO DO MODAL DE DETALHES DA TAREFA ---
    function abrirModalDeDetalhesTarefa(dadosCompletosTarefa) {
        if (!modalDetalhes || !modalDetalhesConteudo || !modalDetalhesTarefaLabel) {
            console.error("Elementos do modal de detalhes da tarefa não encontrados.");
            return;
        }

        modalDetalhesTarefaLabel.textContent = "Detalhes da Tarefa";

        const disciplinaNome = listaDisciplinas.find(d => d.id === dadosCompletosTarefa.disciplinaId)?.nome || 'N/A';
        const dataHoraFormatada = formatarDataHoraParaTabela(dadosCompletosTarefa.dataEntrega, dadosCompletosTarefa.horarioEntrega);
        const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(dadosCompletosTarefa.status)}">${dadosCompletosTarefa.status}</span>`;
        const tipoBadgeHtml = `<span class="badge ${getTipoBadgeClass(dadosCompletosTarefa.tipo)}">${dadosCompletosTarefa.tipo}</span>`;

        let anotacoesHtml = `<li class="list-group-item">Nenhuma anotação vinculada.</li>`;
        if (dadosCompletosTarefa.anotacoesVinculadas && dadosCompletosTarefa.anotacoesVinculadas.length > 0) {
            anotacoesHtml = dadosCompletosTarefa.anotacoesVinculadas.map(anotacao => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${anotacao.titulo}
                    <button class="btn btn-sm btn-outline-secondary" data-anotacao-id="${anotacao.id}">Ver Anotação</button>
                </li>
            `).join('');
        }

        modalDetalhesConteudo.innerHTML = `
            <dl class="row mb-3">
                <dt class="col-sm-4">Título:</dt>
                <dd class="col-sm-8">${dadosCompletosTarefa.titulo || '-'}</dd>

                <dt class="col-sm-4">Disciplina:</dt>
                <dd class="col-sm-8">${disciplinaNome}</dd>

                <dt class="col-sm-4">Tipo:</dt>
                <dd class="col-sm-8">${tipoBadgeHtml}</dd>

                <dt class="col-sm-4">Data & Horário:</dt>
                <dd class="col-sm-8">${dataHoraFormatada}</dd>

                <dt class="col-sm-4">Status:</dt>
                <dd class="col-sm-8">${statusBadgeHtml}</dd>

                ${dadosCompletosTarefa.descricao ? `
                <dt class="col-sm-12 mt-3">Descrição:</dt>
                <dd class="col-sm-12"><pre>${dadosCompletosTarefa.descricao.replace(/\n/g, '<br>')}</pre></dd>
                ` : ''}
            </dl>
            <hr>
            <h6>Anotações Vinculadas</h6>
            <ul id="listaAnotacoesTarefa" class="list-group list-group-flush">
                ${anotacoesHtml}
            </ul>
            <button class="btn btn-sm btn-primary mt-3" id="addAnotacaoTarefaFromDetails">Adicionar Anotação</button>
            <hr>
            <h6>Compartilhamento</h6>
            <p>Permite gerenciar quem colabora nesta tarefa e suas permissões.</p>
            <button class="btn btn-sm btn-info mt-2" id="gerenciarCompartilhamentoTarefaFromDetails">Gerenciar Compartilhamento</button>
        `;

        $('#addAnotacaoTarefaFromDetails').off('click').on('click', function() {
            alert(`Funcionalidade: Abrir modal de nova anotação pré-preenchido com vínculo à Tarefa: ${dadosCompletosTarefa.titulo}`);
        });
        $('#gerenciarCompartilhamentoTarefaFromDetails').off('click').on('click', function() {
            alert(`Funcionalidade: Abrir tela/modal de gerenciamento de compartilhamento para a Tarefa: ${dadosCompletosTarefa.titulo}`);
        });

        if (modalDetalhes && typeof modalDetalhes.showModal === 'function') modalDetalhes.showModal();
        else if (window.bootstrap && modalDetalhes) {
            const bsModal = bootstrap.Modal.getInstance(modalDetalhes) || new bootstrap.Modal(modalDetalhes);
            bsModal.show();
        }
    }

    function fecharModalDeDetalhesTarefa() {
        if (modalDetalhes && typeof modalDetalhes.close === 'function') modalDetalhes.close();
        else if (window.bootstrap && modalDetalhes) {
            const bsModal = bootstrap.Modal.getInstance(modalDetalhes);
            if (bsModal) bsModal.hide();
        }
    }

    if (fecharModalDetalhesBtn) { fecharModalDetalhesBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhesTarefa(); }); }
    if (okModalDetalhesBtn) { okModalDetalhesBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhesTarefa(); }); }
    if (modalDetalhes) modalDetalhes.addEventListener("click", e => {
        if (e.target === modalDetalhes && typeof modalDetalhes.close === 'function') {
            fecharModalDeDetalhesTarefa();
        }
    });

    // --- AÇÕES NA TABELA (Botões de Ação no Dropdown) ---
    $('body').on('click', '.btn-detalhar-tarefa, .btn-marcar-concluida, .btn-marcar-pendente, .btn-edit-tarefa, .btn-remover-tarefa', function (e) {
        e.preventDefault();

        const $clickedItem = $(this);
        const $dropdownMenu = $clickedItem.closest('.dropdown-menu');
        const $originalButton = $dropdownMenu.data('bs-dropdown-toggle-button');

        const hideDropdown = () => {
            if ($originalButton && $originalButton.length > 0 && window.bootstrap) {
                const dropdownInstance = bootstrap.Dropdown.getInstance($originalButton[0]);
                if (dropdownInstance) {
                    dropdownInstance.hide();
                }
            }
        };

        let trElement = $originalButton ? $originalButton.closest('tr')[0] : null;

        if (!tabelaTarefasDt || !trElement) {
            console.error("Ação na Tabela: DataTables não inicializado ou trElement não encontrado.");
            hideDropdown();
            return;
        }

        const row = tabelaTarefasDt.row(trElement);
        if (!row || !row.length || !row.node()) {
            console.error("Ação na Tabela: Linha do DataTables não encontrada para o trElement:", trElement);
            hideDropdown();
            return;
        }

        const rowDataArray = row.data();
        const dadosCompletosArmazenados = $(trElement).data('completo');

        if ($clickedItem.hasClass('btn-detalhar-tarefa')) {
            if (!dadosCompletosArmazenados) {
                alert("Erro: Dados insuficientes para detalhar a tarefa.");
            } else {
                abrirModalDeDetalhesTarefa(dadosCompletosArmazenados);
            }
        } else if ($clickedItem.hasClass('btn-marcar-concluida')) {
            if (!dadosCompletosArmazenados) {
                alert("Erro: Não foi possível obter os dados completos da tarefa.");
            } else if (dadosCompletosArmazenados.status === 'Concluída') {
                alert("Esta tarefa já está marcada como concluída.");
            } else {
                dadosCompletosArmazenados.status = 'Concluída';
                $(trElement).data('completo', dadosCompletosArmazenados);
                rowDataArray[5] = `<span class="badge ${getStatusBadgeClass('Concluída')}">Concluída</span>`;
                row.data(rowDataArray).draw(false);
                alert("Tarefa marcada como concluída!");
            }
        } else if ($clickedItem.hasClass('btn-marcar-pendente')) {
            if (!dadosCompletosArmazenados) {
                alert("Erro: Não foi possível obter os dados completos da tarefa.");
            } else if (dadosCompletosArmazenados.status === 'A Fazer') {
                alert("Esta tarefa já está 'A Fazer'.");
            } else {
                dadosCompletosArmazenados.status = 'A Fazer';
                $(trElement).data('completo', dadosCompletosArmazenados);
                rowDataArray[5] = `<span class="badge ${getStatusBadgeClass('A Fazer')}">A Fazer</span>`;
                row.data(rowDataArray).draw(false);
                alert("Tarefa marcada como 'A Fazer'!");
            }
        } else if ($clickedItem.hasClass('btn-edit-tarefa')) {
            if (!dadosCompletosArmazenados) {
                alert("Erro: Não foi possível obter os dados completos da tarefa para edição.");
            } else {
                abrirModalFormTarefa(true, dadosCompletosArmazenados, trElement);
            }
        } else if ($clickedItem.hasClass('btn-remover-tarefa')) {
            const tituloTarefa = dadosCompletosArmazenados ? dadosCompletosArmazenados.titulo : "esta tarefa";
            if (confirm(`Tem certeza que deseja remover a tarefa "${tituloTarefa}"?`)) {
                row.remove().draw(false);
                alert("Tarefa removida com sucesso!");
            }
        }

        hideDropdown();
    });


    // --- SUBMIT DO FORMULÁRIO DE TAREFA ---
    if (formTarefa) {
        formTarefa.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!validateFormTarefa()) {
                console.warn("Formulário de tarefa inválido.");
                return;
            }

            if (!tabelaTarefasDt) {
                console.error("DataTables não inicializado.");
                return;
            }

            const tarefaId = formTarefa.dataset.tarefaId || 'newID-' + new Date().getTime();
            const rowIndex = formTarefa.dataset.rowIndex !== undefined ? parseInt(formTarefa.dataset.rowIndex) : undefined;

            const disciplinaSelecionadaObj = listaDisciplinas.find(d => d.id === tarefaDisciplinaSelect.value);

            const dadosCompletosTarefa = {
                id: tarefaId,
                titulo: tarefaTituloInput.value.trim(),
                disciplinaId: tarefaDisciplinaSelect.value || '',
                disciplinaNome: disciplinaSelecionadaObj ? disciplinaSelecionadaObj.nome : '',
                tipo: tarefaTipoSelect.value,
                dataEntrega: tarefaDataEntregaInput.value,
                horarioEntrega: tarefaHorarioEntregaInput.value || '',
                status: tarefaStatusSelect.value,
                descricao: tarefaDescricaoInput.value.trim(),
                anotacoesVinculadas: []
            };

            const dataHoraFormatadaParaTabela = formatarDataHoraParaTabela(dadosCompletosTarefa.dataEntrega, dadosCompletosTarefa.horarioEntrega);
            const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(dadosCompletosTarefa.status)}">${dadosCompletosTarefa.status}</span>`;
            const tipoBadgeHtml = `<span class="badge ${getTipoBadgeClass(dadosCompletosTarefa.tipo)}">${dadosCompletosTarefa.tipo}</span>`;

            const dropdownHtml = `
                <div class="dropdown">
                    <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da tarefa" data-bs-popper-boundary="window">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item btn-detalhar-tarefa" href="#" data-tarefa-id="${tarefaId}"><i class="bi bi-eye me-2"></i>Detalhar Tarefa</a></li>
                        <li><a class="dropdown-item btn-marcar-concluida" href="#" data-tarefa-id="${tarefaId}"><i class="bi bi-check-circle me-2"></i>Marcar Concluída</a></li>
                        <li><a class="dropdown-item btn-marcar-pendente" href="#" data-tarefa-id="${tarefaId}"><i class="bi bi-arrow-counterclockwise me-2"></i>Marcar Pendente</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item btn-edit-tarefa" href="#" data-tarefa-id="${tarefaId}"><i class="bi bi-pencil-square me-2"></i>Editar Tarefa</a></li>
                        <li><a class="dropdown-item btn-remover-tarefa text-danger" href="#" data-tarefa-id="${tarefaId}"><i class="bi bi-trash me-2"></i>Remover Tarefa</a></li>
                    </ul>
                </div>`;

            const dadosLinhaTabela = [
                '', // Coluna para o dtr-control
                dadosCompletosTarefa.titulo,
                dadosCompletosTarefa.disciplinaNome,
                tipoBadgeHtml,
                dataHoraFormatadaParaTabela,
                statusBadgeHtml,
                dropdownHtml
            ];

            let targetRowNode;

            if (tarefaId && rowIndex !== undefined && tabelaTarefasDt.row(rowIndex).node()) {
                targetRowNode = tabelaTarefasDt.row(rowIndex).data(dadosLinhaTabela).draw(false).node();
                const indexLista = listaTarefas.findIndex(t => t.id === tarefaId);
                if(indexLista !== -1) {
                    listaTarefas[indexLista] = dadosCompletosTarefa;
                }
                alert("Tarefa atualizada com sucesso!");
            } else {
                targetRowNode = tabelaTarefasDt.row.add(dadosLinhaTabela).draw(false).node();
                listaTarefas.push(dadosCompletosTarefa);
                alert("Tarefa adicionada com sucesso!");
            }

            if (targetRowNode) {
                $(targetRowNode).data('completo', dadosCompletosTarefa);
            } else {
                console.error("FORM SUBMIT: targetRowNode não foi definido. Dados 'completo' não foram armazenados.");
            }

            fecharModalFormTarefa();
            if (tabelaTarefasDt) tabelaTarefasDt.columns.adjust().responsive.recalc();
        });
    }

    // --- FUNÇÕES AUXILIARES DE FORMATAÇÃO E ESTILO ---
    function formatarDataHoraParaTabela(dataStr, horaStr) {
        let formatted = '';
        if (dataStr) {
            const [year, month, day] = dataStr.split('-');
            const dataObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
            const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
            formatted = `${dataObj.getUTCDate()} ${meses[dataObj.getUTCMonth()]} ${dataObj.getUTCFullYear()}`;
        }

        if (horaStr) {
            const [hour, minute] = horaStr.split(':');
            let h = parseInt(hour);
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            h = h ? h : 12;
            const formattedTime = `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
            formatted = formatted ? `${formatted}, ${formattedTime}` : formattedTime;
        }
        return formatted || '-';
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Concluída': return 'bg-success-subtle text-success';
            case 'Agendada':
            case 'Em Andamento': return 'bg-info-subtle text-info';
            case 'A Fazer': return 'bg-warning-subtle text-warning';
            case 'Atrasada':
            case 'Cancelada': return 'bg-danger-subtle text-danger';
            default: return 'bg-secondary-subtle text-secondary';
        }
    }

    function getTipoBadgeClass(tipo) {
        switch (tipo) {
            case 'Prova': return 'bg-warning-subtle text-warning';
            case 'Tarefa': return 'bg-primary-subtle text-primary';
            default: return 'bg-light-subtle text-dark';
        }
    }


    // --- INICIALIZAÇÕES FINAIS ---
    popularDisciplinasSelect();
    inicializarDataTable();
});
