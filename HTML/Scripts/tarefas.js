document.addEventListener("DOMContentLoaded", function () {
    // --- SELETORES DE ELEMENTOS ---
    const modalTarefaDialog = document.querySelector("#modalTarefa");
    const abrirModalNovaTarefaBtnOriginal = document.querySelector("#abrirModalNovaTarefa");
    const fecharModalTarefaBtn = document.querySelector("#fecharModalTarefa");
    const cancelarModalTarefaBtn = document.querySelector("#cancelarModalTarefa");
    const formTarefa = document.querySelector("#formTarefa");
    const modalTarefaLabel = document.querySelector("#modalTarefaLabel");
    const tarefaIdInput = document.getElementById('tarefaId');
    const tarefaTituloInput = document.getElementById('tarefaTitulo');
    const tarefaDisciplinaSelect = document.getElementById('tarefaDisciplina');
    const tarefaTipoSelect = document.getElementById('tarefaTipo');
    const tarefaDataEntregaInput = document.getElementById('tarefaDataEntrega');
    const tarefaHorarioEntregaInput = document.getElementById('tarefaHorarioEntrega');
    const tarefaStatusSelect = document.getElementById('tarefaStatus');
    const tarefaDescricaoInput = document.getElementById('tarefaDescricao');
    const modalDetalhesDialog = document.querySelector("#modalDetalhesTarefa");
    const fecharModalDetalhesBtn = document.querySelector("#fecharModalDetalhesTarefa");
    const okModalDetalhesBtn = document.querySelector("#okModalDetalhesTarefa");
    const modalDetalhesConteudo = document.querySelector("#modalDetalhesTarefaConteudo");
    const modalDetalhesTarefaLabel = document.querySelector("#modalDetalhesTarefaLabel");

    let tabelaTarefasDt;

    // --- DADOS MOCADOS ---
    const listaDisciplinas = [
        { id: "CS101", nome: "Algoritmos e Estrutura de Dados" },
        { id: "CS102", nome: "Redes de Computadores" },
        { id: "CS103", nome: "Banco de Dados" },
        { id: "CS104", nome: "Inteligência Artificial" },
        { id: "CS105", nome: "Compiladores" }
    ];
    let listaTarefas = [
        { id: "T001", titulo: "Complexidade e Estruturas Lineares", disciplinaId: "CS101", tipo: "Prova", dataEntrega: "2025-06-23", horarioEntrega: "19:00", status: "Agendada", descricao: "Estudar capítulos 1 a 3 do livro Cormen. Foco em complexidade Big-O." },
        { id: "T006", titulo: "Camadas de Transporte e Aplicação", disciplinaId: "CS102", tipo: "Prova", dataEntrega: "2025-06-24", horarioEntrega: "21:00", status: "Agendada", descricao: "Foco em protocolos TCP, UDP e HTTP." },
        { id: "T010", titulo: "SQL e Normalização", disciplinaId: "CS103", tipo: "Prova", dataEntrega: "2025-06-25", horarioEntrega: "19:00", status: "Agendada", descricao: "Praticar joins e entender as formas normais (1FN, 2FN, 3FN)." },
        { id: "T013", titulo: "Machine Learning e Redes Neurais", disciplinaId: "CS104", tipo: "Prova", dataEntrega: "2025-06-26", horarioEntrega: "21:00", status: "Agendada", descricao: "Revisar conceitos de regressão linear e redes neurais convolucionais." },
        { id: "T017", titulo: "Análise Léxica e Sintática", disciplinaId: "CS105", tipo: "Prova", dataEntrega: "2025-06-29", horarioEntrega: "19:00", status: "Agendada", descricao: "Implementar um analisador léxico simples em Python." },
    ];

    // --- FUNÇÕES DOS MODAIS ---
    function abrirModalTarefa(isEditMode = false, dadosTarefa = null, targetTr = null) {
        if (!modalTarefaDialog) return;
        formTarefa.reset();
        popularSelectDisciplinas();
        modalTarefaLabel.textContent = isEditMode ? "Editar Tarefa/Prova" : "Adicionar Tarefa/Prova";
        if (isEditMode && dadosTarefa) {
            tarefaIdInput.value = dadosTarefa.id;
            tarefaTituloInput.value = dadosTarefa.titulo || '';
            tarefaDescricaoInput.value = dadosTarefa.descricao || '';
            tarefaDataEntregaInput.value = dadosTarefa.dataEntrega || '';
            tarefaTipoSelect.value = dadosTarefa.tipo || '';
            tarefaDisciplinaSelect.value = dadosTarefa.disciplinaId || '';
            tarefaHorarioEntregaInput.value = dadosTarefa.horarioEntrega || '';
            tarefaStatusSelect.value = dadosTarefa.status || 'A Fazer';
            if (tabelaTarefasDt && targetTr) {
                formTarefa.dataset.rowIndex = tabelaTarefasDt.row(targetTr).index();
            }
        } else {
            tarefaIdInput.value = '';
            tarefaTipoSelect.value = "";
            tarefaDisciplinaSelect.value = "";
            tarefaStatusSelect.value = "A Fazer";
        }
        modalTarefaDialog.showModal();
    }

    function fecharModalTarefa() {
        if (modalTarefaDialog) modalTarefaDialog.close();
    }

    function abrirModalDetalhes(tarefaData) {
        if (!modalDetalhesDialog) return;
        const disciplina = listaDisciplinas.find(d => d.id === tarefaData.disciplinaId);
        const dataFormatada = formatarDataHora(tarefaData.dataEntrega, tarefaData.horarioEntrega);
        modalDetalhesTarefaLabel.textContent = `Detalhes: ${tarefaData.titulo}`;
        const conteudoHtml = `
            <div class="detalhes-tarefa p-2">
                <p><strong><i class="bi bi-journal-bookmark-fill me-2"></i>Disciplina:</strong><br>${disciplina ? disciplina.nome : 'Não especificada'}</p>
                <p><strong><i class="bi bi-calendar-event me-2"></i>Data de Entrega:</strong><br>${dataFormatada}</p>
                <p><strong><i class="bi bi-tags-fill me-2"></i>Tipo:</strong> ${tarefaData.tipo || '-'}</p>
                <p><strong><i class="bi bi-flag-fill me-2"></i>Status:</strong> ${tarefaData.status || '-'}</p>
                <hr>
                <p><strong><i class="bi bi-card-text me-2"></i>Descrição:</strong><br>${tarefaData.descricao || 'Nenhuma descrição fornecida.'}</p>
            </div>`;
        modalDetalhesConteudo.innerHTML = conteudoHtml;
        modalDetalhesDialog.showModal();
    }

    // --- LISTENERS DOS MODAIS ---
    if (fecharModalTarefaBtn) fecharModalTarefaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalTarefa(); });
    if (cancelarModalTarefaBtn) cancelarModalTarefaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalTarefa(); });
    if (modalTarefaDialog) modalTarefaDialog.addEventListener("click", e => { if (e.target === modalTarefaDialog) fecharModalTarefa(); });
    if (fecharModalDetalhesBtn) fecharModalDetalhesBtn.addEventListener('click', () => modalDetalhesDialog.close());
    if (okModalDetalhesBtn) okModalDetalhesBtn.addEventListener('click', () => modalDetalhesDialog.close());
    if (modalDetalhesDialog) modalDetalhesDialog.addEventListener("click", e => { if (e.target === modalDetalhesDialog) modalDetalhesDialog.close(); });

    // --- SUBMISSÃO DO FORMULÁRIO ---
    if (formTarefa) {
        formTarefa.addEventListener("submit", function (e) {
            e.preventDefault();
            const isEditMode = !!tarefaIdInput.value;
            const tarefaId = isEditMode ? tarefaIdInput.value : 'T-' + new Date().getTime();
            const rowIndex = formTarefa.dataset.rowIndex;
            const dadosCompletosTarefa = {
                id: tarefaId,
                titulo: tarefaTituloInput.value.trim(),
                disciplinaId: tarefaDisciplinaSelect.value,
                tipo: tarefaTipoSelect.value,
                dataEntrega: tarefaDataEntregaInput.value,
                horarioEntrega: tarefaHorarioEntregaInput.value,
                status: tarefaStatusSelect.value,
                descricao: tarefaDescricaoInput.value.trim(),
            };
            salvarOuAtualizarTarefaNaTabela(dadosCompletosTarefa, isEditMode, rowIndex);
            fecharModalTarefa();
        });
    }

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
        const dataHoraFormatada = formatarDataHora(tarefa.dataEntrega, tarefa.horarioEntrega);
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
        return ['', tarefa.titulo, disciplinaNome, tipoBadgeHtml, dataHoraFormatada, statusBadgeHtml, dropdownHtml];
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
                if (abrirModalNovaTarefaBtnOriginal && buttonsContainer.length && $('#abrirModalNovaTarefaDt').length === 0) {
                    const btnClone = $(abrirModalNovaTarefaBtnOriginal).clone().attr('id', 'abrirModalNovaTarefaDt').show();
                    buttonsContainer.append(btnClone);
                    btnClone.on('click', (e) => {
                        e.preventDefault();
                        abrirModalTarefa();
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

    // --- FUNÇÕES UTILITÁRIAS E EVENTOS DE EDIÇÃO/REMOÇÃO ---
    function popularSelectDisciplinas() {
        if (!tarefaDisciplinaSelect) return;
        const valorAtual = tarefaDisciplinaSelect.value;
        tarefaDisciplinaSelect.innerHTML = '';
        listaDisciplinas.forEach(d => tarefaDisciplinaSelect.add(new Option(d.nome, d.id)));
        tarefaDisciplinaSelect.value = valorAtual;
    }
    
    // -- LÓGICA DE CONTROLE DO DROPDOWN --
    
    // Função para fechar e resetar a posição de qualquer menu dropdown
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

    const formatarDataHora = (data, hora) => {
        if (!data) return '-';
        const [year, month, day] = data.split('-');
        let dataFormatada = `${day}/${month}/${year}`;
        if (hora) {
            const [h, m] = hora.split(':');
            let ampm = parseInt(h) >= 12 ? 'PM' : 'AM';
            let hour = parseInt(h) % 12;
            hour = hour ? hour : 12;
            dataFormatada += `, ${hour.toString().padStart(2, '0')}:${m} ${ampm}`;
        }
        return dataFormatada;
    };

    const getStatusBadgeClass = status => ({ 'Concluída': 'bg-success-subtle text-success', 'Em Andamento': 'bg-info-subtle text-info', 'Agendada': 'bg-primary-subtle text-primary', 'A Fazer': 'bg-warning-subtle text-warning', 'Atrasada': 'bg-danger-subtle text-danger' }[status] || 'bg-secondary-subtle text-secondary');
    const getTipoBadgeClass = tipo => tipo === 'Prova' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary';

    // --- BLOCO PRINCIPAL DE EXECUÇÃO ---
    
    inicializarDataTable();

    $('#tabelaTarefas tbody').on('click', '.btn-actions', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const triggerButton = this;
        const dropdownMenu = $(triggerButton).next('.dropdown-menu');
        const isAlreadyOpen = dropdownMenu.hasClass('show');

        // Fecha e reseta todos os outros menus antes de abrir um novo
        closeAndResetDropdown($('.dropdown-menu.show'));

        if (isAlreadyOpen) return; // Se o menu já estava aberto, o passo anterior já o fechou.

        const triggerRow = $(triggerButton).closest('tr');
        const rowIndex = tabelaTarefasDt.row(triggerRow).index();
        
        // Salva a "casa" original e o índice da linha no menu
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