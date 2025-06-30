// Aguarda o carregamento completo do HTML antes de executar o script.
document.addEventListener('DOMContentLoaded', function () {
    // Seleciona os elementos do formulário no HTML.
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');

    // Define as credenciais do administrador para login.
    // ATENÇÃO: Em um sistema real, isso NUNCA deve ser feito no frontend por segurança.
    // Isso é apenas para fins de demonstração do TCC.
    const ADMIN_EMAIL = 'admin@admin.com'; // Email do administrador.
    const ADMIN_SENHA = '1234';          // Senha do administrador.

    /**
     * Verifica se o formato de um email é válido.
     * Exemplo: "texto@dominio.com"
     * @param {string} email O email para validar.
     * @returns {boolean} True se o email tiver um formato válido, false caso contrário.
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Padrão básico para formato de email.
        return emailRegex.test(email);
    }

    /**
     * Mostra uma mensagem de erro customizada abaixo de um campo do formulário.
     * Também adiciona um estilo visual de erro ao campo.
     * @param {HTMLElement} inputElement O campo (input) que apresentou o erro.
     * @param {string} message A mensagem de erro a ser exibida.
     */
    function displayError(inputElement, message) {
        clearError(inputElement); // Limpa erro anterior

        const errorElement = document.createElement('div');
        // Use a classe que o Bootstrap usa ou uma customizada que você estilize
        errorElement.className = 'invalid-feedback d-block mt-1'; // Adicionado d-block e mt-1
        errorElement.textContent = message;

        inputElement.parentElement.appendChild(errorElement); // << PONTO CRÍTICO
        inputElement.classList.add('is-invalid');
    }

    /**
     * Remove a mensagem de erro e o estilo visual de erro de um campo.
     * @param {HTMLElement} inputElement O campo (input) para limpar o erro.
     */
    function clearError(inputElement) {
        const errorElement = inputElement.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove(); // Remove a mensagem de erro.
        }
        inputElement.classList.remove('is-invalid'); // Remove o estilo visual de erro.
    }

    // ---- FLUXO PRINCIPAL: Quando o formulário de login é enviado ----
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Impede que o formulário seja enviado da forma tradicional (recarregando a página).

        // 1. Obtém os valores digitados pelo usuário.
        const email = emailInput.value.trim(); // .trim() remove espaços em branco extras.
        const senha = senhaInput.value;
        let isValid = true; // Flag para controlar se todas as validações passaram.

        // 2. Limpa erros de validações anteriores antes de verificar novamente.
        clearError(emailInput);
        clearError(senhaInput);
        // Remove também a mensagem de erro geral de login (se houver).
        const existingGeneralError = loginForm.querySelector('.alert-danger');
        if (existingGeneralError) {
            existingGeneralError.remove();
        }

        // 3. Valida o campo de Email.
        if (!email) { // Verifica se o email está vazio.
            displayError(emailInput, 'O campo email é obrigatório.');
            isValid = false;
        } else if (!isValidEmail(email)) { // Verifica se o formato do email é válido.
            displayError(emailInput, 'Por favor, insira um email válido.');
            isValid = false;
        }

        // 4. Valida o campo de Senha.
        if (!senha) { // Verifica se a senha está vazia.
            displayError(senhaInput, 'O campo senha é obrigatório.');
            isValid = false;
        }

        // 5. Se todas as validações passaram (isValid continua true)...
        if (isValid) {
            // 5.1. Verifica se as credenciais correspondem ao administrador.
            if (email === ADMIN_EMAIL && senha === ADMIN_SENHA) {
                // SUCESSO: Redireciona para a página principal.
                window.location.href = '/dashboard';
            } else {
                // FALHA: Credenciais incorretas. Mostra uma mensagem de erro geral.
                const generalErrorDiv = document.createElement('div');
                generalErrorDiv.className = 'alert alert-danger mt-3'; // Estilo Bootstrap para alerta de erro.
                generalErrorDiv.textContent = 'Email ou senha inválidos!';
                // Adiciona a mensagem no topo do formulário.
                loginForm.insertBefore(generalErrorDiv, loginForm.firstChild);

                // Adiciona feedback visual de erro aos campos.
                emailInput.classList.add('is-invalid');
                senhaInput.classList.add('is-invalid');
            }
        }
        // Se 'isValid' for false, o script termina aqui e o usuário vê os erros nos campos.
    });

    // ---- MELHORIA DE USABILIDADE ----
    // Limpa o erro de um campo assim que o usuário começa a digitar nele.
    emailInput.addEventListener('input', () => clearError(emailInput));
    senhaInput.addEventListener('input', () => clearError(senhaInput));
});
