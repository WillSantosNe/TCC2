// Aguarda o carregamento completo do HTML antes de executar o script.
document.addEventListener('DOMContentLoaded', function () {
    // --- Seleção dos Elementos do Formulário ---
    const cadastroForm = document.getElementById('cadastroForm');
    const nomeInput = document.getElementById('nome');
    const sobrenomeInput = document.getElementById('sobrenome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const termosCheckbox = document.getElementById('termos');
    const passwordToggles = document.querySelectorAll('.password-toggle-icon');

    // --- Funções Auxiliares de Validação e UI ---

    /**
     * Verifica se o formato de um email é válido.
     * @param {string} email O email para validar.
     * @returns {boolean} True se o email tiver um formato válido, false caso contrário.
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Verifica se a senha atende aos critérios: mínimo 8 caracteres e pelo menos um número.
     * @param {string} senha A senha para validar.
     * @returns {boolean} True se a senha for válida, false caso contrário.
     */
    function isSenhaValida(senha) {
        if (senha.length < 8) {
            return false;
        }
        if (!/\d/.test(senha)) { // Verifica se contém pelo menos um dígito
            return false;
        }
        return true;
    }

    /**
     * Mostra uma mensagem de erro customizada abaixo de um campo do formulário.
     * @param {HTMLElement} inputElement O campo (input/checkbox) que apresentou o erro.
     * @param {string} message A mensagem de erro a ser exibida.
     */
    function displayError(inputElement, message) {
        clearError(inputElement);

        const parent = inputElement.closest('.form-check') || inputElement.parentElement;
        const errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback d-block';
        errorElement.textContent = message;

        parent.appendChild(errorElement);
        inputElement.classList.add('is-invalid');
    }

    /**
     * Remove a mensagem de erro e o estilo visual de erro de um campo.
     * @param {HTMLElement} inputElement O campo (input/checkbox) para limpar o erro.
     */
    function clearError(inputElement) {
        const parent = inputElement.closest('.form-check') || inputElement.parentElement;
        const errorElement = parent.querySelector('.invalid-feedback.d-block');
        if (errorElement) {
            errorElement.remove();
        }
        inputElement.classList.remove('is-invalid');
        inputElement.classList.remove('is-valid');
    }

    /**
     * Marca um campo como válido.
     * @param {HTMLElement} inputElement O campo (input) a ser marcado como válido.
     */
    function markAsValid(inputElement) {
        clearError(inputElement);
        inputElement.classList.add('is-valid');
    }

    // --- Lógica para Mostrar/Esconder Senha ---
    passwordToggles.forEach(toggle => {
        const icon = toggle.querySelector('i');
        const input = toggle.parentElement.querySelector('input[type="password"], input[type="text"]');

        if (input) {
            toggle.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.replace('bi-eye-slash', 'bi-eye');
                } else {
                    input.type = 'password';
                    icon.classList.replace('bi-eye', 'bi-eye-slash');
                }
            });
        }
    });


    // ---- FLUXO PRINCIPAL: Quando o formulário de CADASTRO é enviado ----
    cadastroForm.addEventListener('submit', function (event) {
        let formValido = true;

        // 1. Limpa todos os erros anteriores antes de validar novamente.
        [nomeInput, sobrenomeInput, emailInput, senhaInput, confirmarSenhaInput, termosCheckbox].forEach(clearError);

        // 2. Validação do Nome
        if (!nomeInput.value.trim()) {
            displayError(nomeInput, 'O campo nome é obrigatório.');
            formValido = false;
        } else {
            markAsValid(nomeInput);
        }

        // 3. Validação do Sobrenome
        if (!sobrenomeInput.value.trim()) {
            displayError(sobrenomeInput, 'O campo sobrenome é obrigatório.');
            formValido = false;
        } else {
            markAsValid(sobrenomeInput);
        }

        // 4. Validação do Email
        if (!emailInput.value.trim()) {
            displayError(emailInput, 'O campo email é obrigatório.');
            formValido = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            displayError(emailInput, 'Por favor, insira um email válido (ex: seu@email.com).');
            formValido = false;
        } else {
            markAsValid(emailInput);
        }

        // 5. Validação da Senha
        const senhaValor = senhaInput.value;
        if (!senhaValor) {
            displayError(senhaInput, 'O campo senha é obrigatório.');
            formValido = false;
        } else if (!isSenhaValida(senhaValor)) {
            displayError(senhaInput, 'A senha deve ter no mínimo 8 caracteres e incluir pelo menos um número.');
            formValido = false;
        } else {
            markAsValid(senhaInput);
        }

        // 6. Validação da Confirmação de Senha
        const confirmarSenhaValor = confirmarSenhaInput.value;
        if (!confirmarSenhaValor) {
            displayError(confirmarSenhaInput, 'Por favor, confirme sua senha.');
            formValido = false;
        } else if (senhaValor && confirmarSenhaValor !== senhaValor) {
            displayError(confirmarSenhaInput, 'As senhas não coincidem.');
            formValido = false;
        } else if (senhaValor && confirmarSenhaValor === senhaValor) {
             if (isSenhaValida(senhaValor)) markAsValid(confirmarSenhaInput);
        }

        // 7. Validação do Checkbox de Termos
        if (!termosCheckbox.checked) {
            displayError(termosCheckbox, 'Você deve aceitar os termos e a política de privacidade.');
            formValido = false;
        } else {
            clearError(termosCheckbox);
        }

        // 8. Se alguma validação do front-end falhou, impede o envio do formulário.
        // Se tudo estiver válido, o script não faz nada e o formulário é enviado
        // para o servidor Flask para a lógica de back-end.
        if (!formValido) {
            event.preventDefault();
        }
    });

    // ---- MELHORIA DE USABILIDADE ----
    // Limpa o erro de um campo assim que o usuário começa a digitar/interagir.
    [nomeInput, sobrenomeInput, emailInput, senhaInput, confirmarSenhaInput].forEach(input => {
        input.addEventListener('input', () => clearError(input));
    });
    termosCheckbox.addEventListener('change', () => clearError(termosCheckbox));
});
