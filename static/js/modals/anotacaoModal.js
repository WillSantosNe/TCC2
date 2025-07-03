// static/js/modals/anotacaoModal.js (VERSÃO ATUAL E CORRETA)

document.addEventListener('DOMContentLoaded', function() {
    // Seletores dos elementos do modal de Anotação
    const modalEl = document.getElementById('modalAnotacaoPrincipal');
    if (!modalEl) return; 

    const form = modalEl.querySelector('#formAnotacaoPrincipal');
    const disciplinaSelect = modalEl.querySelector('#principalAnotacaoDisciplinaSelect');
    const atividadeSelect = modalEl.querySelector('#principalAnotacaoAtividadeSelect');
    const conteudoTextarea = modalEl.querySelector('#principalAnotacaoConteudoInput');

    // Função auxiliar para popular os dropdowns <select>
    const popularSelect = (selectElement, options, placeholder) => {
        if (!selectElement) return;
        selectElement.innerHTML = `<option value="">${placeholder}</option>`;
        options.forEach(option => {
            selectElement.add(new Option(option.nome || option.titulo, option.id));
        });
    };

    // Função para atualizar o dropdown de atividades com base na disciplina selecionada
    const atualizarAtividades = (disciplinaId) => {
        if (typeof window.tarefas_json === 'undefined') return;

        let atividadesFiltradas = disciplinaId 
            ? window.tarefas_json.filter(tarefa => tarefa.disciplina.id == disciplinaId)
            : window.tarefas_json;
        
        popularSelect(atividadeSelect, atividadesFiltradas, "Selecione uma atividade (opcional)");
    };

    // Evento disparado QUANDO O MODAL ABRE
    modalEl.addEventListener('show.bs.modal', function () {
        form.reset();
        form.classList.remove('was-validated');

        if (window.disciplinas_json) {
            popularSelect(disciplinaSelect, window.disciplinas_json, "Selecione uma disciplina (opcional)");
        }
        if (window.tarefas_json) {
            atualizarAtividades(null);
        }
        
        if (typeof tinymce !== 'undefined') {
            tinymce.remove('#principalAnotacaoConteudoInput'); 
            tinymce.init({
                selector: '#principalAnotacaoConteudoInput',
                plugins: 'lists link image table code help wordcount autoresize',
                toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image table | code | help',
                menubar: 'edit view insert format tools table help',
                height: 400,
                min_height: 400,
                autoresize_bottom_margin: 30,
                branding: false,
                statusbar: false
            });
        }
    });
    
    // Evento disparado QUANDO O MODAL FECHA
    modalEl.addEventListener('hidden.bs.modal', function () {
        const editor = tinymce.get('principalAnotacaoConteudoInput');
        if (editor) {
            editor.destroy();
        }
    });

    // Evento para atualizar as atividades QUANDO UMA DISCIPLINA É SELECIONADA
    disciplinaSelect.addEventListener('change', function() {
        atualizarAtividades(this.value);
    });

    // Evento de SUBMISSÃO DO FORMULÁRIO
    form.addEventListener('submit', function(event) {
        const editor = tinymce.get('principalAnotacaoConteudoInput');
        if (editor) {
            editor.save();
        }

        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        form.classList.add('was-validated');
    });
});
