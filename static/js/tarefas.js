// static/js/tarefas.js (VERSÃO FINAL COM DATATABLE COMPLETA)

document.addEventListener("DOMContentLoaded", function () {
    let tabelaTarefasDt;

    // --- FUNÇÕES GLOBAIS DE FORMATAÇÃO ---
    const formatarData = (dataStr) => {
        if (!dataStr) return '-';
        const d = new Date(dataStr + 'T00:00:00');
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
    };

    const getStatusBadgeClass = (status) => ({
        'ATRASADA': 'bg-danger-subtle text-danger',
        'CONCLUIDA': 'bg-success-subtle text-success',
        'ANDAMENTO': 'bg-info-subtle text-info',
        'A_FAZER': 'bg-warning-subtle text-warning'
    }[status] || 'bg-secondary-subtle text-secondary');

    const getTipoBadgeClass = (tipo) => tipo === 'PROVA' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary';

    // --- LÓGICA DA DATATABLE ---
    function inicializarDataTable(dadosTarefas, dadosDisciplinas) {
        if ($.fn.DataTable.isDataTable('#tabelaTarefas')) {
            $('#tabelaTarefas').DataTable().destroy();
        }

        tabelaTarefasDt = $('#tabelaTarefas').DataTable({
            responsive: { details: { type: 'column', target: 0 } },
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto"f><"col-12 col-md-auto ms-md-auto dt-buttons-container">>t<"row dt-footer-controls mt-3 align-items-center"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
            paging: false, 
            scrollY: '450px', // Mantenha a barra de rolagem
            scrollCollapse: true,
            scrollCollapse: true,
            lengthChange: false,
            language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar tarefas/provas..." },
            columnDefs: [
                { orderable: false, targets: [0, 6] },
                { responsivePriority: 1, targets: 0, className: 'dtr-control' },
                { responsivePriority: 2, targets: 1 },
                { responsivePriority: 3, targets: 6 },
            ],
            // Usa os dados vindos do Flask
            data: dadosTarefas,
            columns: [
                { data: null, defaultContent: '' },
                { data: 'titulo' },
                { data: 'disciplina.nome' },
                { 
                    data: 'tipo',
                    render: (data) => `<span class="badge ${getTipoBadgeClass(data)}">${data}</span>`
                },
                { 
                    data: 'data_entrega',
                    render: (data) => formatarData(data)
                },
                { 
                    data: 'status',
                    render: (data) => `<span class="badge ${getStatusBadgeClass(data)}">${data.replace('_', ' ')}</span>`
                },
                {
                    data: 'id',
                    render: (data) => `
                        <div class="dropdown">
                            <button class="btn btn-sm btn-icon btn-actions" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item btn-detalhar-tarefa" href="#" data-tarefa-id="${data}"><i class="bi bi-eye me-2"></i>Detalhar</a></li>
                                <li><a class="dropdown-item btn-editar-tarefa" href="#" data-tarefa-id="${data}"><i class="bi bi-pencil-square me-2"></i>Editar</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item btn-remover-tarefa text-danger" href="#" data-tarefa-id="${data}"><i class="bi bi-trash me-2"></i>Remover</a></li>
                            </ul>
                        </div>`
                }
            ],
            // Restaura sua lógica de filtros e botões
            initComplete: function () {
                const api = this.api();
                const buttonsContainer = $('.dt-buttons-container');
                if ($('#abrirModalNovaTarefaDt').length === 0) {
                    const btnAddTask = $('<button class="btn btn-primary" id="abrirModalNovaTarefaDt" data-bs-toggle="modal" data-bs-target="#modalTarefaPrincipalQuickAdd"><i class="bi bi-plus-lg me-2"></i>Adicionar Tarefa/Prova</button>');
                    buttonsContainer.append(btnAddTask);
                }
                const filterHtml = `<select id="filterTipoTarefa" class="form-select dt-filter-select ms-2"><option value="">Todos os Tipos</option><option value="TAREFA">Tarefa</option><option value="PROVA">Prova</option></select><select id="filterDisciplina" class="form-select dt-filter-select ms-2"><option value="">Todas as Disciplinas</option></select>`;
                buttonsContainer.prepend(filterHtml);
                
                // Popula o filtro de disciplinas com os dados do banco
                dadosDisciplinas.forEach(d => $('#filterDisciplina').append(new Option(d.nome, d.nome)));

                // Funcionalidade dos filtros
                $('#filterTipoTarefa').on('change', function () { api.column(3).search(this.value ? `^${this.value}$` : '', true, false).draw(); });
                $('#filterDisciplina').on('change', function () { api.column(2).search(this.value ? `^${this.value}$` : '', true, false).draw(); });
            }
        });
    }

    // --- LÓGICA DOS MODAIS (igual à anterior) ---
    $('#tabelaTarefas tbody').on('click', '.btn-detalhar-tarefa', function (e) {
        e.preventDefault();
        const tarefaId = $(this).data('tarefa-id');
        
        fetch(`/api/atividade/${tarefaId}`)
            .then(response => response.json())
            .then(data => {
                const modalEl = document.getElementById('modalDetalhesAtividade');
                modalEl.querySelector('#detalhe-atividade-nome').textContent = data.titulo;
                modalEl.querySelector('#detalhe-atividade-disciplina').textContent = data.disciplina_nome;
                modalEl.querySelector('#detalhe-atividade-data').textContent = data.data_entrega;
                modalEl.querySelector('#detalhe-atividade-descricao').textContent = data.descricao || 'Nenhuma descrição fornecida.';
                
                const tipoBadge = modalEl.querySelector('#detalhe-atividade-tipo .badge');
                tipoBadge.className = `badge ${getTipoBadgeClass(data.tipo)}`;
                tipoBadge.textContent = data.tipo;

                const statusBadge = modalEl.querySelector('#detalhe-atividade-status .badge');
                statusBadge.className = `badge ${getStatusBadgeClass(data.status)}`;
                statusBadge.textContent = data.status.replace('_', ' ');

                new bootstrap.Modal(modalEl).show();
            });
    });

    // --- INICIALIZAÇÃO DA PÁGINA ---
    // Verifica se as variáveis injetadas existem antes de inicializar a tabela
    if (typeof tarefas_json !== 'undefined' && typeof disciplinas_json !== 'undefined') {
        inicializarDataTable(tarefas_json, disciplinas_json);
    } else {
        console.error("Variáveis 'tarefas_json' ou 'disciplinas_json' não encontradas. Verifique o template 'tarefas.html'.");
        inicializarDataTable([], []); 
    }
});
