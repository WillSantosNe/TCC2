// static/js/modals/tarefaRapidaModal.js (VERSÃO FINAL E CORRETA)
document.addEventListener('DOMContentLoaded', function() {
    const modalEl = document.getElementById('modalTarefaPrincipalQuickAdd');
    if (!modalEl) return;

    const form = modalEl.querySelector('#formTarefaPrincipalQuickAdd');

    const popularDisciplinasSeNecessario = () => {
        const disciplinaSelect = document.getElementById('principalTarefaDisciplinaQuickAdd');
        // A condição 'options.length <= 1' garante que ele só popule uma vez.
        if (disciplinaSelect && disciplinaSelect.options.length <= 1) {
            if (window.disciplinas_json && window.disciplinas_json.length > 0) {
                // Garante que o placeholder esteja lá antes de adicionar mais opções
                disciplinaSelect.innerHTML = '<option value="" selected disabled>Selecione uma disciplina...</option>';
                
                window.disciplinas_json.forEach(d => {
                    disciplinaSelect.add(new Option(d.nome, String(d.id))); 
                });
            } else {
                 // Caso não hajam disciplinas, exibe uma mensagem.
                 disciplinaSelect.innerHTML = '<option value="" selected disabled>Nenhuma disciplina cadastrada</option>';
            }
        }
    };

    const prepararModalParaAdicionar = (event) => {
        // Impede o comportamento padrão do link <a>
        event.preventDefault();

        // Configura o modal para o modo de "Adicionar"
        modalEl.querySelector('#modalTarefaPrincipalQuickAddLabel').textContent = 'Adicionar Tarefa/Prova';
        form.action = '/tarefas/criar';
        form.reset();
        modalEl.querySelector('#principalTarefaIdQuickAdd').value = '';
        form.classList.remove('was-validated');

        // Popula as disciplinas
        popularDisciplinasSeNecessario();
        
        // Abre o modal usando o JavaScript do Bootstrap
        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
    };

    // --- LISTENERS DE EVENTOS ---
    // Adiciona o listener para o botão da SIDEBAR (ID #quickAddTarefaBtnSidebar)
    const btnSidebar = document.getElementById('quickAddTarefaBtnSidebar');
    if (btnSidebar) {
        btnSidebar.addEventListener('click', prepararModalParaAdicionar);
    }

    // Adiciona o listener para o botão da TABELA (ID #abrirModalNovaTarefaDt)
    // Usamos delegação de evento com jQuery para o botão que é criado dinamicamente em tarefas.js
    $(document).on('click', '#abrirModalNovaTarefaDt', prepararModalParaAdicionar);

    // Validação do formulário no submit
    form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        form.classList.add('was-validated');
    });
});
