document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("cadastroForm");
  const camposObrigatorios = ["nome", "sobrenome", "email", "senha", "confirmarSenha"];
  const senha = document.getElementById("senha");
  const confirmarSenha = document.getElementById("confirmarSenha");

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // impede envio

    let isValid = true;

    // Limpa mensagens antigas
    document.querySelectorAll(".invalid-feedback").forEach(el => el.remove());

    // Verifica campos vazios
    camposObrigatorios.forEach(id => {
      const campo = document.getElementById(id);
      campo.classList.remove("is-invalid", "is-valid");

      if (!campo.value.trim()) {
        campo.classList.add("is-invalid");
        mostrarErro(campo, "Este campo é obrigatório.");
        isValid = false;
      } else {
        campo.classList.add("is-valid");
      }
    });

    // Verifica senha mínima
    if (senha.value && senha.value.length < 8) {
      senha.classList.add("is-invalid");
      mostrarErro(senha, "A senha deve ter no mínimo 8 caracteres.");
      isValid = false;
    }

    // Verifica se as senhas coincidem
    if (senha.value !== confirmarSenha.value) {
      confirmarSenha.classList.add("is-invalid");
      mostrarErro(confirmarSenha, "As senhas não coincidem.");
      isValid = false;
    }

    // Se tudo ok, submete
    if (isValid) {
      form.submit();
    }
  });

  // Remove erro ao digitar
  camposObrigatorios.forEach(id => {
    const campo = document.getElementById(id);
    campo.addEventListener("input", () => {
      campo.classList.remove("is-invalid", "is-valid");
      removerMensagemErro(campo);
    });
  });

  function mostrarErro(campo, mensagem) {
    const feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    feedback.innerText = mensagem;
    campo.parentNode.appendChild(feedback);
  }

  function removerMensagemErro(campo) {
    const feedback = campo.parentNode.querySelector(".invalid-feedback");
    if (feedback) feedback.remove();
  }
});
