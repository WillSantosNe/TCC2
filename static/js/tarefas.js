// static/js/tarefas.js (VERSÃO FINAL COM CONTROLES RESPONSIVOS CORRETOS)
document.addEventListener("DOMContentLoaded", function () {
    // --- FUNÇÕES GLOBAIS DE FORMATAÇÃO (sem alterações) ---
    const formatarData = (dataStr) => {
        if (!dataStr) return '-';
        const d = new Date(dataStr + 'T00:00:00');
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
    };
    const getStatusBadgeClass = (status) => ({
        'ATRASADA': 'bg-danger-subtle text-danger', 'CONCLUIDA': 'bg-success-subtle text-success',
        'ANDAMENTO': 'bg-info-subtle text-info', 'A_FAZER': 'bg-warning-subtle text-warning'
    }[status] || 'bg-secondary-subtle text-secondary');
    const getTipoBadgeClass = (tipo) => tipo === 'PROVA' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary';

    // --- LÓGICA DE ABERTURA DOS MODAIS (sem alterações) ---
    function abrirModalParaEditar(tarefaId) {
        fetch(`/api/atividade/${tarefaId}`).then(r => r.json()).then(data => {
            const modalEl = document.getElementById('modalTarefaPrincipalQuickAdd');
            const form = modalEl.querySelector('#formTarefaPrincipalQuickAdd');
            modalEl.querySelector('#modalTarefaPrincipalQuickAddLabel').textContent = 'Editar Tarefa/Prova';
            form.action = `/tarefas/atualizar/${data.id}`;
            const disciplinaSelect = document.getElementById('principalTarefaDisciplinaQuickAdd');
            if (disciplinaSelect && disciplinaSelect.options.length <= 1) {
                if (window.disciplinas_json) {
                    disciplinaSelect.innerHTML = '<option value="" selected disabled>Selecione uma disciplina...</option>';
                    window.disciplinas_json.forEach(d => { disciplinaSelect.add(new Option(d.nome, String(d.id))); });
                }
            }
            form.querySelector('#principalTarefaIdQuickAdd').value = data.id;
            form.querySelector('#principalTarefaTituloQuickAdd').value = data.titulo;
            form.querySelector('#principalTarefaDescricaoQuickAdd').value = data.descricao;
            form.querySelector('#principalTarefaDataEntregaQuickAdd').value = data.data_entrega;
            form.querySelector('#principalTarefaTipoQuickAdd').value = data.tipo;
            form.querySelector('#principalTarefaStatusQuickAdd').value = data.status.replace(' ', '_');
            form.querySelector('#principalTarefaDisciplinaQuickAdd').value = String(data.disciplina_id);
            const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            bsModal.show();
        });
    }

    function abrirModalParaDetalhar(tarefaId) {
        fetch(`/api/atividade/${tarefaId}`).then(r => r.json()).then(data => {
            const modalEl = document.getElementById('modalDetalhesAtividade');
            modalEl.querySelector('#detalhe-atividade-nome').textContent = data.titulo;
            modalEl.querySelector('#detalhe-atividade-disciplina').textContent = data.disciplina_nome;
            modalEl.querySelector('#detalhe-atividade-data').textContent = formatarData(data.data_entrega);
            modalEl.querySelector('#detalhe-atividade-descricao').textContent = data.descricao || 'Nenhuma descrição.';
            const tipoBadge = modalEl.querySelector('#detalhe-atividade-tipo .badge');
            tipoBadge.className = `badge ${getTipoBadgeClass(data.tipo)}`;
            tipoBadge.textContent = data.tipo;
            const statusBadge = modalEl.querySelector('#detalhe-atividade-status .badge');
            statusBadge.className = `badge ${getStatusBadgeClass(data.status)}`;
            statusBadge.textContent = data.status.replace('_', ' ');
            const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            bsModal.show();
        });
    }

    // =========================================================================================
    // LÓGICA DA DATATABLE
    // =========================================================================================
    let dataTableInstance = null;

    function inicializarDataTable(dadosTarefas, dadosDisciplinas, isMobile) {
        if (dataTableInstance) {
            dataTableInstance.destroy();
            $('.dt-buttons-container').empty();
        }

        let columnDefs = [
            { orderable: false, targets: [0, 6] },
            { responsivePriority: 1, targets: 0 }
        ];

        // A visibilidade das colunas continua sendo controlada aqui, mas o DOM é unificado
        if (isMobile) {
            columnDefs.push({ visible: false, targets: [0, 2, 3, 4, 5] });
            columnDefs.push({ visible: true, targets: [1, 6] });
        }
        
        dataTableInstance = $('#tabelaTarefas').DataTable({
            responsive: !isMobile,
            // O layout DOM agora é o mesmo para ambas as visões. O CSS cuidará do resto.
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto"f><"col-12 col-md-auto ms-md-auto dt-buttons-container">>t<"row dt-footer-controls mt-3 align-items-center"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
            paging: isMobile,
            scrollY: isMobile ? '60vh' : '450px',
            scrollCollapse: !isMobile,
            lengthChange: false,
            language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar tarefas..." },
            columnDefs: columnDefs,
            data: dadosTarefas,
            columns: [
                { data: null, defaultContent: '' }, { data: 'titulo' }, { data: 'disciplina.nome' },
                { data: 'tipo', render: (data) => `<span class="badge ${getTipoBadgeClass(data)}">${data}</span>` },
                { data: 'data_entrega', render: (data) => formatarData(data) },
                { data: 'status', render: (data) => `<span class="badge ${getStatusBadgeClass(data)}">${data.replace('_', ' ')}</span>` },
                { data: 'id', className: 'dt-actions-column', render: (data) => `<button class="btn btn-sm btn-icon btn-actions" type="button" data-tarefa-id="${data}"><i class="bi bi-three-dots-vertical"></i></button>`}
            ],
            initComplete: function () {
                const api = this.api();
                const buttonsContainer = $('.dt-buttons-container');
                
                // CORREÇÃO: Esta lógica agora roda para TODAS as visões
                const btnAddTask = $('<button class="btn btn-primary" id="abrirModalNovaTarefaDt"><i class="bi bi-plus-lg me-2"></i>Adicionar Tarefa/Prova</button>');
                const filterHtml = `<select id="filterTipoTarefa" class="form-select dt-filter-select mb-2"><option value="">Todos os Tipos</option><option value="TAREFA">Tarefa</option><option value="PROVA">Prova</option></select><select id="filterDisciplina" class="form-select dt-filter-select mb-2"><option value="">Todas as Disciplinas</option></select>`;
                
                // Adiciona os filtros e o botão. O CSS cuidará do layout.
                // A ordem é: filtros primeiro, depois o botão.
                buttonsContainer.append(filterHtml);
                buttonsContainer.append(btnAddTask);

                // O restante da lógica para popular os filtros e adicionar eventos
                dadosDisciplinas.forEach(d => $('#filterDisciplina').append(new Option(d.nome, d.nome)));
                
                // Aplica filtro automático se disciplina_id estiver presente
                if (window.disciplina_filtro_id) {
                    const disciplinaParaFiltrar = dadosDisciplinas.find(d => d.id === window.disciplina_filtro_id);
                    if (disciplinaParaFiltrar) {
                        $('#filterDisciplina').val(disciplinaParaFiltrar.nome);
                        api.column(2).search('^' + disciplinaParaFiltrar.nome + '$', true, false).draw();
                    }
                } else {
                    // Mantém a lógica anterior para compatibilidade
                    const params = new URLSearchParams(window.location.search);
                    const disciplinaParaFiltrar = params.get('disciplina');
                    if (disciplinaParaFiltrar) {
                        $('#filterDisciplina').val(disciplinaParaFiltrar);
                        api.column(2).search('^' + disciplinaParaFiltrar + '$', true, false).draw();
                    }
                }
                
                $('#filterTipoTarefa, #filterDisciplina').on('change', function() {
                    api.column(3).search($('#filterTipoTarefa').val())
                       .column(2).search($('#filterDisciplina').val())
                       .draw();
                });
            }
        });
    }

    // --- LÓGICA DO MENU DE AÇÕES MANUAL (sem alterações) ---
    const menu = $('#custom-actions-menu');
    $('#tabelaTarefas').on('click', '.btn-actions', function(e) { e.stopPropagation(); menu.data('tarefa-id', $(this).data('tarefa-id')); const rect = this.getBoundingClientRect(); menu.css({ display: 'block', top: rect.bottom + window.scrollY, left: rect.right + window.scrollX - menu.outerWidth(), }); });
    $(document).on('click', function() { if (menu.is(':visible')) { menu.hide(); } });
    menu.on('click', 'a', function(e) { e.preventDefault(); const tarefaId = menu.data('tarefa-id'); const actionId = $(this).attr('id'); if (!tarefaId) return; if (actionId === 'custom-menu-detalhar') { abrirModalParaDetalhar(tarefaId); } else if (actionId === 'custom-menu-editar') { abrirModalParaEditar(tarefaId); } else if (actionId === 'custom-menu-remover') { console.log(`Clicou em remover para a tarefa ID: ${tarefaId}`); } menu.hide(); });

    // --- INICIALIZAÇÃO CONTROLADA PELO TAMANHO DA TELA (sem alterações) ---
    if (typeof tarefas_json !== 'undefined' && typeof disciplinas_json !== 'undefined') {
        const mediaQuery = window.matchMedia('(max-width: 991.98px)'); // Ponto de quebra do seu CSS
        function handleScreenChange(e) {
            inicializarDataTable(tarefas_json, disciplinas_json, e.matches);
        }
        mediaQuery.addEventListener('change', handleScreenChange);
        handleScreenChange(mediaQuery);
    }
});
