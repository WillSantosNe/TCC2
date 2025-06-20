// --- DADOS MOCADOS (AGORA GLOBALIZADOS DE FORMA CONSISTENTE) ---
const listaDisciplinas = [
    { id: "CS101", nome: "Algoritmos e Estrutura de Dados" },
    { id: "CS102", nome: "Redes de Computadores" },
    { id: "CS103", nome: "Banco de Dados" },
    { id: "CS104", nome: "Inteligência Artificial" },
    { id: "CS105", nome: "Compiladores" }
];

let listaTarefas = [
    { id: "T001", titulo: "Complexidade e Estruturas Lineares", disciplinaId: "CS101", tipo: "Prova", dataEntrega: "2025-06-23", status: "Agendada", descricao: "Estudar capítulos 1 a 3 do livro Cormen. Foco em complexidade Big-O." },
    { id: "T006", titulo: "Camadas de Transporte e Aplicação", disciplinaId: "CS102", tipo: "Prova", dataEntrega: "2025-06-24", status: "Agendada", descricao: "Foco em protocolos TCP, UDP e HTTP." },
    { id: "T010", titulo: "SQL e Normalização", disciplinaId: "CS103", tipo: "Prova", dataEntrega: "2025-06-25", status: "Agendada", descricao: "Praticar joins e entender as formas normais (1FN, 2FN, 3FN)." },
    { id: "T013", titulo: "Machine Learning e Redes Neurais", disciplinaId: "CS104", tipo: "Prova", dataEntrega: "2025-06-26", status: "Agendada", descricao: "Revisar conceitos de regressão linear e redes neurais convolucionais." },
    { id: "T017", titulo: "Análise Léxica e Sintática", disciplinaId: "CS105", tipo: "Prova", dataEntrega: "2025-06-29", status: "Agendada", descricao: "Implementar um analisador léxico simples em Python." },
];


document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM carregado. Iniciando anotacao.js.");

    // --- SELETORES DE ELEMENTOS DO MODAL DE ANOTAÇÃO ---
    const modalAnotacaoBootstrapEl = document.getElementById('modalAnotacao');
    const abrirModalNovaAnotacaoPrincipalBtn = document.getElementById("abrirModalNovaAnotacaoPrincipal");
    const anotacoesHeaderOriginalEl = document.getElementById("anotacoesHeaderOriginal");
    const modalAnotacaoLabelTituloElem = document.getElementById('modalAnotacaoLabel');
    const modalAnotacaoEditInfoElem = document.getElementById('modalAnotacaoEditInfo');
    const anotacaoIdInput = document.getElementById('anotacaoIdInput');
    const anotacaoTituloInputElem = document.getElementById('anotacaoTituloInput');
    const anotacaoDisciplinaSelectElem = document.getElementById('anotacaoDisciplinaSelect');
    const anotacaoAtividadeSelectElem = document.getElementById('anotacaoAtividadeSelect');
    const anotacaoConteudoInputElem = document.getElementById('anotacaoConteudoInput');
    const salvarAnotacaoBtnElem = document.getElementById('salvarAnotacaoBtn');
    const tituloFeedbackDiv = anotacaoTituloInputElem ? anotacaoTituloInputElem.nextElementSibling : null;
    
    // --- SELETORES DE ELEMENTOS DO MODAL DE VISUALIZAÇÃO DE ANOTAÇÃO ---
    const modalVisualizarAnotacaoBootstrapEl = document.getElementById('modalVisualizarAnotacao');
    const visualizarAnotacaoModalTituloElem = document.getElementById('visualizarAnotacaoModalTitulo');
    const visualizarAnotacaoTituloElem = document.getElementById('visualizarAnotacaoTitulo');
    const visualizarAnotacaoSubInfoElem = document.getElementById('visualizarAnotacaoSubInfo');
    const visualizarAnotacaoDisciplinaElem = document.getElementById('visualizarAnotacaoDisciplina');
    const visualizarAnotacaoAtividadeElem = document.getElementById('visualizarAnotacaoAtividade');
    const visualizarAnotacaoConteudoElem = document.getElementById('visualizarAnotacaoConteudo');

    // --- SELETORES DE ELEMENTOS DO MODAL DE TAREFAS/PROVAS (QUICK ADD) ---
    const modalTarefaPrincipalQuickAddEl = document.getElementById('modalTarefaPrincipalQuickAdd');
    const principalTarefaDisciplinaQuickAddSelect = document.getElementById('principalTarefaDisciplinaQuickAdd');


    // --- VERIFICAÇÕES INICIAIS ---
    if (!modalAnotacaoBootstrapEl) console.error("ERRO: #modalAnotacao não encontrado!");
    if (!abrirModalNovaAnotacaoPrincipalBtn && !document.getElementById('quickAddAnotacaoSidebarBtn')) {
        console.warn("AVISO: Botões para abrir modal de nova anotação não encontrados!");
    }
    if (!anotacaoConteudoInputElem) {
        console.error("ERRO CRÍTICO: #anotacaoConteudoInput (textarea) não encontrado!");
    }
    if (!anotacaoDisciplinaSelectElem) console.error("ERRO: #anotacaoDisciplinaSelect não encontrado!");
    if (!anotacaoAtividadeSelectElem) console.error("ERRO: #anotacaoAtividadeSelect não encontrado!");
    if (!principalTarefaDisciplinaQuickAddSelect) console.error("ERRO: #principalTarefaDisciplinaQuickAdd não encontrado!");


    // --- DADOS E ESTADO ---
    let tabelaAnotacoesDt;
    let resizeDebounceTimer;
    let listaAnotacoes = [
        { id: "ANOT_EXEMPLO_1", titulo: "Reunião de Projeto Semanal", disciplinaId: "CS101", atividadeVinculadaId: "T001", conteudo: "<h2>Pauta da Reunião</h2><p>Discutir os seguintes pontos:</p><ul><li>Progresso da semana</li><li>Bloqueios identificados</li><li>Próximos passos para a Sprint 4</li></ul><p><strong>Decisões:</strong> Focar na integração do módulo de pagamentos.</p>", dataCriacao: new Date(new Date().setDate(new Date().getDate()-3)).toISOString(), ultimaModificacao: new Date().toISOString() },
        { id: "ANOT_EXEMPLO_2", titulo: "Estudo de Algoritmos", disciplinaId: "CS101", atividadeVinculadaId: "T001", conteudo: "<h3>Conceitos Importantes sobre Grafos</h3><p>Revisar:</p><ol><li>Busca em Largura (BFS)</li><li>Busca em Profundidade (DFS)</li><li>Algoritmo de Dijkstra</li></ol><p><em>Praticar com exercícios do livro.</em></p>", dataCriacao: new Date(new Date().setDate(new Date().getDate()-5)).toISOString(), ultimaModificacao: new Date().toISOString() },
        { id: "ANOT_EXEMPLO_3", titulo: "Definição do Tema do TCC", disciplinaId: "CS105", atividadeVinculadaId: "T017", conteudo: "<p>Primeiras ideias e esboço do tema para o TCC 1.</p>", dataCriacao: new Date(new Date().setDate(new Date().getDate()-7)).toISOString(), ultimaModificacao: new Date().toISOString() }
    ];

    // --- TINYMCE FUNÇÕES ---
    function inicializarTinyMCE(initialContent = '') {
        if (typeof tinymce === 'undefined') {
            console.error("TinyMCE script não carregado.");
            if (anotacaoConteudoInputElem) { anotacaoConteudoInputElem.value = initialContent; anotacaoConteudoInputElem.style.display = 'block'; }
            return;
        }
        const existingEditor = tinymce.get('anotacaoConteudoInput');
        if (existingEditor) { existingEditor.destroy(); }
        tinymce.init({
            selector: '#anotacaoConteudoInput',
            plugins: 'lists link image table code help wordcount autoresize',
            toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image table | code | help',
            menubar: 'edit view insert format tools table help',
            height: 400, min_height: 400, autoresize_bottom_margin: 30,
            branding: false, statusbar: false,
            setup: function (editor) {
                editor.on('init', function () { editor.setContent(initialContent || ''); });
                editor.on('OpenWindow', function(e) { if (typeof $ !=='undefined' && $('.tox-dialog-wrap').length && $('.modal.show').length){$('.tox-dialog-wrap').css('z-index',parseInt($('.modal.show').css('z-index'))+100);}});
            },
        }).then(editors => { if (editors && editors.length > 0 && anotacaoConteudoInputElem) anotacaoConteudoInputElem.style.display = 'none'; })
          .catch(err => { console.error('Erro TinyMCE:', err); if (anotacaoConteudoInputElem){ anotacaoConteudoInputElem.value = initialContent; anotacaoConteudoInputElem.style.display = 'block';}});
    }

    // --- FUNÇÕES UTILITÁRIAS E DE VALIDAÇÃO ---
    function displayFieldError(el, msg, fb) { clearFieldError(el, fb); if (el) el.classList.add('is-invalid'); if (fb) { fb.textContent = msg; fb.style.display = 'block'; } }
    function clearFieldError(el, fb) { if (el) el.classList.remove('is-invalid'); if (fb) { fb.textContent = ''; fb.style.display = 'none'; } }
    function validateFormAnotacao() { let ok = true; clearFieldError(anotacaoTituloInputElem, tituloFeedbackDiv); if (!anotacaoTituloInputElem || !anotacaoTituloInputElem.value.trim()) { displayFieldError(anotacaoTituloInputElem, "Título obrigatório.", tituloFeedbackDiv); ok = false; } return ok; }
    function formatarDataParaTabela(iso) { if (!iso) return '-'; try { const d=new Date(iso); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; } catch(e){ return iso; }}
    
    // Funções para buscar nome da disciplina/atividade pelo ID
    function getNomeDisciplinaById(id) {
        const disciplina = listaDisciplinas.find(d => d.id === id);
        return disciplina ? disciplina.nome : '-';
    }

    function getTituloTarefaById(id) {
        const tarefa = listaTarefas.find(t => t.id === id);
        return tarefa ? tarefa.titulo : '-';
    }

    // --- FUNÇÕES DE POPULAÇÃO DE SELECTS ---
    function popularSelect(selectEl, dataArr, selectedId = null, defaultOptionText = "Nenhum(a)") {
        if (!selectEl) return;
        selectEl.innerHTML = '';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = ""; // Valor vazio para "Nenhum(a)"
        defaultOption.textContent = defaultOptionText;
        selectEl.appendChild(defaultOption);

        dataArr.forEach(item => {
            const o = document.createElement('option');
            o.value = item.id;
            o.textContent = item.nome || item.titulo; // Usa 'nome' para disciplina, 'titulo' para tarefa
            if (selectedId && item.id === selectedId) {
                o.selected = true;
            }
            selectEl.appendChild(o);
        });
        // Se um ID foi selecionado mas não foi encontrado na lista, garante que a opção "Nenhum(a)" esteja selecionada.
        // Isso evita que um valor inválido persista no select.
        if (selectedId && !dataArr.some(item => item.id === selectedId)) {
             defaultOption.selected = true;
        }
        // Se não houver selectedId e o select ainda não tiver um valor, seleciona o default
        if (!selectedId && !selectEl.value) {
            defaultOption.selected = true;
        }
    }

    // --- FUNÇÕES ESPECÍFICAS DOS MODAIS ---

    // Modal de Anotações
    function atualizarOpcoesAtividadeAnotacao(disciplinaIdSelecionada, atividadeSalvaId = null) {
        if (!anotacaoAtividadeSelectElem) return;

        let atividadesFiltradas = [];
        if (disciplinaIdSelecionada) {
            // Se uma disciplina está selecionada, filtra as tarefas por ela
            atividadesFiltradas = listaTarefas.filter(tarefa => tarefa.disciplinaId === disciplinaIdSelecionada);
        } else {
            // Se nenhuma disciplina está selecionada, mostra todas as tarefas
            atividadesFiltradas = listaTarefas;
        }
        
        popularSelect(anotacaoAtividadeSelectElem, atividadesFiltradas, atividadeSalvaId, "Selecione...");
    }

    function abrirModalFormAnotacao(isEditMode = false, dadosAnotacao = null) {
        clearFieldError(anotacaoTituloInputElem, tituloFeedbackDiv);
        
        if (anotacaoIdInput) anotacaoIdInput.value = '';
        let initialEditorContent = '';
        let disciplinaSalvaId = "";
        let atividadeSalvaId = "";

        // Popula as disciplinas no modal de anotação
        popularSelect(anotacaoDisciplinaSelectElem, listaDisciplinas, null, "Selecione...");

        if (isEditMode && dadosAnotacao) {
            if (modalAnotacaoLabelTituloElem) modalAnotacaoLabelTituloElem.textContent = "Editar Anotação";
            if (modalAnotacaoEditInfoElem) modalAnotacaoEditInfoElem.textContent = `Editando: ${dadosAnotacao.titulo.substring(0,30)}${dadosAnotacao.titulo.length > 30 ? '...' : ''}`;
            if (anotacaoIdInput) anotacaoIdInput.value = dadosAnotacao.id;
            if (anotacaoTituloInputElem) anotacaoTituloInputElem.value = dadosAnotacao.titulo || '';
            
            disciplinaSalvaId = dadosAnotacao.disciplinaId || "";
            if (anotacaoDisciplinaSelectElem) anotacaoDisciplinaSelectElem.value = disciplinaSalvaId;
            
            atividadeSalvaId = dadosAnotacao.atividadeVinculadaId || "";
            initialEditorContent = dadosAnotacao.conteudo || '';
        } else {
            if (modalAnotacaoLabelTituloElem) modalAnotacaoLabelTituloElem.textContent = "Nova Anotação";
            if (modalAnotacaoEditInfoElem) modalAnotacaoEditInfoElem.textContent = 'Nova anotação';
            if (anotacaoTituloInputElem) anotacaoTituloInputElem.value = '';
            // Define o valor padrão para os selects na criação de nova anotação
            if (anotacaoDisciplinaSelectElem) anotacaoDisciplinaSelectElem.value = ""; 
            if (anotacaoAtividadeSelectElem) anotacaoAtividadeSelectElem.value = "";
            initialEditorContent = '';
        }
        
        atualizarOpcoesAtividadeAnotacao(anotacaoDisciplinaSelectElem.value, atividadeSalvaId);
        inicializarTinyMCE(initialEditorContent); 

        if (modalAnotacaoBootstrapEl) {
            const bsModal = bootstrap.Modal.getInstance(modalAnotacaoBootstrapEl) || new bootstrap.Modal(modalAnotacaoBootstrapEl);
            $(modalAnotacaoBootstrapEl).off('shown.bs.modal').on('shown.bs.modal', () => { if(tinymce.get('anotacaoConteudoInput')) tinymce.get('anotacaoConteudoInput').focus(); });
            bsModal.show();
        }
    }

    if (anotacaoDisciplinaSelectElem) {
        anotacaoDisciplinaSelectElem.addEventListener('change', function() {
            atualizarOpcoesAtividadeAnotacao(this.value); 
        });
    }

    function abrirModalVisualizarAnotacao(dados) { 
        if (!dados) return; 
        if (visualizarAnotacaoModalTituloElem) visualizarAnotacaoModalTituloElem.textContent = "Visualizar"; 
        if (visualizarAnotacaoTituloElem) visualizarAnotacaoTituloElem.textContent = dados.titulo || 'S/ Título'; 
        
        let si = `Criado: ${formatarDataParaTabela(dados.dataCriacao)} | Modificado: ${formatarDataParaTabela(dados.ultimaModificacao)}`; 
        if(visualizarAnotacaoSubInfoElem) visualizarAnotacaoSubInfoElem.innerHTML = si; 
        
        const nomeDisciplina = getNomeDisciplinaById(dados.disciplinaId) || '-';
        const tituloAtividade = getTituloTarefaById(dados.atividadeVinculadaId) || '-';

        if (visualizarAnotacaoDisciplinaElem) visualizarAnotacaoDisciplinaElem.textContent = nomeDisciplina; 
        if (visualizarAnotacaoAtividadeElem) visualizarAnotacaoAtividadeElem.textContent = tituloAtividade; 
        if (visualizarAnotacaoConteudoElem) visualizarAnotacaoConteudoElem.innerHTML = dados.conteudo || '<p><em>Nenhum conteúdo.</em></p>'; 
        if (modalVisualizarAnotacaoBootstrapEl) (bootstrap.Modal.getInstance(modalVisualizarAnotacaoBootstrapEl) || new bootstrap.Modal(modalVisualizarAnotacaoBootstrapEl)).show(); 
    }

    // Modal Adicionar Tarefa/Prova Rápida
    if (modalTarefaPrincipalQuickAddEl && principalTarefaDisciplinaQuickAddSelect) {
        modalTarefaPrincipalQuickAddEl.addEventListener('show.bs.modal', function () {
            popularSelect(principalTarefaDisciplinaQuickAddSelect, listaDisciplinas, null, "Selecione a Disciplina");
        });
    }


    // --- DATATABLE ---
    function mapAnotacoesParaDataTable(lista) { 
        return lista.map(a => {
            const disciplinaNome = getNomeDisciplinaById(a.disciplinaId);
            const atividadeNome = getTituloTarefaById(a.atividadeVinculadaId);

            const d = `<div class="dropdown">
                <button class="btn btn-sm btn-icon-only btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-popper-config='{"strategy":"fixed"}'>
                    <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item btn-visualizar-anotacao" href="#" data-anotacao-id="${a.id}"><i class="bi bi-eye me-2"></i>Visualizar</a></li>
                    <li><a class="dropdown-item btn-edit-anotacao" href="#" data-anotacao-id="${a.id}"><i class="bi bi-pencil-square me-2"></i>Editar</a></li>
                    <li><a class="dropdown-item btn-remover-anotacao text-danger" href="#" data-anotacao-id="${a.id}"><i class="bi bi-trash me-2"></i>Remover</a></li>
                </ul>
            </div>`; 
            return ['', a.titulo, disciplinaNome, atividadeNome, formatarDataParaTabela(a.dataCriacao), formatarDataParaTabela(a.ultimaModificacao), d];
        });
    }

    function inicializarTabelaAnotacoes() {
        if (!window.jQuery || !$.fn.DataTable) { console.error("jQuery ou DataTables não carregado!"); return; }
        listaAnotacoes.sort((a, b) => new Date(b.ultimaModificacao) - new Date(a.ultimaModificacao));
        if ($.fn.DataTable.isDataTable('#tabelaAnotacoes')) { $('#tabelaAnotacoes').DataTable().clear().destroy(); $('#tabelaAnotacoes tbody').empty(); }
        tabelaAnotacoesDt = $('#tabelaAnotacoes').DataTable({
            responsive: { details: { type: 'column', target: 0 }},
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto"f><"col-12 col-md-auto ms-auto dt-buttons-anotacoes-container">>t<"row dt-table-footer align-items-center mt-3"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
            paging: false, lengthChange: false, scrollY: '450px', scrollCollapse: true,
            language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar...", info: "Total de _TOTAL_ anotações", infoEmpty: "Nenhuma anotação", infoFiltered: "(de _MAX_)" },
            columnDefs: [
                { orderable: false, className: 'dtr-control', targets: 0 }, // Coluna do ícone '+'
                { responsivePriority: 1, targets: 1 }, // Título da Anotação (Maior Prioridade)
                { responsivePriority: 10001, targets: 2 }, // Disciplina (Prioridade Baixa)
                { responsivePriority: 10002, targets: 3 }, // Atividade (Prioridade Baixa)
                { responsivePriority: 10003, targets: 4 }, // Data de Criação (Prioridade Baixa)
                { responsivePriority: 10004, targets: 5 }, // Última Modificação (Prioridade Baixa)
                { 
                    orderable: false, 
                    className: "text-center dt-actions-column", 
                    targets: 6, 
                    responsivePriority: 2 // Ações (Segunda Maior Prioridade)
                }
            ],
            data: mapAnotacoesParaDataTable(listaAnotacoes),
            createdRow: function(row, data, dataIndex) { const o=listaAnotacoes[dataIndex]; if(o)$(row).data('anotacao-id-interno', o.id);},
            initComplete: function () {
                $('#tabelaAnotacoes_filter input').addClass('form-control-sm').attr('aria-label', 'Buscar');
                $('#tabelaAnotacoes_filter label').contents().filter(function() { return this.nodeType===3;}).remove();
                const btnContainer = $('.dt-buttons-anotacoes-container');
                if (abrirModalNovaAnotacaoPrincipalBtn && btnContainer.length && $('#abrirModalNovaAnotacaoDt').length === 0) {
                    const clone = abrirModalNovaAnotacaoPrincipalBtn.cloneNode(true); 
                    clone.id = 'abrirModalNovaAnotacaoDt'; 
                    clone.style.display = 'inline-flex'; 
                    $(clone).removeClass('d-none').off('click').on('click', (e)=>{e.preventDefault();abrirModalFormAnotacao(false);}); 
                    btnContainer.append(clone);
                    if (anotacoesHeaderOriginalEl && anotacoesHeaderOriginalEl.querySelector('#abrirModalNovaAnotacaoPrincipal')) { 
                        $(anotacoesHeaderOriginalEl.querySelector('#abrirModalNovaAnotacaoPrincipal')).hide(); 
                    }
                }
                if (tabelaAnotacoesDt) tabelaAnotacoesDt.columns.adjust().responsive.recalc();
            }
        });
        if ($.fn.dataTable.ext) {$.extend($.fn.dataTable.ext.type.order,{"date-br-pre":function(d){if(!d||typeof d!=='string')return 0;const p=d.match(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/);return p?parseInt(p[3]+p[2]+p[1]+p[4]+p[5]):0;},"date-br-asc":function(a,b){return a<b?-1:(a>b?1:0);},"date-br-desc":function(a,b){return a<b?1:(a>b?-1:0);}}); }
        $(window).off('resize.dtAnotacoesGlobal').on('resize.dtAnotacoesGlobal', ()=>{clearTimeout(resizeDebounceTimer);resizeDebounceTimer=setTimeout(()=>{if(tabelaAnotacoesDt)tabelaAnotacoesDt.columns.adjust().responsive.recalc();},250);});
    }

    // --- EVENT LISTENERS ---
    $(document).on('click', '.dropdown-menu .btn-visualizar-anotacao, .dropdown-menu .btn-edit-anotacao, .dropdown-menu .btn-remover-anotacao', function(e){
        const $cI=$(this);
        const $dM=$cI.closest('.dropdown-menu');
        const $tB=$dM.data('bs-dropdown-toggle-button');
        if(!$tB||!$tB.closest('#tabelaAnotacoes').length)return;
        e.preventDefault();
        e.stopPropagation();
        const aId=$cI.data('anotacao-id');
        if(typeof aId==='undefined')return;
        const aC=listaAnotacoes.find(a=>String(a.id)===String(aId));
        if(!aC){alert("Anotação não encontrada.");return;}
        
        if($cI.hasClass('btn-visualizar-anotacao')) {
            abrirModalVisualizarAnotacao(aC);
        } else if($cI.hasClass('btn-edit-anotacao')) {
            abrirModalFormAnotacao(true,aC);
        } else if($cI.hasClass('btn-remover-anotacao')) {
            if(confirm(`Remover "${aC.titulo}"?`)){
                listaAnotacoes=listaAnotacoes.filter(a=>String(a.id)!==String(aId));
                inicializarTabelaAnotacoes();
                alert("Anotação removida com sucesso!");
            }
        }
    });

    if(salvarAnotacaoBtnElem){
        salvarAnotacaoBtnElem.addEventListener("click",function(e){
            e.preventDefault();
            if(!validateFormAnotacao()){
                console.warn("Formulário inválido.");
                return;
            }
            const id = anotacaoIdInput ? anotacaoIdInput.value : null;
            const isEdit = !!id;
            const agora = new Date().toISOString();
            let cE = '';
            if(tinymce.get('anotacaoConteudoInput')){
                cE = tinymce.get('anotacaoConteudoInput').getContent();
            } else if(anotacaoConteudoInputElem){
                cE = anotacaoConteudoInputElem.value;
            }
            
            const disciplinaIdVal = anotacaoDisciplinaSelectElem ? anotacaoDisciplinaSelectElem.value : '';
            const atividadeIdVal = anotacaoAtividadeSelectElem ? anotacaoAtividadeSelectElem.value : '';

            const dados = {
                id: isEdit ? id : ('ANOT_' + new Date().getTime()),
                titulo: anotacaoTituloInputElem ? anotacaoTituloInputElem.value.trim() : 'S/ Título',
                disciplinaId: disciplinaIdVal,
                atividadeVinculadaId: atividadeIdVal,
                conteudo: cE,
                ultimaModificacao: agora,
                dataCriacao: isEdit ? (listaAnotacoes.find(a => String(a.id) === String(id))?.dataCriacao || agora) : agora
            };

            if(isEdit){
                const idx = listaAnotacoes.findIndex(a => String(a.id) === String(id));
                if(idx !== -1){
                    listaAnotacoes[idx] = { ...listaAnotacoes[idx], ...dados };
                    alert("Anotação atualizada com sucesso!");
                } else {
                    alert("Erro ao atualizar anotação. Anotação não encontrada.");
                    return;
                }
            } else {
                listaAnotacoes.push(dados);
                alert("Anotação adicionada com sucesso!");
            }
            
            if(modalAnotacaoBootstrapEl){
                const m = bootstrap.Modal.getInstance(modalAnotacaoBootstrapEl);
                if(m)m.hide();
            }
            inicializarTabelaAnotacoes();
        });
    }

    $('#tabelaAnotacoes tbody').on('show.bs.dropdown','.dropdown',function(e){const $dr=$(this);const $m=$dr.find('.dropdown-menu');if($m.length){$m.data('bs-dropdown-original-parent',$dr);const $tB=$dr.find('[data-bs-toggle="dropdown"]');$m.data('bs-dropdown-toggle-button',$tB);$('body').append($m.detach());const i=bootstrap.Dropdown.getInstance($tB[0]);if(i&&typeof i.update==='function')i.update();else{const tr=$tB[0].getBoundingClientRect();const mh=$m.outerHeight();const mw=$m.outerWidth();const wh=$(window).height();const ww=$(window).width();let t=tr.bottom;if(t+mh>wh)t=tr.top-mh;if(t<0)t=0;let l=tr.left;if($m.hasClass('dropdown-menu-end'))l=tr.right-mw;if(l+mw>ww)l=ww-mw-5;if(l<0)l=5;$m.css({position:'fixed',top:t+'px',left:l+'px',right:'auto',bottom:'auto'});}}});
    $('body').on('hide.bs.dropdown','.dropdown-menu',function(e){const $m=$(this);const $op=$m.data('bs-dropdown-original-parent');if($op&&$op.length&&$m.parent().is('body')){$op.append($m.detach());$m.css({position:'',top:'',left:'',right:'',bottom:''}).removeData('bs-dropdown-original-parent').removeData('bs-dropdown-toggle-button');}});
    
    const quickAddBtn=document.getElementById('quickAddAnotacaoSidebarBtn');
    if(quickAddBtn){
        quickAddBtn.addEventListener('click',function(e){
            e.preventDefault();
            abrirModalFormAnotacao(false);
        });
    }
        
    if(modalAnotacaoBootstrapEl){
        modalAnotacaoBootstrapEl.addEventListener('hidden.bs.modal',function(){
            const ed=tinymce.get('anotacaoConteudoInput');
            if(ed)ed.destroy();
        });
    }

    // --- INICIALIZAÇÃO DA PÁGINA ---
    inicializarTabelaAnotacoes(); 
    console.log("anotacao.js carregado e inicializado.");
});
