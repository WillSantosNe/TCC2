// Estamos usando usuario padrao para a primeira pagina 

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // impede o envio padrão do formulário

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (email === 'admin@admin' && senha === '1234') {
      // Redireciona para a página inicial
      window.location.href = 'principal.html';
    } else {
      // Mostra mensagem de erro
      alert('Email ou senha inválidos!');
    }
  });
});
