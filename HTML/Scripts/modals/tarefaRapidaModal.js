document.addEventListener('DOMContentLoaded', function() {
    // Seletores ajustados para o NOVO ID do modal rápido da sidebar
    const modalTarefaPrincipalQuickAddEl = document.getElementById('modalTarefaPrincipalQuickAdd');
    const formTarefaPrincipalQuickAdd = document.getElementById('formTarefaPrincipalQuickAdd');
    const principalTarefaTituloQuickAddInput = document.getElementById('principalTarefaTituloQuickAdd');
    const principalTarefaDescricaoQuickAddInput = document.getElementById('principalTarefaDescricaoQuickAdd');
    const principalTarefaDisciplinaQuickAddSelect = document.getElementById('principalTarefaDisciplinaQuickAdd'); // Novo campo
    const principalTarefaDataEntregaQuickAddInput = document.getElementById('principalTarefaDataEntregaQuickAdd');
    const principalTarefaTipoQuickAddSelect = document.getElementById('principalTarefaTipoQuickAdd');
    const principalTarefaStatusQuickAddSelect = document.getElementById('principalTarefaStatusQuickAdd'); // Novo campo

    // Instancia o modal Bootstrap
    const modalTarefaPrincipalQuickAdd = new bootstrap.Modal(modalTarefaPrincipalQuickAddEl);

    // Evento para quando o modal é aberto (limpar formulário, etc.)
    modalTarefaPrincipalQuickAddEl.addEventListener('show.bs.modal', function () {
        formTarefaPrincipalQuickAdd.reset(); // Limpa todos os campos do formulário
        formTarefaPrincipalQuickAdd.classList.remove('was-validated'); // Remove classes de validação Bootstrap
        
        // Popula os selects para o modal rápido
        // Assegura que listaDisciplinas e popularSelect (do tarefas.js) estejam disponíveis globalmente
        if (window.listaDisciplinas && window.popularSelect) {
            window.popularSelect(principalTarefaDisciplinaQuickAddSelect, window.listaDisciplinas.map(d => ({id: d.id, nome: d.nome})), '');
            window.popularSelect(principalTarefaTipoQuickAddSelect, ["Tarefa", "Prova"], '');
            window.popularSelect(principalTarefaStatusQuickAddSelect, ["A fazer", "Em andamento", "Concluída"], "A fazer");
        } else {
            console.error("Variáveis globais (listaDisciplinas ou popularSelect) não encontradas. Verifique a ordem dos scripts.");
        }
    });

    // Listener para o submit do formulário
    formTarefaPrincipalQuickAdd.addEventListener('submit', function(event) {
        // Validação Bootstrap
        if (!formTarefaPrincipalQuickAdd.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault(); // Impede o envio padrão do formulário

            // Coleta os dados do formulário
            const novaTarefa = {
                id: 'T-' + new Date().getTime(), // Exemplo de ID único
                titulo: principalTarefaTituloQuickAddInput.value.trim(),
                descricao: principalTarefaDescricaoQuickAddInput.value.trim(),
                disciplinaId: principalTarefaDisciplinaQuickAddSelect.value, // Pega o valor do novo campo
                dataEntrega: principalTarefaDataEntregaQuickAddInput.value,
                tipo: principalTarefaTipoQuickAddSelect.value,
                status: principalTarefaStatusQuickAddSelect.value 
            };

            console.log('Nova Tarefa/Prova Adicionada (Quick Add):', novaTarefa);
            alert(`Tarefa/Prova "${novaTarefa.titulo}" adicionada com sucesso via Quick Add!`);

            // Se você quiser que a tabela na página principal seja atualizada,
            // você precisará de um mecanismo para comunicar essa nova tarefa.
            // Por exemplo, um evento customizado ou se 'listaTarefas' e 'tabelaTarefasDt' forem globais.
            if (window.salvarOuAtualizarTarefaNaTabela) {
                window.salvarOuAtualizarTarefaNaTabela(novaTarefa, false);
            }

            // Esconde o modal
            modalTarefaPrincipalQuickAdd.hide();
        }
        formTarefaPrincipalQuickAdd.classList.add('was-validated'); // Adiciona a classe para exibir feedback de validação
    });
});
