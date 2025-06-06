document.addEventListener("DOMContentLoaded", function () {
    // --- SELETORES DE ELEMENTOS ---
    const modalTarefaDialog = document.querySelector("#modalTarefa"); 
    const abrirModalNovaTarefaBtnOriginal = document.querySelector("#abrirModalNovaTarefa"); 
    const fecharModalTarefaBtn = document.querySelector("#fecharModalTarefa"); 
    const cancelarModalTarefaBtn = document.querySelector("#cancelarModalTarefa"); 
    const formTarefaDialog = document.querySelector("#formTarefa");
    const modalTarefaLabel = document.querySelector("#modalTarefaLabel");
    const tarefaTituloInput = document.getElementById('tarefaTitulo');
    const tarefaDisciplinaSelect = document.getElementById('tarefaDisciplina');
    const tarefaTipoSelect = document.getElementById('tarefaTipo');
    const tarefaDataEntregaInput = document.getElementById('tarefaDataEntrega');
    const tarefaHorarioEntregaInput = document.getElementById('tarefaHorarioEntrega');
    const tarefaStatusSelect = document.getElementById('tarefaStatus');
    const tarefaDescricaoInput = document.getElementById('tarefaDescricao');
    const modalDetalhesDialog = document.querySelector("#modalDetalhesTarefa");
    const fecharModalDetalhesBtn = document.querySelector("#fecharModalDetalhesTarefa");
    const okModalDetalhesBtn = document.querySelector("#okModalDetalhesTarefa");
    const modalDetalhesConteudo = document.querySelector("#modalDetalhesTarefaConteudo");
    const modalDetalhesTarefaLabel = document.querySelector("#modalDetalhesTarefaLabel");
    const rapidaAnotacaoDisciplinaSelect = document.getElementById('rapidaAnotacaoDisciplinaSelect');
    const rapidaAnotacaoAtividadeSelect = document.getElementById('rapidaAnotacaoAtividadeSelect');

    let tabelaTarefasDt;
    let resizeDebounceTimer;

    // Array com as disciplinas únicas
    const listaDisciplinas = [
        { id: "CS101", nome: "Algoritmos e Estrutura de Dados" },
        { id: "CS102", nome: "Redes de Computadores" },
        { id: "CS103", nome: "Banco de Dados" },
        { id: "CS104", nome: "Inteligência Artificial" },
        { id: "CS105", nome: "Compiladores" }
    ];

    // Array com todas as 20 atividades, exatamente como no Excel
    let listaTarefas = [
        // Algoritmos e Estrutura de Dados
        { id: "T001", titulo: "Complexidade e Estruturas Lineares", disciplinaId: "CS101", tipo: "Prova", dataEntrega: "2025-06-23", horarioEntrega: "19:00", status: "Agendada", descricao: "", anotacoesVinculadas: [] },
       
        // Redes de Computadores
        { id: "T006", titulo: "Camadas de Transporte e Aplicação", disciplinaId: "CS102", tipo: "Prova", dataEntrega: "2025-06-24", horarioEntrega: "21:00", status: "Agendada", descricao: "", anotacoesVinculadas: [] },

        // Banco de Dados
        { id: "T010", titulo: "SQL e Normalização", disciplinaId: "CS103", tipo: "Prova", dataEntrega: "2025-06-25", horarioEntrega: "19:00", status: "Agendada", descricao: "", anotacoesVinculadas: [] },

        // Inteligência Artificial
        { id: "T013", titulo: "Machine Learning e Redes Neurais", disciplinaId: "CS104", tipo: "Prova", dataEntrega: "2025-06-26", horarioEntrega: "21:00", status: "Agendada", descricao: "", anotacoesVinculadas: [] },

        // Compiladores
        { id: "T017", titulo: "Análise Léxica e Sintática", disciplinaId: "CS105", tipo: "Prova", dataEntrega: "2025-06-29", horarioEntrega: "19:00", status: "Agendada", descricao: "", anotacoesVinculadas: [] }, 
    ];
    
    let listaAnotacoes = [];

    function displayFieldError(inputElement, message) {
        if (!inputElement) return;
        clearFieldError(inputElement);
        inputElement.classList.add('is-invalid');
        const inputWrapper = inputElement.closest('.input-wrapper');
        let feedbackContainer = inputElement.parentElement;
        if (inputWrapper) {
            feedbackContainer = inputWrapper;
        }
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'invalid-feedback d-block';
        feedbackContainer.appendChild(feedbackDiv); 
        feedbackDiv.textContent = message;
    }

    function clearFieldError(inputElement) {
        if (!inputElement) return;
        inputElement.classList.remove('is-invalid');
        const inputWrapper = inputElement.closest('.input-wrapper');
        let feedbackContainer = inputElement.parentElement;
        if (inputWrapper) {
            feedbackContainer = inputWrapper;
        }
        const feedbackElement = feedbackContainer.querySelector('.invalid-feedback.d-block');
        if (feedbackElement) {
            feedbackElement.remove();
        }
    }
    
    function popularSelectComOpcoes(selectElement, opcoes, valorPadraoTexto = "Selecione...", valorPadrao = "") {
        if (!selectElement) return;
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

    function validateFormTarefaPrincipal() { 
        let isValid = true;
        const fieldsToValidate = [
            { element: tarefaTituloInput, message: "Por favor, informe o título da tarefa." },
            { element: tarefaTipoSelect, message: "Por favor, selecione o tipo da tarefa." },
            { element: tarefaDataEntregaInput, message: "Por favor, informe a data de entrega." },
            { element: tarefaStatusSelect, message: "Por favor, selecione o status." }
        ];
        fieldsToValidate.forEach(field => {
            if (!field.element) return;
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
            console.error("Elementos do modal de tarefa (<dialog>) não encontrados.");
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
            if(tarefaDisciplinaSelect) tarefaDisciplinaSelect.value = "";
            if(tarefaTipoSelect) tarefaTipoSelect.value = ""; 
            if(tarefaStatusSelect) tarefaStatusSelect.value = "A Fazer";
        }
        modalTarefaDialog.showModal();
    }

    function fecharModalFormTarefaPrincipal() { 
        if (!modalTarefaDialog) return;
        modalTarefaDialog.close();
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
            dadosCompletosTarefa.disciplinaNome = disciplinaSelecionadaObj ? disciplinaSelecionadaObj.nome : '-';
            salvarOuAtualizarTarefaNaListaEDataTable(dadosCompletosTarefa, isEditMode, rowIndex);
            fecharModalFormTarefaPrincipal();
        });
    }

    function salvarOuAtualizarTarefaNaListaEDataTable(dadosTarefa, isEditMode, rowIndex) {
        const dataHoraFormatadaParaTabela = formatarDataHoraParaTabela(dadosTarefa.dataEntrega, dadosTarefa.horarioEntrega);
        const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(dadosTarefa.status)}">${dadosTarefa.status}</span>`;
        const tipoBadgeHtml = `<span class="badge ${getTipoBadgeClass(dadosTarefa.tipo)}">${dadosTarefa.tipo}</span>`;
        const dropdownHtml = `
            <div class="dropdown">
                <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da tarefa">
                    <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item btn-detalhar-tarefa" href="#" data-tarefa-id="${dadosTarefa.id}"><i class="bi bi-eye me-2"></i>Detalhar</a></li>
                    <li><a class="dropdown-item btn-edit-tarefa" href="#" data-tarefa-id="${dadosTarefa.id}"><i class="bi bi-pencil-square me-2"></i>Editar</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item btn-remover-tarefa text-danger" href="#" data-tarefa-id="${dadosTarefa.id}"><i class="bi bi-trash me-2"></i>Remover</a></li>
                </ul>
            </div>`;
        const dadosLinhaTabela = ['', dadosTarefa.titulo, dadosTarefa.disciplinaNome || '-', tipoBadgeHtml, dataHoraFormatadaParaTabela, statusBadgeHtml, dropdownHtml];

        if (tabelaTarefasDt) {
            if (isEditMode && rowIndex !== undefined && tabelaTarefasDt.row(rowIndex).node()) {
                tabelaTarefasDt.row(rowIndex).data(dadosLinhaTabela).draw(false);
                const indexLista = listaTarefas.findIndex(t => t.id === dadosTarefa.id);
                if(indexLista !== -1) listaTarefas[indexLista] = dadosTarefa;
            } else {
                tabelaTarefasDt.row.add(dadosLinhaTabela).draw(false);
                listaTarefas.push(dadosTarefa);
            }
        }
    }

    function inicializarDataTable() {
        if (!window.jQuery || !$.fn.DataTable) {
            return;
        }
        if ($.fn.DataTable.isDataTable('#tabelaTarefas')) {
            $('#tabelaTarefas').DataTable().destroy();
            $('#tabelaTarefas tbody').empty(); 
        }

        tabelaTarefasDt = $('#tabelaTarefas').DataTable({
            responsive: { details: { type: 'column', target: 0 } },
            // ALTERAÇÃO 1: Removido o 'p' (paginação) do DOM.
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto"f><"col-12 col-md-auto ms-md-auto dt-buttons-container">>t<"row dt-footer-controls mt-3 align-items-center"<"col-sm-12 col-md-5"i>>',
            
            // ALTERAÇÃO 2: Paging desativado.
            paging: false,

            scrollY: '450px',
            scrollCollapse: true,
            lengthChange: false, 
            language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar tarefas...", info: "Total de _TOTAL_ tarefas" },
            columnDefs: [
                { orderable: false, targets: [0, -1] }
            ],
            data: listaTarefas.map(tarefa => {
                const disciplinaObj = listaDisciplinas.find(d => d.id === tarefa.disciplinaId);
                const disciplinaNome = disciplinaObj ? disciplinaObj.nome : '-';
                const dataHoraFormatada = formatarDataHoraParaTabela(tarefa.dataEntrega, tarefa.horarioEntrega);
                const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(tarefa.status)}">${tarefa.status}</span>`;
                const tipoBadgeHtml = `<span class="badge ${getTipoBadgeClass(tarefa.tipo)}">${tarefa.tipo}</span>`;
                const dropdownHtml = `
                    <div class="dropdown">
                        <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da tarefa">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item btn-detalhar-tarefa" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-eye me-2"></i>Detalhar</a></li>
                            <li><a class="dropdown-item btn-edit-tarefa" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-pencil-square me-2"></i>Editar</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item btn-remover-tarefa text-danger" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-trash me-2"></i>Remover</a></li>
                        </ul>
                    </div>`;
                return ['', tarefa.titulo, disciplinaNome, tipoBadgeHtml, dataHoraFormatada, statusBadgeHtml, dropdownHtml ];
            }),
            initComplete: function (settings, json) {
                const api = this.api();
                $('#tabelaTarefas_filter input').addClass('form-control-sm');

                const buttonsContainer = $('.dt-buttons-container');
                if (abrirModalNovaTarefaBtnOriginal && buttonsContainer.length) {
                    if($('#abrirModalNovaTarefaDt').length === 0) { 
                        const abrirModalNovaTarefaBtnClone = abrirModalNovaTarefaBtnOriginal.cloneNode(true);
                        
                        abrirModalNovaTarefaBtnClone.style.display = 'inline-flex';
                        
                        abrirModalNovaTarefaBtnClone.id = 'abrirModalNovaTarefaDt'; 
                        
                        $(abrirModalNovaTarefaBtnClone).on('click', (e) => {
                            e.preventDefault();
                            abrirModalFormTarefaPrincipal();
                        });
                        buttonsContainer.append(abrirModalNovaTarefaBtnClone);
                    }
                }

                const filterHtml = `
                    <select id="filterTipoTarefa" class="form-select form-select-sm dt-filter-select ms-2">
                        <option value="">Todos os Tipos</option> <option value="Tarefa">Tarefa</option> <option value="Prova">Prova</option>
                    </select>
                    <select id="filterDisciplina" class="form-select form-select-sm dt-filter-select ms-2">
                        <option value="">Todas as Disciplinas</option>
                    </select>`;
                buttonsContainer.prepend(filterHtml); 

                const filterDisciplinaSelect = $('#filterDisciplina');
                listaDisciplinas.forEach(disciplina => {
                    filterDisciplinaSelect.append(new Option(disciplina.nome, disciplina.nome)); 
                });

                $('#filterTipoTarefa').on('change', function() {
                    const tipo = this.value;
                    api.column(3).search(tipo ? '^' + $.fn.dataTable.util.escapeRegex(tipo) + '$' : '', true, false).draw();
                });
                $('#filterDisciplina').on('change', function() {
                    const disciplina = this.value;
                    api.column(2).search(disciplina ? '^' + $.fn.dataTable.util.escapeRegex(disciplina) + '$' : '', true, false).draw();
                });
            }
        });
    }

    function formatarDataHoraParaTabela(dataStr, horaStr) {
        if (!dataStr) return '-';
        const [year, month, day] = dataStr.split('-');
        const dataObj = new Date(Date.UTC(year, month - 1, day));
        const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
        let formatted = `${dataObj.getUTCDate()} ${meses[dataObj.getUTCMonth()]} ${dataObj.getUTCFullYear()}`;
        if (horaStr) { 
            const [hour, minute] = horaStr.split(':');
            let h = parseInt(hour);
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            h = h ? h : 12;
            const formattedTime = `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
            formatted += `, ${formattedTime}`;
        }
        return formatted;
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'Concluída': return 'bg-success-subtle text-success';
            case 'Agendada':
            case 'Em Andamento': return 'bg-info-subtle text-info';
            case 'A Fazer': return 'bg-warning-subtle text-warning';
            case 'Atrasada':
            case 'Cancelada': return 'bg-danger-subtle text-danger';
            default: return 'bg-secondary-subtle text-secondary';
        }
    }

    function getTipoBadgeClass(tipo) {
        switch (tipo) {
            case 'Prova': return 'bg-danger-subtle text-danger'; 
            case 'Tarefa': return 'bg-primary-subtle text-primary';
            default: return 'bg-light-subtle text-dark';
        }
    }

    $('#tabelaTarefas tbody').on('click', '.btn-edit-tarefa', function (e) {
        e.preventDefault();
        const tr = $(this).closest('tr');
        const tarefaId = $(this).data('tarefa-id');
        const tarefaData = listaTarefas.find(t => t.id === tarefaId);
        if (tarefaData) {
            abrirModalFormTarefaPrincipal(true, tarefaData, tr[0]);
        }
    });

    $('#tabelaTarefas tbody').on('click', '.btn-remover-tarefa', function (e) {
        e.preventDefault();
        const tarefaId = $(this).data('tarefa-id');
        const tarefaData = listaTarefas.find(t => t.id === tarefaId);
        if (confirm(`Tem certeza que deseja remover a tarefa "${tarefaData.titulo}"?`)) {
            const indexToRemove = listaTarefas.findIndex(t => t.id === tarefaId);
            if (indexToRemove > -1) {
                listaTarefas.splice(indexToRemove, 1);
                tabelaTarefasDt.row($(this).closest('tr')).remove().draw();
            }
        }
    });
    
    // ... (outros listeners como o de detalhar tarefa, se houver)

    // Demais inicializações
    popularDisciplinasEmTodosOsSelects(); 
    popularAtividadesNoSelectAnotacao(); 
    inicializarDataTable(); 
});
