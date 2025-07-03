// static/js/modals/tarefaRapidaModal.js (VERSÃO FINAL DINÂMICA)
document.addEventListener('DOMContentLoaded', function() {
    const modalEl = document.getElementById('modalTarefaPrincipalQuickAdd');
    if (!modalEl) return;

    const form = modalEl.querySelector('#formTarefaPrincipalQuickAdd');
    const disciplinaSelect = modalEl.querySelector('#principalTarefaDisciplinaQuickAdd');

    const popularSelect = (selectElement, options, placeholder) => {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="" selected disabled>${placeholder}</option>`;
        options.forEach(option => {
            selectElement.add(new Option(option.nome, option.id));
        });
    };

    modalEl.addEventListener('show.bs.modal', function () {
        form.reset();
        form.classList.remove('was-validated');

        // Popula o dropdown com os dados globais quando o modal abre
        if (window.disciplinas_json) {
            popularSelect(disciplinaSelect, window.disciplinas_json, "Selecione uma disciplina...");
        } else {
            console.error("tarefaRapidaModal.js: 'disciplinas_json' não encontrado na window.");
        }
    });

    form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        form.classList.add('was-validated');
    });
});
