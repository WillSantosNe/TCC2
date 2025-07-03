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
            scrollY: '450px',
            scrollCollapse: true,
            lengthChange: false,
            language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar tarefas/provas..." },
            
            // --- LÓGICA DE RESPONSIVIDADE DAS COLUNAS RESTAURADA ---
            columnDefs: [
                { orderable: false, targets: [0, 6] }, // Coluna de controle e ações não são ordenáveis
                
                // --- PRIORIDADES DE RESPONSIVIDADE ---
                // Quanto menor o número, mais importante é a coluna (demora mais para sumir)
                { responsivePriority: 1, targets: 0 }, // 1º: O botão '+'
                { responsivePriority: 2, targets: 1 }, // 2º: O Título da Tarefa
                { responsivePriority: 3, targets: 6 }, // 3º: O menu de Ações
                { responsivePriority: 4, targets: 4 }, // 4º: A Data de Entrega
                { responsivePriority: 5, targets: 5 }, // 5º: O Status
                { responsivePriority: 6, targets: 2 }, // 6º: A Disciplina
                { responsivePriority: 7, targets: 3 }  // 7º: O Tipo (some primeiro)
            ],
            // -----------------------------------------------------------

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
                    className: 'dt-actions-column', // Adiciona uma classe para controle de estilo se necessário
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
            initComplete: function () {
                const api = this.api();
                const buttonsContainer = $('.dt-buttons-container');

                // --- LÓGICA DE RESPONSIVIDADE DOS FILTROS RESTAURADA ---
                buttonsContainer.addClass('d-flex flex-wrap gap-2 justify-content-md-end');
                // ------------------------------------------------------
                
                if ($('#abrirModalNovaTarefaDt').length === 0) {
                    const btnAddTask = $('<button class="btn btn-primary" id="abrirModalNovaTarefaDt" data-bs-toggle="modal" data-bs-target="#modalTarefaPrincipalQuickAdd"><i class="bi bi-plus-lg me-2"></i>Adicionar Tarefa/Prova</button>');
                    buttonsContainer.append(btnAddTask);
                }
                
                const filterHtml = `<select id="filterTipoTarefa" class="form-select dt-filter-select ms-2"><option value="">Todos os Tipos</option><option value="TAREFA">Tarefa</option><option value="PROVA">Prova</option></select><select id="filterDisciplina" class="form-select dt-filter-select ms-2"><option value="">Todas as Disciplinas</option></select>`;
                buttonsContainer.prepend(filterHtml);
                
                dadosDisciplinas.forEach(d => $('#filterDisciplina').append(new Option(d.nome, d.nome)));

                $('#filterTipoTarefa').on('change', function () { api.column(3).search(this.value ? `^${this.value}$` : '', true, false).draw(); });
                $('#filterDisciplina').on('change', function () { api.column(2).search(this.value ? `^${this.value}$` : '', true, false).draw(); });
            
                // Adiciona um listener para redimensionar a tabela ao mudar o tamanho da janela
                $(window).off('resize.dtTarefas').on('resize.dtTarefas', function() {
                    setTimeout(() => {
                        api.columns.adjust().responsive.recalc();
                    }, 200);
                });
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
