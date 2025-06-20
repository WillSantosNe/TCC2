document.addEventListener("DOMContentLoaded", function () {
    // --- DADOS MOCADOS ---
    const listaDisciplinas = [
        { id: "CS101", nome: "Algoritmos e Estrutura de Dados", descricao: "Estudo de algoritmos fundamentais, estruturas de dados como listas, filas, pilhas, árvores e grafos, e análise de complexidade.", professor: "Prof. Jango", periodo: "2025.1", status: "Ativa" },
        { id: "CS102", nome: "Redes de Computadores", descricao: "Princípios de redes, modelo OSI, TCP/IP, protocolos de aplicação, camada de transporte e segurança de redes.", professor: "Prof. João Paulo", periodo: "2025.1", status: "Ativa" },
        { id: "CS103", nome: "Banco de Dados", descricao: "Modelagem de dados, SQL, normalização, transações e sistemas de gerenciamento de bancos de dados relacionais e NoSQL.", professor: "Prof. Jason", periodo: "2025.1", status: "Ativa" },
        { id: "CS104", nome: "Inteligência Artificial", descricao: "Introdução à IA, busca, representação de conhecimento, aprendizado de máquina e redes neurais.", professor: "Prof. Pryzado", periodo: "2025.2", status: "Em Andamento" },
        { id: "CS105", nome: "Compiladores", descricao: "Teoria e prática da construção de compiladores, incluindo análise léxica, sintática e semântica, e geração de código.", professor: "Prof. Ada L.", periodo: "2025.2", status: "Agendada" },
        { id: "CS210", nome: "Engenharia de Software", descricao: "Ciclo de vida de software, metodologias ágeis (Scrum, Kanban), UML, padrões de projeto e testes de software.", professor: "Prof. Fernanda", periodo: "2025.2", status: "Ativa" },
        { id: "CS220", nome: "Sistemas Operacionais", descricao: "Gerenciamento de processos, memória, sistemas de arquivos e concorrência em sistemas operacionais modernos.", professor: "Prof. Linus T.", periodo: "2025.1", status: "Concluída" }
    ];

    // =======================================================================
    // == ADIÇÃO 1: DADOS E ESTRUTURAS AUXILIARES PARA O MODAL DE ANOTAÇÃO ====
    // =======================================================================
    // Estes dados são essenciais para saber quais tarefas existem.
    const listaTarefas = [
        { id: "T001", titulo: "Complexidade e Estruturas Lineares", disciplinaId: "CS101" },
        { id: "T002", titulo: "Trabalho sobre Árvores AVL", disciplinaId: "CS101" },
        { id: "T006", titulo: "Camadas de Transporte e Aplicação", disciplinaId: "CS102" },
        { id: "T007", titulo: "Configuração de Roteadores", disciplinaId: "CS102" },
        { id: "T010", titulo: "Modelagem Entidade-Relacionamento", disciplinaId: "CS103" }
    ];

    // Estruturas que formatam os dados para os dropdowns.
    const disciplinasParaSelect = listaDisciplinas.map(d => ({ id: d.id, nome: d.nome }));
    const todasAtividadesParaSelect = listaTarefas.map(t => ({ id: t.id, nome: t.titulo }));
    const atividadesPorDisciplina = listaDisciplinas.reduce((acc, disciplina) => {
        acc[disciplina.id] = listaTarefas
            .filter(t => t.disciplinaId === disciplina.id)
            .map(t => ({ id: t.id, nome: t.titulo }));
        return acc;
    }, {});
    // =======================================================================
    // == FIM DA ADIÇÃO 1 ====================================================
    // =======================================================================


    // --- ELEMENT SELECTORS --- (CÓDIGO ORIGINAL INTACTO)
    const modalDisciplinaAdicao = document.querySelector("#modalDisciplinaAdicaoPrincipal");
    const abrirModalNovaDisciplinaBtnOriginal = document.querySelector("#abrirModalNovaDisciplina");
    const formDisciplina = document.querySelector("#formDisciplinaPrincipal");
    const modalDisciplinaLabel = document.querySelector("#modalDisciplinaAdicaoPrincipalLabel");
    const disciplinaNomeInput = document.getElementById('principalDisciplinaNome');
    const disciplinaDescricaoInput = document.getElementById('principalDisciplinaDescricao');
    const disciplinaProfessorInput = document.getElementById('principalDisciplinaProfessor');
    const disciplinaPeriodoSelect = document.getElementById('principalDisciplinaPeriodo');
    const disciplinaStatusSelect = document.getElementById('principalDisciplinaStatus');

    const modalDetalhesDisciplina = document.querySelector("#modalDetalhesDisciplina");
    const detalheDisciplinaNome = document.querySelector("#detalhe-disciplina-nome");
    const detalheDisciplinaDescricao = document.querySelector("#detalhe-disciplina-descricao");
    const detalheDisciplinaProfessor = document.querySelector("#detalhe-disciplina-professor");
    const detalheDisciplinaPeriodo = document.querySelector("#detalhe-disciplina-periodo");
    const detalheDisciplinaStatus = document.querySelector("#detalhe-disciplina-status");

    let tabelaDisciplinasDt;
    let resizeDebounceTimer;

    // --- FUNÇÕES DE VALIDAÇÃO --- (CÓDIGO ORIGINAL INTACTO)
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

    // --- FUNÇÕES DE UI E AUXILIARES --- (CÓDIGO ORIGINAL INTACTO, COM UMA ADIÇÃO)
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Ativa': return 'bg-success-subtle text-success';
            case 'Em Andamento': return 'bg-info-subtle text-info';
            case 'Concluída': return 'bg-secondary-subtle text-secondary';
            case 'Agendada': return 'bg-primary-subtle text-primary';
            default: return 'bg-light-subtle text-dark';
        }
    }

    function gerarDropdownHtml(disciplinaId) {
        if (!disciplinaId) return '--';
        return `
            <div class="dropdown">
                <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item btn-detalhar-disciplina" href="#" data-disciplina-id="${disciplinaId}"><i class="bi bi-eye me-2"></i>Detalhar</a></li>
                    <li><a class="dropdown-item btn-edit-disciplina" href="#" data-disciplina-id="${disciplinaId}"><i class="bi bi-pencil-square me-2"></i>Editar</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item btn-remover-disciplina text-danger" href="#" data-disciplina-id="${disciplinaId}"><i class="bi bi-trash me-2"></i>Remover</a></li>
                </ul>
            </div>`;
    }

    // =======================================================================
    // == ADIÇÃO 2: A FUNÇÃO popularSelect É NECESSÁRIA PARA O MODAL =========
    // =======================================================================
    function popularSelect(element, options, selectedValue = null, placeholderText = 'Selecione...') {
        if (!element) return;
        element.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = placeholderText;
        element.appendChild(defaultOption);
        options.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.id;
            optElement.textContent = option.nome;
            element.appendChild(optElement);
        });
        element.value = selectedValue || "";
    }
    // =======================================================================
    // == FIM DA ADIÇÃO 2 ====================================================
    // =======================================================================


    // --- DATATABLE INITIALIZATION --- (CÓDIGO ORIGINAL INTACTO)
    function inicializarDataTable() {
        if (!window.jQuery || !$.fn.DataTable) return null;
        if ($.fn.DataTable.isDataTable('#tabelaDisciplinas')) {
            $('#tabelaDisciplinas').DataTable().destroy();
            $('#tabelaDisciplinas tbody').empty();
        }

        tabelaDisciplinasDt = $('#tabelaDisciplinas').DataTable({
            responsive: { details: { type: 'column', target: 0 } },
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto me-md-auto"f><"col-12 col-md-auto dt-buttons-container">>t<"row mt-3 align-items-center"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7 dataTables_paginate_wrapper"p>>',
            paging: false, scrollY: '450px', scrollCollapse: true, lengthChange: false,
            language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar disciplinas...", info: "Total de _TOTAL_ disciplinas" },
            columnDefs: [
                { orderable: false, className: 'dtr-control', targets: 0 },
                { responsivePriority: 1, targets: 1 }, { responsivePriority: 2, targets: 2 },
                { responsivePriority: 3, targets: 3, className: 'dt-periodo-column' },
                { responsivePriority: 4, targets: 4 },
                { orderable: false, className: "dt-actions-column-left no-export", targets: -1, responsivePriority: 10000 }
            ],
            data: listaDisciplinas.map(disciplina => {
                const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(disciplina.status)}">${disciplina.status}</span>`;
                return ['', disciplina.nome, disciplina.professor || '-', disciplina.periodo || '-', statusBadgeHtml, gerarDropdownHtml(disciplina.id)];
            }),
            initComplete: function () {
                const api = this.api();
                $('#tabelaDisciplinas_filter input').addClass('form-control form-control-sm');
                const buttonsContainer = $(this.api().table().container()).find('.dt-custom-header .dt-buttons-container');
                
                const filterStatusHtml = `<select id="filterStatusDisciplina" class="form-select form-select-sm dt-filter-select"><option value="">Todos os Status</option><option value="Ativa">Ativa</option><option value="Concluída">Concluída</option><option value="Em Andamento">Em Andamento</option><option value="Agendada">Agendada</option></select>`;
                const filterPeriodoHtml = `<select id="filterPeriodo" class="form-select dt-filter-select"><option value="">Todos os Períodos</option><option value="2024.1">2024.1</option><option value="2025.1">2025.1</option><option value="2025.2">2025.2</option></select>`;
                
                buttonsContainer.append(filterStatusHtml, filterPeriodoHtml);
                buttonsContainer.addClass('d-flex flex-wrap gap-2'); 
                
                if (abrirModalNovaDisciplinaBtnOriginal) {
                    buttonsContainer.append(abrirModalNovaDisciplinaBtnOriginal); 
                }

                $('#filterStatusDisciplina').on('change', function () { api.column(4).search($(this).val() ? '^' + $(this).val() + '$' : '', true, false).draw(); });
                $('#filterPeriodo').on('change', function () { api.column(3).search($(this).val() ? '^' + $(this).val() + '$' : '', true, false).draw(); });
                
                $(window).off('resize.dtDisciplinas').on('resize.dtDisciplinas', () => {
                    clearTimeout(resizeDebounceTimer);
                    resizeDebounceTimer = setTimeout(() => { if (tabelaDisciplinasDt) tabelaDisciplinasDt.columns.adjust().responsive.recalc(); }, 250);
                });
            },
            drawCallback: function (settings) {
                const api = this.api();
                api.rows({ page: 'current' }).nodes().each(function (rowNode, index) {
                    const dropdownToggleEl = rowNode.querySelector('[data-bs-toggle="dropdown"]');
                    if (dropdownToggleEl && !bootstrap.Dropdown.getInstance(dropdownToggleEl)) {
                        new bootstrap.Dropdown(dropdownToggleEl, { popperConfig: { strategy: 'fixed' } });
                    }
                    if (!$(rowNode).data('completo')) {
                        const rowData = api.row(rowNode).data();
                        if (rowData) {
                            const disciplinaOriginal = listaDisciplinas.find(d => d.nome === rowData[1]);
                            if (disciplinaOriginal) {
                                $(rowNode).data('completo', disciplinaOriginal);
                            }
                        }
                    }
                });
            }
        });
        return tabelaDisciplinasDt;
    }

    // --- AÇÕES DA TABELA (MODAL DE DETALHES, EDITAR, REMOVER) --- (CÓDIGO ORIGINAL INTACTO)
    $('#tabelaDisciplinas tbody').on('click', '.btn-detalhar-disciplina, .btn-edit-disciplina, .btn-remover-disciplina', function (e) {
        e.preventDefault(); e.stopPropagation();
        let tr = $(this).closest('tr');
        if (tr.hasClass('dtr-bs-modal')) tr = tr.prev('tr.parent');

        const dadosCompletos = tr.data('completo');
        if (!dadosCompletos) {
            console.error("Não foi possível encontrar os dados completos para a linha.", tr);
            return;
        };

        const dropdownElement = $(this).closest('.dropdown').find('[data-bs-toggle="dropdown"]')[0];
        if (dropdownElement) { const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownElement); if (dropdownInstance) dropdownInstance.hide(); }

        if ($(this).hasClass('btn-edit-disciplina')) {
            abrirModalFormDisciplina(true, dadosCompletos, tr[0]);
        } else if ($(this).hasClass('btn-remover-disciplina')) {
            if (confirm(`Tem certeza que deseja remover "${dadosCompletos.nome}"?`)) {
                const indexNaLista = listaDisciplinas.findIndex(d => d.id === dadosCompletos.id);
                if(indexNaLista > -1) listaDisciplinas.splice(indexNaLista, 1);
                tabelaDisciplinasDt.row(tr).remove().draw();
            }
        } else if ($(this).hasClass('btn-detalhar-disciplina')) {
            detalheDisciplinaNome.textContent = dadosCompletos.nome || 'Detalhes da Disciplina';
            detalheDisciplinaDescricao.textContent = dadosCompletos.descricao || 'Nenhuma descrição fornecida.';
            detalheDisciplinaProfessor.textContent = dadosCompletos.professor || '-';
            detalheDisciplinaPeriodo.textContent = dadosCompletos.periodo || '-';
            detalheDisciplinaStatus.innerHTML = `<span class="badge ${getStatusBadgeClass(dadosCompletos.status)}">${dadosCompletos.status}</span>`;
            const bsModal = new bootstrap.Modal(modalDetalhesDisciplina);
            bsModal.show();
        }
    });

    // --- LÓGICA DO FORMULÁRIO DE DISCIPLINA --- (CÓDIGO ORIGINAL INTACTO)
    function abrirModalFormDisciplina(isEditMode = false, dadosDisciplina = null, targetTr = null) {
        if (!formDisciplina || !modalDisciplinaAdicao || !disciplinaNomeInput) return;
        formDisciplina.reset();
        [disciplinaNomeInput, disciplinaDescricaoInput, disciplinaPeriodoSelect, disciplinaStatusSelect].forEach(el => el && clearFieldError(el));
        
        delete formDisciplina.dataset.disciplinaId;
        delete formDisciplina.dataset.rowIndex;
        
        modalDisciplinaLabel.textContent = isEditMode ? "Editar Disciplina" : "Adicionar Disciplina";

        if (isEditMode && dadosDisciplina) {
            disciplinaNomeInput.value = dadosDisciplina.nome || '';
            disciplinaDescricaoInput.value = dadosDisciplina.descricao || '';
            disciplinaProfessorInput.value = dadosDisciplina.professor || '';
            disciplinaPeriodoSelect.value = dadosDisciplina.periodo || '';
            disciplinaStatusSelect.value = dadosDisciplina.status || '';
            formDisciplina.dataset.disciplinaId = dadosDisciplina.id;
            if (tabelaDisciplinasDt && targetTr) {
                formDisciplina.dataset.rowIndex = tabelaDisciplinasDt.row(targetTr).index();
            }
        } else {
            disciplinaStatusSelect.value = "Ativa";
            disciplinaDescricaoInput.value = '';
        }

        const bsModal = bootstrap.Modal.getInstance(modalDisciplinaAdicao) || new bootstrap.Modal(modalDisciplinaAdicao);
        bsModal.show();
    }
    
    if (abrirModalNovaDisciplinaBtnOriginal) {
        abrirModalNovaDisciplinaBtnOriginal.addEventListener('click', () => {
            abrirModalFormDisciplina(false);
        });
    }

    if (formDisciplina) {
        formDisciplina.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!validateFormDisciplina()) return;

            const formDisciplinaId = formDisciplina.dataset.disciplinaId;
            const rowIndex = formDisciplina.dataset.rowIndex;
            const descriptionContent = disciplinaDescricaoInput.value.trim();

            const dadosCompletosDisciplina = {
                id: formDisciplinaId || 'disc-' + new Date().getTime(),
                nome: disciplinaNomeInput.value.trim(),
                descricao: descriptionContent,
                professor: disciplinaProfessorInput.value.trim() || '-',
                periodo: disciplinaPeriodoSelect.value,
                status: disciplinaStatusSelect.value,
            };

            const indexNaLista = listaDisciplinas.findIndex(d => d.id === formDisciplinaId);
            if (indexNaLista > -1) {
                listaDisciplinas[indexNaLista] = dadosCompletosDisciplina;
                tabelaDisciplinasDt.row(rowIndex).data([
                    '', dadosCompletosDisciplina.nome, dadosCompletosDisciplina.professor, 
                    dadosCompletosDisciplina.periodo, 
                    `<span class="badge ${getStatusBadgeClass(dadosCompletosDisciplina.status)}">${dadosCompletosDisciplina.status}</span>`, 
                    gerarDropdownHtml(dadosCompletosDisciplina.id)
                ]).draw(false);
            } else {
                listaDisciplinas.push(dadosCompletosDisciplina);
                tabelaDisciplinasDt.row.add([
                    '', dadosCompletosDisciplina.nome, dadosCompletosDisciplina.professor, 
                    dadosCompletosDisciplina.periodo, 
                    `<span class="badge ${getStatusBadgeClass(dadosCompletosDisciplina.status)}">${dadosCompletosDisciplina.status}</span>`, 
                    gerarDropdownHtml(dadosCompletosDisciplina.id)
                ]).draw(false);
            }
            
            const bsModal = bootstrap.Modal.getInstance(modalDisciplinaAdicao);
            if(bsModal) bsModal.hide();
        });
    }

    // =======================================================================
    // == SEÇÃO DO MODAL DE ANOTAÇÃO - CORRIGIDA E COMPLETA ==================
    // =======================================================================
    function inicializarEditorAnotacao() {
        if (typeof tinymce !== 'undefined') {
            tinymce.remove('#conteudoAnotacao');
            tinymce.init({
                selector: '#conteudoAnotacao',
                plugins: 'lists link image table code help wordcount autoresize',
                toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image table code help',
                height: 350,
                min_height: 400,
                menubar: true,
                branding: false,
                statusbar: false,
                language: 'pt_BR'
            });
        } else {
            console.error("TinyMCE não foi carregado.");
        }
    }

    const modalAnotacao = document.getElementById('modalNovaAnotacao');
    if (modalAnotacao) {
        const anotacaoDisciplinaSelect = document.getElementById('principalAnotacaoDisciplinaSelect');
        const anotacaoAtividadeSelect = document.getElementById('principalAnotacaoAtividadeSelect');

        modalAnotacao.addEventListener('show.bs.modal', function () {
            popularSelect(anotacaoDisciplinaSelect, disciplinasParaSelect, null, "Selecione uma disciplina...");
            popularSelect(anotacaoAtividadeSelect, todasAtividadesParaSelect, null, "Qualquer Atividade");
            anotacaoAtividadeSelect.disabled = false;
        });

        modalAnotacao.addEventListener('shown.bs.modal', function () {
            inicializarEditorAnotacao();
        });

        modalAnotacao.addEventListener('hidden.bs.modal', function () {
            const editor = tinymce.get('conteudoAnotacao');
            if (editor) {
                editor.destroy();
            }
        });

        anotacaoDisciplinaSelect.addEventListener('change', function () {
            const disciplinaId = this.value;
            if (disciplinaId) {
                const atividadesFiltradas = atividadesPorDisciplina[disciplinaId] || [];
                popularSelect(anotacaoAtividadeSelect, atividadesFiltradas, null, "Nenhuma atividade específica");
            } else {
                popularSelect(anotacaoAtividadeSelect, todasAtividadesParaSelect, null, "Qualquer Atividade");
            }
        });
    }

    // --- INICIALIZAÇÃO GERAL ---
    inicializarDataTable();
});
