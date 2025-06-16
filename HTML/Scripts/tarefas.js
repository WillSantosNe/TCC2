document.addEventListener("DOMContentLoaded", function () {
    // --- SELETORES DE ELEMENTOS ---
    // O modal original de edição/adição de tarefa (agora com estilo unificado)
    const modalTarefaEl = document.getElementById('modalTarefa'); 
    const formTarefa = document.getElementById('formTarefa');
    const modalTarefaLabel = document.getElementById('modalTarefaLabel');
    const tarefaIdInput = document.getElementById('tarefaId');
    const tarefaTituloInput = document.getElementById('tarefaTitulo');
    const tarefaDescricaoInput = document.getElementById('tarefaDescricao');
    const tarefaDisciplinaSelect = document.getElementById('tarefaDisciplina'); // Agora visível e preenchível
    const tarefaDataEntregaInput = document.getElementById('tarefaDataEntrega');
    const tarefaTipoSelect = document.getElementById('tarefaTipo');
    const tarefaStatusSelect = document.getElementById('tarefaStatus'); // Agora visível e preenchível
    const tarefaHorarioEntregaInput = document.getElementById('tarefaHorarioEntrega'); // Campo oculto, mantido

    // Modal de Detalhes da Tarefa (mantido)
    const modalDetalhesTarefaEl = document.getElementById('modalDetalhesTarefa');
    const modalDetalhesTarefaLabel = document.getElementById('modalDetalhesTarefaLabel');
    const modalDetalhesTarefaConteudo = document.getElementById('modalDetalhesTarefaConteudo');

    // Instâncias de modais Bootstrap
    const bsModalTarefa = new bootstrap.Modal(modalTarefaEl, { keyboard: false });
    const bsModalDetalhesTarefa = new bootstrap.Modal(modalDetalhesTarefaEl, { keyboard: false });

    let tabelaTarefasDt;

    // --- DADOS MOCADOS (acessíveis globalmente ou passados para os modais se necessário) ---
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

    // --- FUNÇÕES DOS MODAIS DE TAREFA (PRINCIPAL) ---
    function abrirModalTarefa(isEditMode = false, dadosTarefa = null, targetTr = null) {
        formTarefa.reset();
        formTarefa.classList.remove('was-validated'); // Limpa validação ao abrir
        
        // Popula o select de disciplinas e status VISÍVEIS
        popularSelect(tarefaDisciplinaSelect, listaDisciplinas.map(d => ({id: d.id, nome: d.nome})), ''); 
        popularSelect(tarefaStatusSelect, ["A FAZER", "EM ANDAMENTO", "CONCLUÍDA"], "A FAZER");


        modalTarefaLabel.textContent = isEditMode ? "Editar Tarefa/Prova" : "Adicionar Tarefa/Prova";

        if (isEditMode && dadosTarefa) {
            tarefaIdInput.value = dadosTarefa.id;
            tarefaTituloInput.value = dadosTarefa.titulo || '';
            tarefaDescricaoInput.value = dadosTarefa.descricao || '';
            tarefaDisciplinaSelect.value = dadosTarefa.disciplinaId || ''; // Preenche o select da disciplina
            tarefaDataEntregaInput.value = dadosTarefa.dataEntrega || '';
            tarefaTipoSelect.value = dadosTarefa.tipo || '';
            tarefaStatusSelect.value = dadosTarefa.status || 'A FAZER'; // Preenche o select de status
            tarefaHorarioEntregaInput.value = dadosTarefa.tarefaHorarioEntrega || ''; // Se tiver dados

            if (tabelaTarefasDt && targetTr) {
                formTarefa.dataset.rowIndex = tabelaTarefasDt.row(targetTr).index();
            }
        } else {
            tarefaIdInput.value = '';
            // Os valores padrão já foram definidos acima para os selects
            delete formTarefa.dataset.rowIndex; 
        }
        bsModalTarefa.show(); // Abre o modal
    }

    function fecharModalTarefa() {
        bsModalTarefa.hide();
        formTarefa.reset();
        formTarefa.classList.remove('was-validated');
    }

    function abrirModalDetalhes(tarefaData) {
        const disciplina = listaDisciplinas.find(d => d.id === tarefaData.disciplinaId);
        const dataFormatada = formatarData(tarefaData.dataEntrega);
        modalDetalhesTarefaLabel.textContent = `Detalhes: ${tarefaData.titulo}`;
        const conteudoHtml = `
            <div class="detalhes-tarefa p-2">
                <p><strong><i class="bi bi-calendar-event me-2"></i>Data de Entrega:</strong><br>${dataFormatada}</p>
                <p><strong><i class="bi bi-journal-bookmark-fill me-2"></i>Disciplina:</strong><br>${disciplina ? disciplina.nome : 'Não especificada'}</p>
                <p><strong><i class="bi bi-tags-fill me-2"></i>Tipo:</strong> ${tarefaData.tipo || '-'}</p>
                <p><strong><i class="bi bi-flag-fill me-2"></i>Status:</strong> ${tarefaData.status || '-'}</p>
                <hr>
                <p><strong><i class="bi bi-card-text me-2"></i>Descrição:</strong><br>${tarefaData.descricao || 'Nenhuma descrição fornecida.'}</p>
            </div>`;
        modalDetalhesTarefaConteudo.innerHTML = conteudoHtml;
        bsModalDetalhesTarefa.show();
    }

    // --- LISTENERS DOS MODAIS DE TAREFA (PRINCIPAL) ---
    // Esses listeners agora controlam o modal Bootstrap
    if (formTarefa) {
        formTarefa.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!formTarefa.checkValidity()) {
                e.stopPropagation();
                formTarefa.classList.add('was-validated');
                return;
            }

            const isEditMode = !!tarefaIdInput.value;
            const tarefaId = isEditMode ? tarefaIdInput.value : 'T-' + new Date().getTime();
            const rowIndex = formTarefa.dataset.rowIndex;
            
            const dadosCompletosTarefa = {
                id: tarefaId,
                titulo: tarefaTituloInput.value.trim(),
                descricao: tarefaDescricaoInput.value.trim(),
                disciplinaId: tarefaDisciplinaSelect.value, // Pega o valor do select de disciplina
                dataEntrega: tarefaDataEntregaInput.value,
                tipo: tarefaTipoSelect.value,
                status: tarefaStatusSelect.value, // Pega o valor do select de status
                tarefaHorarioEntrega: tarefaHorarioEntregaInput.value // Pega o valor do campo de horário oculto
            };
            salvarOuAtualizarTarefaNaTabela(dadosCompletosTarefa, isEditMode, rowIndex);
            fecharModalTarefa();
        });
    }

    // O botão principal "Adicionar Tarefa" na página será inserido e controlado pela DataTable.
    // A lógica de `initComplete` da DataTable irá cuidar de clonar e anexar o botão.


    // --- FUNÇÕES DA TABELA ---
    function salvarOuAtualizarTarefaNaTabela(dadosTarefa, isEditMode, rowIndex) {
        const dadosLinhaTabela = formatarDadosParaLinha(dadosTarefa);
        if (isEditMode && rowIndex !== undefined) {
            tabelaTarefasDt.row(rowIndex).data(dadosLinhaTabela).draw(false);
            const indexLista = listaTarefas.findIndex(t => t.id === dadosTarefa.id);
            if (indexLista !== -1) listaTarefas[indexLista] = dadosTarefa;
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
                // Adiciona o botão "Adicionar Tarefa" no cabeçalho da tabela se ele ainda não estiver lá
                if ($('#abrirModalNovaTarefaDt').length === 0) {
                    const btnAddTask = $('<button class="btn btn-primary btn-sm btn-add-task" id="abrirModalNovaTarefaDt" data-bs-toggle="modal" data-bs-target="#modalTarefa"> <i class="bi bi-plus-lg me-sm-2"></i> <span class="d-none d-sm-inline">Adicionar Tarefa</span> </button>');
                    buttonsContainer.append(btnAddTask);
                    // O data-bs-target agora aponta para #modalTarefa (que tem a nova estrutura)
                }
                const filterHtml = `<select id="filterTipoTarefa" class="form-select form-select-sm dt-filter-select ms-2"><option value="">Todos os Tipos</option><option value="Tarefa">Tarefa</option><option value="Prova">Prova</option></select><select id="filterDisciplina" class="form-select form-select-sm dt-filter-select ms-2"><option value="">Todas as Disciplinas</option></select>`;
                buttonsContainer.prepend(filterHtml);
                listaDisciplinas.forEach(d => $('#filterDisciplina').append(new Option(d.nome, d.nome)));
                $('#filterTipoTarefa').on('change', function () { api.column(3).search(this.value ? '^' + $.fn.dataTable.util.escapeRegex(this.value) + '$' : '', true, false).draw(); });
                $('#filterDisciplina').on('change', function () { api.column(2).search(this.value ? '^' + $.fn.dataTable.util.escapeRegex(this.value) + '$' : '', true, false).draw(); });
            }
        });
    }

    // --- FUNÇÕES UTILITÁRIAS ---
    // Esta função foi generalizada para ser mais flexível, recebendo objetos ou strings.
    // Ela é usada para popular tanto os selects do modal principal de tarefa quanto os dos modais rápidos.
    function popularSelect(element, options, selectedValue = null) {
        if (!element) {
            console.warn("Elemento select não encontrado para popular:", element);
            return;
        }
        element.innerHTML = ''; // Limpa opções existentes
        
        // Adiciona uma opção padrão "Selecione..." se ainda não existir
        const hasPlaceholder = element.querySelector('option[disabled][selected]');
        if (!hasPlaceholder) {
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Selecione...";
            defaultOption.disabled = true;
            defaultOption.selected = true; // Define como selecionada por padrão
            element.appendChild(defaultOption);
        }

        options.forEach(option => {
            const optElement = document.createElement('option');
            const value = (typeof option === 'object' && option !== null) ? option.id : option;
            const textContent = (typeof option === 'object' && option !== null) ? option.nome : option;

            optElement.value = value;
            optElement.textContent = textContent;

            if (selectedValue !== null && (String(value) === String(selectedValue) || String(textContent) === String(selectedValue))) {
                optElement.selected = true;
                if (hasPlaceholder) { // Se existia um placeholder, desseleciona ele
                    element.querySelector('option[disabled][selected]').selected = false;
                }
            }
            element.appendChild(optElement);
        });
    }
    
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
            // Abre o modal principal de tarefa, agora com a nova estrutura
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
            abrirModalDetalhes(tarefaData);
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

    const formatarData = (data) => {
        if (!data) return '-';
        const [year, month, day] = data.split('-');
        // Convert to Date object to handle potential timezone issues if needed, then format
        const d = new Date(data + 'T00:00:00'); // Add time to ensure correct date parsing
        return new Intl.DateTimeFormat('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(d);
    };

    const getStatusBadgeClass = status => ({ 
        'Concluída': 'bg-success-subtle text-success', 
        'Em Andamento': 'bg-info-subtle text-info', 
        'Agendada': 'bg-primary-subtle text-primary', 
        'A Fazer': 'bg-warning-subtle text-warning', 
        'Atrasada': 'bg-danger-subtle text-danger' 
    }[status] || 'bg-secondary-subtle text-secondary');

    const getTipoBadgeClass = tipo => tipo === 'Prova' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary';

    // --- BLOCO PRINCIPAL DE EXECUÇÃO ---
    inicializarDataTable();

    $('#tabelaTarefas tbody').on('click', '.btn-actions', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const triggerButton = this;
        const dropdownMenu = $(triggerButton).next('.dropdown-menu');
        const isAlreadyOpen = dropdownMenu.hasClass('show');

        // Fecha qualquer outro dropdown aberto
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
