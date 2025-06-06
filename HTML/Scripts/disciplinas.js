document.addEventListener("DOMContentLoaded", function () {
    // --- ELEMENT SELECTORS ---
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

    // --- FUNÇÕES DE VALIDAÇÃO ---
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

    // --- FUNÇÕES DE UI E AUXILIARES ---
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

    function popularSelect(el, opts, selVal = null) {
        if (!el) return;
        el.innerHTML = '';
        opts.forEach(opt => {
            const o = document.createElement('option');
            o.value = (typeof opt === 'object' ? opt.id : opt);
            o.textContent = (typeof opt === 'object' ? opt.nome : opt);
            if (selVal && (String(o.value) === String(selVal) || (typeof opt === 'object' && opt.nome === selVal))) o.selected = true;
            el.appendChild(o);
        });
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
                const filterStatusHtml = `<select id="filterStatusDisciplina" class="form-select dt-filter-select"><option value="">Todos os Status</option><option value="Ativa">Ativa</option><option value="Concluída">Concluída</option><option value="Em Andamento">Em Andamento</option><option value="Agendada">Agendada</option></select>`;
                const filterPeriodoHtml = `<select id="filterPeriodo" class="form-select dt-filter-select"><option value="">Todos os Períodos</option><option value="2024.1">2024.1</option><option value="2025.1">2025.1</option><option value="2025.2">2025.2</option></select>`;
                buttonsContainer.append(filterStatusHtml, filterPeriodoHtml);
                
                // ================== CÓDIGO CORRIGIDO ==================
                if (abrirModalNovaDisciplinaBtnOriginal) {
                    // Mover o botão original para o container da tabela, em vez de clonar
                    buttonsContainer.append(abrirModalNovaDisciplinaBtnOriginal); 
                }
                // ======================================================

                $('#filterStatusDisciplina').on('change', function () { api.column(4).search($(this).val() ? '^' + $(this).val() + '$' : '', true, false).draw(); });
                $('#filterPeriodo').on('change', function () { api.column(3).search($(this).val() ? '^' + $(this).val() + '$' : '', true, false).draw(); });
                
                $('#tabelaDisciplinas tbody tr').each(function (index, el) {
                    const rowData = api.row(el).data();
                    const disciplinaOriginal = listaDisciplinas.find(d => d.nome === rowData[1]);
                    if (disciplinaOriginal) $(this).data('completo', disciplinaOriginal);
                });

                $(window).off('resize.dtDisciplinas').on('resize.dtDisciplinas', () => {
                    clearTimeout(resizeDebounceTimer);
                    resizeDebounceTimer = setTimeout(() => { if (tabelaDisciplinasDt) tabelaDisciplinasDt.columns.adjust().responsive.recalc(); }, 250);
                });
            },
            drawCallback: function (settings) {
                const dropdownToggleList = [].slice.call(this.api().table().body().querySelectorAll('[data-bs-toggle="dropdown"]'));
                dropdownToggleList.forEach(function (dropdownToggleEl) {
                    if (!bootstrap.Dropdown.getInstance(dropdownToggleEl)) {
                        new bootstrap.Dropdown(dropdownToggleEl, { popperConfig: { strategy: 'fixed' } });
                    }
                });
            }
        });
        return tabelaDisciplinasDt;
    }

    // --- AÇÕES DA TABELA (MODAL DE DETALHES, EDITAR, REMOVER) ---
    $('#tabelaDisciplinas tbody').on('click', '.btn-detalhar-disciplina, .btn-edit-disciplina, .btn-remover-disciplina', function (e) {
        e.preventDefault(); e.stopPropagation();
        let tr = $(this).closest('tr');
        if (tr.hasClass('dtr-bs-modal')) tr = tr.prev('tr.parent');

        const dadosCompletos = tr.data('completo');
        if (!dadosCompletos) return;

        const dropdownElement = $(this).closest('.dropdown').find('[data-bs-toggle="dropdown"]')[0];
        if (dropdownElement) { const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownElement); if (dropdownInstance) dropdownInstance.hide(); }

        if ($(this).hasClass('btn-edit-disciplina')) {
            abrirModalFormDisciplina(true, dadosCompletos, tr[0]);
        } else if ($(this).hasClass('btn-remover-disciplina')) {
            if (confirm(`Tem certeza que deseja remover "${dadosCompletos.nome}"?`)) {
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

    // --- LÓGICA PARA MODAIS DE ADIÇÃO RÁPIDA (SIDEBAR) ---
    (function setupQuickAddModals() {
        const disciplinasParaSelects = ["Nenhuma", ...new Set(listaDisciplinas.map(d => d.nome))];
        const atividadesPorDisciplina = { "Nenhuma": ["Nenhuma"] };
        listaDisciplinas.forEach(d => {
            atividadesPorDisciplina[d.nome] = ["Nenhuma", "Atividade Genérica 1", "Atividade Genérica 2"];
        });

        const modalTarefaEl = document.getElementById('modalTarefaAdicaoPrincipal');
        if (modalTarefaEl) {
            const form = modalTarefaEl.querySelector('form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert("Lógica para salvar Tarefa/Prova...");
                bootstrap.Modal.getInstance(modalTarefaEl).hide();
            });
        }

        const modalAnotacaoEl = document.getElementById('modalAnotacaoPrincipal');
        if (modalAnotacaoEl) {
            const form = modalAnotacaoEl.querySelector('form');
            const disciplinaSelect = form.querySelector('#principalAnotacaoDisciplinaSelect');
            const atividadeSelect = form.querySelector('#principalAnotacaoAtividadeSelect');
            const conteudoTextarea = form.querySelector('#principalAnotacaoConteudoInput');

            modalAnotacaoEl.addEventListener('show.bs.modal', () => {
                form.reset();
                popularSelect(disciplinaSelect, disciplinasParaSelects, "Nenhuma");
                popularSelect(atividadeSelect, atividadesPorDisciplina[disciplinaSelect.value] || ["Nenhuma"], "Nenhuma");
                if (typeof tinymce !== 'undefined') {
                    tinymce.get(conteudoTextarea.id)?.destroy();
                    tinymce.init({
                        selector: `#${conteudoTextarea.id}`,
                        plugins: 'lists link image table code help wordcount autoresize',
                        toolbar: 'undo redo | blocks | bold italic | bullist numlist | link | code',
                        height: 250, menubar: false, branding: false, statusbar: false,
                        setup: (editor) => { editor.on('init', () => editor.setContent('')); }
                    });
                }
            });
            modalAnotacaoEl.addEventListener('hidden.bs.modal', () => {
                tinymce.get(conteudoTextarea.id)?.destroy();
            });
            disciplinaSelect.addEventListener('change', function () {
                popularSelect(atividadeSelect, atividadesPorDisciplina[this.value] || ["Nenhuma"], "Nenhuma");
            });
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert("Lógica para salvar Anotação...");
                bootstrap.Modal.getInstance(modalAnotacaoEl).hide();
            });
        }
    })();
    
    // --- LÓGICA DO FORMULÁRIO PRINCIPAL DE EDIÇÃO/CRIAÇÃO DE DISCIPLINA ---
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
        }
        const bsModal = bootstrap.Modal.getInstance(modalDisciplinaAdicao) || new bootstrap.Modal(modalDisciplinaAdicao);
        bsModal.show();
    }

    if (formDisciplina) {
        formDisciplina.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!validateFormDisciplina()) return;

            const formDisciplinaId = formDisciplina.dataset.disciplinaId;
            const rowIndex = formDisciplina.dataset.rowIndex;

            const dadosCompletosDisciplina = {
                id: formDisciplinaId || 'disc-' + new Date().getTime(),
                nome: disciplinaNomeInput.value.trim(),
                descricao: disciplinaDescricaoInput.value.trim(),
                professor: disciplinaProfessorInput.value.trim() || '-',
                periodo: disciplinaPeriodoSelect.value,
                status: disciplinaStatusSelect.value,
            };

            const indexNaLista = listaDisciplinas.findIndex(d => d.id === formDisciplinaId);
            if (indexNaLista > -1) {
                listaDisciplinas[indexNaLista] = dadosCompletosDisciplina;
            } else {
                listaDisciplinas.push(dadosCompletosDisciplina);
            }

            const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(dadosCompletosDisciplina.status)}">${dadosCompletosDisciplina.status}</span>`;
            const dadosLinhaTabela = ['', dadosCompletosDisciplina.nome, dadosCompletosDisciplina.professor, dadosCompletosDisciplina.periodo, statusBadgeHtml, gerarDropdownHtml(dadosCompletosDisciplina.id)];
            
            let targetRowNode;
            if (formDisciplinaId && rowIndex !== undefined) {
                targetRowNode = tabelaDisciplinasDt.row(rowIndex).data(dadosLinhaTabela).node();
            } else {
                targetRowNode = tabelaDisciplinasDt.row.add(dadosLinhaTabela).node();
            }
            $(targetRowNode).data('completo', dadosCompletosDisciplina);
            
            tabelaDisciplinasDt.draw(false);
            
            const bsModal = bootstrap.Modal.getInstance(modalDisciplinaAdicao);
            if(bsModal) bsModal.hide();
        });
    }

    // --- INICIALIZAÇÃO ---
    inicializarDataTable();
});
