// static/js/modals/disciplinaModal.js (CORRIGIDO)
document.addEventListener('DOMContentLoaded', function() {
    const modalDisciplinaPrincipalEl = document.getElementById('modalDisciplinaAdicaoPrincipal');
    const formDisciplinaPrincipal = document.getElementById('formDisciplinaPrincipal');
    
    // Sai da função se os elementos do modal não existirem nesta página
    if (!modalDisciplinaPrincipalEl || !formDisciplinaPrincipal) {
        return; 
    }

    const principalDisciplinaPeriodoSelect = document.getElementById('principalDisciplinaPeriodo');
    const principalDisciplinaStatusSelect = document.getElementById('principalDisciplinaStatus');

    // Evento para quando o modal é aberto: limpa o formulário
    modalDisciplinaPrincipalEl.addEventListener('show.bs.modal', function () {
        formDisciplinaPrincipal.reset();
        formDisciplinaPrincipal.classList.remove('was-validated'); // Remove classes de validação Bootstrap
        if (principalDisciplinaStatusSelect) {
            principalDisciplinaStatusSelect.value = "Ativa"; 
        }
        if (principalDisciplinaPeriodoSelect) {
            principalDisciplinaPeriodoSelect.value = "";
        }
    });

    // Listener para o submit do formulário
    formDisciplinaPrincipal.addEventListener('submit', function(event) {
        // Usa a validação nativa do Bootstrap.
        // Se o formulário NÃO for válido...
        if (!formDisciplinaPrincipal.checkValidity()) {
            // ...impede o envio para que o usuário possa corrigir os campos.
            event.preventDefault();
            event.stopPropagation();
        }

        // Adiciona a classe para que o Bootstrap mostre os feedbacks de validação (mensagens de erro/sucesso).
        formDisciplinaPrincipal.classList.add('was-validated');

        // Se o formulário for válido (checkValidity() retornar true),
        // o script NÃO chama preventDefault(), e o formulário é enviado
        // normalmente para a rota definida no atributo 'action' do HTML.
    });
});
