// static/js/modals/tarefaRapidaModal.js (CORRIGIDO)
document.addEventListener('DOMContentLoaded', function() {
    const modalEl = document.getElementById('modalTarefaPrincipalQuickAdd');
    const form = document.getElementById('formTarefaPrincipalQuickAdd');

    // Sai da função se os elementos do modal não existirem nesta página
    if (!modalEl || !form) {
        return; 
    }

    // Evento para quando o modal é aberto: limpa o formulário e as classes de validação.
    // A população dos selects agora é feita pelo Flask/Jinja2 diretamente no HTML.
    modalEl.addEventListener('show.bs.modal', function () {
        form.reset();
        form.classList.remove('was-validated');
    });

    // Listener para o submit do formulário
    form.addEventListener('submit', function(event) {
        // Usa a validação nativa do Bootstrap.
        // Se o formulário NÃO for válido...
        if (!form.checkValidity()) {
            // ...impede o envio para que o usuário possa corrigir os campos.
            event.preventDefault();
            event.stopPropagation();
        }

        // Adiciona a classe para que o Bootstrap mostre os feedbacks de validação (mensagens de erro/sucesso).
        form.classList.add('was-validated');

        // Se o formulário for válido, o script NÃO chama preventDefault() e permite
        // que o formulário seja enviado para a rota '/tarefas/criar' no Flask.
    });
});
