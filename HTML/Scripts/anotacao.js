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
    
    const anotacaoDisciplinaSelectElem = document.getElementById('anotacaoDisciplinaSelect');
    const anotacaoAtividadeSelectElem = document.getElementById('anotacaoAtividadeSelect'); // ÚNICO SELECT PARA ATIVIDADES

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
        console.warn("AVISO: Botões para abrir modal de nova anotação não encontrados!");
    }
    if (!anotacaoConteudoInputElem) {
        console.error("ERRO CRÍTICO: #anotacaoConteudoInput (textarea) não encontrado!");
    }
    if (!anotacaoDisciplinaSelectElem) console.error("ERRO: #anotacaoDisciplinaSelect não encontrado!");
    if (!anotacaoAtividadeSelectElem) console.error("ERRO: #anotacaoAtividadeSelect não encontrado!");

    // --- DADOS E ESTADO ---
    let tabelaAnotacoesDt;
    let resizeDebounceTimer;
    let agora = new Date();
    let listaAnotacoes = [
        { id: "ANOT_EXEMPLO_1", titulo: "Reunião de Projeto Semanal", disciplinaNome: "Gestão de Projetos", atividadeVinculadaNome: "Sprint Review 3", conteudo: "<h2>Pauta da Reunião</h2><p>Discutir os seguintes pontos:</p><ul><li>Progresso da semana</li><li>Bloqueios identificados</li><li>Próximos passos para a Sprint 4</li></ul><p><strong>Decisões:</strong> Focar na integração do módulo de pagamentos.</p>", dataCriacao: new Date(agora.setDate(agora.getDate()-3)).toISOString(), ultimaModificacao: new Date(agora.setDate(agora.getDate())).toISOString() },
        { id: "ANOT_EXEMPLO_2", titulo: "Estudo de Algoritmos", disciplinaNome: "Estrutura de Dados", atividadeVinculadaNome: "Capítulo 5: Grafos", conteudo: "<h3>Conceitos Importantes sobre Grafos</h3><p>Revisar:</p><ol><li>Busca em Largura (BFS)</li><li>Busca em Profundidade (DFS)</li><li>Algoritmo de Dijkstra</li></ol><p><em>Praticar com exercícios do livro.</em></p>", dataCriacao: new Date(agora.setDate(agora.getDate()-5)).toISOString(), ultimaModificacao: new Date(agora.setDate(agora.getDate()+1)).toISOString() },
        { id: "ANOT_EXEMPLO_3", titulo: "Definição do Tema do TCC", disciplinaNome: "TCC 1", atividadeVinculadaNome: "Definição do Tema", conteudo: "<p>Primeiras ideias e esboço do tema para o TCC 1.</p>", dataCriacao: new Date(agora.setDate(agora.getDate()-7)).toISOString(), ultimaModificacao: new Date(agora.setDate(agora.getDate())).toISOString() }
    ];

    // --- LISTAS DE OPÇÕES FIXAS ---
    const disciplinasFixas = ["Nenhuma", "Cálculo I", "Programação Orientada a Objetos", "Engenharia de Software", "TCC 1", "Outra"];
    const atividadesPorDisciplina = {
        "Nenhuma": ["Nenhuma"],
        "Cálculo I": ["Nenhuma", "Lista de Exercícios 1", "Prova P1", "Trabalho em Grupo", "Outra"],
        "Programação Orientada a Objetos": ["Nenhuma", "Projeto Prático 1", "Laboratório 3", "Seminário", "Outra"],
        "Engenharia de Software": ["Nenhuma", "Documentação de Requisitos", "Modelagem UML", "Protótipo", "Outra"],
        "TCC 1": ["Nenhuma", "Definição do Tema", "Revisão Bibliográfica Inicial", "Desenvolvimento da Proposta", "Apresentação da Proposta", "Outra"],
        "Outra": ["Nenhuma", "Atividade Genérica 1", "Atividade Genérica 2", "Outra"]
    };
    const atividadesPadrao = ["Nenhuma", "Outra"]; // Fallback se a disciplina não estiver mapeada


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

    // --- FUNÇÕES DE MODAL E CAMPOS CONDICIONAIS ---
    function popularSelect(selectEl, optsArr, selVal = null) {
        if (!selectEl) return;
        selectEl.innerHTML = '';
        optsArr.forEach(opt => { const o=document.createElement('option'); o.value=opt; o.textContent=opt; if(selVal && opt===selVal)o.selected=true; selectEl.appendChild(o); });
    }

    function atualizarOpcoesAtividade(disciplinaSelecionada, atividadeSalva = null) {
        if (!anotacaoAtividadeSelectElem) return;
        const atividadesParaDisciplina = atividadesPorDisciplina[disciplinaSelecionada] || atividadesPadrao;
        popularSelect(anotacaoAtividadeSelectElem, atividadesParaDisciplina, atividadeSalva);
    }

    function abrirModalFormAnotacao(isEditMode = false, dadosAnotacao = null) {
        clearFieldError(anotacaoTituloInputElem, tituloFeedbackDiv);
        if (anotacaoIdInput) anotacaoIdInput.value = '';
        let initialEditorContent = '';
        let disciplinaSalva = "Nenhuma";
        let atividadeSalva = "Nenhuma";

        popularSelect(anotacaoDisciplinaSelectElem, disciplinasFixas);

        if (isEditMode && dadosAnotacao) {
            if (modalAnotacaoLabelTituloElem) modalAnotacaoLabelTituloElem.textContent = "Editar Anotação";
            if (modalAnotacaoEditInfoElem) modalAnotacaoEditInfoElem.textContent = `Editando: ${dadosAnotacao.titulo.substring(0,30)}${dadosAnotacao.titulo.length > 30 ? '...' : ''}`;
            if (anotacaoIdInput) anotacaoIdInput.value = dadosAnotacao.id;
            if (anotacaoTituloInputElem) anotacaoTituloInputElem.value = dadosAnotacao.titulo || '';
            
            disciplinaSalva = dadosAnotacao.disciplinaNome || "Nenhuma";
            if (anotacaoDisciplinaSelectElem) anotacaoDisciplinaSelectElem.value = disciplinaSalva;
            
            atividadeSalva = dadosAnotacao.atividadeVinculadaNome || "Nenhuma";
            initialEditorContent = dadosAnotacao.conteudo || '';
        } else {
            if (modalAnotacaoLabelTituloElem) modalAnotacaoLabelTituloElem.textContent = "Nova Anotação";
            if (modalAnotacaoEditInfoElem) modalAnotacaoEditInfoElem.textContent = 'Nova anotação';
            if (anotacaoTituloInputElem) anotacaoTituloInputElem.value = '';
            if (anotacaoDisciplinaSelectElem) anotacaoDisciplinaSelectElem.value = "Nenhuma";
            initialEditorContent = '';
        }
        
        atualizarOpcoesAtividade(anotacaoDisciplinaSelectElem.value, atividadeSalva);
        inicializarTinyMCE(initialEditorContent); 

        if (modalAnotacaoBootstrapEl) {
            const bsModal = bootstrap.Modal.getInstance(modalAnotacaoBootstrapEl) || new bootstrap.Modal(modalAnotacaoBootstrapEl);
            $(modalAnotacaoBootstrapEl).off('shown.bs.modal').on('shown.bs.modal', () => { if(tinymce.get('anotacaoConteudoInput')) tinymce.get('anotacaoConteudoInput').focus(); });
            bsModal.show();
        }
    }

    if (anotacaoDisciplinaSelectElem) {
        anotacaoDisciplinaSelectElem.addEventListener('change', function() {
            atualizarOpcoesAtividade(this.value); 
        });
    }

    function abrirModalVisualizarAnotacao(dados) { if (!dados) return; if (visualizarAnotacaoModalTituloElem) visualizarAnotacaoModalTituloElem.textContent = "Visualizar"; if (visualizarAnotacaoTituloElem) visualizarAnotacaoTituloElem.textContent = dados.titulo || 'S/ Título'; let si = `Criado: ${formatarDataParaTabela(dados.dataCriacao)} | Modificado: ${formatarDataParaTabela(dados.ultimaModificacao)}`; if(visualizarAnotacaoSubInfoElem) visualizarAnotacaoSubInfoElem.innerHTML = si; if (visualizarAnotacaoDisciplinaElem) visualizarAnotacaoDisciplinaElem.textContent = dados.disciplinaNome || '-'; if (visualizarAnotacaoAtividadeElem) visualizarAnotacaoAtividadeElem.textContent = dados.atividadeVinculadaNome || '-'; if (visualizarAnotacaoConteudoElem) visualizarAnotacaoConteudoElem.innerHTML = dados.conteudo || '<p><em>Nenhum conteúdo.</em></p>'; if (modalVisualizarAnotacaoBootstrapEl) (bootstrap.Modal.getInstance(modalVisualizarAnotacaoBootstrapEl) || new bootstrap.Modal(modalVisualizarAnotacaoBootstrapEl)).show(); }

    // --- DATATABLE ---
    function mapAnotacoesParaDataTable(lista) { return lista.map(a => {const d=`<div class="dropdown"><button class="btn btn-sm btn-icon-only btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-popper-config='{"strategy":"fixed"}'><i class="bi bi-three-dots-vertical"></i></button><ul class="dropdown-menu dropdown-menu-end"><li><a class="dropdown-item btn-visualizar-anotacao" href="#" data-anotacao-id="${a.id}"><i class="bi bi-eye me-2"></i>Visualizar</a></li><li><a class="dropdown-item btn-edit-anotacao" href="#" data-anotacao-id="${a.id}"><i class="bi bi-pencil-square me-2"></i>Editar</a></li><li><a class="dropdown-item btn-remover-anotacao text-danger" href="#" data-anotacao-id="${a.id}"><i class="bi bi-trash me-2"></i>Remover</a></li></ul></div>`; return['',a.titulo,a.disciplinaNome||'-',a.atividadeVinculadaNome||'-',formatarDataParaTabela(a.dataCriacao),formatarDataParaTabela(a.ultimaModificacao),d]});}
    function inicializarTabelaAnotacoes() {
        if (!window.jQuery || !$.fn.DataTable) { console.error("jQuery ou DataTables não carregado!"); return; }
        listaAnotacoes.sort((a, b) => new Date(b.ultimaModificacao) - new Date(a.ultimaModificacao));
        if ($.fn.DataTable.isDataTable('#tabelaAnotacoes')) { $('#tabelaAnotacoes').DataTable().clear().destroy(); $('#tabelaAnotacoes tbody').empty(); }
        tabelaAnotacoesDt = $('#tabelaAnotacoes').DataTable({
            responsive: { details: { type: 'column', target: 0 }},
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto"f><"col-12 col-md-auto ms-auto dt-buttons-anotacoes-container">>t<"row dt-table-footer align-items-center mt-3"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
            paging: false, lengthChange: false, scrollY: '450px', scrollCollapse: true,
            language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar...", info: "Total de _TOTAL_ anotações", infoEmpty: "Nenhuma anotação", infoFiltered: "(de _MAX_)" },
            columnDefs: [ { orderable: false, className: 'dtr-control', targets: 0 }, { responsivePriority: 1, targets: 1 }, { responsivePriority: 2, targets: 2 }, { responsivePriority: 3, targets: 3 }, { responsivePriority: 5, targets: 4, type: 'date-br' }, { responsivePriority: 4, targets: 5, type: 'date-br' }, { orderable: false, className: "text-center", targets: 6, responsivePriority: 1 } ],
            data: mapAnotacoesParaDataTable(listaAnotacoes),
            createdRow: function(row, data, dataIndex) { const o=listaAnotacoes[dataIndex]; if(o)$(row).data('anotacao-id-interno', o.id);},
            initComplete: function () {
                $('#tabelaAnotacoes_filter input').addClass('form-control-sm').attr('aria-label', 'Buscar');
                $('#tabelaAnotacoes_filter label').contents().filter(function() { return this.nodeType===3;}).remove();
                const btnContainer = $('.dt-buttons-anotacoes-container');
                if (abrirModalNovaAnotacaoPrincipalBtn && btnContainer.length && $('#abrirModalNovaAnotacaoDt').length === 0) {
                    const clone = abrirModalNovaAnotacaoPrincipalBtn.cloneNode(true); clone.id = 'abrirModalNovaAnotacaoDt'; clone.style.display = 'inline-flex'; $(clone).removeClass('d-none').off('click').on('click', (e)=>{e.preventDefault();abrirModalFormAnotacao(false);}); btnContainer.append(clone);
                    if (anotacoesHeaderOriginalEl && anotacoesHeaderOriginalEl.querySelector('#abrirModalNovaAnotacaoPrincipal')) { $(anotacoesHeaderOriginalEl.querySelector('#abrirModalNovaAnotacaoPrincipal')).hide(); }
                }
                if (tabelaAnotacoesDt) tabelaAnotacoesDt.columns.adjust().responsive.recalc();
            }
        });
        if ($.fn.dataTable.ext) {$.extend($.fn.dataTable.ext.type.order,{"date-br-pre":function(d){if(!d||typeof d!=='string')return 0;const p=d.match(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/);return p?parseInt(p[3]+p[2]+p[1]+p[4]+p[5]):0;},"date-br-asc":function(a,b){return a<b?-1:(a>b?1:0);},"date-br-desc":function(a,b){return a<b?1:(a>b?-1:0);}}); }
        $(window).off('resize.dtAnotacoesGlobal').on('resize.dtAnotacoesGlobal', ()=>{clearTimeout(resizeDebounceTimer);resizeDebounceTimer=setTimeout(()=>{if(tabelaAnotacoesDt)tabelaAnotacoesDt.columns.adjust().responsive.recalc();},250);});
    }

    // --- EVENT LISTENERS ---
    $(document).on('click', '.dropdown-menu .btn-visualizar-anotacao, .dropdown-menu .btn-edit-anotacao, .dropdown-menu .btn-remover-anotacao', function(e){const $cI=$(this);const $dM=$cI.closest('.dropdown-menu');const $tB=$dM.data('bs-dropdown-toggle-button');if(!$tB||!$tB.closest('#tabelaAnotacoes').length)return;e.preventDefault();e.stopPropagation();const aId=$cI.data('anotacao-id');if(typeof aId==='undefined')return;const aC=listaAnotacoes.find(a=>String(a.id)===String(aId));if(!aC){alert("Anotação não encontrada.");return;}if($cI.hasClass('btn-visualizar-anotacao'))abrirModalVisualizarAnotacao(aC);else if($cI.hasClass('btn-edit-anotacao'))abrirModalFormAnotacao(true,aC);else if($cI.hasClass('btn-remover-anotacao'))if(confirm(`Remover "${aC.titulo}"?`)){listaAnotacoes=listaAnotacoes.filter(a=>String(a.id)!==String(aId));inicializarTabelaAnotacoes();alert("Removida!");}});
    if(salvarAnotacaoBtnElem){salvarAnotacaoBtnElem.addEventListener("click",function(){if(!validateFormAnotacao()){console.warn("Formulário inválido.");return;}const id=anotacaoIdInput?anotacaoIdInput.value:null;const isEdit=!!id;const agora=new Date().toISOString();let cE='';if(tinymce.get('anotacaoConteudoInput')){cE=tinymce.get('anotacaoConteudoInput').getContent();}else if(anotacaoConteudoInputElem){cE=anotacaoConteudoInputElem.value;}let dV=anotacaoDisciplinaSelectElem?anotacaoDisciplinaSelectElem.value:'';let aV=anotacaoAtividadeSelectElem?anotacaoAtividadeSelectElem.value:'';if(dV==="Nenhuma")dV="";if(aV==="Nenhuma")aV="";const dados={id:isEdit?id:('ANOT'+new Date().getTime()),titulo:anotacaoTituloInputElem?anotacaoTituloInputElem.value.trim():'S/ Título',disciplinaNome:dV,atividadeVinculadaNome:aV,conteudo:cE,ultimaModificacao:agora,dataCriacao:isEdit?(listaAnotacoes.find(a=>String(a.id)===String(id))?.dataCriacao||agora):agora};if(isEdit){const idx=listaAnotacoes.findIndex(a=>String(a.id)===String(id));if(idx!==-1){listaAnotacoes[idx]={...listaAnotacoes[idx],...dados};alert("Atualizada!");}else{alert("Erro ao atualizar.");return;}}else{listaAnotacoes.push(dados);alert("Adicionada!");}if(modalAnotacaoBootstrapEl){const m=bootstrap.Modal.getInstance(modalAnotacaoBootstrapEl);if(m)m.hide();}inicializarTabelaAnotacoes();});}
    $('#tabelaAnotacoes tbody').on('show.bs.dropdown','.dropdown',function(e){const $dr=$(this);const $m=$dr.find('.dropdown-menu');if($m.length){$m.data('bs-dropdown-original-parent',$dr);const $tB=$dr.find('[data-bs-toggle="dropdown"]');$m.data('bs-dropdown-toggle-button',$tB);$('body').append($m.detach());const i=bootstrap.Dropdown.getInstance($tB[0]);if(i&&typeof i.update==='function')i.update();else{const tr=$tB[0].getBoundingClientRect();const mh=$m.outerHeight();const mw=$m.outerWidth();const wh=$(window).height();const ww=$(window).width();let t=tr.bottom;if(t+mh>wh)t=tr.top-mh;if(t<0)t=0;let l=tr.left;if($m.hasClass('dropdown-menu-end'))l=tr.right-mw;if(l+mw>ww)l=ww-mw-5;if(l<0)l=5;$m.css({position:'fixed',top:t+'px',left:l+'px',right:'auto',bottom:'auto'});}}});
    $('body').on('hide.bs.dropdown','.dropdown-menu',function(e){const $m=$(this);const $op=$m.data('bs-dropdown-original-parent');if($op&&$op.length&&$m.parent().is('body')){$op.append($m.detach());$m.css({position:'',top:'',left:'',right:'',bottom:''}).removeData('bs-dropdown-original-parent').removeData('bs-dropdown-toggle-button');}});
    const quickAddBtn=document.getElementById('quickAddAnotacaoSidebarBtn');if(quickAddBtn){quickAddBtn.addEventListener('click',function(e){e.preventDefault();abrirModalFormAnotacao(false);});}
    document.querySelectorAll('dialog .btn-close-custom,dialog .btn-modal-cancel,dialog .btn-modal-ok').forEach(b=>{b.addEventListener('click',(e)=>{e.preventDefault();const d=b.closest('dialog');if(d&&typeof d.close==='function')d.close();});});
    if(modalAnotacaoBootstrapEl){modalAnotacaoBootstrapEl.addEventListener('hidden.bs.modal',function(){const ed=tinymce.get('anotacaoConteudoInput');if(ed)ed.destroy();});}

    // --- INICIALIZAÇÃO DA PÁGINA ---
    inicializarTabelaAnotacoes(); 
    console.log("anotacao.js carregado e inicializado.");
});
