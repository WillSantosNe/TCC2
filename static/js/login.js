// Aguarda o carregamento completo do HTML antes de executar o script.
document.addEventListener('DOMContentLoaded', function () {
    // Seleciona os elementos do formulário no HTML.
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');

    /**
     * Verifica se o formato de um email é válido.
     * @param {string} email O email para validar.
     * @returns {boolean} True se o email tiver um formato válido, false caso contrário.
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Padrão básico para formato de email.
        return emailRegex.test(email);
    }

    /**
     * Mostra uma mensagem de erro customizada abaixo de um campo do formulário.
     * @param {HTMLElement} inputElement O campo (input) que apresentou o erro.
     * @param {string} message A mensagem de erro a ser exibida.
     */
    function displayError(inputElement, message) {
        clearError(inputElement); // Limpa erro anterior

        const errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback d-block mt-1'; // Classe do Bootstrap para erro
        errorElement.textContent = message;

        // Adiciona a mensagem de erro logo após o campo de input
        inputElement.parentElement.appendChild(errorElement);
        inputElement.classList.add('is-invalid');
    }

    /**
     * Remove a mensagem de erro e o estilo visual de erro de um campo.
     * @param {HTMLElement} inputElement O campo (input) para limpar o erro.
     */
    function clearError(inputElement) {
        const parent = inputElement.parentElement;
        const errorElement = parent.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.remove();
        }
        inputElement.classList.remove('is-invalid');
    }

    // ---- FLUXO PRINCIPAL: Quando o formulário de login é enviado ----
    loginForm.addEventListener('submit', function (event) {
        // 1. Obtém os valores digitados pelo usuário.
        const email = emailInput.value.trim();
        const senha = senhaInput.value;
        let isValid = true;

        // 2. Limpa erros de validações anteriores.
        clearError(emailInput);
        clearError(senhaInput);

        // 3. Valida o campo de Email.
        if (!email) {
            displayError(emailInput, 'O campo email é obrigatório.');
            isValid = false;
        } else if (!isValidEmail(email)) {
            displayError(emailInput, 'Por favor, insira um email válido.');
            isValid = false;
        }

        // 4. Valida o campo de Senha.
        if (!senha) {
            displayError(senhaInput, 'O campo senha é obrigatório.');
            isValid = false;
        }

        // 5. Se a validação do frontend falhar (algum campo estiver vazio ou inválido),
        // o envio do formulário é impedido para que o usuário possa corrigir.
        // Se a validação passar, o script não faz nada e o formulário é enviado
        // normalmente para o backend (Flask) para a verificação das credenciais.
        if (!isValid) {
            event.preventDefault();
        }
    });

    // ---- MELHORIA DE USABILIDADE ----
    // Limpa o erro de um campo assim que o usuário começa a digitar nele.
    emailInput.addEventListener('input', () => clearError(emailInput));
    senhaInput.addEventListener('input', () => clearError(senhaInput));
});
