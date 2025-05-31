document.addEventListener('DOMContentLoaded', function() {
    const cModalConfig = document.getElementById('cModalConfig'); // RENOMEADO AQUI
    const modalSections = cModalConfig.querySelectorAll('.modal-section');
    const sidebarLinks = cModalConfig.querySelectorAll('.modal-sidebar .list-group-item a');
    // Não precisamos alterar userDropdownLinks diretamente aqui, pois ele já seleciona pelo data-bs-target

    // Função para mostrar uma seção específica
    function showSection(sectionId) {
        modalSections.forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Remove active class de todos os links da sidebar
        sidebarLinks.forEach(link => link.closest('.list-group-item').classList.remove('active'));
        
        // Adiciona active class ao link correspondente na sidebar
        const activeLink = cModalConfig.querySelector(`.modal-sidebar .list-group-item a[data-section="${sectionId.replace('modal-', '')}"]`);
        if (activeLink) {
            activeLink.closest('.list-group-item').classList.add('active');
        } else {
             // Se não houver um link direto na sidebar para a seção, 
             // como no caso de "Configurações" abrir a "welcome-content"
             // ou "Notificações" que tem seu próprio item,
             // garantimos que nenhum link de seção esteja ativo inicialmente
             // ou ativamos o link 'Notificações' se for o caso.
             if (sectionId === 'modal-notificacoes') {
                 cModalConfig.querySelector(`.modal-sidebar .list-group-item a[data-section="notificacoes"]`).closest('.list-group-item').classList.add('active');
             }
        }
    }

    // Ao abrir o modal, verifica de qual link ele foi acionado
    cModalConfig.addEventListener('show.bs.modal', function (event) { // RENOMEADO AQUI
        const relatedTarget = event.relatedTarget; 
        if (relatedTarget) {
            const sectionToShow = relatedTarget.dataset.modalSection; 
            if (sectionToShow) {
                if (sectionToShow === 'configuracoes') {
                    showSection('modal-welcome-content'); 
                } else if (sectionToShow === 'notificacoes') {
                    showSection('modal-notificacoes'); 
                }
            } else {
                showSection('modal-welcome-content');
            }
        } else {
            showSection('modal-welcome-content'); 
        }
    });

    // Event listener para os links da sidebar dentro do modal
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); 
            const sectionId = 'modal-' + this.dataset.section; 
            showSection(sectionId);
        });
    });

    // Event listener para o botão "Voltar" dentro do modal (que fecha o modal)
    const backLink = document.getElementById('backLink');
    if (backLink) {
        backLink.addEventListener('click', function(event) {
            showSection('modal-welcome-content'); 
        });
    }

    showSection('modal-welcome-content'); 
});