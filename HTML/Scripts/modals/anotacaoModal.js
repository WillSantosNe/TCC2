// anotacaoModal.js
document.addEventListener('DOMContentLoaded', function() {
    // Modal Adicionar Anotação (LÓGICA ATUALIZADA COM TINYMCE)
    const modalAnotacaoPrincipalEl = document.getElementById('modalAnotacaoPrincipal');
    if (modalAnotacaoPrincipalEl) {
        const form = modalAnotacaoPrincipalEl.querySelector('#formAnotacaoPrincipal');
        const conteudoTextarea = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoConteudoInput');
        const disciplinaSelect = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoDisciplinaSelect');
        const atividadeSelect = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoAtividadeSelect');
        const tituloInput = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoTituloInput');

        /**
         * Atualiza as opções do select de atividades com base na disciplina selecionada.
         * @param {string} disciplinaSelecionada - O nome da disciplina selecionada.
         */
        function atualizarAtividadesAnotacaoPrincipal(disciplinaSelecionada) {
            const atividades = atividadesPorDisciplinaParaSelects[disciplinaSelecionada] || atividadesPadraoParaSelects;
            popularSelect(atividadeSelect, atividades, "Nenhuma");
        }

        modalAnotacaoPrincipalEl.addEventListener('show.bs.modal', () => {
            form?.reset(); // Reseta o formulário
            tituloInput?.classList.remove('is-invalid'); // Remove a classe de validação se houver

            // Popula os selects ao abrir o modal
            popularSelect(disciplinaSelect, disciplinasFixasParaSelects, "Nenhuma");
            atualizarAtividadesAnotacaoPrincipal(disciplinaSelect?.value || "Nenhuma");

            // Inicializa ou re-inicializa o TinyMCE
            if (typeof tinymce !== 'undefined' && conteudoTextarea) {
                const editorId = conteudoTextarea.id;
                // Destroi qualquer instância anterior para evitar duplicidade ou erros
                tinymce.get(editorId)?.destroy();

                tinymce.init({
                    selector: `#${editorId}`,
                    plugins: 'lists link image table code help wordcount autoresize',
                    toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image table | code | help',
                    menubar: 'edit view insert format tools table help',
                    height: 400, min_height: 400, autoresize_bottom_margin: 30,
                    branding: false, statusbar: false,
                    setup: (editor) => {
                        editor.on('init', () => {
                            // Garante que o conteúdo inicial seja vazio ou o que você desejar
                            editor.setContent('');
                        });
                        // Garante que os diálogos do TinyMCE fiquem sobre o modal do Bootstrap
                        editor.on('OpenWindow', function(e) {
                            const modalZIndex = parseInt(window.getComputedStyle(modalAnotacaoPrincipalEl).zIndex, 10);
                            const toxDialog = document.querySelector('.tox-dialog-wrap');
                            if (toxDialog) {
                                toxDialog.style.zIndex = modalZIndex + 50; // Coloca o diálogo acima do modal
                            }
                        });
                    }
                }).catch(err => console.error("Erro ao inicializar TinyMCE:", err));
            }
        });
        modalAnotacaoPrincipalEl.addEventListener('hidden.bs.modal', () => {
            if (conteudoTextarea && tinymce.get(conteudoTextarea.id)) {
                tinymce.get(conteudoTextarea.id).destroy();
            }
        });
        if (disciplinaSelect) {
            disciplinaSelect.addEventListener('change', function() {
                atualizarAtividadesAnotacaoPrincipal(this.value);
            });
        }
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!tituloInput.value.trim()) {
                    tituloInput.classList.add('is-invalid');
                    e.stopPropagation();
                    return;
                }
                alert("Salvar Anotação (lógica a ser implementada)");
                bootstrap.Modal.getInstance(modalAnotacaoPrincipalEl).hide();
            });
        }
    }
});
