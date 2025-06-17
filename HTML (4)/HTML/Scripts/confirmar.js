document.addEventListener('DOMContentLoaded', () => {
  const form        = document.getElementById('definirSenhaForm');
  const novaSenha   = document.getElementById('nova-senha');
  const confirma    = document.getElementById('confirmar-senha');

  form.addEventListener('submit', e => {
    e.preventDefault();
    e.stopPropagation();

    [novaSenha, confirma].forEach(i => {
      i.classList.remove('is-invalid');
    });

    let valid = true;

    if (!novaSenha.value.trim()) {
      setErro(novaSenha, 'Por favor, insira a nova senha.');
      valid = false;
    }
    if (!confirma.value.trim()) {
      setErro(confirma, 'Por favor, confirme a nova senha.');
      valid = false;
    }

    if (novaSenha.value && confirma.value && novaSenha.value !== confirma.value) {
      setErro(confirma, 'As senhas não coincidem. Tente novamente.');
      valid = false;
    }

    if (valid) {
      alert('Senha alterada com sucesso!');
      window.location.href = 'login.html';
    }
  });

  function setErro(el, msg) {
    el.classList.add('is-invalid');
    let feedback = el.nextElementSibling;

    // Se não existir <div class="invalid-feedback">, cria
    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      el.parentNode.insertBefore(feedback, el.nextSibling);
    }

    feedback.textContent = msg;
  }
});
