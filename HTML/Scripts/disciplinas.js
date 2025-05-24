document.addEventListener("DOMContentLoaded", function () {
    // --- ELEMENT SELECTORS ---
    const modalDisciplina = document.querySelector("#modalDisciplina");
    const abrirModalNovaDisciplinaBtnOriginal = document.querySelector("#abrirModalNovaDisciplina");
    const fecharModalDisciplinaBtn = document.querySelector("#fecharModalDisciplina");
    const cancelarModalDisciplinaBtn = document.querySelector("#cancelarModalDisciplina");
    const formDisciplina = document.querySelector("#formDisciplina");
    const modalDisciplinaLabel = document.querySelector("#modalDisciplinaLabel");

    const disciplinaIdInput = document.getElementById('disciplinaId');
    const disciplinaNomeInput = document.getElementById('disciplinaNome');
    const disciplinaProfessorInput = document.getElementById('disciplinaProfessor');
    const disciplinaDescricaoInput = document.getElementById('disciplinaDescricao');
    const disciplinaPeriodoSelect = document.getElementById('disciplinaPeriodo');
    const disciplinaStatusSelect = document.getElementById('disciplinaStatus');
    const disciplinaDiasInput = document.getElementById('disciplinaDias');
    const disciplinaHorarioInicioInput = document.getElementById('disciplinaHorarioInicio');
    const disciplinaHorarioFimInput = document.getElementById('disciplinaHorarioFim');
    const disciplinaLocalInput = document.getElementById('disciplinaLocal');
    const disciplinaDataCriacaoInput = document.getElementById('disciplinaDataCriacao');

    // Details Modal Selectors
    const modalDetalhesDisciplina = document.querySelector("#modalDetalhesDisciplina");
    const fecharModalDetalhesDisciplinaBtn = document.querySelector("#fecharModalDetalhesDisciplina");
    const okModalDetalhesDisciplinaBtn = document.querySelector("#okModalDetalhesDisciplina");
    const modalDetalhesDisciplinaConteudo = document.querySelector("#modalDetalhesDisciplinaConteudo");
    const modalDetalhesDisciplinaLabel = document.querySelector("#modalDetalhesDisciplinaLabel");
    const addTarefaFromDisciplinaBtn = document.getElementById('addTarefaFromDisciplina');
    const addAnotacaoFromDisciplinaBtn = document.getElementById('addAnotacaoFromDisciplina');


    let tabelaDisciplinasDt;
    let resizeDebounceTimer;

    // --- DADOS MOCADOS (Substitua por dados reais da API) ---
    const listaDisciplinas = [
        {
            id: "ITD201", nome: "Web Design Avançado – ITD201", professor: "Prof. João Paulo",
            descricao: "Estudo aprofundado em design responsivo e frameworks.", periodo: "2024.1", status: "Ativa", dataCriacao: "2024-02-01",
            dias: "Seg, Qua, Sex", horarioInicio: "08:00", horarioFim: "10:00", local: "Sala B12"
        },
        {
            id: "ART101", nome: "Fundamentos de Design Gráfico – ART101", professor: "Prof. Jango",
            descricao: "Introdução aos princípios fundamentais do design.", periodo: "2024.1", status: "Ativa", dataCriacao: "2024-02-05",
            dias: "Ter, Qui", horarioInicio: "10:30", horarioFim: "12:00", local: "Estúdio C"
        },
        {
            id: "UXD301", nome: "Princípios de UX/UI Design – UXD301", professor: "Prof. Jason",
            descricao: "Conceitos e práticas para criação de interfaces amigáveis.", periodo: "2024.2", status: "Ativa", dataCriacao: "2024-07-10",
            dias: "Seg, Qua", horarioInicio: "14:00", horarioFim: "15:30", local: "Laboratório UX"
        },
        {
            id: "ANI301", nome: "Técnicas de Animação 3D – ANI301", professor: "Prof. Pryzado",
            descricao: "Desenvolvimento de animações tridimensionais avançadas.", periodo: "2024.2", status: "Em Andamento", dataCriacao: "2024-08-01",
            dias: "Sex", horarioInicio: "09:00", horarioFim: "12:00", local: "Estúdio de Animação"
        },
        {
            id: "HAR202", nome: "História da Arte – HAR202", professor: "Prof. Olivia",
            descricao: "Períodos e movimentos artísticos desde a antiguidade.", periodo: "2024.1", status: "Concluída", dataCriacao: "2024-01-15",
            dias: "Qua", horarioInicio: "16:00", horarioFim: "17:30", local: "Auditório B"
        },
        {
            id: "PHO110", nome: "Fotografia Digital – PHO110", professor: "Prof. Lucas",
            descricao: "Fundamentos e técnicas de fotografia digital moderna.", periodo: "2024.2", status: "Ativa", dataCriacao: "2024-07-20",
            dias: "Ter", horarioInicio: "13:30", horarioFim: "15:00", local: "Estúdio Foto 1"
        },
        {
            id: "CCO200", nome: "Programação Orientada a Objetos – CCO200", professor: "Prof. Ana",
            descricao: "Conceitos e aplicação de POO em Java.", periodo: "2024.1", status: "Concluída", dataCriacao: "2024-02-10",
            dias: "Seg, Qua", horarioInicio: "10:30", horarioFim: "12:00", local: "Lab C05"
        },
        {
            id: "CCO210", nome: "Banco de Dados – CCO210", professor: "Prof. Carlos",
            descricao: "Modelagem e gerenciamento de sistemas de banco de dados.", periodo: "2024.2", status: "Ativa", dataCriacao: "2024-07-01",
            dias: "Ter, Qui", horarioInicio: "08:00", horarioFim: "09:30", local: "Lab C06"
        },
        {
            id: "CCO300", nome: "Redes de Computadores – CCO300", professor: "Prof. Beatriz",
            descricao: "Fundamentos de redes de computadores e protocolos.", periodo: "2024.1", status: "Ativa", dataCriacao: "2024-03-01",
            dias: "Seg, Sex", horarioInicio: "13:00", horarioFim: "14:30", local: "Lab Redes A"
        },
        {
            id: "CCO401", nome: "Inteligência Artificial – CCO401", professor: "Prof. Eduardo",
            descricao: "Introdução aos conceitos e aplicações de IA.", periodo: "2025.1", status: "Agendada", dataCriacao: "2025-01-01",
            dias: "Qua", horarioInicio: "14:00", horarioFim: "17:00", local: "Lab IA"
        },
        {
            id: "CCO310", nome: "Engenharia de Software – CCO310", professor: "Prof. Fernanda",
            descricao: "Metodologias e práticas para desenvolvimento de software.", periodo: "2025.1", status: "Agendada", dataCriacao: "2025-01-05",
            dias: "Ter, Qui", horarioInicio: "10:00", horarioFim: "11:30", local: "Sala C10"
        },
        {
            id: "UXD205", nome: "Design de Interação – UXD205", professor: "Prof. Gustavo",
            descricao: "Design de interação e usabilidade em sistemas digitais.", periodo: "2025.1", status: "Agendada", dataCriacao: "2025-01-10",
            dias: "Seg, Sex", horarioInicio: "16:00", horarioFim: "17:30", local: "Estúdio UX 2"
        },
        {
            id: "MKT300", nome: "Marketing Digital – MKT300", professor: "Prof. Helena",
            descricao: "Estratégias de marketing no ambiente digital.", periodo: "2024.2", status: "Concluída", dataCriacao: "2024-07-15",
            dias: "Ter", horarioInicio: "18:30", horarioFim: "21:30", local: "Sala Online MKT"
        },
        {
            id: "MOB400", nome: "Desenvolvimento Mobile – MOB400", professor: "Prof. Igor",
            descricao: "Desenvolvimento de aplicações para plataformas móveis.", periodo: "2025.1", status: "Agendada", dataCriacao: "2025-01-20",
            dias: "Qui", horarioInicio: "19:00", horarioFim: "22:00", local: "Lab Mobile Dev"
        },
        {
            id: "SEG500", nome: "Segurança da Informação – SEG500", professor: "Prof. Juliana",
            descricao: "Princípios e tecnologias de segurança da informação.", periodo: "2025.1", status: "Agendada", dataCriacao: "2025-01-25",
            dias: "Seg, Qua", horarioInicio: "08:30", horarioFim: "10:00", local: "Sala B08"
        }
    ];

    // --- Dados mockados de Tarefas e Anotações (simplificados para o contexto da Disciplina) ---
    // Estes dados seriam filtrados para a disciplina específica no modal
    const listaTarefasMock = [
        { id: "T001", titulo: "Estudar para Prova de Design Gráfico", disciplinaId: "ART101", tipo: "Prova", dataEntrega: "2025-01-25", status: "Concluída", horarioEntrega: "19:30" },
        { id: "T002", titulo: "Projeto de UX/UI", disciplinaId: "UXD301", tipo: "Trabalho", dataEntrega: "2025-03-10", status: "Agendada", horarioEntrega: "23:59" },
        { id: "T003", titulo: "Leitura Cap. 3 POO", disciplinaId: "CCO200", tipo: "Leitura", dataEntrega: "2025-03-05", status: "A Fazer", horarioEntrega: "09:00" },
        { id: "T005", titulo: "Exercícios de Redes", disciplinaId: "CCO300", tipo: "Tarefa", dataEntrega: "2025-04-01", status: "Em Andamento", horarioEntrega: "15:00" },
        { id: "T006", titulo: "Preparar Seminário IA", disciplinaId: "CCO401", tipo: "Trabalho", dataEntrega: "2025-06-01", status: "Agendada", horarioEntrega: "10:00" },
    ];

    const listaAnotacoesMock = [
        { id: "A001", titulo: "Resumo Cap. 1-2 DG", disciplinaId: "ART101", idTarefa: null, conteudo: "Notas sobre conceitos de design." },
        { id: "A002", titulo: "Ideias para Projeto UX", disciplinaId: "UXD301", idTarefa: "T002", conteudo: "Brainstorming para funcionalidades do app." },
        { id: "A003", titulo: "Conceitos de Banco de Dados", disciplinaId: "CCO210", idTarefa: null, conteudo: "Definições de normalização." },
        { id: "A004", titulo: "Dicas de Render 3D", disciplinaId: "ANI301", idTarefa: null, conteudo: "Melhores softwares e técnicas de iluminação." },
    ];


    // --- VALIDATION AND ERROR FEEDBACK FUNCTIONS ---
    function displayFieldError(inputElement, message) {
        clearFieldError(inputElement);
        inputElement.classList.add('is-invalid');
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'invalid-feedback d-block';
        feedbackDiv.textContent = message;
        const parent = inputElement.closest('.mb-3, .col-sm-6') || inputElement.parentNode;
        if (parent) {
             parent.insertBefore(feedbackDiv, inputElement.nextElementSibling);
        } else if (inputElement.parentNode) {
            inputElement.parentNode.insertBefore(feedbackDiv, inputElement.nextElementSibling);
        }
    }

    function clearFieldError(inputElement) {
        inputElement.classList.remove('is-invalid');
        const parent = inputElement.closest('.mb-3, .col-sm-6') || inputElement.parentNode;
        if (parent) {
            const feedbackElement = parent.querySelector('.invalid-feedback.d-block');
            if (feedbackElement) {
                feedbackElement.remove();
            }
        } else if (inputElement.parentNode) {
            const feedbackElement = inputElement.parentNode.querySelector('.invalid-feedback.d-block');
            if (feedbackElement) feedbackElement.remove();
        }
    }

    function validateFormDisciplina() {
        let isValid = true;
        const fieldsToValidate = [
            { element: disciplinaNomeInput, message: "Por favor, informe o nome da disciplina." },
            { element: disciplinaPeriodoSelect, message: "Por favor, selecione o período." },
            { element: disciplinaStatusSelect, message: "Por favor, selecione o status." },
            { element: disciplinaDiasInput, message: "Por favor, informe os dias da semana." },
            { element: disciplinaHorarioInicioInput, message: "Por favor, informe o horário de início." },
            { element: disciplinaHorarioFimInput, message: "Por favor, informe o horário de fim." },
            { element: disciplinaLocalInput, message: "Por favor, informe o local da disciplina." }
        ];

        fieldsToValidate.forEach(field => {
            if (!field.element) {
                console.warn("ValidateFormDisciplina: Elemento não encontrado para validação", field);
                return;
            }
            clearFieldError(field.element);
            if (!field.element.value || field.element.value.trim() === "" || (field.element.value === "" && field.element.tagName === "SELECT")) {
                displayFieldError(field.element, field.message);
                isValid = false;
            }
        });

        if (disciplinaHorarioInicioInput.value && disciplinaHorarioFimInput.value) {
            if (disciplinaHorarioInicioInput.value >= disciplinaHorarioFimInput.value) {
                displayFieldError(disciplinaHorarioFimInput, "O horário de fim deve ser depois do horário de início.");
                isValid = false;
            }
        }
        return isValid;
    }

    // --- DATA AND UI MANIPULATION FUNCTIONS ---
    function formatTime(timeString) {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        let h = parseInt(hour);
        if (isNaN(h) || isNaN(parseInt(minute))) { return timeString; }
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
    }

    // Função para obter a classe do badge de status (copiada de tarefas.js)
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Ativa': return 'bg-success-subtle text-success';
            case 'Em Andamento': return 'bg-info-subtle text-info';
            case 'Concluída': return 'bg-secondary-subtle text-secondary';
            case 'Agendada': return 'bg-primary-subtle text-primary';
            default: return 'bg-light-subtle text-dark';
        }
    }

    // Função auxiliar de formatação de data/hora (copiada de tarefas.js)
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


    // --- DATATABLE INITIALIZATION ---
    function inicializarDataTable() {
        if (!window.jQuery || !$.fn.DataTable) {
            console.error("jQuery ou DataTables não carregado!");
            return null;
        }

        if ($.fn.DataTable.isDataTable('#tabelaDisciplinas')) {
            $('#tabelaDisciplinas').DataTable().destroy();
            $('#tabelaDisciplinas tbody').empty(); // Clear existing rows
        }

        tabelaDisciplinasDt = $('#tabelaDisciplinas').DataTable({
            responsive: {
                details: {
                    type: 'column',
                    target: 0
                }
            },
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto me-md-auto"f><"col-12 col-md-auto dt-buttons-container">>t<"row mt-3 align-items-center"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7 dataTables_paginate_wrapper"p>>',
            paging: false,
            scrollY: '450px',
            scrollCollapse: true,
            lengthChange: false,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json',
                search: "",
                searchPlaceholder: "Buscar disciplinas...",
                info: "Total de _TOTAL_ disciplinas",
                infoEmpty: "Nenhuma disciplina encontrada",
                infoFiltered: "(filtrado de _MAX_ disciplinas)",
                paginate: {
                    first: "Primeiro",
                    last: "Último",
                    next: "Próximo",
                    previous: "Anterior"
                }
            },
            columnDefs: [
                { orderable: false, className: 'dtr-control', targets: 0 },
                { responsivePriority: 1, targets: 1 }, // Nome da Disciplina
                { responsivePriority: 2, targets: 2 }, // Professor
                { responsivePriority: 3, targets: 3 }, // Dias da Semana
                { responsivePriority: 4, targets: 4 }, // Horário
                { responsivePriority: 5, targets: 5 }, // Local
                { responsivePriority: 1, targets: 6 }, // Status
                { responsivePriority: 2, targets: 7 }, // Período
                { orderable: false, className: "dt-actions-column no-export", targets: -1, responsivePriority: 10000 }
            ],
            data: listaDisciplinas.map(disciplina => {
                const horarioFormatadoParaTabela = disciplina.horarioInicio && disciplina.horarioFim
                    ? `${formatTime(disciplina.horarioInicio)} - ${formatTime(disciplina.horarioFim)}` : '-';
                const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(disciplina.status)}">${disciplina.status}</span>`;

                const dropdownHtml = `
                    <div class="dropdown">
                        <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da disciplina">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item btn-detalhar-disciplina" href="#" data-disciplina-id="${disciplina.id}"><i class="bi bi-eye me-2"></i>Detalhar Disciplina</a></li>
                            <li><a class="dropdown-item btn-edit-disciplina" href="#" data-disciplina-id="${disciplina.id}"><i class="bi bi-pencil-square me-2"></i>Editar Disciplina</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item btn-remover-disciplina text-danger" href="#" data-disciplina-id="${disciplina.id}"><i class="bi bi-trash me-2"></i>Remover Disciplina</a></li>
                        </ul>
                    </div>`;

                return [
                    '', // dtr-control column
                    disciplina.nome,
                    disciplina.professor || '-',
                    disciplina.dias || '-',
                    horarioFormatadoParaTabela,
                    disciplina.local || '-',
                    statusBadgeHtml,
                    disciplina.periodo || '-',
                    dropdownHtml
                ];
            }),
            initComplete: function (settings, json) {
                const api = this.api();
                $('#tabelaDisciplinas_filter input').addClass('form-control form-control-sm').attr('aria-label', 'Buscar disciplinas');
                $('#tabelaDisciplinas_filter label').contents().filter(function() {
                    return this.nodeType === 3;
                }).remove();

                const buttonsContainer = $(this.api().table().container()).find('.dt-custom-header .dt-buttons-container');

                let abrirModalNovaDisciplinaDtBtn = $('#abrirModalNovaDisciplinaDt'); // Check if it already exists

                if (abrirModalNovaDisciplinaBtnOriginal && buttonsContainer.length) {
                    if (abrirModalNovaDisciplinaDtBtn.length === 0) { // If not, clone it
                        const abrirModalBtnClone = abrirModalNovaDisciplinaBtnOriginal.cloneNode(true);
                        abrirModalBtnClone.id = 'abrirModalNovaDisciplinaDt';
                        abrirModalNovaDisciplinaDtBtn = $(abrirModalBtnClone); // Update the jQuery object reference
                        abrirModalNovaDisciplinaDtBtn.off('click').on('click', (e) => {
                            e.preventDefault();
                            abrirModalFormDisciplina();
                        });
                    }
                    abrirModalNovaDisciplinaBtnOriginal.style.display = 'none'; // Hide the original button
                }

                // --- Adicionar filtros customizados (Status e Período) ---
                const filterStatusHtml = `
                    <select id="filterStatusDisciplina" class="form-select dt-filter-select">
                        <option value="">Todos os Status</option>
                        <option value="Ativa">Ativa</option>
                        <option value="Concluída">Concluída</option>
                        <option value="Em Andamento">Em Andamento</option>
                        <option value="Agendada">Agendada</option>
                    </select>`;

                const filterPeriodoHtml = `
                    <select id="filterPeriodo" class="form-select dt-filter-select">
                        <option value="">Todos os Períodos</option>
                        <option value="2024.1">2024.1</option>
                        <option value="2024.2">2024.2</option>
                        <option value="2025.1">2025.1</option>
                        <option value="2025.2">2025.2</option>
                    </select>`;
                
                // Append the filters and the button in the correct order for the new CSS grid layout
                buttonsContainer.append(filterStatusHtml);
                buttonsContainer.append(filterPeriodoHtml);
                if (abrirModalNovaDisciplinaDtBtn.length) {
                    buttonsContainer.append(abrirModalNovaDisciplinaDtBtn);
                }

                $('#filterStatusDisciplina').on('change', function() {
                    const status = $(this).val();
                    api.column(6).search(status ? '^' + status + '$' : '', true, false).draw();
                });

                $('#filterPeriodo').on('change', function() {
                    const periodo = $(this).val();
                    api.column(7).search(periodo ? '^' + periodo + '$' : '', true, false).draw();
                });

                // Armazenar dados completos no TR
                $('#tabelaDisciplinas tbody tr').each(function(index) {
                    const rowData = listaDisciplinas[index];
                    $(this).data('completo', rowData);
                });

                // Lógica para mover o dropdown ao abrir/fechar
                $('#tabelaDisciplinas tbody').off('show.bs.dropdown.disciplinas hide.bs.dropdown.disciplinas');
                $('body').off('show.bs.dropdown.disciplinas hide.bs.dropdown.disciplinas', '.dropdown-menu');

                $('#tabelaDisciplinas tbody').on('show.bs.dropdown.disciplinas', '.dropdown', function (e) {
                    const $dropdown = $(this);
                    const $dropdownMenu = $dropdown.find('.dropdown-menu');
                    if (!$dropdownMenu.parent().is('body')) {
                        $dropdownMenu.data('bs-dropdown-original-parent', $dropdown);
                        $dropdownMenu.data('bs-dropdown-toggle-button', $(e.target));
                        $dropdownMenu.appendTo('body');
                        const bsDropdown = bootstrap.Dropdown.getInstance(e.target);
                        if (bsDropdown && bsDropdown._popper) bsDropdown._popper.update();
                    }
                });

                $('body').on('hide.bs.dropdown.disciplinas', '.dropdown-menu', function (e) {
                    const $dropdownMenu = $(this);
                    const $originalParent = $dropdownMenu.data('bs-dropdown-original-parent');

                    if ($originalParent && $originalParent.closest('#tabelaDisciplinas').length && !$dropdownMenu.parent().is($originalParent)) {
                        $dropdownMenu.prependTo($originalParent);
                        $dropdownMenu.removeData('bs-dropdown-original-parent');
                        $dropdownMenu.removeData('bs-dropdown-toggle-button');
                    } else if (!$originalParent && $(this).data('bs-dropdown-toggle-button')?.closest('#tabelaDisciplinas').length) {
                        $dropdownMenu.removeData('bs-dropdown-original-parent');
                        $dropdownMenu.removeData('bs-dropdown-toggle-button');
                    }
                });

                $(window).off('resize.dtDisciplinas').on('resize.dtDisciplinas', function () {
                    clearTimeout(resizeDebounceTimer);
                    resizeDebounceTimer = setTimeout(() => { if (tabelaDisciplinasDt) tabelaDisciplinasDt.columns.adjust().responsive.recalc(); }, 250);
                });
            }
        });
        return tabelaDisciplinasDt;
    }

    // --- MANAGE ADD/EDIT DISCIPLINA MODAL ---
    function abrirModalFormDisciplina(isEditMode = false, dadosDisciplina = null, targetTr = null) {
        if (!formDisciplina || !modalDisciplinaLabel || !modalDisciplina || !disciplinaNomeInput) {
            console.error("Discipline modal elements not found. Cannot open modal."); return;
        }
        formDisciplina.reset();
        const fieldsToClearValidation = [
            disciplinaNomeInput, disciplinaProfessorInput, disciplinaDescricaoInput,
            disciplinaPeriodoSelect, disciplinaStatusSelect, disciplinaDiasInput,
            disciplinaHorarioInicioInput, disciplinaHorarioFimInput, disciplinaLocalInput
        ];
        fieldsToClearValidation.forEach(clearFieldError);

        delete formDisciplina.dataset.disciplinaId;
        delete formDisciplina.dataset.rowIndex;
        disciplinaIdInput.value = '';
        disciplinaDataCriacaoInput.value = '';


        modalDisciplinaLabel.textContent = isEditMode ? "Editar Disciplina" : "Adicionar Disciplina";

        if (isEditMode && dadosDisciplina) {
            disciplinaIdInput.value = dadosDisciplina.id || '';
            disciplinaNomeInput.value = dadosDisciplina.nome || '';
            disciplinaProfessorInput.value = dadosDisciplina.professor || '';
            disciplinaDescricaoInput.value = dadosDisciplina.descricao || '';
            disciplinaPeriodoSelect.value = dadosDisciplina.periodo || '';
            disciplinaStatusSelect.value = dadosDisciplina.status || '';
            disciplinaDiasInput.value = dadosDisciplina.dias || '';
            disciplinaHorarioInicioInput.value = dadosDisciplina.horarioInicio || '';
            disciplinaHorarioFimInput.value = dadosDisciplina.horarioFim || '';
            disciplinaLocalInput.value = dadosDisciplina.local || '';
            disciplinaDataCriacaoInput.value = dadosDisciplina.dataCriacao || '';

            formDisciplina.dataset.disciplinaId = dadosDisciplina.id;
            if (tabelaDisciplinasDt && targetTr) {
                formDisciplina.dataset.rowIndex = tabelaDisciplinasDt.row(targetTr).index();
            }
        } else {
            disciplinaDataCriacaoInput.value = new Date().toISOString().split('T')[0];
            disciplinaPeriodoSelect.value = "";
            disciplinaStatusSelect.value = "Ativa";
        }

        if (modalDisciplina && typeof modalDisciplina.showModal === 'function') {
            modalDisciplina.showModal();
        } else {
            console.error("modalDisciplina não é um elemento <dialog> válido ou showModal não é uma função.");
        }
    }

    function fecharModalFormDisciplina() {
        if (modalDisciplina && typeof modalDisciplina.close === 'function') modalDisciplina.close();
        if (formDisciplina) {
            formDisciplina.reset();
            const fieldsToClearValidation = [
                disciplinaNomeInput, disciplinaProfessorInput, disciplinaDescricaoInput,
                disciplinaPeriodoSelect, disciplinaStatusSelect, disciplinaDiasInput,
                disciplinaHorarioInicioInput, disciplinaHorarioFimInput, disciplinaLocalInput
            ];
            fieldsToClearValidation.forEach(clearFieldError);
            delete formDisciplina.dataset.disciplinaId;
            delete formDisciplina.dataset.rowIndex;
            disciplinaIdInput.value = '';
            disciplinaDataCriacaoInput.value = '';
        }
    }

    if (abrirModalNovaDisciplinaBtnOriginal) {
        $(abrirModalNovaDisciplinaBtnOriginal).on('click', function(e) {
            e.preventDefault();
            abrirModalFormDisciplina();
        });
    }

    if (fecharModalDisciplinaBtn) fecharModalDisciplinaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormDisciplina(); });
    if (cancelarModalDisciplinaBtn) cancelarModalDisciplinaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormDisciplina(); });
    if (modalDisciplina) modalDisciplina.addEventListener("click", e => { if (e.target === modalDisciplina) fecharModalFormDisciplina(); });


    // --- TABLE ACTIONS (DETALHAR, EDITAR, REMOVER) ---
    $('body').on('click', '.btn-detalhar-disciplina, .btn-edit-disciplina, .btn-remover-disciplina', function (e) {
        e.preventDefault();

        const $clickedItem = $(this);
        const $dropdownMenu = $clickedItem.closest('.dropdown-menu');
        const $originalButton = $dropdownMenu.data('bs-dropdown-toggle-button');

        const hideDropdown = () => {
            if ($originalButton && $originalButton.length > 0 && window.bootstrap) {
                const dropdownInstance = bootstrap.Dropdown.getInstance($originalButton[0]);
                if (dropdownInstance) dropdownInstance.hide();
            }
        };

        let trElement = $originalButton ? $originalButton.closest('tr')[0] : null;
        if (!trElement) {
            trElement = $clickedItem.closest('tr')[0];
        }

        if (!tabelaDisciplinasDt || !trElement) {
            console.error("Ações Disciplina: DataTables não inicializado ou trElement não encontrado.");
            hideDropdown(); return;
        }
        const row = tabelaDisciplinasDt.row(trElement);
        if (!row || !row.length || !row.node()) {
            console.error("Ações Disciplina: Linha do DataTables não encontrada.", trElement);
            hideDropdown(); return;
        }

        const dadosCompletosArmazenados = $(trElement).data('completo');

        if ($clickedItem.hasClass('btn-detalhar-disciplina')) {
            if (!dadosCompletosArmazenados) {
                alert("Erro: Dados insuficientes para detalhar a disciplina.");
            } else {
                abrirModalDeDetalhesDisciplina(dadosCompletosArmazenados);
            }
        } else if ($clickedItem.hasClass('btn-edit-disciplina')) {
            if (!dadosCompletosArmazenados) {
                alert("Erro: Não foi possível obter os dados completos da disciplina para edição.");
            } else {
                abrirModalFormDisciplina(true, dadosCompletosArmazenados, trElement);
            }
        } else if ($clickedItem.hasClass('btn-remover-disciplina')) {
            const nomeDisciplina = dadosCompletosArmazenados?.nome || (row.data() ? row.data()[1] : "esta disciplina"); // Índice 1 para nome
            if (confirm(`Tem certeza que deseja remover a disciplina "${nomeDisciplina}"?`)) {
                row.remove().draw(false);
                const indexLista = listaDisciplinas.findIndex(d => d.id === dadosCompletosArmazenados.id);
                if(indexLista !== -1) {
                    listaDisciplinas.splice(indexLista, 1); // Remove dos dados mocados
                }
                alert("Disciplina removida com sucesso!");
            }
        }
        hideDropdown();
    });

    // --- FORM SUBMISSION ---
    if (formDisciplina) {
        formDisciplina.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!validateFormDisciplina()) return;
            if (!tabelaDisciplinasDt) { console.error("DataTables (disciplinas) não inicializado."); return; }

            const formDisciplinaId = formDisciplina.dataset.disciplinaId;
            const rowIndex = formDisciplina.dataset.rowIndex !== undefined ? parseInt(formDisciplina.dataset.rowIndex) : undefined;

            const dadosCompletosDisciplina = {
                id: formDisciplinaId || 'disc-' + new Date().getTime(),
                nome: disciplinaNomeInput.value.trim(),
                professor: disciplinaProfessorInput.value.trim(),
                descricao: disciplinaDescricaoInput.value.trim(),
                periodo: disciplinaPeriodoSelect.value,
                status: disciplinaStatusSelect.value,
                dias: disciplinaDiasInput.value.trim(),
                horarioInicio: disciplinaHorarioInicioInput.value,
                horarioFim: disciplinaHorarioFimInput.value,
                local: disciplinaLocalInput.value.trim(),
                dataCriacao: disciplinaDataCriacaoInput.value // Usar valor do campo hidden
            };

            const horarioFormatadoParaTabela = dadosCompletosDisciplina.horarioInicio && dadosCompletosDisciplina.horarioFim
                ? `${formatTime(dadosCompletosDisciplina.horarioInicio)} - ${formatTime(dadosCompletosDisciplina.horarioFim)}` : '-';
            const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(dadosCompletosDisciplina.status)}">${dadosCompletosDisciplina.status}</span>`;


            const dropdownHtml = `
                <div class="dropdown">
                    <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da disciplina"><i class="bi bi-three-dots-vertical"></i></button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item btn-detalhar-disciplina" href="#" data-disciplina-id="${dadosCompletosDisciplina.id}"><i class="bi bi-eye me-2"></i>Detalhar Disciplina</a></li>
                        <li><a class="dropdown-item btn-edit-disciplina" href="#" data-disciplina-id="${dadosCompletosDisciplina.id}"><i class="bi bi-pencil-square me-2"></i>Editar Disciplina</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item btn-remover-disciplina text-danger" href="#" data-disciplina-id="${dadosCompletosDisciplina.id}"><i class="bi bi-trash me-2"></i>Remover Disciplina</a></li>
                    </ul>
                </div>`;

            const dadosLinhaTabela = [
                '', // dtr-control column
                dadosCompletosDisciplina.nome,
                dadosCompletosDisciplina.professor || '-',
                dadosCompletosDisciplina.dias || '-',
                horarioFormatadoParaTabela,
                dadosCompletosDisciplina.local || '-',
                statusBadgeHtml, // Nova coluna
                dadosCompletosDisciplina.periodo || '-', // Nova coluna
                dropdownHtml
            ];

            let targetRowNode;
            if (formDisciplinaId && rowIndex !== undefined && tabelaDisciplinasDt.row(rowIndex).node()) {
                targetRowNode = tabelaDisciplinasDt.row(rowIndex).data(dadosLinhaTabela).draw(false).node();
                const indexLista = listaDisciplinas.findIndex(d => d.id === formDisciplinaId);
                if(indexLista !== -1) {
                    listaDisciplinas[indexLista] = dadosCompletosDisciplina;
                }
                alert("Disciplina atualizada com sucesso!");
            } else {
                targetRowNode = tabelaDisciplinasDt.row.add(dadosLinhaTabela).draw(false).node();
                listaDisciplinas.push(dadosCompletosDisciplina);
                alert("Disciplina adicionada com sucesso!");
            }

            if (targetRowNode) {
                $(targetRowNode).data('completo', dadosCompletosDisciplina);
                $(targetRowNode).data('id', dadosCompletosDisciplina.id);
            }
            fecharModalFormDisciplina();
            if (tabelaDisciplinasDt) tabelaDisciplinasDt.columns.adjust().responsive.recalc();
        });
    }

    // --- FUNÇÕES AUXILIARES para modal de Detalhes da Disciplina (adicionar Tarefa/Anotação) ---
    function abrirModalDeDetalhesDisciplina(dadosDisciplina) {
        if (!modalDetalhesDisciplina || !modalDetalhesDisciplinaConteudo || !modalDetalhesDisciplinaLabel) {
            console.error("Elementos do modal de detalhes da disciplina não encontrados.");
            return;
        }

        modalDetalhesDisciplinaLabel.textContent = "Detalhes da Disciplina";

        // Preencher detalhes da disciplina
        modalDetalhesDisciplinaConteudo.innerHTML = `
            <dl class="row mb-3">
                <dt class="col-sm-4">Nome:</dt>
                <dd class="col-sm-8">${dadosDisciplina.nome || '-'}</dd>

                <dt class="col-sm-4">Professor:</dt>
                <dd class="col-sm-8">${dadosDisciplina.professor || '-'}</dd>

                <dt class="col-sm-4">Período:</dt>
                <dd class="col-sm-8">${dadosDisciplina.periodo || '-'}</dd>

                <dt class="col-sm-4">Status:</dt>
                <dd class="col-sm-8"><span class="badge ${getStatusBadgeClass(dadosDisciplina.status)}">${dadosDisciplina.status || '-'}</span></dd>

                ${dadosDisciplina.descricao ? `
                <dt class="col-sm-12 mt-3">Descrição:</dt>
                <dd class="col-sm-12"><pre>${dadosDisciplina.descricao.replace(/\n/g, '<br>')}</pre></dd>
                ` : ''}

                <dt class="col-sm-4">Dias:</dt>
                <dd class="col-sm-8">${dadosDisciplina.dias || '-'}</dd>

                <dt class="col-sm-4">Horário:</dt>
                <dd class="col-sm-8">${dadosDisciplina.horarioInicio && dadosDisciplina.horarioFim ? `${formatTime(dadosDisciplina.horarioInicio)} - ${formatTime(dadosDisciplina.horarioFim)}` : '-'}</dd>

                <dt class="col-sm-4">Local:</dt>
                <dd class="col-sm-8">${dadosDisciplina.local || '-'}</dd>

                <dt class="col-sm-4">Data de Criação:</dt>
                <dd class="col-sm-8">${dadosDisciplina.dataCriacao || '-'}</dd>
            </dl>
            <hr>
            <h6>Tarefas Vinculadas</h6>
            <ul id="listaTarefasDisciplina" class="list-group list-group-flush">
                </ul>
            <hr>
            <h6>Anotações Vinculadas</h6>
            <ul id="listaAnotacoesDisciplina" class="list-group list-group-flush">
                </ul>
            <hr>
            <h6>Ações Rápidas</h6>
            <button class="btn btn-sm btn-primary mt-2 me-2" id="addTarefaFromDisciplina" data-disciplina-id="${dadosDisciplina.id}" data-disciplina-nome="${dadosDisciplina.nome}">Adicionar Tarefa</button>
            <button class="btn btn-sm btn-info mt-2" id="addAnotacaoFromDisciplina" data-disciplina-id="${dadosDisciplina.id}" data-disciplina-nome="${dadosDisciplina.nome}">Adicionar Anotação</button>
        `;

        // Preencher listas de tarefas e anotações vinculadas
        const listaTarefasDisciplinaUl = modalDetalhesDisciplinaConteudo.querySelector('#listaTarefasDisciplina');
        const listaAnotacoesDisciplinaUl = modalDetalhesDisciplinaConteudo.querySelector('#listaAnotacoesDisciplina');

        // Filtrar tarefas e anotações pelos dados da disciplina
        const tarefasFiltradas = listaTarefasMock.filter(t => t.disciplinaId === dadosDisciplina.id);
        const anotacoesFiltradas = listaAnotacoesMock.filter(a => a.disciplinaId === dadosDisciplina.id);

        if (tarefasFiltradas.length > 0) {
            listaTarefasDisciplinaUl.innerHTML = tarefasFiltradas.map(tarefa => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${tarefa.titulo} (${formatarDataHoraParaTabela(tarefa.dataEntrega, tarefa.horarioEntrega)})
                    <span class="badge ${getStatusBadgeClass(tarefa.status)}">${tarefa.status}</span>
                    <button class="btn btn-sm btn-outline-secondary" data-tarefa-id="${tarefa.id}">Ver Tarefa</button>
                </li>
            `).join('');
        } else {
            listaTarefasDisciplinaUl.innerHTML = `<li class="list-group-item">Nenhuma tarefa vinculada a esta disciplina.</li>`;
        }

        if (anotacoesFiltradas.length > 0) {
            listaAnotacoesDisciplinaUl.innerHTML = anotacoesFiltradas.map(anotacao => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${anotacao.titulo}
                    <button class="btn btn-sm btn-outline-secondary" data-anotacao-id="${anotacao.id}">Ver Anotação</button>
                </li>
            `).join('');
        } else {
            listaAnotacoesDisciplinaUl.innerHTML = `<li class="list-group-item">Nenhuma anotação vinculada a esta disciplina.</li>`;
        }

        // Reanexar listeners aos botões dentro do modal de detalhes (se ele foi gerado dinamicamente)
        $(modalDetalhesDisciplinaConteudo).find('#addTarefaFromDisciplina').off('click').on('click', function() {
            const discId = $(this).data('disciplina-id');
            const discNome = $(this).data('disciplina-nome');
            alert(`Funcionalidade: Abrir modal de nova tarefa, pré-selecionada com Disciplina: ${discNome || discId}`);
            // Em um sistema real, você chamaria a função para abrir o modal de Tarefas
            // e passaria os dados da disciplina para preencher o select.
            // Por exemplo: abrirModalFormTarefa(false, { disciplinaId: discId, disciplinaNome: discNome });
            fecharModalDeDetalhesDisciplina(); // Fecha o modal de detalhes
        });
        $(modalDetalhesDisciplinaConteudo).find('#addAnotacaoFromDisciplina').off('click').on('click', function() {
            const discId = $(this).data('disciplina-id');
            const discNome = $(this).data('disciplina-nome');
            alert(`Funcionalidade: Abrir modal de nova anotação, pré-selecionada com Disciplina: ${discNome || discId}`);
            // Aqui você chamaria a função para abrir o modal de Anotações
            // Por exemplo: abrirModalFormAnotacao(false, { disciplinaId: discId, disciplinaNome: discNome });
            fecharModalDeDetalhesDisciplina(); // Fecha o modal de detalhes
        });

        // Listeners para os botões "Ver Tarefa/Anotação" (dentro do modal de detalhes da disciplina)
        $(modalDetalhesDisciplinaConteudo).find('.btn-outline-secondary').off('click').on('click', function() {
            const tarefaId = $(this).data('tarefa-id');
            const anotacaoId = $(this).data('anotacao-id');
            if (tarefaId) {
                alert(`Funcionalidade: Ver detalhes da Tarefa com ID: ${tarefaId}`);
                // Chamar função para abrir modal de detalhes da tarefa
            } else if (anotacaoId) {
                alert(`Funcionalidade: Ver detalhes da Anotação com ID: ${anotacaoId}`);
                // Chamar função para abrir modal de detalhes da anotação
            }
        });


        if (modalDetalhesDisciplina && typeof modalDetalhesDisciplina.showModal === 'function') {
            modalDetalhesDisciplina.showModal();
        } else if (window.bootstrap && modalDetalhesDisciplina) {
            const bsModal = bootstrap.Modal.getInstance(modalDetalhesDisciplina) || new bootstrap.Modal(modalDetalhesDisciplina);
            bsModal.show();
        }
    }

    function fecharModalDeDetalhesDisciplina() {
        if (modalDetalhesDisciplina && typeof modalDetalhesDisciplina.close === 'function') modalDetalhesDisciplina.close();
        else if (window.bootstrap && modalDetalhesDisciplina) {
            const bsModal = bootstrap.Modal.getInstance(modalDetalhesDisciplina);
            if (bsModal) bsModal.hide();
        }
    }

    if (fecharModalDetalhesDisciplinaBtn) { fecharModalDetalhesDisciplinaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhesDisciplina(); }); }
    if (okModalDetalhesDisciplinaBtn) { okModalDetalhesDisciplinaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhesDisciplina(); }); }
    if (modalDetalhesDisciplina) modalDetalhesDisciplina.addEventListener("click", e => {
        if (e.target === modalDetalhesDisciplina && typeof modalDetalhesDisciplina.close === 'function') {
            fecharModalDeDetalhesDisciplina();
        }
    });

    // --- FINAL INITIALIZATIONS ---
    inicializarDataTable();
});
