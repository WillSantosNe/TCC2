document.addEventListener("DOMContentLoaded", function () {
    // --- SELETORES DE ELEMENTOS ---

    // Para o <dialog id="modalTarefa"> (modal principal da página de Tarefas)
    const modalTarefaDialog = document.querySelector("#modalTarefa"); 
    const abrirModalNovaTarefaBtnOriginal = document.querySelector("#abrirModalNovaTarefa"); // Botão original (mesmo que escondido no HTML)
    const fecharModalTarefaBtn = document.querySelector("#fecharModalTarefa"); 
    const cancelarModalTarefaBtn = document.querySelector("#cancelarModalTarefa"); 
    const formTarefaDialog = document.querySelector("#formTarefa"); 
    
    // IDs dos campos DENTRO do <dialog id="modalTarefa"> - CORRIGIDOS
    const modalTarefaLabel = document.querySelector("#modalTarefaLabel"); 
    const tarefaTituloInput = document.getElementById('tarefaTitulo');     
    const tarefaDisciplinaSelect = document.getElementById('tarefaDisciplina'); 
    const tarefaTipoSelect = document.getElementById('tarefaTipo');       
    const tarefaDataEntregaInput = document.getElementById('tarefaDataEntrega'); 
    const tarefaHorarioEntregaInput = document.getElementById('tarefaHorarioEntrega'); 
    const tarefaStatusSelect = document.getElementById('tarefaStatus');     
    const tarefaDescricaoInput = document.getElementById('tarefaDescricao');   

    // --- SELETORES PARA MODAL DE DETALHES (dialog) ---
    const modalDetalhesDialog = document.querySelector("#modalDetalhesTarefa");
    const fecharModalDetalhesBtn = document.querySelector("#fecharModalDetalhesTarefa");
    const okModalDetalhesBtn = document.querySelector("#okModalDetalhesTarefa");
    const modalDetalhesConteudo = document.querySelector("#modalDetalhesTarefaConteudo");
    const modalDetalhesTarefaLabel = document.querySelector("#modalDetalhesTarefaLabel");


    // --- SELETORES PARA NOVOS MODAIS BOOTSTRAP (BOTÕES RÁPIDOS DA SIDEBAR) ---
    const modalDisciplinaAdicaoRapida = document.getElementById('modalDisciplinaAdicaoRapida');
    const formDisciplinaAdicaoRapida = document.getElementById('formDisciplinaAdicaoRapida');
    const rapidaDisciplinaNomeInput = document.getElementById('rapidaDisciplinaNome');
    const rapidaDisciplinaProfessorInput = document.getElementById('rapidaDisciplinaProfessor');
    const rapidaDisciplinaDescricaoTextarea = document.getElementById('rapidaDisciplinaDescricao');

    const modalTarefaAdicaoRapida = document.getElementById('modalTarefaAdicaoRapida');
    const formTarefaAdicaoRapida = document.getElementById('formTarefaAdicaoRapida');
    const rapidaTarefaTituloInput = document.getElementById('rapidaTarefaTitulo');
    const rapidaTarefaDescricaoTextarea = document.getElementById('rapidaTarefaDescricao');
    const rapidaTarefaDataEntregaInput = document.getElementById('rapidaTarefaDataEntrega');
    const rapidaTarefaTipoSelect = document.getElementById('rapidaTarefaTipo');
    
    const modalAnotacaoAdicaoRapida = document.getElementById('modalAnotacaoAdicaoRapida');
    const formAnotacaoAdicaoRapida = document.getElementById('formAnotacaoAdicaoRapida');
    const rapidaAnotacaoTituloInput = document.getElementById('rapidaAnotacaoTituloInput');
    const rapidaAnotacaoDisciplinaSelect = document.getElementById('rapidaAnotacaoDisciplinaSelect');
    const rapidaAnotacaoAtividadeSelect = document.getElementById('rapidaAnotacaoAtividadeSelect');
    const rapidaAnotacaoConteudoInputId = 'rapidaAnotacaoConteudoInput'; 
    const salvarAnotacaoRapidaBtn = document.getElementById('salvarAnotacaoRapidaBtn');

    let tabelaTarefasDt;
    let resizeDebounceTimer;

    const listaDisciplinas = [
        { id: "ART101", nome: "Fundamentos de Design Gráfico – ART101" }, { id: "ITD201", nome: "Web Design Avançado – ITD201" }, { id: "UXD301", nome: "Princípios de UX/UI Design – UXD301" }, { id: "ANI301", nome: "Técnicas de Animação 3D – ANI301" }, { id: "HAR202", nome: "História da Arte – HAR202" }, { id: "PHO110", nome: "Fotografia Digital – PHO110" }, { id: "CCO200", nome: "Programação Orientada a Objetos – CCO200" }, { id: "CCO210", nome: "Banco de Dados – CCO210" }, { id: "CCO300", nome: "Redes de Computadores – CCO300" }, { id: "CCO401", nome: "Inteligência Artificial – CCO401" }, { id: "CCO310", nome: "Engenharia de Software – CCO310" }, { id: "UXD205", nome: "Design de Interação – UXD205" }, { id: "MKT300", nome: "Marketing Digital – MKT300" }, { id: "MOB400", nome: "Desenvolvimento Mobile – MOB400" }, { id: "SEG500", nome: "Segurança da Informação – SEG500" },
    ];

    let listaTarefas = [
        { id: "T001", titulo: "Estudar para Prova de Fundamentos de Design Gráfico", disciplinaId: "ART101", tipo: "Prova", dataEntrega: "2025-01-25", horarioEntrega: "19:30", status: "Concluída", descricao: "Revisar capítulos 1 a 5 e slides da aula 3. Local: Design Studio A.", anotacoesVinculadas: [ { id: "A001", titulo: "Resumo Cap. 1-2", conteudo: "Principios basicos de design." },{ id: "A002", titulo: "Dúvidas Prova", conteudo: "Questões sobre cor e tipografia." }]}, { id: "T002", titulo: "Entregar Projeto de UX/UI Design", disciplinaId: "UXD301", tipo: "Tarefa", dataEntrega: "2025-03-10", horarioEntrega: "23:59", status: "Agendada", descricao: "Finalizar protótipo de alta fidelidade e preparar apresentação. Equipe: João, Maria.", anotacoesVinculadas: []}, { id: "T003", titulo: "Fazer Leitura do Capítulo 3", disciplinaId: "CCO200", tipo: "Tarefa", dataEntrega: "2025-03-05", horarioEntrega: "09:00", status: "A Fazer", descricao: "Ler sobre classes e objetos em POO.", anotacoesVinculadas: []}, { id: "T004", titulo: "Preparar apresentação para a banca", disciplinaId: "", tipo: "Tarefa", dataEntrega: "2025-06-15", horarioEntrega: "10:00", status: "Em Andamento", descricao: "Reunir todos os materiais do TCC e criar slides. Não pertence a uma disciplina específica.", anotacoesVinculadas: []}
    ];
    
    let listaAnotacoes = [];

    function displayFieldError(inputElement, message) {
        if (!inputElement) { console.warn("displayFieldError: inputElement é nulo para mensagem:", message); return; }
        clearFieldError(inputElement);
        inputElement.classList.add('is-invalid');
        const inputWrapper = inputElement.closest('.input-wrapper');
        let feedbackContainer = inputElement.parentElement;
        if (inputWrapper) {
            feedbackContainer = inputWrapper;
        }
        if (feedbackContainer) { // Adicionada verificação para feedbackContainer
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'invalid-feedback d-block';
            feedbackContainer.appendChild(feedbackDiv); 
            feedbackDiv.textContent = message;
        }
    }

    function clearFieldError(inputElement) {
        if (!inputElement) return;
        inputElement.classList.remove('is-invalid');
        const inputWrapper = inputElement.closest('.input-wrapper');
        let feedbackContainer = inputElement.parentElement;
        if (inputWrapper) {
            feedbackContainer = inputWrapper;
        }
        if (feedbackContainer) { // Adicionada verificação
            const feedbackElement = feedbackContainer.querySelector('.invalid-feedback.d-block');
            if (feedbackElement) {
                feedbackElement.remove();
            }
        }
    }
    
    function popularSelectComOpcoes(selectElement, opcoes, valorPadraoTexto = "Selecione...", valorPadrao = "") {
        if (!selectElement) { /* console.warn("popularSelectComOpcoes: selectElement é nulo para:", valorPadraoTexto); */ return; } // Comentado para reduzir logs
        const valorAnterior = selectElement.value;
        selectElement.innerHTML = `<option value="${valorPadrao}" ${!valorPadrao && !opcoes.some(op => op.id === valorAnterior) ? 'disabled selected' : ''}>${valorPadraoTexto}</option>`; 
        opcoes.forEach(opcao => {
            const optionElement = new Option(opcao.nome, opcao.id);
            selectElement.add(optionElement);
        });
        if (opcoes.some(op => op.id === valorAnterior) || valorAnterior === valorPadrao ) {
            selectElement.value = valorAnterior;
        }
    }
    
    function popularDisciplinasEmTodosOsSelects() {
        const selectsDeDisciplina = [
            tarefaDisciplinaSelect, 
            rapidaAnotacaoDisciplinaSelect, 
        ];
        selectsDeDisciplina.forEach(select => {
            if (select) {
                popularSelectComOpcoes(select, listaDisciplinas, "Selecione... (Opcional)", "");
            }
        });
    }

    function popularAtividadesNoSelectAnotacao() {
        if (!rapidaAnotacaoAtividadeSelect) return;
        const atividadesParaSelect = listaTarefas.map(tarefa => ({ id: tarefa.id, nome: tarefa.titulo }));
        popularSelectComOpcoes(rapidaAnotacaoAtividadeSelect, atividadesParaSelect, "Nenhuma atividade vinculada", "");
    }

    // --- LÓGICA PARA O <dialog id="modalTarefa"> (MODAL PRINCIPAL DA PÁGINA) ---
    function validateFormTarefaPrincipal() { 
        let isValid = true;
        const fieldsToValidate = [
            { element: tarefaTituloInput, message: "Por favor, informe o título da tarefa." },
            { element: tarefaTipoSelect, message: "Por favor, selecione o tipo da tarefa." },
            { element: tarefaDataEntregaInput, message: "Por favor, informe a data de entrega." },
            { element: tarefaStatusSelect, message: "Por favor, selecione o status." }
        ];
        fieldsToValidate.forEach(field => {
            if (!field.element) { 
                console.warn(`validateFormTarefaPrincipal: Elemento de validação não encontrado (esperado para '${field.message}')`);
                isValid = false; 
                return; 
            }
            clearFieldError(field.element);
            if (!field.element.value || (field.element.value === "" && field.element.tagName === "SELECT")) {
                displayFieldError(field.element, field.message);
                isValid = false;
            }
        });
        return isValid;
    }

    function abrirModalFormTarefaPrincipal(isEditMode = false, dadosTarefa = null, targetTr = null) {
        if (!formTarefaDialog || !modalTarefaDialog || !modalTarefaLabel) {
            console.error("Elementos cruciais do <dialog id='modalTarefa'> não encontrados: #formTarefa, #modalTarefa, ou #modalTarefaLabel");
            return;
        }
        formTarefaDialog.reset();
        const fieldsToClearValidation = [
            tarefaTituloInput, tarefaDisciplinaSelect, tarefaTipoSelect, tarefaDataEntregaInput,
            tarefaHorarioEntregaInput, tarefaStatusSelect, tarefaDescricaoInput
        ];
        fieldsToClearValidation.forEach(el => { if (el) clearFieldError(el); });

        delete formTarefaDialog.dataset.tarefaId;
        delete formTarefaDialog.dataset.rowIndex;

        popularDisciplinasEmTodosOsSelects(); 

        modalTarefaLabel.textContent = isEditMode ? "Editar Tarefa" : "Adicionar Tarefa";

        if (isEditMode && dadosTarefa) {
            if(tarefaTituloInput) tarefaTituloInput.value = dadosTarefa.titulo || '';
            if(tarefaDisciplinaSelect) tarefaDisciplinaSelect.value = dadosTarefa.disciplinaId || '';
            if(tarefaTipoSelect) tarefaTipoSelect.value = dadosTarefa.tipo || '';
            if(tarefaDataEntregaInput) tarefaDataEntregaInput.value = dadosTarefa.dataEntrega || '';
            if(tarefaHorarioEntregaInput) tarefaHorarioEntregaInput.value = dadosTarefa.horarioEntrega || '';
            if(tarefaStatusSelect) tarefaStatusSelect.value = dadosTarefa.status || 'A Fazer';
            if(tarefaDescricaoInput) tarefaDescricaoInput.value = dadosTarefa.descricao || '';
            formTarefaDialog.dataset.tarefaId = dadosTarefa.id;
            if (tabelaTarefasDt && targetTr) {
                formTarefaDialog.dataset.rowIndex = tabelaTarefasDt.row(targetTr).index();
            }
        } else {
            if(tarefaTituloInput) tarefaTituloInput.value = '';
            if(tarefaDisciplinaSelect) tarefaDisciplinaSelect.value = "";
            if(tarefaTipoSelect) tarefaTipoSelect.value = ""; 
            if(tarefaDataEntregaInput) tarefaDataEntregaInput.value = '';
            if(tarefaHorarioEntregaInput) tarefaHorarioEntregaInput.value = '';
            if(tarefaStatusSelect) tarefaStatusSelect.value = "A Fazer";
            if(tarefaDescricaoInput) tarefaDescricaoInput.value = '';
        }
        modalTarefaDialog.showModal();
    }

    function fecharModalFormTarefaPrincipal() { 
        if (!modalTarefaDialog || !formTarefaDialog) return;
        modalTarefaDialog.close();
        formTarefaDialog.reset();
        const fieldsToClearValidation = [
            tarefaTituloInput, tarefaDisciplinaSelect, tarefaTipoSelect, tarefaDataEntregaInput,
            tarefaHorarioEntregaInput, tarefaStatusSelect, tarefaDescricaoInput
        ];
        fieldsToClearValidation.forEach(el => { if (el) clearFieldError(el); });
    }

    if (abrirModalNovaTarefaBtnOriginal) { 
        abrirModalNovaTarefaBtnOriginal.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModalFormTarefaPrincipal();
        });
    }
    if (fecharModalTarefaBtn) fecharModalTarefaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormTarefaPrincipal(); });
    if (cancelarModalTarefaBtn) cancelarModalTarefaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormTarefaPrincipal(); });
    if (modalTarefaDialog) modalTarefaDialog.addEventListener("click", e => {
        if (e.target === modalTarefaDialog) {
            fecharModalFormTarefaPrincipal();
        }
    });
    
    if (formTarefaDialog) { 
        formTarefaDialog.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!validateFormTarefaPrincipal()) return;

            const tarefaIdAttr = formTarefaDialog.dataset.tarefaId;
            const isEditMode = !!tarefaIdAttr && tarefaIdAttr !== 'undefined';
            const tarefaId = isEditMode ? tarefaIdAttr : 'TDialog-' + new Date().getTime(); 
            const rowIndex = formTarefaDialog.dataset.rowIndex !== undefined ? parseInt(formTarefaDialog.dataset.rowIndex) : undefined;

            const disciplinaSelecionadaObj = listaDisciplinas.find(d => d.id === (tarefaDisciplinaSelect ? tarefaDisciplinaSelect.value : ''));

            const dadosCompletosTarefa = {
                id: tarefaId,
                titulo: tarefaTituloInput ? tarefaTituloInput.value.trim() : '',
                disciplinaId: tarefaDisciplinaSelect ? tarefaDisciplinaSelect.value : '',
                tipo: tarefaTipoSelect ? tarefaTipoSelect.value : '',
                dataEntrega: tarefaDataEntregaInput ? tarefaDataEntregaInput.value : '',
                horarioEntrega: tarefaHorarioEntregaInput ? tarefaHorarioEntregaInput.value : '',
                status: tarefaStatusSelect ? tarefaStatusSelect.value : 'A Fazer',
                descricao: tarefaDescricaoInput ? tarefaDescricaoInput.value.trim() : '',
                anotacoesVinculadas: isEditMode ? (listaTarefas.find(t => t.id === tarefaId)?.anotacoesVinculadas || []) : []
            };
            if (dadosCompletosTarefa.disciplinaId && disciplinaSelecionadaObj) {
                dadosCompletosTarefa.disciplinaNome = disciplinaSelecionadaObj.nome;
            } else {
                dadosCompletosTarefa.disciplinaNome = '-';
            }

            salvarOuAtualizarTarefaNaListaEDataTable(dadosCompletosTarefa, isEditMode, rowIndex);
            fecharModalFormTarefaPrincipal();
        });
    }

    // --- LÓGICA PARA MODAIS RÁPIDOS (BOOTSTRAP) ---
    // (Mantida como na sua última versão do JS, que já estava correta para estes)
    if (formDisciplinaAdicaoRapida) {
        formDisciplinaAdicaoRapida.addEventListener('submit', function(e) {
            e.preventDefault(); let isValid = true;
            if (rapidaDisciplinaNomeInput) { clearFieldError(rapidaDisciplinaNomeInput); if (!rapidaDisciplinaNomeInput.value.trim()) { displayFieldError(rapidaDisciplinaNomeInput, "Nome da disciplina é obrigatório."); isValid = false; } } else { isValid = false; console.error("#rapidaDisciplinaNome não encontrado."); }
            if (!isValid) return;
            const novaDisciplina = { id: 'DISC-RAPIDA-' + new Date().getTime(), nome: rapidaDisciplinaNomeInput.value.trim(), professor: rapidaDisciplinaProfessorInput ? rapidaDisciplinaProfessorInput.value.trim() : '', descricao: rapidaDisciplinaDescricaoTextarea ? rapidaDisciplinaDescricaoTextarea.value.trim() : '' };
            listaDisciplinas.push(novaDisciplina);
            formDisciplinaAdicaoRapida.reset(); bootstrap.Modal.getInstance(modalDisciplinaAdicaoRapida).hide(); popularDisciplinasEmTodosOsSelects();
        });
    }
    if (formTarefaAdicaoRapida) {
        formTarefaAdicaoRapida.addEventListener('submit', function(e) {
            e.preventDefault(); let isValid = true;
            const fieldsToValidate = [ { element: rapidaTarefaTituloInput, message: "Título é obrigatório." }, { element: rapidaTarefaDataEntregaInput, message: "Data de entrega é obrigatória." }, { element: rapidaTarefaTipoSelect, message: "Tipo é obrigatório." } ];
            fieldsToValidate.forEach(field => { if (!field.element) {isValid=false; return;} clearFieldError(field.element); if (!field.element.value || (field.element.tagName === "SELECT" && field.element.value === "")) { displayFieldError(field.element, field.message); isValid = false; }});
            if (!isValid) return;
            const novaTarefaRapida = { id: 'TRF-RAPIDA-' + new Date().getTime(), titulo: rapidaTarefaTituloInput.value.trim(), descricao: rapidaTarefaDescricaoTextarea ? rapidaTarefaDescricaoTextarea.value.trim() : '', dataEntrega: rapidaTarefaDataEntregaInput.value, tipo: rapidaTarefaTipoSelect.value, status: 'A Fazer', disciplinaId: '', disciplinaNome: '-', anotacoesVinculadas: [] };
            salvarOuAtualizarTarefaNaListaEDataTable(novaTarefaRapida, false);
            formTarefaAdicaoRapida.reset(); bootstrap.Modal.getInstance(modalTarefaAdicaoRapida).hide();
        });
    }
    if (modalAnotacaoAdicaoRapida) {
        if (typeof tinymce !== 'undefined' && document.getElementById(rapidaAnotacaoConteudoInputId)) {
            tinymce.init({ selector: `#${rapidaAnotacaoConteudoInputId}`, plugins: 'advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount', toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                setup: function (editor) {
                    editor.on('OpenWindow', function (e) {
                        const targetElement = e.target.closest('.tox-dialog');
                        if (targetElement && modalAnotacaoAdicaoRapida) {
                            const zIndexModal = parseInt(getComputedStyle(modalAnotacaoAdicaoRapida).zIndex || '1055');
                            targetElement.style.zIndex = zIndexModal + 50;
                        }
                    });
                }
            });
        }
        modalAnotacaoAdicaoRapida.addEventListener('show.bs.modal', function () {
            popularDisciplinasEmTodosOsSelects(); popularAtividadesNoSelectAnotacao();
            if (tinymce.get(rapidaAnotacaoConteudoInputId)) tinymce.get(rapidaAnotacaoConteudoInputId).setContent('');
            if (formAnotacaoAdicaoRapida) formAnotacaoAdicaoRapida.reset(); 
            if (rapidaAnotacaoTituloInput) clearFieldError(rapidaAnotacaoTituloInput);
        });
        if (salvarAnotacaoRapidaBtn) {
            salvarAnotacaoRapidaBtn.addEventListener('click', function() {
                let isValid = true;
                if (rapidaAnotacaoTituloInput) { clearFieldError(rapidaAnotacaoTituloInput); if (!rapidaAnotacaoTituloInput.value.trim()) { displayFieldError(rapidaAnotacaoTituloInput, "Título da anotação é obrigatório."); isValid = false; } } else { isValid = false; }
                if (!isValid) return;
                const conteudoAnotacao = tinymce.get(rapidaAnotacaoConteudoInputId) ? tinymce.get(rapidaAnotacaoConteudoInputId).getContent() : '';
                const novaAnotacao = { id: 'ANOT-RAPIDA-' + new Date().getTime(), titulo: rapidaAnotacaoTituloInput.value.trim(), disciplinaId: rapidaAnotacaoDisciplinaSelect.value, atividadeId: rapidaAnotacaoAtividadeSelect.value, conteudo: conteudoAnotacao, dataCriacao: new Date().toISOString(), dataModificacao: new Date().toISOString() };
                listaAnotacoes.push(novaAnotacao);
                if (formAnotacaoAdicaoRapida) formAnotacaoAdicaoRapida.reset(); 
                if (tinymce.get(rapidaAnotacaoConteudoInputId)) tinymce.get(rapidaAnotacaoConteudoInputId).setContent(''); 
                bootstrap.Modal.getInstance(modalAnotacaoAdicaoRapida).hide();
            });
        }
    }

    function salvarOuAtualizarTarefaNaListaEDataTable(dadosTarefa, isEditMode, rowIndex) {
        if (!tabelaTarefasDt) { console.error("DataTable não inicializada."); return; }
        const dataHoraFormatadaParaTabela = formatarDataHoraParaTabela(dadosTarefa.dataEntrega, dadosTarefa.horarioEntrega);
        const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(dadosTarefa.status)}">${dadosTarefa.status}</span>`;
        const tipoBadgeHtml = `<span class="badge ${getTipoBadgeClass(dadosTarefa.tipo)}">${dadosTarefa.tipo}</span>`;
        const dropdownHtml = `
            <div class="dropdown">
                <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da tarefa" data-bs-popper-boundary="window">
                    <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item btn-detalhar-tarefa" href="#" data-tarefa-id="${dadosTarefa.id}"><i class="bi bi-eye me-2"></i>Detalhar Tarefa</a></li>
                    <li><a class="dropdown-item btn-marcar-concluida" href="#" data-tarefa-id="${dadosTarefa.id}"><i class="bi bi-check-circle me-2"></i>Marcar Concluída</a></li>
                    <li><a class="dropdown-item btn-marcar-pendente" href="#" data-tarefa-id="${dadosTarefa.id}"><i class="bi bi-arrow-counterclockwise me-2"></i>Marcar Pendente</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item btn-edit-tarefa" href="#" data-tarefa-id="${dadosTarefa.id}"><i class="bi bi-pencil-square me-2"></i>Editar Tarefa</a></li>
                    <li><a class="dropdown-item btn-remover-tarefa text-danger" href="#" data-tarefa-id="${dadosTarefa.id}"><i class="bi bi-trash me-2"></i>Remover Tarefa</a></li>
                </ul>
            </div>`;
        const dadosLinhaTabela = [ '', dadosTarefa.titulo, dadosTarefa.disciplinaNome || '-', tipoBadgeHtml, dataHoraFormatadaParaTabela, statusBadgeHtml, dropdownHtml ];
        let targetRowNode;
        if (isEditMode && rowIndex !== undefined && tabelaTarefasDt.row(rowIndex).node()) {
            targetRowNode = tabelaTarefasDt.row(rowIndex).data(dadosLinhaTabela).draw(false).node();
            const indexLista = listaTarefas.findIndex(t => t.id === dadosTarefa.id);
            if(indexLista !== -1) listaTarefas[indexLista] = dadosTarefa;
        } else {
            targetRowNode = tabelaTarefasDt.row.add(dadosLinhaTabela).draw(false).node();
            listaTarefas.push(dadosTarefa);
        }
        if (targetRowNode) { $(targetRowNode).data('completo', dadosTarefa); }
        tabelaTarefasDt.columns.adjust().responsive.recalc();
    }

    function inicializarDataTable() {
        if (!window.jQuery || !$.fn.DataTable) { console.error("jQuery ou DataTables não carregado!"); return null; }
        if ($.fn.DataTable.isDataTable('#tabelaTarefas')) { $('#tabelaTarefas').DataTable().destroy(); $('#tabelaTarefas tbody').empty(); }

        tabelaTarefasDt = $('#tabelaTarefas').DataTable({
            responsive: { details: { type: 'column', target: 0 } },
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto me-md-auto"f><"col-12 col-md-auto dt-buttons-container">>t<"row mt-3 align-items-center"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7 dataTables_paginate_wrapper"p>>',
            paging: false, scrollY: '450px', scrollCollapse: true, lengthChange: false, 
            language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar tarefas...", info: "Total de _TOTAL_ tarefas", infoEmpty: "Nenhuma tarefa encontrada", infoFiltered: "(filtrado de _MAX_ tarefas)", paginate: { first: "Primeiro", last: "Último", next: "Próximo", previous: "Anterior"}},
            columnDefs: [ { orderable: false, className: 'dtr-control', targets: 0 }, { responsivePriority: 1, targets: 1, className: 'dt-column-title' }, { responsivePriority: 1, targets: 2, className: 'dt-column-disciplina' }, { responsivePriority: 2, targets: 3 }, { responsivePriority: 3, targets: 4 }, { responsivePriority: 4, targets: 5 }, { orderable: false, className: "dt-actions-column no-export", targets: -1, responsivePriority: 10000 } ],
            data: listaTarefas.map(tarefa => {
                const disciplinaObj = listaDisciplinas.find(d => d.id === tarefa.disciplinaId);
                const disciplinaNome = disciplinaObj ? disciplinaObj.nome : '-';
                const dataHoraFormatada = formatarDataHoraParaTabela(tarefa.dataEntrega, tarefa.horarioEntrega);
                const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(tarefa.status)}">${tarefa.status}</span>`;
                const tipoBadgeHtml = `<span class="badge ${getTipoBadgeClass(tarefa.tipo)}">${tarefa.tipo}</span>`;
                const dropdownHtml = `
                    <div class="dropdown">
                        <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da tarefa" data-bs-popper-boundary="window">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item btn-detalhar-tarefa" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-eye me-2"></i>Detalhar Tarefa</a></li>
                            <li><a class="dropdown-item btn-marcar-concluida" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-check-circle me-2"></i>Marcar Concluída</a></li>
                            <li><a class="dropdown-item btn-marcar-pendente" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-arrow-counterclockwise me-2"></i>Marcar Pendente</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item btn-edit-tarefa" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-pencil-square me-2"></i>Editar Tarefa</a></li>
                            <li><a class="dropdown-item btn-remover-tarefa text-danger" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-trash me-2"></i>Remover Tarefa</a></li>
                        </ul>
                    </div>`;
                return ['', tarefa.titulo, disciplinaNome, tipoBadgeHtml, dataHoraFormatada, statusBadgeHtml, dropdownHtml ];
            }),
            initComplete: function (settings, json) {
                const api = this.api();
                const searchInput = $('#tabelaTarefas_filter input');
                searchInput.addClass('form-control form-control-sm').attr('aria-label', 'Buscar tarefas na tabela');
                $('#tabelaTarefas_filter label').contents().filter(function() { return this.nodeType === 3; }).remove();

                const buttonsContainer = $('.dt-buttons-container');
                if (abrirModalNovaTarefaBtnOriginal && buttonsContainer.length) { // Verifica se o botão original existe
                    if($('#abrirModalNovaTarefaDt').length === 0) { 
                        const abrirModalNovaTarefaBtnClone = abrirModalNovaTarefaBtnOriginal.cloneNode(true);
                        abrirModalNovaTarefaBtnClone.id = 'abrirModalNovaTarefaDt'; 
                        $(abrirModalNovaTarefaBtnClone).off('click').on('click', (e) => {
                            e.preventDefault();
                            abrirModalFormTarefaPrincipal();
                        });
                        buttonsContainer.append(abrirModalNovaTarefaBtnClone);
                    }
                    abrirModalNovaTarefaBtnOriginal.style.display = 'none'; // Esconde o original APÓS clonar
                } else if (buttonsContainer.length && !abrirModalNovaTarefaBtnOriginal) {
                     // Se o botão original foi removido do HTML, criamos um dinamicamente para o header da tabela
                    if($('#abrirModalNovaTarefaDt').length === 0) {
                        const novoBotaoAdicionar = $(`<button class="btn btn-primary btn-add-task" id="abrirModalNovaTarefaDt"><i class="bi bi-plus-lg me-sm-2"></i><span class="d-none d-sm-inline">Adicionar Tarefa</span></button>`);
                        novoBotaoAdicionar.on('click', (e) => { e.preventDefault(); abrirModalFormTarefaPrincipal(); });
                        buttonsContainer.append(novoBotaoAdicionar);
                    }
                }


                const filterHtml = `
                    <select id="filterTipoTarefa" class="form-select dt-filter-select">
                        <option value="">Todos os Tipos</option> <option value="Tarefa">Tarefa</option> <option value="Prova">Prova</option>
                    </select>
                    <select id="filterDisciplina" class="form-select dt-filter-select">
                        <option value="">Todas as Disciplinas</option>
                    </select>`;
                buttonsContainer.prepend(filterHtml); 

                const filterDisciplinaSelect = $('#filterDisciplina');
                listaDisciplinas.forEach(disciplina => { filterDisciplinaSelect.append(new Option(disciplina.nome, disciplina.nome)); });
                $('#filterTipoTarefa').on('change', function() { const tipo = $(this).val(); api.column(3).search(tipo ? '^' + tipo.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$' : '', true, false).draw(); });
                $('#filterDisciplina').on('change', function() { const disciplina = $(this).val(); api.column(2).search(disciplina ? '^' + disciplina.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$' : '', true, false).draw(); });
                
                api.rows().every(function () {
                    const node = this.node();
                    const dataDaLinha = this.data();
                    if (dataDaLinha && dataDaLinha.length > 0) {
                        const dropdownButton = $(node).find('.btn-detalhar-tarefa');
                        if (dropdownButton.length > 0) {
                            const tarefaIdNoDropdown = dropdownButton.data('tarefa-id');
                            const tarefaCompleta = listaTarefas.find(t => t.id === tarefaIdNoDropdown);
                            if (tarefaCompleta) { $(node).data('completo', tarefaCompleta); }
                        }
                    }
                });

                $('#tabelaTarefas tbody').off('show.bs.dropdown hide.bs.dropdown');
                $('body').off('show.bs.dropdown hide.bs.dropdown', '.dropdown-menu');
                $('#tabelaTarefas tbody').on('show.bs.dropdown', '.dropdown', function (e) {
                    const $dropdownMenu = $(this).find('.dropdown-menu');
                    $dropdownMenu.data('bs-dropdown-original-parent', $(this));
                    $dropdownMenu.data('bs-dropdown-toggle-button', $(e.relatedTarget || e.target));
                    $dropdownMenu.appendTo('body');
                    const instance = bootstrap.Dropdown.getInstance(e.relatedTarget || e.target);
                    if (instance && instance._popper) { instance._popper.update(); }
                });
                $('body').on('hide.bs.dropdown', '.dropdown-menu', function () {
                    const $dropdownMenu = $(this);
                    const $originalParent = $dropdownMenu.data('bs-dropdown-original-parent');
                    if ($originalParent && !$dropdownMenu.parent().is($originalParent)) {
                        $dropdownMenu.prependTo($originalParent);
                        $dropdownMenu.removeData('bs-dropdown-original-parent');
                        $dropdownMenu.removeData('bs-dropdown-toggle-button');
                    }
                });
            }
        });
        $(window).off('resize.dtTarefasGlobal').on('resize.dtTarefasGlobal', function () {
            clearTimeout(resizeDebounceTimer);
            resizeDebounceTimer = setTimeout(function () {
                if (tabelaTarefasDt) tabelaTarefasDt.columns.adjust().responsive.recalc();
            }, 250);
        });
        return tabelaTarefasDt;
    }

    function getDetalhesModalElements() {
        return {
            modalDetalhesElem: document.querySelector("#modalDetalhesTarefa"),
            fecharModalDetalhesBtnElem: document.querySelector("#fecharModalDetalhesTarefa"),
            okModalDetalhesBtnElem: document.querySelector("#okModalDetalhesTarefa"),
            modalDetalhesConteudoElem: document.querySelector("#modalDetalhesTarefaConteudo"),
            modalDetalhesTarefaLabelElem: document.querySelector("#modalDetalhesTarefaLabel")
        };
    }
    function abrirModalDeDetalhesTarefa(dadosCompletosTarefa) {
        const { modalDetalhesElem, modalDetalhesConteudoElem, modalDetalhesTarefaLabelElem } = getDetalhesModalElements();
        if (!modalDetalhesElem || !modalDetalhesConteudoElem || !modalDetalhesTarefaLabelElem) { console.error("Elementos do modal de detalhes não encontrados."); return; }
        modalDetalhesTarefaLabelElem.textContent = "Detalhes da Tarefa";
        const disciplinaObj = listaDisciplinas.find(d => d.id === dadosCompletosTarefa.disciplinaId);
        const disciplinaNome = disciplinaObj ? disciplinaObj.nome : (dadosCompletosTarefa.disciplinaId ? 'Disciplina não encontrada' : 'N/A');
        const dataHoraFormatada = formatarDataHoraParaTabela(dadosCompletosTarefa.dataEntrega, dadosCompletosTarefa.horarioEntrega);
        const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(dadosCompletosTarefa.status)}">${dadosCompletosTarefa.status}</span>`;
        const tipoBadgeHtml = `<span class="badge ${getTipoBadgeClass(dadosCompletosTarefa.tipo)}">${dadosCompletosTarefa.tipo}</span>`;
        let anotacoesHtml = `<li class="list-group-item">Nenhuma anotação vinculada.</li>`;
        if (dadosCompletosTarefa.anotacoesVinculadas && dadosCompletosTarefa.anotacoesVinculadas.length > 0) {
            anotacoesHtml = dadosCompletosTarefa.anotacoesVinculadas.map(anotacao => `<li class="list-group-item d-flex justify-content-between align-items-center">${anotacao.titulo}<button class="btn btn-sm btn-outline-secondary btn-ver-anotacao-detalhes" data-anotacao-id="${anotacao.id}">Ver Anotação</button></li>`).join('');
        }
        modalDetalhesConteudoElem.innerHTML = `<dl class="row mb-3"><dt class="col-sm-4">Título:</dt><dd class="col-sm-8">${dadosCompletosTarefa.titulo || '-'}</dd><dt class="col-sm-4">Disciplina:</dt><dd class="col-sm-8">${disciplinaNome}</dd><dt class="col-sm-4">Tipo:</dt><dd class="col-sm-8">${tipoBadgeHtml}</dd><dt class="col-sm-4">Data & Horário:</dt><dd class="col-sm-8">${dataHoraFormatada}</dd><dt class="col-sm-4">Status:</dt><dd class="col-sm-8">${statusBadgeHtml}</dd>${dadosCompletosTarefa.descricao ? `<dt class="col-sm-12 mt-3">Descrição:</dt><dd class="col-sm-12"><pre style="white-space: pre-wrap; word-wrap: break-word;">${dadosCompletosTarefa.descricao.replace(/\n/g, '<br>')}</pre></dd>` : ''}</dl><hr><h6>Anotações Vinculadas</h6><ul id="listaAnotacoesTarefa" class="list-group list-group-flush">${anotacoesHtml}</ul><button class="btn btn-sm btn-primary mt-3" id="addAnotacaoTarefaFromDetails" data-tarefa-id="${dadosCompletosTarefa.id}" data-disciplina-id="${dadosCompletosTarefa.disciplinaId || ''}">Adicionar Anotação</button><hr><h6>Compartilhamento</h6><p>Permite gerenciar quem colabora nesta tarefa e suas permissões.</p><button class="btn btn-sm btn-info mt-2" id="gerenciarCompartilhamentoTarefaFromDetails">Gerenciar Compartilhamento</button>`;
        
        $(modalDetalhesConteudoElem).find('#addAnotacaoTarefaFromDetails').off('click').on('click', function() { 
            const tarefaIdParaVincular = $(this).data('tarefa-id');
            const disciplinaIdParaVincular = $(this).data('disciplina-id');
            const modalAnotacaoBS = bootstrap.Modal.getInstance(modalAnotacaoAdicaoRapida) || new bootstrap.Modal(modalAnotacaoAdicaoRapida);
            $(modalAnotacaoAdicaoRapida).one('shown.bs.modal', function() {
                if(rapidaAnotacaoAtividadeSelect && tarefaIdParaVincular) rapidaAnotacaoAtividadeSelect.value = tarefaIdParaVincular;
                if(rapidaAnotacaoDisciplinaSelect && disciplinaIdParaVincular) rapidaAnotacaoDisciplinaSelect.value = disciplinaIdParaVincular;
            });
            modalAnotacaoBS.show();
        });
        $(modalDetalhesConteudoElem).find('#gerenciarCompartilhamentoTarefaFromDetails').off('click').on('click', function() { alert(`Funcionalidade: Abrir tela/modal de gerenciamento de compartilhamento para a Tarefa: ${dadosCompletosTarefa.titulo}`);});
        $(modalDetalhesConteudoElem).find('.btn-ver-anotacao-detalhes').each(function() { $(this).off('click').on('click', function() { const anotacaoId = $(this).data('anotacao-id'); alert(`Funcionalidade: Ver detalhes da Anotação ID: ${anotacaoId}`); }); });
        if (modalDetalhesDialog && typeof modalDetalhesDialog.showModal === 'function') modalDetalhesDialog.showModal();
        else if (window.bootstrap && modalDetalhesDialog) { const bsModal = bootstrap.Modal.getInstance(modalDetalhesDialog) || new bootstrap.Modal(modalDetalhesDialog); bsModal.show(); }
    }

    function fecharModalDeDetalhesTarefa() {
        const { modalDetalhesElem } = getDetalhesModalElements();
        if (modalDetalhesElem && typeof modalDetalhesElem.close === 'function') modalDetalhesElem.close();
        else if (window.bootstrap && modalDetalhesElem) { const bsModal = bootstrap.Modal.getInstance(modalDetalhesElem); if (bsModal) bsModal.hide(); }
    }
    function setupDetalhesModalEventListeners() {
        const { fecharModalDetalhesBtnElem, okModalDetalhesBtnElem, modalDetalhesElem } = getDetalhesModalElements();
        if (fecharModalDetalhesBtnElem) $(fecharModalDetalhesBtnElem).off('click').on('click', (e) => { e.preventDefault(); fecharModalDeDetalhesTarefa(); });
        if (okModalDetalhesBtnElem) $(okModalDetalhesBtnElem).off('click').on('click', (e) => { e.preventDefault(); fecharModalDeDetalhesTarefa(); });
        if (modalDetalhesElem) $(modalDetalhesElem).off('click').on('click', e => { if (e.target === modalDetalhesElem && typeof modalDetalhesElem.close === 'function') fecharModalDeDetalhesTarefa(); });
    }

    $('body').on('click', '.btn-detalhar-tarefa, .btn-marcar-concluida, .btn-marcar-pendente, .btn-edit-tarefa, .btn-remover-tarefa', function (e) {
        e.preventDefault();
        const $clickedItem = $(this);
        const $dropdownMenu = $clickedItem.closest('.dropdown-menu');
        const $originalButton = $dropdownMenu.data('bs-dropdown-toggle-button');
        const hideDropdown = () => { if ($originalButton && $originalButton.length > 0 && window.bootstrap) { const di = bootstrap.Dropdown.getInstance($originalButton[0]); if (di) di.hide(); }};
        let trElement = $originalButton ? $originalButton.closest('tr')[0] : null;
        if (!tabelaTarefasDt || !trElement) { console.warn("Ação na tabela: trElement não encontrado."); hideDropdown(); return; }
        const row = tabelaTarefasDt.row(trElement);
        if (!row || !row.length || !row.node()) { hideDropdown(); return; }
        const dadosCompletosArmazenados = $(trElement).data('completo');
        if (!dadosCompletosArmazenados) { console.error("Dados completos da tarefa não encontrados na linha TR. ID:", $clickedItem.data('tarefa-id')); hideDropdown(); return; }
        if ($clickedItem.hasClass('btn-detalhar-tarefa')) { abrirModalDeDetalhesTarefa(dadosCompletosArmazenados); }
        else if ($clickedItem.hasClass('btn-marcar-concluida')) { if (dadosCompletosArmazenados.status !== 'Concluída') { dadosCompletosArmazenados.status = 'Concluída'; salvarOuAtualizarTarefaNaListaEDataTable(dadosCompletosArmazenados, true, row.index()); } }
        else if ($clickedItem.hasClass('btn-marcar-pendente')) { if (dadosCompletosArmazenados.status !== 'A Fazer') { dadosCompletosArmazenados.status = 'A Fazer'; salvarOuAtualizarTarefaNaListaEDataTable(dadosCompletosArmazenados, true, row.index()); } }
        else if ($clickedItem.hasClass('btn-edit-tarefa')) { abrirModalFormTarefaPrincipal(true, dadosCompletosArmazenados, trElement); }
        else if ($clickedItem.hasClass('btn-remover-tarefa')) { const tituloTarefa = dadosCompletosArmazenados.titulo || "esta tarefa"; if (confirm(`Tem certeza que deseja remover a tarefa "${tituloTarefa}"?`)) { const indexToRemove = listaTarefas.findIndex(t => t.id === dadosCompletosArmazenados.id); if (indexToRemove > -1) listaTarefas.splice(indexToRemove, 1); row.remove().draw(false); } }
        hideDropdown();
    });

    function formatarDataHoraParaTabela(dataStr, horaStr) {
        let formatted = '';
        if (dataStr) { const [year, month, day] = dataStr.split('-'); const dataObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day))); const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]; formatted = `${dataObj.getUTCDate()} ${meses[dataObj.getUTCMonth()]} ${dataObj.getUTCFullYear()}`; }
        if (horaStr) { const [hour, minute] = horaStr.split(':'); let h = parseInt(hour); const ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12; h = h ? h : 12; const formattedTime = `${h}:${String(minute).padStart(2, '0')} ${ampm}`; formatted = formatted ? `${formatted}, ${formattedTime}` : formattedTime; }
        return formatted || '-';
    }
    function getStatusBadgeClass(status) {
        switch (status) { case 'Concluída': return 'bg-success-subtle text-success'; case 'Agendada': case 'Em Andamento': return 'bg-info-subtle text-info'; case 'A Fazer': return 'bg-warning-subtle text-warning'; case 'Atrasada': case 'Cancelada': return 'bg-danger-subtle text-danger'; default: return 'bg-secondary-subtle text-secondary'; }
    }
    function getTipoBadgeClass(tipo) {
        switch (tipo) { case 'Prova': return 'bg-danger-subtle text-danger'; case 'Tarefa': return 'bg-primary-subtle text-primary'; default: return 'bg-light-subtle text-dark'; }
    }

    popularDisciplinasEmTodosOsSelects(); 
    popularAtividadesNoSelectAnotacao(); 
    inicializarDataTable(); 
    setupDetalhesModalEventListeners(); 
});