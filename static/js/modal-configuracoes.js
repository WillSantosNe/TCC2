document.addEventListener('DOMContentLoaded', function() {
    const cModalConfig = document.getElementById('cModalConfig');
    const modalSections = cModalConfig.querySelectorAll('.modal-section');
    const sidebarLinks = cModalConfig.querySelectorAll('.modal-sidebar .list-group-item a');

    // Variáveis para armazenar dados temporários
    let tokenConfirmacao = null;
    let novaSenha = null;

    function showSection(sectionId) {
        modalSections.forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        sidebarLinks.forEach(link => link.closest('.list-group-item').classList.remove('active'));
        
        const activeLink = cModalConfig.querySelector(`.modal-sidebar .list-group-item a[data-section="${sectionId.replace('modal-', '')}"]`);
        if (activeLink) {
            activeLink.closest('.list-group-item').classList.add('active');
        } else {
             if (sectionId === 'modal-notificacoes') {
                 cModalConfig.querySelector(`.modal-sidebar .list-group-item a[data-section="notificacoes"]`).closest('.list-group-item').classList.add('active');
             }
        }
    }

    cModalConfig.addEventListener('show.bs.modal', function (event) {
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
        
        // Carrega configurações atuais quando o modal abre
        carregarConfiguracoes();
    });

    // Event listener para os links da sidebar dentro do modal
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); 
            const sectionId = 'modal-' + this.dataset.section; 
            showSection(sectionId);
        });
    });

    // Event listener para o botão "Voltar" dentro do modal
    const backLink = document.getElementById('backLink');
    if (backLink) {
        backLink.addEventListener('click', function(event) {
            showSection('modal-welcome-content'); 
        });
    }

    // =======================================================================
    // == FUNCIONALIDADES DE CONFIGURAÇÕES ==================================
    // =======================================================================

    // Função para carregar configurações atuais
    async function carregarConfiguracoes() {
        try {
            const response = await fetch('/api/configuracoes/perfil');
            if (response.ok) {
                const configs = await response.json();
                
                // Atualiza foto de perfil no modal
                const fotoPerfil = document.getElementById('fotoPerfilAtual');
                if (configs.foto_perfil) {
                    fotoPerfil.src = `/static/${configs.foto_perfil}`;
                }
                
                // Atualiza avatar no header
                const headerAvatar = document.getElementById('headerAvatar');
                if (headerAvatar && configs.foto_perfil) {
                    headerAvatar.src = `/static/${configs.foto_perfil}`;
                }
                
                // Atualiza configurações de notificações
                document.getElementById('emailNotificacoes').checked = configs.email_notificacoes;
                document.getElementById('appNotificacoes').checked = configs.app_notificacoes;
                document.getElementById('notificationFrequency').value = configs.frequencia_notificacoes;
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    }

    // =======================================================================
    // == TROCA DE SENHA ====================================================
    // =======================================================================
    
    const formTrocarSenha = document.getElementById('formTrocarSenha');
    if (formTrocarSenha) {
        formTrocarSenha.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validarFormularioSenha()) {
                return;
            }

            const senhaAtual = document.getElementById('currentPassword').value;
            const senhaNova = document.getElementById('newPassword').value;
            
            try {
                const response = await fetch('/api/configuracoes/trocar-senha', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        senha_atual: senhaAtual,
                        nova_senha: senhaNova
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    tokenConfirmacao = data.token;
                    novaSenha = senhaNova;
                    
                    // Mostra modal de confirmação
                    document.getElementById('tokenConfirmacao').textContent = tokenConfirmacao;
                    const modalConfirmacao = new bootstrap.Modal(document.getElementById('modalConfirmacaoSenha'));
                    modalConfirmacao.show();
                    
                    // Limpa o formulário
                    formTrocarSenha.reset();
                } else {
                    const error = await response.json();
                    mostrarNotificacao(error.error, 'error');
                }
            } catch (error) {
                console.error('Erro ao solicitar troca de senha:', error);
                mostrarNotificacao('Erro ao processar solicitação', 'error');
            }
        });
    }

    // Validação do formulário de senha
    function validarFormularioSenha() {
        const senhaAtual = document.getElementById('currentPassword');
        const senhaNova = document.getElementById('newPassword');
        const confirmarSenha = document.getElementById('confirmNewPassword');
        
        let valido = true;
        
        // Limpa validações anteriores
        [senhaAtual, senhaNova, confirmarSenha].forEach(input => {
            input.classList.remove('is-invalid');
        });
        
        if (!senhaAtual.value) {
            senhaAtual.classList.add('is-invalid');
            valido = false;
        }
        
        if (!senhaNova.value || senhaNova.value.length < 6) {
            senhaNova.classList.add('is-invalid');
            valido = false;
        }
        
        if (senhaNova.value !== confirmarSenha.value) {
            confirmarSenha.classList.add('is-invalid');
            valido = false;
        }
        
        return valido;
    }

    // Botão de confirmar senha
    const btnConfirmarSenha = document.getElementById('btnConfirmarSenha');
    if (btnConfirmarSenha) {
        btnConfirmarSenha.addEventListener('click', async function() {
            if (!tokenConfirmacao || !novaSenha) {
                mostrarNotificacao('Dados de confirmação inválidos', 'error');
                return;
            }

            try {
                const response = await fetch(`/api/configuracoes/confirmar-senha/${tokenConfirmacao}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nova_senha: novaSenha
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    mostrarNotificacao(data.message, 'success');
                    
                    // Fecha o modal de confirmação
                    const modalConfirmacao = bootstrap.Modal.getInstance(document.getElementById('modalConfirmacaoSenha'));
                    modalConfirmacao.hide();
                    
                    // Limpa variáveis
                    tokenConfirmacao = null;
                    novaSenha = null;
                } else {
                    const error = await response.json();
                    mostrarNotificacao(error.error, 'error');
                }
            } catch (error) {
                console.error('Erro ao confirmar senha:', error);
                mostrarNotificacao('Erro ao confirmar alteração', 'error');
            }
        });
    }

    // =======================================================================
    // == FOTO DE PERFIL ====================================================
    // =======================================================================
    
    const btnSalvarFoto = document.getElementById('btnSalvarFoto');
    if (btnSalvarFoto) {
        btnSalvarFoto.addEventListener('click', async function() {
            const inputFoto = document.getElementById('profilePictureInput');
            const arquivo = inputFoto.files[0];
            
            if (!arquivo) {
                mostrarNotificacao('Selecione uma foto para continuar', 'warning');
                return;
            }

            // Validação de tipo de arquivo
            const tiposPermitidos = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];
            if (!tiposPermitidos.includes(arquivo.type)) {
                mostrarNotificacao('Tipo de arquivo não permitido. Use PNG, JPG, JPEG ou GIF.', 'error');
                return;
            }

            // Validação de tamanho (16MB)
            if (arquivo.size > 16 * 1024 * 1024) {
                mostrarNotificacao('Arquivo muito grande. Tamanho máximo: 16MB', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('foto', arquivo);

            try {
                const response = await fetch('/api/configuracoes/foto-perfil', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    mostrarNotificacao(data.message, 'success');
                    
                    // Atualiza a imagem no modal
                    document.getElementById('fotoPerfilAtual').src = data.foto_url;
                    
                    // Atualiza o avatar no header
                    const headerAvatar = document.getElementById('headerAvatar');
                    if (headerAvatar) {
                        headerAvatar.src = data.foto_url;
                    }
                    
                    // Limpa o input
                    inputFoto.value = '';
                } else {
                    const error = await response.json();
                    mostrarNotificacao(error.error, 'error');
                }
            } catch (error) {
                console.error('Erro ao atualizar foto:', error);
                mostrarNotificacao('Erro ao atualizar foto', 'error');
            }
        });
    }

    // =======================================================================
    // == NOTIFICAÇÕES ======================================================
    // =======================================================================
    
    const formNotificacoes = document.getElementById('formNotificacoes');
    if (formNotificacoes) {
        formNotificacoes.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailNotif = document.getElementById('emailNotificacoes').checked;
            const appNotif = document.getElementById('appNotificacoes').checked;
            const frequencia = document.getElementById('notificationFrequency').value;

            try {
                const response = await fetch('/api/configuracoes/notificacoes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email_notificacoes: emailNotif,
                        app_notificacoes: appNotif,
                        frequencia_notificacoes: frequencia
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    mostrarNotificacao(data.message, 'success');
                } else {
                    const error = await response.json();
                    mostrarNotificacao(error.error, 'error');
                }
            } catch (error) {
                console.error('Erro ao atualizar notificações:', error);
                mostrarNotificacao('Erro ao atualizar configurações', 'error');
            }
        });
    }

    // =======================================================================
    // == FUNÇÕES AUXILIARES ===============================================
    // =======================================================================
    
    function mostrarNotificacao(mensagem, tipo = 'success') {
        // Implementação simples de notificação
        // Você pode usar uma biblioteca como Toastr ou SweetAlert2
        alert(`${tipo.toUpperCase()}: ${mensagem}`);
    }

    showSection('modal-welcome-content');
});