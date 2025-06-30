document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('esqueceuSenhaForm');
  const email = document.getElementById('email');

  form.addEventListener('submit', e => {
    e.preventDefault();
    e.stopPropagation();

    // limpa estado anterior
    email.classList.remove('is-invalid');

    const val = email.value.trim();
    const re  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!val) {
      showError('Por favor, insira seu email.');
      return;
    }
    if (!re.test(val)) {
      showError('Por favor, insira um email válido.');
      return;
    }

    // se chegou aqui, é válido
    alert('Código de verificação enviado para ' + val + '!');
    // aqui você pode redirecionar ou exibir uma mensagem fixa na tela
    // e.g. window.location.href = 'codigo.html';
  });

  function showError(msg) {
    email.classList.add('is-invalid');
    let fb = email.nextElementSibling;
    // se não existir <div class="invalid-feedback">, cria
    if (!fb || !fb.classList.contains('invalid-feedback')) {
      fb = document.createElement('div');
      fb.className = 'invalid-feedback';
      email.parentNode.appendChild(fb);
    }
    fb.textContent = msg;
  }
});
