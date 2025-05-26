document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM carregado. Iniciando anotacao.js.");

    // --- SELETORES DE ELEMENTOS ---
    const modalAnotacaoBootstrapEl = document.getElementById('modalAnotacao');
    const abrirModalNovaAnotacaoPrincipalBtn = document.getElementById("abrirModalNovaAnotacaoPrincipal");
    const anotacoesHeaderOriginalEl = document.getElementById("anotacoesHeaderOriginal");
    const modalAnotacaoLabelTituloElem = document.getElementById('modalAnotacaoLabelTitulo');
    const modalAnotacaoEditInfoElem = document.getElementById('modalAnotacaoEditInfo');
    const anotacaoIdInput = document.getElementById('anotacaoIdInput');
    const anotacaoTituloInputElem = document.getElementById('anotacaoTituloInput');
    const anotacaoDisciplinaInputElem = document.getElementById('anotacaoDisciplinaInput');
    const anotacaoAtividadeInputElem = document.getElementById('anotacaoAtividadeInput');
    const anotacaoConteudoInputElem = document.getElementById('anotacaoConteudoInput');
    const salvarAnotacaoBtnElem = document.getElementById('salvarAnotacaoBtn');
    const tituloFeedbackDiv = anotacaoTituloInputElem ? anotacaoTituloInputElem.nextElementSibling : null;
    const modalVisualizarAnotacaoBootstrapEl = document.getElementById('modalVisualizarAnotacao');
    const visualizarAnotacaoModalTituloElem = document.getElementById('visualizarAnotacaoModalTitulo');
    const visualizarAnotacaoTituloElem = document.getElementById('visualizarAnotacaoTitulo');
    const visualizarAnotacaoSubInfoElem = document.getElementById('visualizarAnotacaoSubInfo');
    const visualizarAnotacaoDisciplinaElem = document.getElementById('visualizarAnotacaoDisciplina');
    const visualizarAnotacaoAtividadeElem = document.getElementById('visualizarAnotacaoAtividade');
    const visualizarAnotacaoConteudoElem = document.getElementById('visualizarAnotacaoConteudo');

    // --- VERIFICAÇÕES INICIAIS ---
    if (!modalAnotacaoBootstrapEl) console.error("ERRO: #modalAnotacao não encontrado!");
    if (!abrirModalNovaAnotacaoPrincipalBtn && !document.getElementById('quickAddAnotacaoSidebarBtn')) {
        // console.warn("AVISO: Botões para abrir modal de nova anotação não encontrados!");
    }
    if (!anotacaoConteudoInputElem) {
        console.error("ERRO CRÍTICO: #anotacaoConteudoInput (textarea) não encontrado! O editor TinyMCE não poderá ser inicializado.");
    }

    // --- DADOS E ESTADO ---
    let tabelaAnotacoesDt;
    let resizeDebounceTimer;
    let listaAnotacoes = [
        { id: "ANOT_EXEMPLO_1", titulo: "Reunião de Projeto Semanal", disciplinaNome: "Gestão de Projetos", atividadeVinculadaNome: "Sprint Review 3", conteudo: "<h2>Pauta da Reunião</h2><p>Discutir os seguintes pontos:</p><ul><li>Progresso da semana</li><li>Bloqueios identificados</li><li>Próximos passos para a Sprint 4</li></ul><p><strong>Decisões:</strong> Focar na integração do módulo de pagamentos.</p>", dataCriacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), ultimaModificacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "ANOT_EXEMPLO_2", titulo: "Estudo de Algoritmos", disciplinaNome: "Estrutura de Dados", atividadeVinculadaNome: "Capítulo 5: Grafos", conteudo: "<h3>Conceitos Importantes sobre Grafos</h3><p>Revisar:</p><ol><li>Busca em Largura (BFS)</li><li>Busca em Profundidade (DFS)</li><li>Algoritmo de Dijkstra</li></ol><p><em>Praticar com exercícios do livro.</em></p>", dataCriacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), ultimaModificacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: "ANOT_EXEMPLO_3", titulo: "Ideias para Post no Blog", disciplinaNome: "Marketing Digital", atividadeVinculadaNome: "", conteudo: "<p>Brainstorm de temas:</p><ul><li>Como otimizar SEO para iniciantes</li><li>Tendências de Web Design para 2025</li><li>A importância da UX em aplicações móveis</li></ul>", dataCriacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), ultimaModificacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ];

    // --- TINYMCE FUNÇÕES ---
    function inicializarTinyMCE(initialContent = '') {
        // console.log("Chamando inicializarTinyMCE...");
        if (typeof tinymce === 'undefined') {
            console.error("TinyMCE script não carregado (typeof tinymce === 'undefined').");
            if (anotacaoConteudoInputElem) {
                // console.warn("TinyMCE falhou ao carregar. Usando textarea simples como fallback.");
                anotacaoConteudoInputElem.value = initialContent;
                anotacaoConteudoInputElem.style.display = 'block';
            }
            return;
        }

        const existingEditor = tinymce.get('anotacaoConteudoInput');
        if (existingEditor) {
            // console.log("Removendo instância anterior do TinyMCE (ID: anotacaoConteudoInput).");
            existingEditor.destroy();
        }
        
        // console.log("Tentando inicializar TinyMCE com seletor: #anotacaoConteudoInput");
        tinymce.init({
            selector: '#anotacaoConteudoInput',
            plugins: 'lists link image table code help wordcount autoresize',
            toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image table | code | help',
            menubar: 'edit view insert format tools table help',
            height: 400, // Altura inicial aumentada
            min_height: 400, // Altura mínima, útil com autoresize
            autoresize_bottom_margin: 30,
            branding: false,    // Remove a marca "Built with TinyMCE"
            statusbar: false,   // Remove a barra de status inteira (incluindo contagem de palavras)
            setup: function (editor) {
                editor.on('init', function () {
                    // console.log('TinyMCE (self-hosted) CALLBACK DE INIT EXECUTADO.');
                    editor.setContent(initialContent || '');
                    // console.log('Conteúdo definido no TinyMCE.');
                });
                editor.on('OpenWindow', function(e) { 
                    if (typeof $ !== 'undefined' && $('.tox-dialog-wrap').length && $('.modal.show').length) {
                        $('.tox-dialog-wrap').css('z-index', parseInt($('.modal.show').css('z-index')) + 100);
                    }
                });
            },
        }).then(function(editors) {
            if (editors && editors.length > 0) {
                // console.log('TinyMCE (self-hosted) inicializado com SUCESSO via Promise. Editor ID:', editors[0].id);
                 if (anotacaoConteudoInputElem) anotacaoConteudoInputElem.style.display = 'none';
            } else {
                console.error('TinyMCE .then() chamado, mas array de editores está vazio ou editor não encontrado.');
                if (anotacaoConteudoInputElem) { anotacaoConteudoInputElem.value = initialContent; anotacaoConteudoInputElem.style.display = 'block';}
            }
        }).catch(function(error) {
            console.error('ERRO CRÍTICO ao inicializar TinyMCE:', error);
            if (anotacaoConteudoInputElem) {
                 anotacaoConteudoInputElem.value = initialContent; 
                 anotacaoConteudoInputElem.style.display = 'block';
            }
        });
    }

    // --- FUNÇÕES UTILITÁRIAS E DE VALIDAÇÃO ---
    function displayFieldError(inputElement, message, feedbackElem) { clearFieldError(inputElement, feedbackElem); if (inputElement) inputElement.classList.add('is-invalid'); if (feedbackElem) { feedbackElem.textContent = message; feedbackElem.style.display = 'block'; } }
    function clearFieldError(inputElement, feedbackElem) { if (inputElement) inputElement.classList.remove('is-invalid'); if (feedbackElem) { feedbackElem.textContent = ''; feedbackElem.style.display = 'none'; } }
    function validateFormAnotacao() { let isValid = true; clearFieldError(anotacaoTituloInputElem, tituloFeedbackDiv); if (!anotacaoTituloInputElem || !anotacaoTituloInputElem.value.trim()) { displayFieldError(anotacaoTituloInputElem, "Por favor, informe o título da anotação.", tituloFeedbackDiv); isValid = false; } return isValid; }
    function formatarDataParaTabela(dataISO) { if (!dataISO) return '-'; try { const dataObj = new Date(dataISO); const dia = String(dataObj.getDate()).padStart(2, '0'); const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); const ano = dataObj.getFullYear(); const hora = String(dataObj.getHours()).padStart(2, '0'); const minuto = String(dataObj.getMinutes()).padStart(2, '0'); return `${dia}/${mes}/${ano}, ${hora}:${minuto}`; } catch (e) { console.error("Erro ao formatar data:", dataISO, e); return dataISO; } }

    // --- FUNÇÕES DE MODAL ---
    function abrirModalFormAnotacao(isEditMode = false, dadosAnotacao = null) {
        // console.log("Abrindo modal de anotação. Modo Edição:", isEditMode);
        clearFieldError(anotacaoTituloInputElem, tituloFeedbackDiv);
        if (anotacaoIdInput) anotacaoIdInput.value = '';
        let initialEditorContent = '';

        if (isEditMode && dadosAnotacao) {
            if (modalAnotacaoLabelTituloElem) modalAnotacaoLabelTituloElem.textContent = "Editar Anotação";
            if (modalAnotacaoEditInfoElem) modalAnotacaoEditInfoElem.textContent = `Editando: ${dadosAnotacao.titulo.substring(0, 30)}${dadosAnotacao.titulo.length > 30 ? '...' : ''}`;
            if (anotacaoIdInput) anotacaoIdInput.value = dadosAnotacao.id;
            if (anotacaoTituloInputElem) anotacaoTituloInputElem.value = dadosAnotacao.titulo || '';
            if (anotacaoDisciplinaInputElem) anotacaoDisciplinaInputElem.value = dadosAnotacao.disciplinaNome || '';
            if (anotacaoAtividadeInputElem) anotacaoAtividadeInputElem.value = dadosAnotacao.atividadeVinculadaNome || '';
            initialEditorContent = dadosAnotacao.conteudo || '';
        } else {
            if (modalAnotacaoLabelTituloElem) modalAnotacaoLabelTituloElem.textContent = "Nova Anotação";
            if (modalAnotacaoEditInfoElem) modalAnotacaoEditInfoElem.textContent = 'Criando nova anotação';
            if (anotacaoTituloInputElem) anotacaoTituloInputElem.value = '';
            if (anotacaoDisciplinaInputElem) anotacaoDisciplinaInputElem.value = '';
            if (anotacaoAtividadeInputElem) anotacaoAtividadeInputElem.value = '';
            initialEditorContent = '';
        }
        
        inicializarTinyMCE(initialEditorContent); 

        if (modalAnotacaoBootstrapEl) {
            const bsModal = bootstrap.Modal.getInstance(modalAnotacaoBootstrapEl) || new bootstrap.Modal(modalAnotacaoBootstrapEl);
            $(modalAnotacaoBootstrapEl).off('shown.bs.modal').on('shown.bs.modal', function () {
                const editor = tinymce.get('anotacaoConteudoInput');
                if (editor) {
                    editor.focus();
                } else {
                    // console.warn("Tentativa de focar no TinyMCE, mas o editor não foi encontrado após modal ser exibido.");
                }
            });
            bsModal.show();
        } else {
            console.error("Modal #modalAnotacao não encontrado ao tentar abrir.");
        }
    }

    function abrirModalVisualizarAnotacao(dadosAnotacao) { if (!dadosAnotacao) { /* ... */ return; } if (visualizarAnotacaoModalTituloElem) visualizarAnotacaoModalTituloElem.textContent = "Visualizar Anotação"; if (visualizarAnotacaoTituloElem) visualizarAnotacaoTituloElem.textContent = dadosAnotacao.titulo || 'Sem Título'; let subInfo = `Criado: ${formatarDataParaTabela(dadosAnotacao.dataCriacao)} | Modificado: ${formatarDataParaTabela(dadosAnotacao.ultimaModificacao)}`; if(visualizarAnotacaoSubInfoElem) visualizarAnotacaoSubInfoElem.innerHTML = subInfo; if (visualizarAnotacaoDisciplinaElem) visualizarAnotacaoDisciplinaElem.textContent = dadosAnotacao.disciplinaNome || '-'; if (visualizarAnotacaoAtividadeElem) visualizarAnotacaoAtividadeElem.textContent = dadosAnotacao.atividadeVinculadaNome || '-'; if (visualizarAnotacaoConteudoElem) { visualizarAnotacaoConteudoElem.innerHTML = dadosAnotacao.conteudo || '<p><em>Nenhum conteúdo.</em></p>'; } if (modalVisualizarAnotacaoBootstrapEl) { (bootstrap.Modal.getInstance(modalVisualizarAnotacaoBootstrapEl) || new bootstrap.Modal(modalVisualizarAnotacaoBootstrapEl)).show(); } }

    // --- DATATABLE ---
    function mapAnotacoesParaDataTable(lista) { return lista.map(anotacao => { const d = `<div class="dropdown"><button class="btn btn-sm btn-icon-only btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-popper-config='{"strategy":"fixed"}'><i class="bi bi-three-dots-vertical"></i></button><ul class="dropdown-menu dropdown-menu-end"><li><a class="dropdown-item btn-visualizar-anotacao" href="#" data-anotacao-id="${anotacao.id}"><i class="bi bi-eye me-2"></i>Visualizar</a></li><li><a class="dropdown-item btn-edit-anotacao" href="#" data-anotacao-id="${anotacao.id}"><i class="bi bi-pencil-square me-2"></i>Editar</a></li><li><a class="dropdown-item btn-remover-anotacao text-danger" href="#" data-anotacao-id="${anotacao.id}"><i class="bi bi-trash me-2"></i>Remover</a></li></ul></div>`; return [ '', anotacao.titulo, anotacao.disciplinaNome||'-', anotacao.atividadeVinculadaNome||'-', formatarDataParaTabela(anotacao.dataCriacao), formatarDataParaTabela(anotacao.ultimaModificacao), d ]; }); }
    function inicializarTabelaAnotacoes() {
        // console.log("Inicializando DataTable...");
        if (!window.jQuery || !$.fn.DataTable) { console.error("jQuery ou DataTables não carregado!"); return; }
        listaAnotacoes.sort((a, b) => new Date(b.ultimaModificacao) - new Date(a.ultimaModificacao));
        const mappedData = mapAnotacoesParaDataTable(listaAnotacoes);
        if ($.fn.DataTable.isDataTable('#tabelaAnotacoes')) { $('#tabelaAnotacoes').DataTable().clear().destroy(); $('#tabelaAnotacoes tbody').empty(); }
        tabelaAnotacoesDt = $('#tabelaAnotacoes').DataTable({
            responsive: { details: { type: 'column', target: 0 }},
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto"f><"col-12 col-md-auto ms-auto dt-buttons-anotacoes-container">>t<"row dt-table-footer align-items-center mt-3"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
            paging: false, lengthChange: false, scrollY: '450px', scrollCollapse: true,
            language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar...", info: "Total de _TOTAL_ anotações", infoEmpty: "Nenhuma anotação", infoFiltered: "(de _MAX_)" },
            columnDefs: [ { orderable: false, className: 'dtr-control', targets: 0 }, { responsivePriority: 1, targets: 1 }, { responsivePriority: 2, targets: 2 }, { responsivePriority: 3, targets: 3 }, { responsivePriority: 5, targets: 4, type: 'date-br' }, { responsivePriority: 4, targets: 5, type: 'date-br' }, { orderable: false, className: "text-center", targets: 6, responsivePriority: 1 } ],
            data: mappedData,
            createdRow: function(row, data, dataIndex) { const o = listaAnotacoes[dataIndex]; if (o) $(row).data('anotacao-id-interno', o.id); },
            initComplete: function () {
                // console.log("DataTable initComplete.");
                $('#tabelaAnotacoes_filter input').addClass('form-control-sm').attr('aria-label', 'Buscar');
                $('#tabelaAnotacoes_filter label').contents().filter(function() { return this.nodeType === 3; }).remove();
                const btnContainer = $('.dt-buttons-anotacoes-container');
                if (abrirModalNovaAnotacaoPrincipalBtn && btnContainer.length && $('#abrirModalNovaAnotacaoDt').length === 0) {
                    const clone = abrirModalNovaAnotacaoPrincipalBtn.cloneNode(true); clone.id = 'abrirModalNovaAnotacaoDt'; clone.style.display = 'inline-flex'; $(clone).removeClass('d-none').off('click').on('click', (e) => { e.preventDefault(); abrirModalFormAnotacao(false); }); btnContainer.append(clone);
                    if (anotacoesHeaderOriginalEl && anotacoesHeaderOriginalEl.querySelector('#abrirModalNovaAnotacaoPrincipal')) { $(anotacoesHeaderOriginalEl.querySelector('#abrirModalNovaAnotacaoPrincipal')).hide(); }
                }
                if (tabelaAnotacoesDt) { tabelaAnotacoesDt.columns.adjust().responsive.recalc(); }
            }
        });
        if ($.fn.dataTable.ext) { $.extend($.fn.dataTable.ext.type.order, { "date-br-pre": function (d) { if(!d||typeof d!=='string')return 0;const p=d.match(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/); return p?parseInt(p[3]+p[2]+p[1]+p[4]+p[5]):0;}, "date-br-asc":function(a,b){return a<b?-1:(a>b?1:0);}, "date-br-desc":function(a,b){return a<b?1:(a>b?-1:0);} }); }
        $(window).off('resize.dtAnotacoesGlobal').on('resize.dtAnotacoesGlobal', function () { clearTimeout(resizeDebounceTimer); resizeDebounceTimer = setTimeout(function () { if (tabelaAnotacoesDt) { tabelaAnotacoesDt.columns.adjust().responsive.recalc(); } }, 250); });
        // console.log("DataTable inicializada.");
    }

    // --- EVENT LISTENERS ---
    $(document).on('click', '.dropdown-menu .btn-visualizar-anotacao, .dropdown-menu .btn-edit-anotacao, .dropdown-menu .btn-remover-anotacao', function (e) { const $clickedItem = $(this); const $dropdownMenu = $clickedItem.closest('.dropdown-menu'); const $toggleButton = $dropdownMenu.data('bs-dropdown-toggle-button'); if (!$toggleButton || !$toggleButton.closest('#tabelaAnotacoes').length) { return; } e.preventDefault(); e.stopPropagation(); const anotacaoId = $clickedItem.data('anotacao-id'); if (typeof anotacaoId === 'undefined') { console.error("ID da anotação é undefined."); return; } const anotacaoCompleta = listaAnotacoes.find(a => String(a.id) === String(anotacaoId)); if (!anotacaoCompleta) { alert("Erro: Dados da anotação não encontrados."); return; } if ($clickedItem.hasClass('btn-visualizar-anotacao')) { abrirModalVisualizarAnotacao(anotacaoCompleta); } else if ($clickedItem.hasClass('btn-edit-anotacao')) { abrirModalFormAnotacao(true, anotacaoCompleta); } else if ($clickedItem.hasClass('btn-remover-anotacao')) { if (confirm(`Tem certeza que deseja remover a anotação "${anotacaoCompleta.titulo}"?`)) { listaAnotacoes = listaAnotacoes.filter(a => String(a.id) !== String(anotacaoId)); inicializarTabelaAnotacoes(); alert("Anotação removida!"); } } });
    if (salvarAnotacaoBtnElem) { salvarAnotacaoBtnElem.addEventListener("click", function () { if (!validateFormAnotacao()) { console.warn("Salvar Anotação: Formulário inválido."); return; } const idAnotacaoAtual = anotacaoIdInput ? anotacaoIdInput.value : null; const isEditMode = !!idAnotacaoAtual; const dataAtual = new Date().toISOString(); let conteudoEditor = ''; if (tinymce.get('anotacaoConteudoInput')) { conteudoEditor = tinymce.get('anotacaoConteudoInput').getContent(); } else if (anotacaoConteudoInputElem) { conteudoEditor = anotacaoConteudoInputElem.value; } const dadosFormAnotacao = { id: isEditMode ? idAnotacaoAtual : 'ANOT' + new Date().getTime(), titulo: anotacaoTituloInputElem ? anotacaoTituloInputElem.value.trim() : 'Sem Título', disciplinaNome: anotacaoDisciplinaInputElem ? anotacaoDisciplinaInputElem.value.trim() : '', atividadeVinculadaNome: anotacaoAtividadeInputElem ? anotacaoAtividadeInputElem.value.trim() : '', conteudo: conteudoEditor, ultimaModificacao: dataAtual, dataCriacao: isEditMode ? (listaAnotacoes.find(a => String(a.id) === String(idAnotacaoAtual))?.dataCriacao || dataAtual) : dataAtual }; if (isEditMode) { const index = listaAnotacoes.findIndex(a => String(a.id) === String(idAnotacaoAtual)); if (index !== -1) { listaAnotacoes[index] = {...listaAnotacoes[index], ...dadosFormAnotacao}; alert("Anotação atualizada!"); } else { alert("Erro ao atualizar."); return; } } else { listaAnotacoes.push(dadosFormAnotacao); alert("Anotação adicionada!"); } if (modalAnotacaoBootstrapEl) { const bsModal = bootstrap.Modal.getInstance(modalAnotacaoBootstrapEl); if (bsModal) bsModal.hide(); } inicializarTabelaAnotacoes(); }); }
    $('#tabelaAnotacoes tbody').on('show.bs.dropdown', '.dropdown', function (e) { const $dr=$(this); const $m=$dr.find('.dropdown-menu'); if($m.length){ $m.data('bs-dropdown-original-parent', $dr); const $tB=$dr.find('[data-bs-toggle="dropdown"]'); $m.data('bs-dropdown-toggle-button',$tB); $('body').append($m.detach()); const i=bootstrap.Dropdown.getInstance($tB[0]); if(i&&typeof i.update==='function')i.update(); else{ const tr=$tB[0].getBoundingClientRect(); const mh=$m.outerHeight(); const mw=$m.outerWidth(); const wh=$(window).height(); const ww=$(window).width(); let top=tr.bottom; if(top+mh>wh)top=tr.top-mh; if(top<0)top=0; let left=tr.left; if($m.hasClass('dropdown-menu-end'))left=tr.right-mw; if(left+mw>ww)left=ww-mw-5; if(left<0)left=5; $m.css({position:'fixed',top:top+'px',left:left+'px',right:'auto',bottom:'auto'});}}});
    $('body').on('hide.bs.dropdown', '.dropdown-menu', function (e) { const $m=$(this); const $op=$m.data('bs-dropdown-original-parent'); if($op&&$op.length&&$m.parent().is('body')){$op.append($m.detach()); $m.css({position:'',top:'',left:'',right:'',bottom:''}).removeData('bs-dropdown-original-parent').removeData('bs-dropdown-toggle-button');}});
    const quickAddAnotacaoSidebarBtn = document.getElementById('quickAddAnotacaoSidebarBtn');
    if (quickAddAnotacaoSidebarBtn) { quickAddAnotacaoSidebarBtn.addEventListener('click', function(e){ e.preventDefault(); abrirModalFormAnotacao(false); }); }
    document.querySelectorAll('dialog .btn-close-custom, dialog .btn-modal-cancel, dialog .btn-modal-ok').forEach(btn => { btn.addEventListener('click', (e) => { e.preventDefault(); const dialog = btn.closest('dialog'); if (dialog && typeof dialog.close === 'function') dialog.close(); }); });
    
    if (modalAnotacaoBootstrapEl) {
        modalAnotacaoBootstrapEl.addEventListener('hidden.bs.modal', function () {
            const editor = tinymce.get('anotacaoConteudoInput');
            if (editor) {
                editor.destroy(); // Usar destroy() para limpar completamente
                // console.log('TinyMCE (self-hosted) destruído ao fechar modal.');
            }
        });
    }

    // --- INICIALIZAÇÃO DA PÁGINA ---
    inicializarTabelaAnotacoes(); 
    console.log("anotacao.js carregado e inicializado.");
});
