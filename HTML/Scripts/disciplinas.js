// CÓDIGO JAVASCRIPT COMPLETO E FINAL PARA A PÁGINA DE DISCIPLINAS

document.addEventListener("DOMContentLoaded", function () {
    let tabelaDisciplinasDt;

    // --- DADOS MOCADOS ---
    let listaDisciplinas = [
        { id: "ITD201", nome: "Web Design Avançado", professor: "Prof. João Paulo", status: "Ativa", periodo: "2024.1" },
        { id: "DGF101", nome: "Fundamentos de Design Gráfico", professor: "Prof. Jango", status: "Ativa", periodo: "2024.1" },
        { id: "UXD301", nome: "Princípios de UX/UI Design", professor: "Prof. Jason", status: "Ativa", periodo: "2024.2" },
        { id: "ANM250", nome: "Técnicas de Animação 3D", professor: "Prof. Pryzado", status: "Em Andamento", periodo: "2024.2" },
        { id: "HAR202", nome: "História da Arte", professor: "Prof. Olívia", status: "Concluída", periodo: "2024.1" },
        { id: "PHO110", nome: "Fotografia Digital", professor: "Prof. Lucas", status: "Ativa", periodo: "2024.2" },
        { id: "CCO210", nome: "Programação Orientada a Objetos", professor: "Prof. Ana", status: "Concluída", periodo: "2024.1" }
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
                    <li><a class="dropdown-item btn-compartilhar-disciplina" href="#" data-disciplina-id="${disciplinaId}"><i class="bi bi-share-fill me-2"></i>Compartilhar</a></li>
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
            { data: 'id', orderable: false, className: 'text-center', render: (data) => gerarDropdownHtml(data) },
            { data: 'periodo', visible: false } 
        ],
        drawCallback: function () {
            // Inicializa os dropdowns do Bootstrap com a configuração para sobrepor a tabela
            this.api().table().body().querySelectorAll('[data-bs-toggle="dropdown"]').forEach(function(dd) {
                new bootstrap.Dropdown(dd, {
                    popperConfig: {
                        strategy: 'absolute',
                    }
                });
            });
        }
    });

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
    $('#tabelaDisciplinas tbody').on('click', '.dropdown-item', function(e) {
        e.preventDefault();
        const disciplinaId = $(this).data('disciplina-id');
        const disciplina = listaDisciplinas.find(d => d.id === disciplinaId);
        if (!disciplina) return;
        if ($(this).hasClass('btn-excluir-disciplina')) {
            if (confirm(`Tem certeza que deseja excluir a disciplina "${disciplina.nome}"?`)) {
                listaDisciplinas = listaDisciplinas.filter(d => d.id !== disciplinaId);
                tabelaDisciplinasDt.clear().rows.add(listaDisciplinas).draw();
            }
        } else if ($(this).hasClass('btn-detalhar-disciplina')) {
            alert(`Detalhes da disciplina: ${disciplina.nome}`);
        } else if ($(this).hasClass('btn-compartilhar-disciplina')) {
            alert(`Compartilhando a disciplina: ${disciplina.nome}`);
        }
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
});