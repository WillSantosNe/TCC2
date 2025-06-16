// tarefaRapidaModal.js
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

    // Dados para popular o select de Disciplina (assumindo que listaDisciplinas está disponível globalmente ou aqui)
    const listaDisciplinasQuickAdd = [
        { id: "CS101", nome: "Algoritmos e Estrutura de Dados" },
        { id: "CS102", nome: "Redes de Computadores" },
        { id: "CS103", nome: "Banco de Dados" },
        { id: "CS104", nome: "Inteligência Artificial" },
        { id: "CS105", nome: "Compiladores" }
    ];
    // Função auxiliar para popular selects (copiada de tarefas.js para ser independente)
    function popularSelectQuickAdd(element, options, selectedValue = null) {
        if (!element) return;
        element.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Selecione...";
        defaultOption.disabled = true;
        defaultOption.selected = true;
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

    // Evento para quando o modal é aberto (limpar formulário, etc.)
    modalTarefaPrincipalQuickAddEl.addEventListener('show.bs.modal', function () {
        formTarefaPrincipalQuickAdd.reset(); // Limpa todos os campos do formulário
        formTarefaPrincipalQuickAdd.classList.remove('was-validated'); // Remove classes de validação Bootstrap
        
        // Popula os selects para o modal rápido
        popularSelectQuickAdd(principalTarefaDisciplinaQuickAddSelect, listaDisciplinasQuickAdd.map(d => ({id: d.id, nome: d.nome})), '');
        popularSelectQuickAdd(principalTarefaTipoQuickAddSelect, ["Tarefa", "Prova"], '');
        popularSelectQuickAdd(principalTarefaStatusQuickAddSelect, ["A FAZER", "EM ANDAMENTO", "CONCLUÍDA"], "A FAZER");
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
                status: principalTarefaStatusQuickAddSelect.value // Pega o valor do novo campo
            };

            console.log('Nova Tarefa/Prova Adicionada (Quick Add):', novaTarefa);
            alert(`Tarefa/Prova "${novaTarefa.titulo}" adicionada com sucesso via Quick Add!`);

            // Se você quiser que a tabela na página principal seja atualizada,
            // você precisará de um mecanismo para comunicar essa nova tarefa.
            // Por exemplo, um evento customizado ou se 'listaTarefas' e 'tabelaTarefasDt' forem globais.
            // Exemplo:
            // if (window.salvarOuAtualizarTarefaNaTabela && window.tabelaTarefasDt) {
            //     window.salvarOuAtualizarTarefaNaTabela(novaTarefa, false);
            // }

            // Esconde o modal
            modalTarefaPrincipalQuickAdd.hide();
        }
        formTarefaPrincipalQuickAdd.classList.add('was-validated'); // Adiciona a classe para exibir feedback de validação
    });
});
