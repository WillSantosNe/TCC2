// disciplinaModal.js
document.addEventListener('DOMContentLoaded', function() {
    const modalDisciplinaPrincipalEl = document.getElementById('modalDisciplinaAdicaoPrincipal');
    const formDisciplinaPrincipal = document.getElementById('formDisciplinaPrincipal');
    const principalDisciplinaNomeInput = document.getElementById('principalDisciplinaNome');
    const principalDisciplinaDescricaoInput = document.getElementById('principalDisciplinaDescricao');
    const principalDisciplinaProfessorInput = document.getElementById('principalDisciplinaProfessor');
    const principalDisciplinaPeriodoSelect = document.getElementById('principalDisciplinaPeriodo');
    const principalDisciplinaStatusSelect = document.getElementById('principalDisciplinaStatus');

    // Instancia o modal Bootstrap
    const modalDisciplinaPrincipal = new bootstrap.Modal(modalDisciplinaPrincipalEl);

    // Evento para quando o modal é aberto (limpar formulário, etc.)
    modalDisciplinaPrincipalEl.addEventListener('show.bs.modal', function () {
        formDisciplinaPrincipal.reset(); // Limpa todos os campos do formulário
        formDisciplinaPrincipal.classList.remove('was-validated'); // Remove classes de validação Bootstrap
        // Assegura que o select de status tenha a opção padrão selecionada ao abrir
        if (principalDisciplinaStatusSelect) {
            principalDisciplinaStatusSelect.value = "Ativa"; 
        }
        // Assegura que o select de período tenha a opção padrão selecionada
        if (principalDisciplinaPeriodoSelect) {
            principalDisciplinaPeriodoSelect.value = ""; // Volta para "Selecione..."
            principalDisciplinaPeriodoSelect.querySelector('option[value=""]').selected = true;
        }
    });

    // Listener para o submit do formulário
    formDisciplinaPrincipal.addEventListener('submit', function(event) {
        // Validação Bootstrap
        if (!formDisciplinaPrincipal.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault(); // Impede o envio padrão do formulário

            // Coleta os dados do formulário
            const novaDisciplina = {
                id: 'D-' + new Date().getTime(), // Exemplo de ID único
                nome: principalDisciplinaNomeInput.value.trim(),
                descricao: principalDisciplinaDescricaoInput.value.trim(),
                professor: principalDisciplinaProfessorInput.value.trim(),
                periodo: principalDisciplinaPeriodoSelect.value,
                status: principalDisciplinaStatusSelect.value
            };

            console.log('Nova Disciplina Adicionada:', novaDisciplina);
            alert(`Disciplina "${novaDisciplina.nome}" adicionada com sucesso!`);

            // Lógica para adicionar a disciplina à sua lista de dados (se houver uma global)
            // Ex: if (typeof listaDisciplinas !== 'undefined') { listaDisciplinas.push(novaDisciplina); }
            // Ou chamar uma API para salvar no backend.

            // Esconde o modal
            modalDisciplinaPrincipal.hide();
        }
        formDisciplinaPrincipal.classList.add('was-validated'); // Adiciona a classe para exibir feedback de validação
    });
});
