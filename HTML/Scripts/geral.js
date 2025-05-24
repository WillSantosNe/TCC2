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

    // --- Modal Adicionar Anotação (placeholder) ---
    const quickAddAnotacaoBtn = document.getElementById('quickAddAnotacaoBtn');
    console.log('Verificando Botão Rápido Adicionar Anotação:', quickAddAnotacaoBtn);
    if (quickAddAnotacaoBtn) {
        quickAddAnotacaoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botão Rápido Adicionar Anotação clicado.');
            alert('Funcionalidade "Adicionar Anotação" ainda não implementada ou modal não definido.');
        });
    } else {
        console.error('Botão "quickAddAnotacaoBtn" não encontrado para o modal.');
    }
});
