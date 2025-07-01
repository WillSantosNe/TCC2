document.addEventListener('DOMContentLoaded', () => {
    // --- Modal Adicionar Disciplina ---
    const modalDisciplina = document.getElementById('modalDisciplina');
    const quickAddDisciplinaBtn = document.getElementById('quickAddDisciplinaBtn');
    const fecharModalDisciplinaBtn = document.getElementById('fecharModalDisciplina');
    const cancelarModalDisciplinaBtn = document.getElementById('cancelarModalDisciplina');
    const formDisciplina = document.getElementById('formDisciplina');

    console.log('Verificando Modal Disciplina:', modalDisciplina);
    console.log('Verificando Botão Rápido Adicionar Disciplina:', quickAddDisciplinaBtn);

    if (quickAddDisciplinaBtn && modalDisciplina) {
        quickAddDisciplinaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botão Rápido Adicionar Disciplina clicado.');
            if (formDisciplina) formDisciplina.reset();
            const modalLabel = modalDisciplina.querySelector('#modalDisciplinaLabel');
            if (modalLabel) modalLabel.textContent = 'Adicionar Disciplina';
            
            const disciplinaIdField = modalDisciplina.querySelector('#disciplinaId');
            if (disciplinaIdField) disciplinaIdField.value = '';

            modalDisciplina.showModal();
            console.log('Modal Disciplina showModal() chamado.');
        });
    } else {
        if (!quickAddDisciplinaBtn) console.error('Botão "quickAddDisciplinaBtn" não encontrado para o modal.');
        if (!modalDisciplina) console.error('Modal "modalDisciplina" não encontrado.');
    }

    if (fecharModalDisciplinaBtn && modalDisciplina) {
        fecharModalDisciplinaBtn.addEventListener('click', () => {
            modalDisciplina.close();
            console.log('Modal Disciplina fechado pelo botão X.');
        });
    }

    if (cancelarModalDisciplinaBtn && modalDisciplina) {
        cancelarModalDisciplinaBtn.addEventListener('click', () => {
            modalDisciplina.close();
            console.log('Modal Disciplina fechado pelo botão Cancelar.');
        });
    }

    if (modalDisciplina) {
        modalDisciplina.addEventListener('click', (event) => {
            if (event.target === modalDisciplina) { // Clique no backdrop
                modalDisciplina.close();
                console.log('Modal Disciplina fechado pelo clique no backdrop.');
            }
        });
    }

    // --- Modal Adicionar Tarefa/Prova ---
    const modalTarefa = document.getElementById('modalTarefa');
    const quickAddTarefaBtn = document.getElementById('quickAddTarefaBtn');
    const fecharModalTarefaBtn = document.getElementById('fecharModalTarefa');
    const cancelarModalTarefaBtn = document.getElementById('cancelarModalTarefa');
    const formTarefa = document.getElementById('formTarefa');

    console.log('Verificando Modal Tarefa:', modalTarefa);
    console.log('Verificando Botão Rápido Adicionar Tarefa:', quickAddTarefaBtn);

    if (quickAddTarefaBtn && modalTarefa) {
        quickAddTarefaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botão Rápido Adicionar Tarefa clicado.');
            if (formTarefa) formTarefa.reset();
            const modalLabel = modalTarefa.querySelector('#modalTarefaLabel');
            if (modalLabel) modalLabel.textContent = 'Adicionar Tarefa';
            
            // Lógica para popular o select de disciplinas (tarefaDisciplina) pode ser chamada aqui
            // popularSelectDisciplinas(document.getElementById('tarefaDisciplina'));

            modalTarefa.showModal();
            console.log('Modal Tarefa showModal() chamado.');
        });
    } else {
        if (!quickAddTarefaBtn) console.error('Botão "quickAddTarefaBtn" não encontrado para o modal.');
        if (!modalTarefa) console.error('Modal "modalTarefa" não encontrado.');
    }

    if (fecharModalTarefaBtn && modalTarefa) {
        fecharModalTarefaBtn.addEventListener('click', () => {
            modalTarefa.close();
            console.log('Modal Tarefa fechado pelo botão X.');
        });
    }

    if (cancelarModalTarefaBtn && modalTarefa) {
        cancelarModalTarefaBtn.addEventListener('click', () => {
            modalTarefa.close();
            console.log('Modal Tarefa fechado pelo botão Cancelar.');
        });
    }

    if (modalTarefa) {
        modalTarefa.addEventListener('click', (event) => {
            if (event.target === modalTarefa) { // Clique no backdrop
                modalTarefa.close();
                console.log('Modal Tarefa fechado pelo clique no backdrop.');
            }
        });
    }
    const modalAnotacaoElement = document.getElementById('modalAnotacao');
    const quickAddAnotacaoBtn = document.getElementById('quickAddAnotacaoBtn'); // Botão na sidebar

    console.log('Verificando Modal Anotação Element:', modalAnotacaoElement);
    console.log('Verificando Botão Rápido Adicionar Anotação:', quickAddAnotacaoBtn);

    if (quickAddAnotacaoBtn) {
        quickAddAnotacaoBtn.addEventListener('click', (e) => {
            // Previne o comportamento padrão do link <a>
            e.preventDefault();
            console.log('Botão Rápido Adicionar Anotação clicado.');
            // Bootstrap já cuida de abrir o modal devido aos atributos data-bs-toggle e data-bs-target.
            // A lógica de reset de campos está no evento 'show.bs.modal'.
            
            // Se você precisar instanciar e chamar o show manualmente (não é necessário com os data-attributes):
            // const modalAnotacao = bootstrap.Modal.getInstance(modalAnotacaoElement) || new bootstrap.Modal(modalAnotacaoElement);
            // modalAnotacao.show();
        });
    } else {
        console.error('Botão "quickAddAnotacaoBtn" não encontrado para o modal de anotação.');
    }

    if (modalAnotacaoElement) {
        // Evento disparado quando o modal está prestes a ser exibido
        modalAnotacaoElement.addEventListener('show.bs.modal', () => {
            console.log('Modal Anotação está sendo aberto (evento show.bs.modal).');
            
            // Seleciona os campos dentro do modal de anotação
            const tituloInput = modalAnotacaoElement.querySelector('#anotacaoTituloInput');
            const disciplinaInput = modalAnotacaoElement.querySelector('#anotacaoDisciplinaInput');
            const atividadeInput = modalAnotacaoElement.querySelector('#anotacaoAtividadeInput');
            const conteudoInput = modalAnotacaoElement.querySelector('#anotacaoConteudoInput');
            const idInput = modalAnotacaoElement.querySelector('#anotacaoIdInput'); // Campo hidden para ID
            
            const modalLabel = modalAnotacaoElement.querySelector('#modalAnotacaoLabelTitulo'); // Título principal do modal
            const editInfo = modalAnotacaoElement.querySelector('#modalAnotacaoEditInfo'); // Texto informativo (ex: "Criando nova anotação")

            // Reseta os valores dos campos para um novo formulário
            if (tituloInput) tituloInput.value = '';
            if (disciplinaInput) disciplinaInput.value = ''; // O placeholder "Nenhuma" será exibido
            if (atividadeInput) atividadeInput.value = '';   // O placeholder "Nenhuma" será exibido
            if (conteudoInput) conteudoInput.value = '';
            if (idInput) idInput.value = ''; // Garante que não há ID de uma anotação anterior

            // Define os textos do cabeçalho para o modo de "nova anotação"
            if (modalLabel) modalLabel.textContent = 'Nova Anotação';
            if (editInfo) editInfo.textContent = 'Criando nova anotação';

            // Adicione aqui qualquer outra lógica de inicialização para uma nova anotação
        });

        // Evento disparado quando o modal já foi completamente exibido
        modalAnotacaoElement.addEventListener('shown.bs.modal', () => {
            console.log('Modal Anotação foi completamente aberto (evento shown.bs.modal).');
            const tituloInput = modalAnotacaoElement.querySelector('#anotacaoTituloInput');
            if (tituloInput) {
                tituloInput.focus(); // Foca no campo de título ao abrir
            }
        });

        // Evento disparado quando o modal está prestes a ser escondido
        modalAnotacaoElement.addEventListener('hide.bs.modal', () => {
            console.log('Modal Anotação está sendo fechado (evento hide.bs.modal).');
        });

        // Evento disparado quando o modal já foi completamente escondido
        modalAnotacaoElement.addEventListener('hidden.bs.modal', () => {
            console.log('Modal Anotação foi completamente fechado (evento hidden.bs.modal).');
        });

    } else {
        console.error('Elemento do Modal "modalAnotacao" não encontrado.');
    }
});


// static/js/geral.js

/**
 * Cria e exibe uma notificação toast no canto da tela.
 * @param {string} message A mensagem a ser exibida.
 * @param {string} category 'success' (verde) ou 'danger' (vermelho) para a cor.
 */
function showToast(message, category = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    // Cria o elemento HTML do toast
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${category} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    // Adiciona o toast ao container
    toastContainer.appendChild(toastEl);

    // Inicializa e mostra o toast usando a API do Bootstrap
    const toast = new bootstrap.Toast(toastEl, {
        delay: 5000 // O toast desaparecerá após 5 segundos
    });
    toast.show();

    // Remove o elemento do HTML depois que ele desaparecer
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}
