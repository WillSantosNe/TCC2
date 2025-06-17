// anotacaoModal.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("anotacaoModal.js: DOMContentLoaded - Início");

    const modalAnotacaoPrincipalEl = document.getElementById('modalAnotacaoPrincipal');
    const formAnotacaoPrincipal = modalAnotacaoPrincipalEl.querySelector('#formAnotacaoPrincipal');
    const conteudoTextarea = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoConteudoInput');
    const disciplinaSelect = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoDisciplinaSelect');
    const atividadeSelect = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoAtividadeSelect');
    const tituloInput = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoTituloInput');

    const bsModalAnotacao = new bootstrap.Modal(modalAnotacaoPrincipalEl);

    let tinyMceEditorInstance = null;

    /**
     * Helper function to get global data safely.
     */
    function getGlobalData(name) {
        if (typeof window !== 'undefined' && window[name]) {
            console.log(`anotacaoModal.js: Global variable '${name}' found.`);
            return window[name];
        }
        console.warn(`anotacaoModal.js: Global variable '${name}' NOT found.`);
        return null;
    }

    /**
     * Atualiza as opções do select de atividades com base na disciplina selecionada.
     * @param {string} disciplinaSelecionadaId - O ID da disciplina selecionada.
     */
    function atualizarAtividadesAnotacaoPrincipal(disciplinaSelecionadaId) {
        const atividadesPorDisciplinaGlobal = getGlobalData('atividadesPorDisciplinaParaSelects');
        const atividadesPadraoGlobal = getGlobalData('atividadesPadraoParaSelects');
        const popularSelectGlobal = getGlobalData('popularSelect');

        if (!atividadesPorDisciplinaGlobal || !atividadesPadraoGlobal || !popularSelectGlobal || !atividadeSelect) {
            console.warn("anotacaoModal.js: Dependências para atualizarAtividadesAnotacaoPrincipal não encontradas. Abortando.");
            if (popularSelectGlobal && atividadeSelect) {
                popularSelectGlobal(atividadeSelect, [{id: "", nome: "Erro ao carregar atividades"}], "");
            }
            return;
        }

        let atividadesParaDropdown = atividadesPadraoGlobal; 

        if (disciplinaSelecionadaId && disciplinaSelecionadaId !== "") {
            const atividadesEncontradas = atividadesPorDisciplinaGlobal[disciplinaSelecionadaId];
            if (atividadesEncontradas) {
                atividadesParaDropdown = atividadesEncontradas;
            } else {
                const listaTarefasGlobal = getGlobalData('listaTarefas');
                if (listaTarefasGlobal) {
                     const tarefasDaDisciplina = listaTarefasGlobal.filter(
                        t => t.disciplinaId === disciplinaSelecionadaId
                    );
                    atividadesParaDropdown = [{id: "", nome: "Nenhuma"}]
                        .concat(tarefasDaDisciplina.map(t => ({id: t.id, nome: t.titulo})));
                } else {
                    console.warn(`anotacaoModal.js: listaTarefasGlobal não encontrada para filtrar atividades da disciplina ${disciplinaSelecionadaId}`);
                }
            }
        }
        
        popularSelectGlobal(atividadeSelect, atividadesParaDropdown, ""); 
    }

    // Listener para quando o modal está completamente visível
    modalAnotacaoPrincipalEl.addEventListener('shown.bs.modal', () => {
        console.log("anotacaoModal.js: 'shown.bs.modal' event fired.");

        formAnotacaoPrincipal?.reset();
        formAnotacaoPrincipal.classList.remove('was-validated');
        tituloInput?.classList.remove('is-invalid');

        const listaDisciplinasGlobal = getGlobalData('disciplinasFixasParaSelects');
        const popularSelectGlobal = getGlobalData('popularSelect');

        if (listaDisciplinasGlobal && popularSelectGlobal) {
            popularSelectGlobal(disciplinaSelect, listaDisciplinasGlobal, "");
            console.log("anotacaoModal.js: Disciplina select populado.");
        } else {
            console.error("anotacaoModal.js: Variáveis globais de disciplina ou popularSelect NÃO encontradas ao abrir o modal. Verifique a ordem dos scripts.");
            // Pode adicionar um alert ou feedback visual aqui para o usuário se necessário
            alert("Erro ao carregar disciplinas para anotação. Por favor, recarregue a página.");
        }
        
        atualizarAtividadesAnotacaoPrincipal(disciplinaSelect?.value || "");

        // *** AQUI É A MUDANÇA PRINCIPAL: ADICIONAR UM PEQUENO ATRASO ***
        setTimeout(() => {
            if (typeof tinymce !== 'undefined' && conteudoTextarea) {
                const editorId = conteudoTextarea.id;
                
                // Destrói qualquer instância anterior para evitar duplicidade ou erros
                if (tinyMceEditorInstance) {
                    tinyMceEditorInstance.destroy();
                    tinyMceEditorInstance = null; 
                    console.log(`anotacaoModal.js: Old TinyMCE instance destroyed for ${editorId}.`);
                }

                tinymce.init({
                    selector: `#${editorId}`,
                    plugins: 'lists link image table code help wordcount autoresize',
                    toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image table | code | help',
                    menubar: 'edit view insert format tools table help',
                    height: 400, min_height: 400, autoresize_bottom_margin: 30,
                    branding: false, statusbar: false,
                    setup: (editor) => {
                        tinyMceEditorInstance = editor;
                        editor.on('init', () => {
                            console.log('TinyMCE initialized SUCCESSFULLY for:', editorId);
                            editor.setContent(''); 
                            // Opcional: Garante que a textarea original esteja oculta após a inicialização do TinyMCE
                            if (conteudoTextarea) {
                                conteudoTextarea.style.display = 'none'; 
                            }
                        });
                        editor.on('OpenWindow', function(e) {
                            const modalZIndex = parseInt(window.getComputedStyle(modalAnotacaoPrincipalEl).zIndex, 10);
                            const toxDialog = document.querySelector('.tox-dialog-wrap');
                            if (toxDialog) {
                                toxDialog.style.zIndex = modalZIndex + 50; 
                            }
                        });
                    }
                }).catch(err => {
                    console.error("anotacaoModal.js: ERRO ao inicializar TinyMCE:", err);
                    if (conteudoTextarea) {
                        conteudoTextarea.style.display = 'block'; // Fallback para textarea normal
                        console.log("anotacaoModal.js: Falling back to standard textarea.");
                    }
                });
            } else {
                 console.warn("anotacaoModal.js: TinyMCE (global object) ou o elemento textarea não está disponível. Não foi possível inicializar o editor. Exibindo textarea padrão.");
                 if (conteudoTextarea) {
                     conteudoTextarea.style.display = 'block';
                 }
            }
        }, 100); // Atraso de 100ms
    });

    // Evento 'hidden.bs.modal' para destruir o TinyMCE ao fechar o modal
    modalAnotacaoPrincipalEl.addEventListener('hidden.bs.modal', () => {
        console.log("anotacaoModal.js: 'hidden.bs.modal' event fired.");
        if (tinyMceEditorInstance) {
            console.log('TinyMce destroying for:', tinyMceEditorInstance.id);
            tinyMceEditorInstance.destroy();
            tinyMceEditorInstance = null;
        }
        // Opcional: Garante que a textarea original esteja visível para a próxima inicialização se TinyMCE falhar
        if (conteudoTextarea) {
            conteudoTextarea.style.display = 'block'; 
        }
        formAnotacaoPrincipal.classList.remove('was-validated'); 
    });

    if (disciplinaSelect) {
        disciplinaSelect.addEventListener('change', function() {
            console.log("anotacaoModal.js: Disciplina selected. Value:", this.value);
            atualizarAtividadesAnotacaoPrincipal(this.value);
        });
    }

    if (formAnotacaoPrincipal) {
        formAnotacaoPrincipal.addEventListener('submit', (e) => {
            e.preventDefault();
            formAnotacaoPrincipal.classList.add('was-validated');

            if (!formAnotacaoPrincipal.checkValidity()) {
                e.stopPropagation();
                console.warn("anotacaoModal.js: Formulário de anotação inválido.");
                return;
            }
            
            const conteudoAnotacao = tinyMceEditorInstance ? tinyMceEditorInstance.getContent() : conteudoTextarea.value;

            const novaAnotacao = {
                id: 'A-' + new Date().getTime(),
                titulo: tituloInput.value.trim(),
                disciplinaId: disciplinaSelect.value, 
                atividadeId: atividadeSelect.value,   
                conteudo: conteudoAnotacao,
                dataCriacao: new Date().toISOString().split('T')[0]
            };

            console.log('anotacaoModal.js: Nova Anotação Adicionada:', novaAnotacao);
            alert(`Anotação "${novaAnotacao.titulo}" salva com sucesso!`);
            
            // Aqui você adicionaria a lógica para salvar a anotação
            // Exemplo: if (window.adicionarAnotacaoGlobal) window.adicionarAnotacaoGlobal(novaAnotacao);

            bsModalAnotacao.hide();
        });
    }

    console.log("anotacaoModal.js: DOMContentLoaded - Fim");
});
