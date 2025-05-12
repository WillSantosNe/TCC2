/**
 * @file Validações do formulário de cadastro e funcionalidade de visualização de senha.
 * @description Este script lida com a validação client-side dos campos do formulário de cadastro
 * e permite ao usuário alternar a visibilidade dos campos de senha.
 */

document.addEventListener('DOMContentLoaded', function () {
    const cadastroForm = document.getElementById('cadastroForm');
    const nomeInput = document.getElementById('nome');
    const sobrenomeInput = document.getElementById('sobrenome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const termosCheckbox = document.getElementById('termos');
    const togglePasswordContainers = document.querySelectorAll('.password-toggle-icon');

    // ... (função controlarVisibilidadeIconeSenha e seu loop forEach permanecem os mesmos)
    function controlarVisibilidadeIconeSenha(inputElement, iconContainer) {
        if (inputElement.value.length > 0) {
            iconContainer.classList.add('visible');
        } else {
            iconContainer.classList.remove('visible');
            if (inputElement.type === 'text') {
                inputElement.type = 'password';
                const icon = iconContainer.querySelector('i');
                if (icon) {
                    icon.classList.remove('bi-eye');
                    icon.classList.add('bi-eye-slash');
                }
            }
        }
    }

    togglePasswordContainers.forEach(iconContainer => {
        const passwordInput = iconContainer.parentElement.querySelector('input[type="password"], input[type="text"]');
        const icon = iconContainer.querySelector('i');

        if (passwordInput && icon) {
            controlarVisibilidadeIconeSenha(passwordInput, iconContainer);
            passwordInput.addEventListener('input', function() {
                controlarVisibilidadeIconeSenha(passwordInput, iconContainer);
            });
            iconContainer.addEventListener('click', function () {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('bi-eye-slash');
                    icon.classList.add('bi-eye');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('bi-eye');
                    icon.classList.add('bi-eye-slash');
                }
            });
        }
    });


    if (cadastroForm) {
        cadastroForm.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            const formularioValido = validarFormularioCompleto(true);

            if (formularioValido) {
                alert('Formulário válido e pronto para ser enviado!');
                // cadastroForm.submit(); 
            } else {
                cadastroForm.classList.add('was-validated');
                console.log('Formulário contém erros. Por favor, corrija-os.');
            }
        });
    }

    function validarFormularioCompleto(showErrorOnSubmit = false) {
        [nomeInput, sobrenomeInput, emailInput, senhaInput, confirmarSenhaInput, termosCheckbox].forEach(input => {
            if (input) input.classList.remove('is-valid', 'is-invalid'); // Limpa ambos os estados
        });
        
        const isNomeValido = validarCampoObrigatorio(nomeInput, "Por favor, insira seu nome.", showErrorOnSubmit);
        const isSobrenomeValido = validarCampoObrigatorio(sobrenomeInput, "Por favor, insira seu sobrenome.", showErrorOnSubmit);
        const isEmailValido = validarEmail(showErrorOnSubmit);
        
        // Validar a força da senha primeiro
        const isSenhaForte = verificarForcaSenha(showErrorOnSubmit);
        
        // Validar a confirmação da senha (que também verifica a coincidência)
        const senhasCoincidem = validarConfirmarSenha(showErrorOnSubmit);

        // A senha principal só é válida se for forte E coincidir com a confirmação
        const isSenhaPrincipalValida = isSenhaForte && senhasCoincidem;
        if (showErrorOnSubmit && isSenhaPrincipalValida) {
            setSucesso(senhaInput);
        } else if (showErrorOnSubmit && !isSenhaForte) {
            // O erro de força já foi setado em verificarForcaSenha
        } else if (showErrorOnSubmit && isSenhaForte && !senhasCoincidem) {
            // Se a senha é forte mas não coincide, o erro já está em confirmarSenhaInput.
            // Poderíamos também marcar senhaInput como inválido aqui, mas pode ser confuso.
            // Vamos garantir que não seja marcado como sucesso se não coincidir.
            senhaInput.classList.remove('is-valid'); // Garante que não fique como válido
        }


        const isTermosAceitos = validarTermos(showErrorOnSubmit);

        return isNomeValido && isSobrenomeValido && isEmailValido && isSenhaPrincipalValida && senhasCoincidem && isTermosAceitos;
    }

    function validarCampoObrigatorio(inputElement, mensagemErro, showError) {
        if (!inputElement) return true;
        const valor = inputElement.value.trim();
        if (valor === '') {
            if (showError) setErro(inputElement, mensagemErro);
            return false;
        }
        if (showError || inputElement.classList.contains('is-invalid')) {
            setSucesso(inputElement);
        }
        return true;
    }

    function validarEmail(showError) {
        if (!emailInput) return true;
        const emailValor = emailInput.value.trim();
        if (emailValor === '') {
            if (showError) setErro(emailInput, 'O email é obrigatório.');
            return false;
        } else if (!isEmailValidoRegex(emailValor)) {
            if (showError) setErro(emailInput, 'Por favor, insira um email válido (ex: usuario@dominio.com).');
            return false;
        }
        if (showError || emailInput.classList.contains('is-invalid')) {
            setSucesso(emailInput);
        }
        return true;
    }

    function isEmailValidoRegex(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(String(email).toLowerCase());
    }

    /**
     * Verifica apenas a força da senha, sem se preocupar com a confirmação.
     * @param {boolean} showError - Se true, mostra o erro visualmente no campo de senha.
     * @returns {boolean} Verdadeiro se a senha atende aos critérios de força.
     */
    function verificarForcaSenha(showError) {
        if (!senhaInput) return true;
        const senhaValor = senhaInput.value;
        const minLength = 8;
        const criterios = {
            upper: /[A-Z]/.test(senhaValor),
            lower: /[a-z]/.test(senhaValor),
            number: /[0-9]/.test(senhaValor),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(senhaValor),
            length: senhaValor.length >= minLength
        };
        let errosDetalhados = [];
        if (!criterios.length) errosDetalhados.push(`pelo menos ${minLength} caracteres`);
        if (!criterios.upper) errosDetalhados.push("uma letra maiúscula");
        if (!criterios.lower) errosDetalhados.push("uma letra minúscula");
        if (!criterios.number) errosDetalhados.push("um número");
        if (!criterios.special) errosDetalhados.push("um caractere especial");

        if (errosDetalhados.length > 0) {
            if (showError) setErro(senhaInput, "A senha deve conter: " + errosDetalhados.join(', ') + '.');
            return false;
        }
        // Não chama setSucesso aqui ainda, pois a validação completa da senha envolve a confirmação.
        return true; 
    }

    /**
     * Valida se o campo "Confirmar Senha" está preenchido e coincide com o campo "Senha".
     * @param {boolean} showError - Se true, mostra o erro visualmente.
     * @returns {boolean} Verdadeiro se as senhas coincidem e o campo não está vazio.
     */
    function validarConfirmarSenha(showError) {
        if (!confirmarSenhaInput || !senhaInput) return true;
        const senhaValor = senhaInput.value;
        const confirmarSenhaValor = confirmarSenhaInput.value;


        console.log(senhaValor)
        console.log(confirmarSenhaValor)



        if (confirmarSenhaValor === '') {
            if (showError) setErro(confirmarSenhaInput, 'A confirmação de senha é obrigatória.');
            return false;
        } else if (senhaValor !== confirmarSenhaValor) {
            if (showError) {
                setErro(confirmarSenhaInput, 'As senhas não coincidem.');
                // Se as senhas não coincidem, o campo de senha principal também não está "totalmente" válido
                // em relação ao par, então removemos 'is-valid' dele se showError for true.
                // A força da senha ainda pode ser válida, mas a coincidência falhou.
                if (showError) senhaInput.classList.remove('is-valid');
            }
            return false;
        }

        // Se chegou aqui, as senhas coincidem e o campo não está vazio.
        if (showError || confirmarSenhaInput.classList.contains('is-invalid')) {
            setSucesso(confirmarSenhaInput);
        }
        // Se as senhas coincidem, e a senha principal já passou na validação de força,
        // podemos marcar a senha principal como sucesso aqui também, mas é mais seguro fazer no validarFormularioCompleto.
        return true;
    }

    function validarTermos(showError) {
        // ... (código como antes)
        if (!termosCheckbox) return true;
        if (!termosCheckbox.checked) {
            if (showError) {
                termosCheckbox.classList.add('is-invalid');
                const feedbackEl = termosCheckbox.closest('.form-check').querySelector('.invalid-feedback');
                if (feedbackEl) feedbackEl.style.display = 'block';
            }
            return false;
        }
        termosCheckbox.classList.remove('is-invalid');
        const feedbackEl = termosCheckbox.closest('.form-check').querySelector('.invalid-feedback');
        if (feedbackEl) feedbackEl.style.display = 'none';
        return true;
    }

    function setErro(inputElement, mensagem) {
        // ... (código como antes)
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
        const feedbackEl = (inputElement.type === 'checkbox')
            ? inputElement.closest('.form-check').querySelector('.invalid-feedback')
            : inputElement.closest('.input-group') // Procura dentro do input-group primeiro
                ? inputElement.closest('.input-group').nextElementSibling // Se feedback está após input-group
                : (inputElement.nextElementSibling && inputElement.nextElementSibling.classList.contains('invalid-feedback')
                    ? inputElement.nextElementSibling // Se feedback está logo após o input (sem input-group)
                    : (inputElement.parentElement.querySelector('.invalid-feedback'))); // Fallback geral
        
        if (feedbackEl && feedbackEl.classList.contains('invalid-feedback')) {
            feedbackEl.textContent = mensagem;
            if (inputElement.type === 'checkbox') feedbackEl.style.display = 'block';
        }
    }

    function setSucesso(inputElement) {
        // ... (código como antes)
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid'); 

        const feedbackEl = (inputElement.type === 'checkbox')
            ? inputElement.closest('.form-check').querySelector('.invalid-feedback')
            : inputElement.closest('.input-group')
                ? inputElement.closest('.input-group').nextElementSibling
                : (inputElement.nextElementSibling && inputElement.nextElementSibling.classList.contains('invalid-feedback')
                    ? inputElement.nextElementSibling
                    : inputElement.parentElement.querySelector('.invalid-feedback'));

        if (feedbackEl && feedbackEl.classList.contains('invalid-feedback')) {
           if (inputElement.type === 'checkbox') feedbackEl.style.display = 'none';
           // Para outros inputs, o Bootstrap esconde o invalid-feedback quando is-invalid é removido.
        }
    }
    
    // --- VALIDAÇÃO EM TEMPO REAL (BLUR e INPUT) ---
    function handleRealTimeValidation(validationFunction, inputElement, eventType = 'blur') {
        // ... (código como antes)
        if (!inputElement) return;
        inputElement.addEventListener(eventType, () => {
            if (cadastroForm.classList.contains('was-validated') || inputElement.classList.contains('is-invalid')) {
                validationFunction(true);
            } else {
                validationFunction(false); 
            }
        });
    }
    
    if (senhaInput) {
        senhaInput.addEventListener('input', () => {
            let showErrorRT = cadastroForm.classList.contains('was-validated') || senhaInput.classList.contains('is-invalid');
            verificarForcaSenha(showErrorRT); // Valida a força da senha principal
            // Revalida a confirmação APENAS se já foi preenchida
            if (confirmarSenhaInput && confirmarSenhaInput.value !== '') {
                let showErrorConfirmRT = cadastroForm.classList.contains('was-validated') || confirmarSenhaInput.classList.contains('is-invalid');
                validarConfirmarSenha(showErrorConfirmRT);
            }
        });
    }
    if (confirmarSenhaInput) { // Validação de "Confirmar Senha" no input e blur
        handleRealTimeValidation(validarConfirmarSenha, confirmarSenhaInput, 'input');
        handleRealTimeValidation(validarConfirmarSenha, confirmarSenhaInput, 'blur');
    }

    handleRealTimeValidation(() => validarCampoObrigatorio(nomeInput, "Por favor, insira seu nome.", true), nomeInput);
    handleRealTimeValidation(() => validarCampoObrigatorio(sobrenomeInput, "Por favor, insira seu sobrenome.", true), sobrenomeInput);
    handleRealTimeValidation(validarEmail, emailInput);
    handleRealTimeValidation(verificarForcaSenha, senhaInput, 'blur'); // Valida força no blur da senha principal

    if (termosCheckbox) {
        termosCheckbox.addEventListener('change', () => {
            let showErrorRT = cadastroForm.classList.contains('was-validated') || termosCheckbox.classList.contains('is-invalid');
            validarTermos(showErrorRT);
        });
    }
});
