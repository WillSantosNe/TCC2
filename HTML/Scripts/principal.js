document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado. principal.js está executando.');

    // --- Modal Adicionar Disciplina ---
    const modalDisciplina = document.getElementById('modalDisciplina');
    const quickAddDisciplinaBtn = document.getElementById('quickAddDisciplinaBtn');
    const fecharModalDisciplinaBtn = document.getElementById('fecharModalDisciplina');
    const cancelarModalDisciplinaBtn = document.getElementById('cancelarModalDisciplina');
    const formDisciplina = document.getElementById('formDisciplina'); // Se precisar resetar/manipular

    console.log('Modal Disciplina:', modalDisciplina);
    console.log('Botão Adicionar Disciplina:', quickAddDisciplinaBtn);

    if (quickAddDisciplinaBtn && modalDisciplina) {
        quickAddDisciplinaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botão Adicionar Disciplina clicado.');
            if (formDisciplina) formDisciplina.reset(); // Opcional: limpa o formulário
            const modalLabel = modalDisciplina.querySelector('#modalDisciplinaLabel');
            if (modalLabel) modalLabel.textContent = 'Adicionar Disciplina';
            
            const disciplinaIdField = modalDisciplina.querySelector('#disciplinaId');
            if (disciplinaIdField) disciplinaIdField.value = ''; // Limpa ID para garantir que é um novo cadastro

            modalDisciplina.showModal();
            console.log('Modal Disciplina deveria estar visível.');
        });
    } else {
        console.error('Não foi possível encontrar o botão quickAddDisciplinaBtn ou o modalDisciplina.');
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
    const formTarefa = document.getElementById('formTarefa'); // Se precisar resetar/manipular

    console.log('Modal Tarefa:', modalTarefa);
    console.log('Botão Adicionar Tarefa:', quickAddTarefaBtn);

    if (quickAddTarefaBtn && modalTarefa) {
        quickAddTarefaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botão Adicionar Tarefa clicado.');
            if (formTarefa) formTarefa.reset(); // Opcional: limpa o formulário
            const modalLabel = modalTarefa.querySelector('#modalTarefaLabel');
            if (modalLabel) modalLabel.textContent = 'Adicionar Tarefa';
            
            // Adicione aqui a lógica para popular o select de disciplinas se necessário
            // popularSelectDisciplinas(document.getElementById('tarefaDisciplina'));

            modalTarefa.showModal();
            console.log('Modal Tarefa deveria estar visível.');
        });
    } else {
        console.error('Não foi possível encontrar o botão quickAddTarefaBtn ou o modalTarefa.');
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
    console.log('Botão Adicionar Anotação:', quickAddAnotacaoBtn);
    if (quickAddAnotacaoBtn) {
        quickAddAnotacaoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Botão Adicionar Anotação clicado.');
            alert('Funcionalidade "Adicionar Anotação" ainda não implementada ou modal não definido.');
        });
    } else {
        console.error('Não foi possível encontrar o botão quickAddAnotacaoBtn.');
    }

    // --- Lógica do Carrossel de Disciplinas (mantida do seu HTML) ---
    const coursesContainer = document.getElementById('coursesContainer');
    const prevCoursesBtn = document.getElementById('prevCoursesBtn');
    const nextCoursesBtn = document.getElementById('nextCoursesBtn');

    if (coursesContainer && prevCoursesBtn && nextCoursesBtn) {
        // Seu código de carrossel aqui...
        // Exemplo básico:
        const scrollAmount = 300;
        prevCoursesBtn.addEventListener('click', () => {
            coursesContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        nextCoursesBtn.addEventListener('click', () => {
            coursesContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
        console.log('Lógica do carrossel configurada.');
    } else {
        console.warn('Elementos do carrossel não encontrados.');
    }

    // Lembre-se: a lógica de SUBMISSÃO dos formulários (salvar dados)
    // ainda precisa ser tratada. Se `disciplinas.js` já faz isso para `formDisciplina`,
    // ele pode funcionar aqui também se não houver conflitos.
    // O mesmo para `formTarefa` e um potencial `tarefas.js`.
});

/*
// Função exemplo para popular select (você precisará adaptar à sua fonte de dados)
function popularSelectDisciplinas(selectElement) {
    if (!selectElement) {
        console.error('Elemento select para disciplinas não encontrado');
        return;
    }
    selectElement.innerHTML = '<option value="">Selecione a disciplina...</option>'; // Limpa opções antigas
    
    // Exemplo: buscar de um array local ou localStorage (simulado)
    // const disciplinas = [
    //     { id: '1', nome: 'Matemática Discreta' },
    //     { id: '2', nome: 'Cálculo I' },
    //     { id: '3', nome: 'Introdução à Programação' }
    // ]; // Substitua pela sua fonte de dados real

    // Supondo que você tenha uma forma de buscar as disciplinas (ex: de localStorage ou API)
    const disciplinasCadastradas = JSON.parse(localStorage.getItem('disciplinasDB')) || []; // Exemplo
    console.log('Disciplinas para popular select:', disciplinasCadastradas);

    disciplinasCadastradas.forEach(disciplina => {
        // Verifique a estrutura do seu objeto 'disciplina'
        // e se 'disciplina.status' existe e é relevante aqui.
        // if (disciplina.status === 'Ativa') { 
            const option = document.createElement('option');
            option.value = disciplina.id; // ou disciplina.nome
            option.textContent = disciplina.nome;
            selectElement.appendChild(option);
        // }
    });
}
*/