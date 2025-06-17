// CÓDIGO JAVASCRIPT COMPLETO E FINAL PARA A PÁGINA DE DISCIPLINAS

document.addEventListener("DOMContentLoaded", function () {
    let tabelaDisciplinasDt;
    let disciplinaEmEdicaoId = null; // Variável para rastrear o ID da disciplina em edição

    // --- DADOS MOCADOS ---
    let listaDisciplinas = [
        { id: "ITD201", nome: "Web Design Avançado", professor: "Prof. João Paulo", status: "Ativa", periodo: "2024.1", descricao: "Foco em técnicas avançadas de HTML, CSS e JavaScript para interfaces responsivas e interativas." },
        { id: "DGF101", nome: "Fundamentos de Design Gráfico", professor: "Prof. Jango", status: "Ativa", periodo: "2024.1", descricao: "Estudo dos princípios de composição, cor, tipografia e imagem." },
        { id: "UXD301", nome: "Princípios de UX/UI Design", professor: "Prof. Jason", status: "Ativa", periodo: "2024.2", descricao: "Introdução aos conceitos de experiência do usuário e design de interface." },
        { id: "ANM250", nome: "Técnicas de Animação 3D", professor: "Prof. Pryzado", status: "Em Andamento", periodo: "2024.2", descricao: "Modelagem, texturização, rigging e animação de objetos 3D." },
        { id: "HAR202", nome: "História da Arte", professor: "Prof. Olívia", status: "Concluída", periodo: "2024.1", descricao: "Visão panorâmica dos principais movimentos artísticos da história." },
        { id: "PHO110", nome: "Fotografia Digital", professor: "Prof. Lucas", status: "Ativa", periodo: "2024.2", descricao: "Técnicas de captura, composição e tratamento de imagens digitais." },
        { id: "CCO210", nome: "Programação Orientada a Objetos", professor: "Prof. Ana", status: "Concluída", periodo: "2024.1", descricao: "Paradigmas e aplicação da programação orientada a objetos." }
    ];

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Ativa': return 'bg-success text-white';
            case 'Em Andamento': return 'bg-info text-dark';
            case 'Concluída': return 'bg-secondary text-white';
            case 'Agendada': return 'bg-primary text-white';
            default: return 'bg-light text-dark';
        }
    }

    function gerarDropdownHtml(disciplinaId) {
        return `
            <div class="dropdown">
                <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item btn-detalhar-disciplina" href="#" data-disciplina-id="${disciplinaId}"><i class="bi bi-eye-fill me-2"></i>Detalhar</a></li>
                    <li><a class="dropdown-item btn-editar-disciplina" href="#" data-disciplina-id="${disciplinaId}"><i class="bi bi-pencil-fill me-2"></i>Editar</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item btn-excluir-disciplina text-danger" href="#" data-disciplina-id="${disciplinaId}"><i class="bi bi-trash-fill me-2"></i>Excluir</a></li>
                </ul>
            </div>`;
    }

    // Inicialização da Tabela de Disciplinas
    tabelaDisciplinasDt = $('#tabelaDisciplinas').DataTable({
        responsive: { details: { type: 'column', target: 0 } },
        dom: 't<"d-flex justify-content-between align-items-center mt-2"<"pt-1"i>p>',
        language: {
            info: "Total de _TOTAL_ disciplinas",
            infoEmpty: "Nenhuma disciplina encontrada",
            infoFiltered: "(filtrado de _MAX_ no total)",
            paginate: { first: "Primeiro", last: "Último", next: "Próximo", previous: "Anterior" }
        },
        paging: false,
        data: listaDisciplinas,
        columns: [
            { data: null, defaultContent: '', orderable: false, className: 'dtr-control' },
            { data: 'nome' },
            { data: 'professor' },
            { data: 'status', render: (data) => `<span class="badge ${getStatusBadgeClass(data)}">${data}</span>` },
            { data: 'id', orderable: false, className: 'text-center dt-actions-column', render: (data) => gerarDropdownHtml(data) },
            { data: 'periodo', visible: false }
        ],
        drawCallback: function () {
            // Re-inicializa os dropdowns do Bootstrap após cada redesenho da tabela
            const dropdowns = this.api().table().body().querySelectorAll('[data-bs-toggle="dropdown"]');
            dropdowns.forEach((dd) => {
                new bootstrap.Dropdown(dd, {
                    boundary: document.body
                });
            });
        }
    });

    // --- FUNÇÃO PARA PREENCHER O MODAL DE EDIÇÃO ---
    function preencherModalEdicao(disciplina) {
        disciplinaEmEdicaoId = disciplina.id;
        $('#modalDisciplinaAdicaoPrincipalLabel').text('Editar Disciplina');
        $('#principalDisciplinaNome').val(disciplina.nome);
        $('#principalDisciplinaDescricao').val(disciplina.descricao);
        $('#principalDisciplinaProfessor').val(disciplina.professor);
        $('#principalDisciplinaPeriodo').val(disciplina.periodo);
        $('#principalDisciplinaStatus').val(disciplina.status);
        new bootstrap.Modal('#modalDisciplinaAdicaoPrincipal').show();
    }
    
    // --- CONECTANDO OS CONTROLES DO HTML ---
    $('#customSearchInput').on('keyup', function () {
        tabelaDisciplinasDt.search(this.value).draw();
    });
    $('#customStatusFilter').on('change', function () {
        tabelaDisciplinasDt.column(3).search(this.value).draw();
    });
    $('#customPeriodoFilter').on('change', function () {
        tabelaDisciplinasDt.column(5).search(this.value).draw();
    });

    // --- LÓGICA DOS BOTÕES DE AÇÃO ---
    $('#tabelaDisciplinas tbody').on('click', '.dropdown-item', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const disciplinaId = $(this).data('disciplina-id');
        const disciplina = listaDisciplinas.find(d => d.id === disciplinaId);
        if (!disciplina) return;
        
        // CORREÇÃO 2: Esconde o dropdown ao clicar em um item que abre um modal
        const dropdownDoItem = bootstrap.Dropdown.getInstance($(this).closest('.dropdown').find('[data-bs-toggle="dropdown"]'));
        if (dropdownDoItem) {
            dropdownDoItem.hide();
        }

        if ($(this).hasClass('btn-excluir-disciplina')) {
            if (confirm(`Tem certeza que deseja excluir a disciplina "${disciplina.nome}"?`)) {
                listaDisciplinas = listaDisciplinas.filter(d => d.id !== disciplinaId);
                // Encontra a linha da tabela e a remove
                tabelaDisciplinasDt.row($(this).closest('tr')).remove().draw();
                popularDropdownsDeDisciplinas();
            }
        } else if ($(this).hasClass('btn-detalhar-disciplina')) {
            // Preenche os dados no novo modal de detalhes
            $('#detalhe-disciplina-nome').text(disciplina.nome);
            $('#detalhe-disciplina-descricao').text(disciplina.descricao || "Nenhuma descrição fornecida.");
            $('#detalhe-disciplina-professor').text(disciplina.professor);
            $('#detalhe-disciplina-periodo').text(disciplina.periodo);
            $('#detalhe-disciplina-status').html(`<span class="badge ${getStatusBadgeClass(disciplina.status)}">${disciplina.status}</span>`);

            const detalhesModal = new bootstrap.Modal('#modalDetalhesDisciplina');
            
            document.getElementById('verTarefasDisciplina').onclick = () => {
                alert(`Aqui você redirecionaria ou filtraria para ver as tarefas de: ${disciplina.nome}`);
                detalhesModal.hide();
            };
            document.getElementById('verAnotacoesDisciplina').onclick = () => {
                alert(`Aqui você redirecionaria ou filtraria para ver as anotações de: ${disciplina.nome}`);
                detalhesModal.hide();
            };
            document.getElementById('btnCompartilharDisciplina').onclick = () => {
                alert(`Aqui você implementaria a lógica para compartilhar a disciplina: ${disciplina.nome}`);
            };

            detalhesModal.show();
        } else if ($(this).hasClass('btn-editar-disciplina')) {
            preencherModalEdicao(disciplina);
        }
    });

    // --- LÓGICA DE SUBMISSÃO DO FORMULÁRIO DE ADIÇÃO/EDIÇÃO ---
    $('#formDisciplinaPrincipal').on('submit', function (e) {
        e.preventDefault();
        const nome = $('#principalDisciplinaNome').val();
        const descricao = $('#principalDisciplinaDescricao').val();
        const professor = $('#principalDisciplinaProfessor').val();
        const periodo = $('#principalDisciplinaPeriodo').val();
        const status = $('#principalDisciplinaStatus').val();

        if (disciplinaEmEdicaoId) {
            // MODO DE EDIÇÃO
            const indexNaLista = listaDisciplinas.findIndex(d => d.id === disciplinaEmEdicaoId);
            const dadosAtualizados = { id: disciplinaEmEdicaoId, nome, professor, status, periodo, descricao };

            if (indexNaLista !== -1) {
                // Atualiza a lista de dados original
                listaDisciplinas[indexNaLista] = dadosAtualizados;
                
                // CORREÇÃO 1: Atualiza apenas a linha específica na tabela do DataTables
                tabelaDisciplinasDt.rows().every(function() {
                    if (this.data().id === disciplinaEmEdicaoId) {
                        this.data(dadosAtualizados).draw(false); // O 'false' mantém a paginação atual
                    }
                });
            }
            disciplinaEmEdicaoId = null; 
            $('#modalDisciplinaAdicaoPrincipalLabel').text('Adicionar Disciplina');
        } else {
            // MODO DE ADIÇÃO
            const novoId = Math.random().toString(36).substring(2, 9).toUpperCase();
            const novaDisciplina = { id: novoId, nome, professor, status, periodo, descricao };
            listaDisciplinas.push(novaDisciplina);
            
            // Adiciona a nova linha à tabela
            tabelaDisciplinasDt.row.add(novaDisciplina).draw(false);
        }

        popularDropdownsDeDisciplinas();
        $('#modalDisciplinaAdicaoPrincipal').modal('hide');
        this.reset();
    });

    // --- CÓDIGO PARA OS MODAIS DE TAREFA E ANOTAÇÃO ---
    function popularDropdownsDeDisciplinas() {
        const tarefaSelect = document.querySelector('#principalTarefaDisciplina');
        const anotacaoSelect = document.querySelector('#principalAnotacaoDisciplinaSelect');
        if (!tarefaSelect || !anotacaoSelect) { return; }
        tarefaSelect.innerHTML = '<option value="" selected disabled>Selecione...</option>';
        anotacaoSelect.innerHTML = '<option value="">Vincular a uma disciplina (opcional)</option>';
        listaDisciplinas.forEach(disciplina => {
            const option = document.createElement('option');
            option.value = disciplina.id;
            option.textContent = disciplina.nome;
            tarefaSelect.appendChild(option.cloneNode(true));
            anotacaoSelect.appendChild(option.cloneNode(true));
        });
    }

    function inicializarEditorDeTexto() {
        if (typeof tinymce !== 'undefined') {
            tinymce.remove('textarea#principalAnotacaoConteudoInput');
            tinymce.init({
                selector: 'textarea#principalAnotacaoConteudoInput',
                plugins: 'lists link image table code help wordcount',
                toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image',
                height: 350,
                menubar: false,
                branding: false,
                language: 'pt_BR'
            });
        }
    }

    popularDropdownsDeDisciplinas();
    const modalAnotacao = document.getElementById('modalAnotacaoPrincipal');
    if (modalAnotacao) {
        modalAnotacao.addEventListener('shown.bs.modal', function () {
            inicializarEditorDeTexto();
        });
    }

    $('#modalDisciplinaAdicaoPrincipal').on('hidden.bs.modal', function () {
        disciplinaEmEdicaoId = null;
        $('#modalDisciplinaAdicaoPrincipalLabel').text('Adicionar Disciplina');
        $('#formDisciplinaPrincipal').trigger("reset");
        $('#formDisciplinaPrincipal').removeClass('was-validated');
    });
});