document.addEventListener("DOMContentLoaded", function () {
  // === Show/Hide password toggle ===
  const toggles = document.querySelectorAll('.password-toggle-icon');
  toggles.forEach(toggle => {
    const icon = toggle.querySelector('i');
    const input = toggle.closest('.input-group').querySelector('input');
    toggle.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('bi-eye-slash', 'bi-eye');
      } else {
        input.type = 'password';
        icon.classList.replace('bi-eye', 'bi-eye-slash');
      }
    });
  });
  // ==================================

  const form = document.getElementById("cadastroForm");
  const campos = {
    nome: document.getElementById("nome"),
    sobrenome: document.getElementById("sobrenome"),
    email: document.getElementById("email"),
    senha: document.getElementById("senha"),
    confirmarSenha: document.getElementById("confirmarSenha"),
  };
  const termos = document.getElementById("termos");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let isValid = true;
    limparErros();

    // Verifica campos obrigatórios
    Object.entries(campos).forEach(([key, campo]) => {
      campo.classList.remove("is-invalid", "is-valid");

      if (!campo.value.trim()) {
        mostrarErro(campo, "Este campo é obrigatório.");
        isValid = false;
      } else {
        campo.classList.add("is-valid");
      }
    });

    // Validação de senha
    if (campos.senha.value && campos.senha.value.length < 8) {
      mostrarErro(campos.senha, "A senha deve ter no mínimo 8 caracteres.");
      isValid = false;
    }

    // Confirmação de senha
    if (campos.senha.value !== campos.confirmarSenha.value) {
      mostrarErro(campos.confirmarSenha, "As senhas não coincidem.");
      isValid = false;
    }

    // Verificação de aceite dos termos
    if (!termos.checked) {
      mostrarErro(termos, "Você deve aceitar os termos e condições.");
      termos.classList.add("is-invalid");
      isValid = false;
    } else {
      termos.classList.remove("is-invalid");
    }

    // Se tudo válido, simula cadastro e redireciona
    if (isValid) {
      alert("Cadastro realizado com sucesso!");
      window.location.href = "login.html";
    }
  });

  // Remove erro ao digitar ou interagir
  Object.values(campos).forEach(campo => {
    campo.addEventListener("input", () => limparErroCampo(campo));
  });
  termos.addEventListener("change", () => termos.classList.remove("is-invalid"));

  function mostrarErro(campo, mensagem) {
    const feedback = document.createElement("div");
    feedback.className = "invalid-feedback d-block";
    feedback.innerText = mensagem;
    campo.classList.add("is-invalid");
    campo.parentNode.appendChild(feedback);
  }

  function limparErroCampo(campo) {
    campo.classList.remove("is-invalid", "is-valid");
    const feedback = campo.parentNode.querySelector(".invalid-feedback");
    if (feedback) feedback.remove();
  }

  function limparErros() {
    document.querySelectorAll(".invalid-feedback").forEach(el => el.remove());
    document.querySelectorAll(".is-invalid, .is-valid").forEach(el => {
      el.classList.remove("is-invalid", "is-valid");
    });
  }
});
