// tarefas.js
document.addEventListener("DOMContentLoaded", function () {
    // --- SELETORES DE ELEMENTOS ---
    const modalTarefaEl = document.getElementById('modalTarefa'); 
    const formTarefa = document.getElementById('formTarefa');
    const modalTarefaLabel = document.getElementById('modalTarefaLabel');
    const tarefaIdInput = document.getElementById('tarefaId');
    const tarefaTituloInput = document.getElementById('tarefaTitulo');
    const tarefaDescricaoInput = document.getElementById('tarefaDescricao');
    const tarefaDisciplinaSelect = document.getElementById('tarefaDisciplina');
    const tarefaDataEntregaInput = document.getElementById('tarefaDataEntrega');
    const tarefaTipoSelect = document.getElementById('tarefaTipo');
    const tarefaStatusSelect = document.getElementById('tarefaStatus');
    const tarefaHorarioEntregaInput = document.getElementById('tarefaHorarioEntrega');

    // Modal de Detalhes da Atividade (agora padronizado)
    const modalDetalhesAtividadeEl = document.getElementById('modalDetalhesAtividade');
    const detalheAtividadeNome = document.getElementById('detalhe-atividade-nome');
    const detalheAtividadeDisciplina = document.getElementById('detalhe-atividade-disciplina');
    const detalheAtividadeTipo = document.getElementById('detalhe-atividade-tipo');
    const detalheAtividadeData = document.getElementById('detalhe-atividade-data');
    const detalheAtividadeStatus = document.getElementById('detalhe-atividade-status');
    const detalheAtividadeDescricao = document.getElementById('detalhe-atividade-descricao');

    // Instâncias de modais Bootstrap
    const bsModalTarefa = new bootstrap.Modal(modalTarefaEl); 
    const bsModalDetalhesAtividade = new bootstrap.Modal(modalDetalhesAtividadeEl, { keyboard: false }); 

    let tabelaTarefasDt;

    // --- DADOS MOCADOS (AGORA GLOBALIZADOS DE FORMA CONSISTENTE) ---
    const listaDisciplinas = [
        { id: "CS101", nome: "Algoritmos e Estrutura de Dados" },
        { id: "CS102", nome: "Redes de Computadores" },
        { id: "CS103", nome: "Banco de Dados" },
        { id: "CS104", nome: "Inteligência Artificial" },
        { id: "CS105", nome: "Compiladores" }
    ];
    let listaTarefas = [
        { id: "T001", titulo: "Complexidade e Estruturas Lineares", disciplinaId: "CS101", tipo: "Prova", dataEntrega: "2025-06-23", status: "Agendada", descricao: "Estudar capítulos 1 a 3 do livro Cormen. Foco em complexidade Big-O." },
        { id: "T006", titulo: "Camadas de Transporte e Aplicação", disciplinaId: "CS102", tipo: "Prova", dataEntrega: "2025-06-24", status: "Agendada", descricao: "Foco em protocolos TCP, UDP e HTTP." },
        { id: "T010", titulo: "SQL e Normalização", disciplinaId: "CS103", tipo: "Prova", dataEntrega: "2025-06-25", status: "Agendada", descricao: "Praticar joins e entender as formas normais (1FN, 2FN, 3FN)." },
        { id: "T013", titulo: "Machine Learning e Redes Neurais", disciplinaId: "CS104", tipo: "Prova", dataEntrega: "2025-06-26", status: "Agendada", descricao: "Revisar conceitos de regressão linear e redes neurais convolucionais." },
        { id: "T017", titulo: "Análise Léxica e Sintática", disciplinaId: "CS105", tipo: "Prova", dataEntrega: "2025-06-29", status: "Agendada", descricao: "Implementar um analisador léxico simples em Python." },
    ];
    
    // --- GLOBALIZAÇÃO DOS DADOS PARA ANOTAÇÕES (IMPORTANTE PARA anotacaoModal.js) ---
    window.listaDisciplinas = listaDisciplinas; 
    window.listaTarefas = listaTarefas; 
    
    window.disciplinasFixasParaSelects = [
        { id: "", nome: "Selecione..." }, 
        ...listaDisciplinas.map(d => ({id: d.id, nome: d.nome}))
    ];
    
    window.atividadesPorDisciplinaParaSelects = { 
        "": [{id: "", nome: "Nenhuma"}], 
        "Nenhuma": [{id: "", nome: "Nenhuma"}], 
        ...Object.fromEntries(
            listaDisciplinas.map(d => [
                d.id, 
                [{id: "", nome: "Nenhuma"}] 
                    .concat(listaTarefas.filter(t => t.disciplinaId === d.id).map(t => ({id: t.id, nome: t.titulo})))
            ])
        ),
        "TCC 1": [{id: "", nome: "Nenhuma"}, {id: "TCC1_Proj", nome: "Revisão Bibliográfica"}, {id: "TCC1_Def", nome: "Defesa da Monografia"}],
        "Outra": [{id: "", nome: "Nenhuma"}, {id: "OUTRA_Gen", nome: "Atividade Geral"}]
    };
    window.atividadesPadraoParaSelects = [{id: "", nome: "Nenhuma"}]; 

    // --- FUNÇÕES DOS MODAIS DE TAREFA (PRINCIPAL) ---
    function abrirModalTarefa(isEditMode = false, dadosTarefa = null, targetTr = null) {
        formTarefa.reset();
        formTarefa.classList.remove('was-validated'); 
        
        popularSelect(tarefaDisciplinaSelect, listaDisciplinas.map(d => ({id: d.id, nome: d.nome})), dadosTarefa ? dadosTarefa.disciplinaId : ''); 
        popularSelect(tarefaStatusSelect, ["A fazer", "Em andamento", "Concluída", "Agendada"], dadosTarefa ? dadosTarefa.status : "A fazer");

        modalTarefaLabel.textContent = isEditMode ? "Editar Tarefa/Prova" : "Adicionar Tarefa/Prova";

        if (isEditMode && dadosTarefa) {
            tarefaIdInput.value = dadosTarefa.id;
            tarefaTituloInput.value = dadosTarefa.titulo || '';
            tarefaDescricaoInput.value = dadosTarefa.descricao || '';
            tarefaDataEntregaInput.value = dadosTarefa.dataEntrega || '';
            tarefaTipoSelect.value = dadosTarefa.tipo || '';
            tarefaHorarioEntregaInput.value = dadosTarefa.tarefaHorarioEntrega || '';

            if (tabelaTarefasDt && targetTr) {
                formTarefa.dataset.rowIndex = tabelaTarefasDt.row(targetTr).index();
            }
        } else {
            tarefaIdInput.value = '';
            delete formTarefa.dataset.rowIndex; 
        }
        bsModalTarefa.show();
    }

    function fecharModalTarefa() {
        bsModalTarefa.hide();
        formTarefa.reset();
        formTarefa.classList.remove('was-validated');
    }

    function abrirModalDetalhesAtividade(tarefaData) {
        const disciplina = listaDisciplinas.find(d => d.id === tarefaData.disciplinaId);
        const dataFormatada = formatarData(tarefaData.dataEntrega);

        detalheAtividadeNome.textContent = tarefaData.titulo || "Detalhes da Atividade";
        detalheAtividadeDisciplina.textContent = disciplina ? disciplina.nome : 'Não especificada';
        detalheAtividadeTipo.innerHTML = `<span class="badge ${getTipoBadgeClass(tarefaData.tipo)}">${tarefaData.tipo || '-'}</span>`;
        detalheAtividadeData.textContent = dataFormatada;
        detalheAtividadeStatus.innerHTML = `<span class="badge ${getStatusBadgeClass(tarefaData.status)}">${tarefaData.status || '-'}</span>`;
        detalheAtividadeDescricao.textContent = tarefaData.descricao || 'Nenhuma descrição fornecida.';
        
        bsModalDetalhesAtividade.show();
    }

    // --- LISTENERS DOS MODAIS DE TAREFA (PRINCIPAL) ---
    if (formTarefa) {
        formTarefa.addEventListener("submit", function (e) {
            e.preventDefault();
            
            formTarefa.classList.add('was-validated'); 

            if (!formTarefa.checkValidity()) {
                e.stopPropagation();
                return;
            }

            const isEditMode = !!tarefaIdInput.value;
            const tarefaId = isEditMode ? tarefaIdInput.value : 'T-' + new Date().getTime();
            const rowIndex = formTarefa.dataset.rowIndex;
            
            const dadosCompletosTarefa = {
                id: tarefaId,
                titulo: tarefaTituloInput.value.trim(),
                descricao: tarefaDescricaoInput.value.trim(),
                disciplinaId: tarefaDisciplinaSelect.value,
                dataEntrega: tarefaDataEntregaInput.value,
                tipo: tarefaTipoSelect.value,
                status: tarefaStatusSelect.value,
                tarefaHorarioEntrega: tarefaHorarioEntregaInput.value 
            };
            salvarOuAtualizarTarefaNaTabela(dadosCompletosTarefa, isEditMode, rowIndex);
            fecharModalTarefa();
        });
    }

    // --- FUNÇÕES DA TABELA ---
    window.salvarOuAtualizarTarefaNaTabela = function (dadosTarefa, isEditMode, rowIndex) {
        const dadosLinhaTabela = formatarDadosParaLinha(dadosTarefa);
        if (isEditMode && rowIndex !== undefined) {
            tabelaTarefasDt.row(rowIndex).data(dadosLinhaTabela).draw(false);
            const indexLista = listaTarefas.findIndex(t => t.id === dadosTarefa.id);
            if (indexLista !== -1) {
                listaTarefas[indexLista] = { ...listaTarefas[indexLista], ...dadosTarefa };
            }
        } else {
            tabelaTarefasDt.row.add(dadosLinhaTabela).draw();
            listaTarefas.push(dadosTarefa);
        }
    }

    function formatarDadosParaLinha(tarefa) {
        const disciplinaObj = listaDisciplinas.find(d => d.id === tarefa.disciplinaId);
        const disciplinaNome = disciplinaObj ? disciplinaObj.nome : '-';
        const dataFormatada = formatarData(tarefa.dataEntrega);
        const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(tarefa.status)}">${tarefa.status}</span>`;
        const tipoBadgeHtml = `<span class="badge ${getTipoBadgeClass(tarefa.tipo)}">${tarefa.tipo}</span>`;
        const dropdownHtml = `
            <div class="dropdown">
                <button class="btn btn-sm btn-icon btn-actions" type="button" aria-expanded="false" aria-label="Ações da tarefa">
                    <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item btn-detalhar-tarefa" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-eye me-2"></i>Detalhar</a></li>
                    <li><a class="dropdown-item btn-edit-tarefa" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-pencil-square me-2"></i>Editar</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item btn-remover-tarefa" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-trash me-2"></i>Remover</a></li>
                </ul>
            </div>`;
        return ['', tarefa.titulo, disciplinaNome, tipoBadgeHtml, dataFormatada, statusBadgeHtml, dropdownHtml];
    }

    function inicializarDataTable() {
        if ($.fn.DataTable.isDataTable('#tabelaTarefas')) {
            $('#tabelaTarefas').DataTable().destroy();
        }
        tabelaTarefasDt = $('#tabelaTarefas').DataTable({
            responsive: { details: { type: 'column', target: 0 } },
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto"f><"col-12 col-md-auto ms-md-auto dt-buttons-container">>t<"row dt-footer-controls mt-3 align-items-center"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
            paging: false,
            scrollY: '450px',
            scrollCollapse: true,
            language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar tarefas..." },
            columnDefs: [{ orderable: false, targets: [0, -1] }],
            data: listaTarefas.map(formatarDadosParaLinha),
            initComplete: function () {
                const api = this.api();
                const buttonsContainer = $('.dt-buttons-container');
                if ($('#abrirModalNovaTarefaDt').length === 0) {
                    const btnAddTask = $('<button class="btn btn-primary btn-sm btn-add-task" id="abrirModalNovaTarefaDt" data-bs-toggle="modal" data-bs-target="#modalTarefa"> <i class="bi bi-plus-lg me-sm-2"></i> <span class="d-none d-sm-inline">Adicionar Tarefa</span> </button>');
                    buttonsContainer.append(btnAddTask);
                    btnAddTask.on('click', function() {
                        abrirModalTarefa(false);
                    });
                }
                const filterHtml = `<select id="filterTipoTarefa" class="form-select form-select-sm dt-filter-select ms-2"><option value="">Todos os Tipos</option><option value="Tarefa">Tarefa</option><option value="Prova">Prova</option></select><select id="filterDisciplina" class="form-select form-select-sm dt-filter-select ms-2"><option value="">Todas as Disciplinas</option></select>`;
                buttonsContainer.prepend(filterHtml);
                listaDisciplinas.forEach(d => $('#filterDisciplina').append(new Option(d.nome, d.nome)));
                $('#filterTipoTarefa').on('change', function () { api.column(3).search(this.value ? '^' + $.fn.dataTable.util.escapeRegex(this.value) + '$' : '', true, false).draw(); });
                $('#filterDisciplina').on('change', function () { api.column(2).search(this.value ? '^' + $.fn.dataTable.util.escapeRegex(this.value) + '$' : '', true, false).draw(); });
            }
        });
    }

    // --- FUNÇÕES UTILITÁRIAS (GLOBALIZADAS) ---
    // Esta função é globalizada para ser usada por outros scripts, como anotacaoModal.js
    window.popularSelect = function (element, options, selectedValue = null) {
        if (!element) {
            console.warn("Elemento select não encontrado para popular:", element);
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
    
    // Globaliza outras funções utilitárias
    window.formatarData = (data) => {
        if (!data) return '-';
        const [year, month, day] = data.split('-');
        const d = new Date(data + 'T00:00:00'); 
        return new Intl.DateTimeFormat('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(d);
    };

    window.getStatusBadgeClass = status => ({ 
        'Concluída': 'bg-success-subtle text-success', 
        'Em Andamento': 'bg-info-subtle text-info', 
        'Agendada': 'bg-primary-subtle text-primary', 
        'A Fazer': 'bg-warning-subtle text-warning', 
        'Atrasada': 'bg-danger-subtle text-danger' 
    }[status] || 'bg-secondary-subtle text-secondary');

    window.getTipoBadgeClass = tipo => tipo === 'Prova' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary';

    // --- BLOCO PRINCIPAL DE EXECUÇÃO ---
    inicializarDataTable();

    // -- LÓGICA DE CONTROLE DE DROPDOWN (JQUERY) --
    function closeAndResetDropdown(menuElement) {
        if (!menuElement || menuElement.length === 0) return;
        const originalParent = menuElement.data('originalParent');
        if (originalParent) {
            menuElement.removeClass('show').appendTo(originalParent);
        }
    }

    $(document).on('click', '.btn-edit-tarefa', function (e) {
        e.preventDefault();
        const menu = $(this).closest('.dropdown-menu');
        const rowIndex = menu.data('rowIndex');
        const tarefaId = $(this).data('tarefa-id');
        const tarefaData = listaTarefas.find(t => t.id === tarefaId);
        const linhaNode = tabelaTarefasDt.row(rowIndex).node();
        
        if (tarefaData) {
            abrirModalTarefa(true, tarefaData, linhaNode);
        }
        closeAndResetDropdown(menu);
    });

    $(document).on('click', '.btn-detalhar-tarefa', function (e) {
        e.preventDefault();
        const menu = $(this).closest('.dropdown-menu');
        const tarefaId = $(this).data('tarefa-id');
        const tarefaData = listaTarefas.find(t => t.id === tarefaId);
        if (tarefaData) {
            abrirModalDetalhesAtividade(tarefaData);
        }
        closeAndResetDropdown(menu);
    });

    $(document).on('click', '.btn-remover-tarefa', function (e) {
        e.preventDefault();
        const menu = $(this).closest('.dropdown-menu');
        const rowIndex = menu.data('rowIndex');
        const tarefaId = $(this).data('tarefa-id');
        const tarefa = listaTarefas.find(t => t.id === tarefaId);

        if (tarefa && confirm(`Tem certeza que deseja remover a tarefa "${tarefa.titulo}"?`)) {
            listaTarefas = listaTarefas.filter(t => t.id !== tarefaId);
            tabelaTarefasDt.row(rowIndex).remove().draw();
        }
        closeAndResetDropdown(menu);
    });

    $('#tabelaTarefas tbody').on('click', '.btn-actions', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const triggerButton = this;
        const dropdownMenu = $(triggerButton).next('.dropdown-menu');
        const isAlreadyOpen = dropdownMenu.hasClass('show');

        closeAndResetDropdown($('.dropdown-menu.show'));

        if (isAlreadyOpen) return;

        const triggerRow = $(triggerButton).closest('tr');
        const rowIndex = tabelaTarefasDt.row(triggerRow).index();
        
        dropdownMenu.data('originalParent', dropdownMenu.parent());
        dropdownMenu.data('rowIndex', rowIndex);
        
        dropdownMenu.appendTo('body');
        const rect = triggerButton.getBoundingClientRect();

        dropdownMenu.css({
            position: 'fixed',
            top: rect.bottom + 'px',
            left: 'auto',
            right: (window.innerWidth - rect.right) + 'px',
            zIndex: 1060
        });

        dropdownMenu.addClass('show');
        setTimeout(() => {
            $(document).one('click.closeDropdown', function (clickEvent) {
                if (!$(clickEvent.target).closest(dropdownMenu).length) {
                    closeAndResetDropdown(dropdownMenu);
                }
            });
        }, 0);
    });
});
