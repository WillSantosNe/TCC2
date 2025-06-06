document.addEventListener("DOMContentLoaded", function () {
    // --- ELEMENT SELECTORS ---
    // Seletores do modal principal
    const modalDisciplina = document.querySelector("#modalDisciplinaAdicaoPrincipal"); // Apontando para o modal correto
    const abrirModalNovaDisciplinaBtnOriginal = document.querySelector("#abrirModalNovaDisciplina");
    const fecharModalDisciplinaBtn = modalDisciplina ? modalDisciplina.querySelector('.btn-close') : null;
    const cancelarModalDisciplinaBtn = modalDisciplina ? modalDisciplina.querySelector('.btn-modal-cancel') : null;
    const formDisciplina = document.querySelector("#formDisciplinaPrincipal");
    const modalDisciplinaLabel = document.querySelector("#modalDisciplinaAdicaoPrincipalLabel");

    // Seletores dos campos do formulário (apenas os necessários)
    const disciplinaIdInput = document.getElementById('disciplinaId'); // Supondo um campo hidden para ID
    const disciplinaNomeInput = document.getElementById('principalDisciplinaNome');
    const disciplinaProfessorInput = document.getElementById('principalDisciplinaProfessor');
    const disciplinaPeriodoSelect = document.getElementById('principalDisciplinaPeriodo');
    const disciplinaStatusSelect = document.getElementById('principalDisciplinaStatus');

    // Seletores do modal de Detalhes
    const modalDetalhesDisciplina = document.querySelector("#modalDetalhesDisciplina");
    const fecharModalDetalhesDisciplinaBtn = document.querySelector("#fecharModalDetalhesDisciplina");
    const okModalDetalhesDisciplinaBtn = document.querySelector("#okModalDetalhesDisciplina");
    const modalDetalhesDisciplinaConteudo = document.querySelector("#modalDetalhesDisciplinaConteudo");
    const modalDetalhesDisciplinaLabel = document.querySelector("#modalDetalhesDisciplinaLabel");

    let tabelaDisciplinasDt;
    let resizeDebounceTimer;

    // --- DADOS MOCADOS (Simplificados) ---
    const listaDisciplinas = [
        { id: "ITD201", nome: "Web Design Avançado – ITD201", professor: "Prof. João Paulo", periodo: "2024.1", status: "Ativa" },
        { id: "ART101", nome: "Fundamentos de Design Gráfico – ART101", professor: "Prof. Jango", periodo: "2024.1", status: "Ativa" },
        { id: "UXD301", nome: "Princípios de UX/UI Design – UXD301", professor: "Prof. Jason", periodo: "2024.2", status: "Ativa" },
        { id: "ANI301", nome: "Técnicas de Animação 3D – ANI301", professor: "Prof. Pryzado", periodo: "2024.2", status: "Em Andamento" },
        { id: "HAR202", nome: "História da Arte – HAR202", professor: "Prof. Olivia", periodo: "2024.1", status: "Concluída" },
        { id: "PHO110", nome: "Fotografia Digital – PHO110", professor: "Prof. Lucas", periodo: "2024.2", status: "Ativa" },
        { id: "CCO200", nome: "Programação Orientada a Objetos – CCO200", professor: "Prof. Ana", periodo: "2024.1", status: "Concluída" },
        { id: "CCO210", nome: "Banco de Dados – CCO210", professor: "Prof. Carlos", periodo: "2024.2", status: "Ativa" },
        { id: "CCO300", nome: "Redes de Computadores – CCO300", professor: "Prof. Beatriz", periodo: "2024.1", status: "Ativa" },
        { id: "CCO401", nome: "Inteligência Artificial – CCO401", professor: "Prof. Eduardo", periodo: "2025.1", status: "Agendada" },
    ];


    // --- FUNÇÕES DE VALIDAÇÃO (Simplificadas) ---
    function displayFieldError(inputElement, message) {
        clearFieldError(inputElement);
        inputElement.classList.add('is-invalid');
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'invalid-feedback d-block';
        feedbackDiv.textContent = message;
        const parent = inputElement.closest('.input-wrapper') || inputElement.parentNode;
        parent.appendChild(feedbackDiv);
    }

    function clearFieldError(inputElement) {
        inputElement.classList.remove('is-invalid');
        const parent = inputElement.closest('.input-wrapper') || inputElement.parentNode;
        const feedbackElement = parent.querySelector('.invalid-feedback.d-block');
        if (feedbackElement) {
            feedbackElement.remove();
        }
    }

    function validateFormDisciplina() {
        let isValid = true;
        const fieldsToValidate = [
            { element: disciplinaNomeInput, message: "Por favor, informe o nome da disciplina." },
            { element: disciplinaPeriodoSelect, message: "Por favor, selecione o período." },
            { element: disciplinaStatusSelect, message: "Por favor, selecione o status." },
        ];

        fieldsToValidate.forEach(field => {
            if (!field.element) return;
            clearFieldError(field.element);
            if (!field.element.value || field.element.value.trim() === "") {
                displayFieldError(field.element, field.message);
                isValid = false;
            }
        });
        return isValid;
    }

    // --- FUNÇÕES DE UI ---
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Ativa': return 'bg-success-subtle text-success';
            case 'Em Andamento': return 'bg-info-subtle text-info';
            case 'Concluída': return 'bg-secondary-subtle text-secondary';
            case 'Agendada': return 'bg-primary-subtle text-primary';
            default: return 'bg-light-subtle text-dark';
        }
    }

    // --- DATATABLE INITIALIZATION ---
    function inicializarDataTable() {
        if (!window.jQuery || !$.fn.DataTable) return null;

        if ($.fn.DataTable.isDataTable('#tabelaDisciplinas')) {
            $('#tabelaDisciplinas').DataTable().destroy();
            $('#tabelaDisciplinas tbody').empty();
        }

        tabelaDisciplinasDt = $('#tabelaDisciplinas').DataTable({
            responsive: { details: { type: 'column', target: 0 } },
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto me-md-auto"f><"col-12 col-md-auto dt-buttons-container">>t<"row mt-3 align-items-center"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7 dataTables_paginate_wrapper"p>>',
            paging: false,
            scrollY: '450px',
            scrollCollapse: true,
            lengthChange: false,
            language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar disciplinas...", info: "Total de _TOTAL_ disciplinas" },
            columnDefs: [
                { orderable: false, className: 'dtr-control', targets: 0 },
                { responsivePriority: 1, targets: 1 }, // Nome
                { responsivePriority: 2, targets: 2 }, // Professor
                { responsivePriority: 3, targets: 3 }, // Período
                { responsivePriority: 4, targets: 4 }, // Status
                { orderable: false, className: "dt-actions-column no-export", targets: -1, responsivePriority: 10000 }
            ],
            data: listaDisciplinas.map(disciplina => {
                const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(disciplina.status)}">${disciplina.status}</span>`;
                const dropdownHtml = `
                    <div class="dropdown">
                        <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-three-dots-vertical"></i></button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item btn-detalhar-disciplina" href="#" data-disciplina-id="${disciplina.id}"><i class="bi bi-eye me-2"></i>Detalhar</a></li>
                            <li><a class="dropdown-item btn-edit-disciplina" href="#" data-disciplina-id="${disciplina.id}"><i class="bi bi-pencil-square me-2"></i>Editar</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item btn-remover-disciplina text-danger" href="#" data-disciplina-id="${disciplina.id}"><i class="bi bi-trash me-2"></i>Remover</a></li>
                        </ul>
                    </div>`;

                return [
                    '', // dtr-control column
                    disciplina.nome,
                    disciplina.professor || '-',
                    disciplina.periodo || '-',
                    statusBadgeHtml,
                    dropdownHtml
                ];
            }),
            initComplete: function () {
                const api = this.api();
                $('#tabelaDisciplinas_filter input').addClass('form-control form-control-sm');
                
                const buttonsContainer = $(this.api().table().container()).find('.dt-custom-header .dt-buttons-container');

                // --- Filtros (Status e Período) ---
                const filterStatusHtml = `<select id="filterStatusDisciplina" class="form-select dt-filter-select"><option value="">Todos os Status</option><option value="Ativa">Ativa</option><option value="Concluída">Concluída</option><option value="Em Andamento">Em Andamento</option><option value="Agendada">Agendada</option></select>`;
                const filterPeriodoHtml = `<select id="filterPeriodo" class="form-select dt-filter-select"><option value="">Todos os Períodos</option><option value="2024.1">2024.1</option><option value="2024.2">2024.2</option><option value="2025.1">2025.1</option></select>`;
                
                buttonsContainer.append(filterStatusHtml);
                buttonsContainer.append(filterPeriodoHtml);
                
                // Mover o botão original para o cabeçalho da tabela
                if (abrirModalNovaDisciplinaBtnOriginal) {
                    buttonsContainer.append(abrirModalNovaDisciplinaBtnOriginal);
                }

                $('#filterStatusDisciplina').on('change', function() {
                    api.column(4).search($(this).val() ? '^' + $(this).val() + '$' : '', true, false).draw();
                });

                $('#filterPeriodo').on('change', function() {
                    api.column(3).search($(this).val() ? '^' + $(this).val() + '$' : '', true, false).draw();
                });

                $('#tabelaDisciplinas tbody tr').each(function(index) {
                    $(this).data('completo', listaDisciplinas[index]);
                });

                $(window).off('resize.dtDisciplinas').on('resize.dtDisciplinas', () => {
                     clearTimeout(resizeDebounceTimer);
                     resizeDebounceTimer = setTimeout(() => { if (tabelaDisciplinasDt) tabelaDisciplinasDt.columns.adjust().responsive.recalc(); }, 250);
                });
            }
        });
        return tabelaDisciplinasDt;
    }

    // --- MANAGE MODAL ---
    function abrirModalFormDisciplina(isEditMode = false, dadosDisciplina = null, targetTr = null) {
        if (!formDisciplina || !modalDisciplina || !disciplinaNomeInput) return;
        
        formDisciplina.reset();
        [disciplinaNomeInput, disciplinaPeriodoSelect, disciplinaStatusSelect].forEach(clearFieldError);
        
        delete formDisciplina.dataset.disciplinaId;
        delete formDisciplina.dataset.rowIndex;
        
        modalDisciplinaLabel.textContent = isEditMode ? "Editar Disciplina" : "Adicionar Disciplina";

        if (isEditMode && dadosDisciplina) {
            disciplinaNomeInput.value = dadosDisciplina.nome || '';
            disciplinaProfessorInput.value = dadosDisciplina.professor || '';
            disciplinaPeriodoSelect.value = dadosDisciplina.periodo || '';
            disciplinaStatusSelect.value = dadosDisciplina.status || '';
            
            formDisciplina.dataset.disciplinaId = dadosDisciplina.id;
            if (tabelaDisciplinasDt && targetTr) {
                formDisciplina.dataset.rowIndex = tabelaDisciplinasDt.row(targetTr).index();
            }
        } else {
            disciplinaStatusSelect.value = "Ativa";
        }
        const bsModal = bootstrap.Modal.getInstance(modalDisciplina) || new bootstrap.Modal(modalDisciplina);
        bsModal.show();
    }
    
    // --- TABLE ACTIONS ---
    $('#tabelaDisciplinas tbody').on('click', '.btn-detalhar-disciplina, .btn-edit-disciplina, .btn-remover-disciplina', function (e) {
        e.preventDefault();
        const tr = $(this).closest('tr');
        const row = tabelaDisciplinasDt.row(tr);
        const dadosCompletos = $(tr).data('completo');

        if (!dadosCompletos) return;

        if ($(this).hasClass('btn-edit-disciplina')) {
            abrirModalFormDisciplina(true, dadosCompletos, tr[0]);
        } else if ($(this).hasClass('btn-remover-disciplina')) {
            if (confirm(`Tem certeza que deseja remover "${dadosCompletos.nome}"?`)) {
                row.remove().draw(false);
                // Lógica para remover do array de dados aqui
            }
        } else if ($(this).hasClass('btn-detalhar-disciplina')) {
            // Preencher e abrir modal de detalhes (simplificado)
            modalDetalhesDisciplinaLabel.textContent = dadosCompletos.nome;
            modalDetalhesDisciplinaConteudo.innerHTML = `
                <dl class="row">
                  <dt class="col-sm-3">Professor:</dt><dd class="col-sm-9">${dadosCompletos.professor || '-'}</dd>
                  <dt class="col-sm-3">Período:</dt><dd class="col-sm-9">${dadosCompletos.periodo || '-'}</dd>
                  <dt class="col-sm-3">Status:</dt><dd class="col-sm-9"><span class="badge ${getStatusBadgeClass(dadosCompletos.status)}">${dadosCompletos.status}</span></dd>
                </dl>`;
            const bsModal = new bootstrap.Modal(modalDetalhesDisciplina);
            bsModal.show();
        }
    });

    // --- FORM SUBMISSION ---
    if (formDisciplina) {
        formDisciplina.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!validateFormDisciplina()) return;

            const formDisciplinaId = formDisciplina.dataset.disciplinaId;
            const rowIndex = formDisciplina.dataset.rowIndex;

            const dadosCompletosDisciplina = {
                id: formDisciplinaId || 'disc-' + new Date().getTime(),
                nome: disciplinaNomeInput.value.trim(),
                professor: disciplinaProfessorInput.value.trim(),
                periodo: disciplinaPeriodoSelect.value,
                status: disciplinaStatusSelect.value,
            };

            const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(dadosCompletosDisciplina.status)}">${dadosCompletosDisciplina.status}</span>`;
            const dropdownHtml = `...`; // O HTML do dropdown seria gerado aqui

            const dadosLinhaTabela = [
                '',
                dadosCompletosDisciplina.nome,
                dadosCompletosDisciplina.professor || '-',
                dadosCompletosDisciplina.periodo || '-',
                statusBadgeHtml,
                dropdownHtml
            ];

            if (formDisciplinaId && rowIndex !== undefined) {
                tabelaDisciplinasDt.row(rowIndex).data(dadosLinhaTabela).draw(false);
            } else {
                tabelaDisciplinasDt.row.add(dadosLinhaTabela).draw(false);
            }
            
            const bsModal = bootstrap.Modal.getInstance(modalDisciplina);
            if(bsModal) bsModal.hide();
        });
    }
    
    // --- EVENT LISTENERS PARA MODAIS ---
    if(abrirModalNovaDisciplinaBtnOriginal) {
        abrirModalNovaDisciplinaBtnOriginal.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModalFormDisciplina();
        });
    }
    if (fecharModalDetalhesDisciplinaBtn) fecharModalDetalhesDisciplinaBtn.addEventListener("click", (e) => e.preventDefault());
    if (okModalDetalhesDisciplinaBtn) okModalDetalhesDisciplinaBtn.addEventListener("click", (e) => e.preventDefault());

    // --- INICIALIZAÇÃO ---
    inicializarDataTable();
});
