document.addEventListener("DOMContentLoaded", function () {
    // --- VARIÁVEIS GLOBAIS ---
    let listaDisciplinas = [];
    let listaTarefas = [];
    let tabelaDisciplinasDt;
    let resizeDebounceTimer;

    // =======================================================================
    // == FUNÇÕES DE COMUNICAÇÃO COM O BACK-END =============================
    // =======================================================================
    
    // Função para buscar todas as disciplinas do usuário
    async function buscarDisciplinas() {
        try {
            const response = await fetch('/api/disciplinas');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const disciplinas = await response.json();
            listaDisciplinas = disciplinas;
            return disciplinas;
        } catch (error) {
            console.error('Erro ao buscar disciplinas:', error);
            mostrarNotificacao('Erro ao carregar disciplinas', 'error');
            return [];
        }
    }

    // Função para criar uma nova disciplina
    async function criarDisciplina(dadosDisciplina) {
        try {
            const response = await fetch('/api/disciplinas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosDisciplina)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao criar disciplina');
            }

            const novaDisciplina = await response.json();
            return novaDisciplina;
        } catch (error) {
            console.error('Erro ao criar disciplina:', error);
            throw error;
        }
    }

    // Função para atualizar uma disciplina
    async function atualizarDisciplina(disciplinaId, dadosDisciplina) {
        try {
            const response = await fetch(`/api/disciplinas/${disciplinaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosDisciplina)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao atualizar disciplina');
            }

            const disciplinaAtualizada = await response.json();
            return disciplinaAtualizada;
        } catch (error) {
            console.error('Erro ao atualizar disciplina:', error);
            throw error;
        }
    }

    // Função para deletar uma disciplina
    async function deletarDisciplina(disciplinaId) {
        try {
            const response = await fetch(`/api/disciplinas/${disciplinaId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao deletar disciplina');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao deletar disciplina:', error);
            throw error;
        }
    }

    // Função para buscar uma disciplina específica
    async function buscarDisciplina(disciplinaId) {
        try {
            const response = await fetch(`/api/disciplina/${disciplinaId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar disciplina:', error);
            throw error;
        }
    }

    // Função para mostrar notificações
    function mostrarNotificacao(mensagem, tipo = 'success') {
        // Implementação simples de notificação
        // Você pode usar uma biblioteca como Toastr ou SweetAlert2
        alert(`${tipo.toUpperCase()}: ${mensagem}`);
    }

    // =======================================================================
    // == FIM DAS FUNÇÕES DE COMUNICAÇÃO COM O BACK-END =====================
    // =======================================================================

    // =======================================================================
    // == DADOS E ESTRUTURAS AUXILIARES PARA O MODAL DE ANOTAÇÃO ============
    // =======================================================================
    // Estes dados são essenciais para saber quais tarefas existem.
    // Por enquanto, mantemos mockados até implementar a integração com tarefas
    listaTarefas = [
        { id: "T001", titulo: "Complexidade e Estruturas Lineares", disciplinaId: "CS101" },
        { id: "T002", titulo: "Trabalho sobre Árvores AVL", disciplinaId: "CS101" },
        { id: "T006", titulo: "Camadas de Transporte e Aplicação", disciplinaId: "CS102" },
        { id: "T007", titulo: "Configuração de Roteadores", disciplinaId: "CS102" },
        { id: "T010", titulo: "Modelagem Entidade-Relacionamento", disciplinaId: "CS103" }
    ];

    // Estruturas que formatam os dados para os dropdowns.
    const disciplinasParaSelect = () => listaDisciplinas.map(d => ({ id: d.id, nome: d.nome }));
    const todasAtividadesParaSelect = listaTarefas.map(t => ({ id: t.id, nome: t.titulo }));
    const atividadesPorDisciplina = () => {
        return listaDisciplinas.reduce((acc, disciplina) => {
            acc[disciplina.id] = listaTarefas
                .filter(t => t.disciplinaId === disciplina.id)
                .map(t => ({ id: t.id, nome: t.titulo }));
            return acc;
        }, {});
    };
    // =======================================================================
    // == FIM DA SEÇÃO DE DADOS AUXILIARES ==================================
    // =======================================================================

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
            case 'ATIVA': return 'bg-success-subtle text-success';
            case 'EM ANDAMENTO': return 'bg-info-subtle text-info';
            case 'CONCLUÍDA': return 'bg-secondary-subtle text-secondary';
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

    // --- DATATABLE INITIALIZATION ---
    function inicializarDataTable() {
        if (!window.jQuery || !$.fn.DataTable) {
            console.error("jQuery ou DataTables não foi carregado.");
            return null;
        }
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

            data: listaDisciplinas,
            columns: [
                {
                    data: null,
                    defaultContent: '',
                    className: 'dtr-control',
                    orderable: false,
                    responsivePriority: 1
                },
                { data: 'nome', responsivePriority: 2 },
                { data: 'professor', responsivePriority: 10002 },
                { data: 'periodo', responsivePriority: 10003, className: 'dt-periodo-column' },
                {
                    data: 'status',
                    responsivePriority: 10004,
                    render: function (data, type, row) {
                        return `<span class="badge ${getStatusBadgeClass(data)}">${data}</span>`;
                    }
                },
                {
                    data: 'id',
                    orderable: false,
                    className: "dt-actions-column-left no-export",
                    responsivePriority: 3,
                    render: function (data, type, row) {
                        return gerarDropdownHtml(data);
                    }
                }
            ],

            initComplete: function () {
                const api = this.api();
                $('#tabelaDisciplinas_filter input').addClass('form-control form-control-sm');
                const buttonsContainer = $(this.api().table().container()).find('.dt-custom-header .dt-buttons-container');

                const filterStatusHtml = `<select id="filterStatusDisciplina" class="form-select form-select-sm dt-filter-select"><option value="">Todos os Status</option><option value="ATIVA">Ativa</option><option value="CONCLUÍDA">Concluída</option><option value="EM ANDAMENTO">Em Andamento</option><option value="Agendada">Agendada</option></select>`;
                const filterPeriodoHtml = `<select id="filterPeriodo" class="form-select dt-filter-select"><option value="">Todos os Períodos</option><option value="2024.1">2024.1</option><option value="2025.1">2025.1</option><option value="2025.2">2025.2</option></select>`;

                buttonsContainer.append(filterStatusHtml, filterPeriodoHtml);
                buttonsContainer.addClass('d-flex flex-wrap gap-2');

                if (abrirModalNovaDisciplinaBtnOriginal) {
                    buttonsContainer.append(abrirModalNovaDisciplinaBtnOriginal);
                }

                $('#filterStatusDisciplina').on('change', function () {
                    const statusSelecionado = $(this).val();
                    api.column(4).search(statusSelecionado ? '^' + statusSelecionado + '$' : '', true, false).draw();
                });

                $('#filterPeriodo').on('change', function () {
                    api.column(3).search($(this).val() ? `^${$(this).val()}$` : '', true, false).draw();
                });

                $(window).off('resize.dtDisciplinas').on('resize.dtDisciplinas', () => {
                    clearTimeout(resizeDebounceTimer);
                    resizeDebounceTimer = setTimeout(() => { if (tabelaDisciplinasDt) tabelaDisciplinasDt.columns.adjust().responsive.recalc(); }, 250);
                });
            },
            drawCallback: function (settings) {
                this.api().rows({ page: 'current' }).nodes().each(function (rowNode, index) {
                    const dropdownToggleEl = rowNode.querySelector('[data-bs-toggle="dropdown"]');
                    if (dropdownToggleEl && !bootstrap.Dropdown.getInstance(dropdownToggleEl)) {
                        new bootstrap.Dropdown(dropdownToggleEl, { popperConfig: { strategy: 'fixed' } });
                    }
                });
            }
        });
        return tabelaDisciplinasDt;
    }

    // --- EVENT LISTENER DE CLICK NA TABELA ---
    $('#tabelaDisciplinas tbody').on('click', '.btn-detalhar-disciplina, .btn-edit-disciplina, .btn-remover-disciplina', function (e) {
        e.preventDefault();
        e.stopPropagation();

        let tr = $(this).closest('tr');
        if (tr.hasClass('dtr-bs-modal')) {
            tr = tr.prev('tr.parent');
        }

        const dadosCompletos = tabelaDisciplinasDt.row(tr).data();

        if (!dadosCompletos) {
            console.error("Não foi possível encontrar os dados da disciplina para esta linha.", tr);
            return;
        }

        console.log("1. DADOS CAPTURADOS DA LINHA:", dadosCompletos);

        // Fecha o dropdown de ações, se estiver aberto
        const dropdownElement = $(this).closest('.dropdown').find('[data-bs-toggle="dropdown"]')[0];
        if (dropdownElement) {
            const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownElement);
            if (dropdownInstance) dropdownInstance.hide();
        }

        if ($(this).hasClass('btn-edit-disciplina')) {
            abrirModalFormDisciplina(true, dadosCompletos, tr[0]);

        } else if ($(this).hasClass('btn-remover-disciplina')) {
            if (confirm(`Tem certeza que deseja remover "${dadosCompletos.nome}"?`)) {
                deletarDisciplinaDaTabela(dadosCompletos.id, tr);
            }
        } else if ($(this).hasClass('btn-detalhar-disciplina')) {
            detalheDisciplinaNome.textContent = dadosCompletos.nome || 'Detalhes da Disciplina';
            detalheDisciplinaDescricao.textContent = dadosCompletos.descricao || 'Nenhuma descrição fornecida.';
            detalheDisciplinaProfessor.textContent = dadosCompletos.professor || '-';
            detalheDisciplinaPeriodo.textContent = dadosCompletos.periodo || '-';
            detalheDisciplinaStatus.innerHTML = `<span class="badge ${getStatusBadgeClass(dadosCompletos.status)}">${dadosCompletos.status}</span>`;

            // Adiciona event listeners para os botões de ação
            adicionarEventListenersBotoesAcao(dadosCompletos.id);

            const bsModal = new bootstrap.Modal(modalDetalhesDisciplina);
            bsModal.show();
        }
    });

    // --- FUNÇÃO PARA ADICIONAR EVENT LISTENERS AOS BOTÕES DE AÇÃO ---
    function adicionarEventListenersBotoesAcao(disciplinaId) {
        // Remove event listeners anteriores para evitar duplicação
        const btnVerTarefas = modalDetalhesDisciplina.querySelector('.btn-ver-tarefas');
        const btnVerAnotacoes = modalDetalhesDisciplina.querySelector('.btn-ver-anotacoes');
        
        if (btnVerTarefas) {
            btnVerTarefas.onclick = null; // Remove listener anterior
            btnVerTarefas.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = `/tarefas?disciplina_id=${disciplinaId}`;
            });
        }
        
        if (btnVerAnotacoes) {
            btnVerAnotacoes.onclick = null; // Remove listener anterior
            btnVerAnotacoes.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = `/anotacao?disciplina_id=${disciplinaId}`;
            });
        }
    }

    // --- FUNÇÕES PARA MANIPULAR DISCIPLINAS ---
    async function deletarDisciplinaDaTabela(disciplinaId, tr) {
        try {
            await deletarDisciplina(disciplinaId);
            
            // Remove da lista local
            const indexNaLista = listaDisciplinas.findIndex(d => d.id === disciplinaId);
            if (indexNaLista > -1) {
                listaDisciplinas.splice(indexNaLista, 1);
            }
            
            // Remove da tabela
            tabelaDisciplinasDt.row(tr).remove().draw();
            
            mostrarNotificacao('Disciplina removida com sucesso!', 'success');
        } catch (error) {
            mostrarNotificacao(error.message, 'error');
        }
    }

    // --- LÓGICA DO FORMULÁRIO DE DISCIPLINA ---
    function abrirModalFormDisciplina(isEditMode = false, dadosDisciplina = null, targetTr = null) {
        if (!formDisciplina || !modalDisciplinaAdicao || !disciplinaNomeInput) {
            console.error("Elementos essenciais do modal não foram encontrados. Verifique os IDs no HTML.");
            return;
        }
        console.log("2. DADOS RECEBIDOS PELO MODAL:", dadosDisciplina);

        formDisciplina.reset();
        delete formDisciplina.dataset.disciplinaId;
        delete formDisciplina.dataset.rowIndex;

        if (isEditMode && dadosDisciplina) {
            formDisciplina.dataset.disciplinaId = dadosDisciplina.id;
            if (tabelaDisciplinasDt && targetTr) {
                formDisciplina.dataset.rowIndex = tabelaDisciplinasDt.row(targetTr).index();
            }
        }

        modalDisciplinaLabel.textContent = isEditMode ? "Editar Disciplina" : "Adicionar Disciplina";

        $(modalDisciplinaAdicao).one('shown.bs.modal', function () {
            console.log("4. MODAL COMPLETAMENTE VISÍVEL. Preenchendo os campos agora.");

            if (isEditMode && dadosDisciplina) {
                disciplinaNomeInput.value = dadosDisciplina.nome || '';
                disciplinaDescricaoInput.value = dadosDisciplina.descricao || '';
                disciplinaProfessorInput.value = dadosDisciplina.professor || '';
                disciplinaPeriodoSelect.value = dadosDisciplina.periodo || '';
                disciplinaStatusSelect.value = dadosDisciplina.status || '';
            } else {
                disciplinaStatusSelect.value = "ATIVA";
            }
        });

        const bsModal = bootstrap.Modal.getInstance(modalDisciplinaAdicao) || new bootstrap.Modal(modalDisciplinaAdicao);
        bsModal.show();
    }

    if (abrirModalNovaDisciplinaBtnOriginal) {
        abrirModalNovaDisciplinaBtnOriginal.addEventListener('click', () => {
            abrirModalFormDisciplina(false);
        });
    }

    // --- EVENT LISTENER DE SUBMIT ---
    if (formDisciplina) {
        formDisciplina.addEventListener("submit", async function (e) {
            e.preventDefault();
            if (!validateFormDisciplina()) {
                console.warn("Formulário inválido.");
                return;
            }

            const formDisciplinaId = formDisciplina.dataset.disciplinaId;
            const rowIndex = formDisciplina.dataset.rowIndex;
            const isEditMode = !!formDisciplinaId;

            const dadosDisciplina = {
                nome: disciplinaNomeInput.value.trim(),
                descricao: disciplinaDescricaoInput.value.trim(),
                professor: disciplinaProfessorInput.value.trim() || '',
                periodo: disciplinaPeriodoSelect.value,
                status: disciplinaStatusSelect.value,
            };

            try {
                if (isEditMode) {
                    // MODO EDIÇÃO
                    const disciplinaAtualizada = await atualizarDisciplina(formDisciplinaId, dadosDisciplina);
                    
                    // Atualiza a lista local
                    const indexNaLista = listaDisciplinas.findIndex(d => d.id == formDisciplinaId);
                    if (indexNaLista > -1) {
                        listaDisciplinas[indexNaLista] = disciplinaAtualizada;
                    }
                    
                    // Atualiza a tabela
                    tabelaDisciplinasDt.row(rowIndex).data(disciplinaAtualizada).draw(false);
                    mostrarNotificacao('Disciplina atualizada com sucesso!', 'success');
                } else {
                    // MODO ADIÇÃO
                    const novaDisciplina = await criarDisciplina(dadosDisciplina);
                    
                    // Adiciona na lista local
                    listaDisciplinas.push(novaDisciplina);
                    
                    // Adiciona na tabela
                    tabelaDisciplinasDt.row.add(novaDisciplina).draw(false);
                    mostrarNotificacao('Disciplina criada com sucesso!', 'success');
                }

                // Fecha o modal
                const bsModal = bootstrap.Modal.getInstance(modalDisciplinaAdicao);
                if (bsModal) bsModal.hide();

            } catch (error) {
                mostrarNotificacao(error.message, 'error');
            }
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

    // =======================================================================
    // == QUICK ADD: TAREFA/PROVA - POPULAR DISCIPLINAS DINAMICAMENTE ========
    // =======================================================================
    const modalTarefaQuickAdd = document.getElementById('modalTarefaPrincipalQuickAdd');
    if (modalTarefaQuickAdd) {
        const tarefaDisciplinaSelect = document.getElementById('principalTarefaDisciplinaQuickAdd');

        modalTarefaQuickAdd.addEventListener('show.bs.modal', function () {
            // Garante que a lista está atualizada (usa cache já carregado nesta página)
            // Se quiser forçar atualização: chamar buscarDisciplinas() aqui de forma assíncrona
            popularSelect(tarefaDisciplinaSelect, disciplinasParaSelect(), null, "Selecione...");
        });
    }

    const modalAnotacao = document.getElementById('modalNovaAnotacao');
    if (modalAnotacao) {
        const anotacaoDisciplinaSelect = document.getElementById('principalAnotacaoDisciplinaSelect');
        const anotacaoAtividadeSelect = document.getElementById('principalAnotacaoAtividadeSelect');

        modalAnotacao.addEventListener('show.bs.modal', function () {
            popularSelect(anotacaoDisciplinaSelect, disciplinasParaSelect(), null, "Selecione...");
            popularSelect(anotacaoAtividadeSelect, todasAtividadesParaSelect, null, "Selecione...");
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
                const atividadesFiltradas = atividadesPorDisciplina()[disciplinaId] || [];
                popularSelect(anotacaoAtividadeSelect, atividadesFiltradas, null, "Nenhuma atividade específica");
            } else {
                popularSelect(anotacaoAtividadeSelect, todasAtividadesParaSelect, null, "Qualquer Atividade");
            }
        });
    }

    // --- INICIALIZAÇÃO DA APLICAÇÃO ---
    async function inicializarAplicacao() {
        try {
            // Se temos dados iniciais do back-end, usamos eles
            if (window.disciplinasData) {
                listaDisciplinas = window.disciplinasData;
                console.log('Usando dados iniciais do back-end:', listaDisciplinas);
            } else {
                // Caso contrário, busca do servidor
                await buscarDisciplinas();
            }
            
            // Inicializa a tabela com os dados carregados
            inicializarDataTable();
            
            console.log('Aplicação inicializada com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            mostrarNotificacao('Erro ao carregar dados', 'error');
        }
    }

    // Inicia a aplicação
    inicializarAplicacao();
});