document.addEventListener("DOMContentLoaded", function () {
    // --- SELETORES DE ELEMENTOS ---
    const modalProva = document.querySelector("#modalProva");
    const abrirModalNovaProvaBtnOriginal = document.querySelector("#abrirModalNovaProva"); // Mantido para clonagem
    const fecharModalProvaBtn = document.querySelector("#fecharModal");
    const cancelarModalProvaBtn = document.querySelector("#cancelarModal");
    const formProva = document.querySelector("#formProva");
    const modalProvaLabel = document.querySelector("#modalProvaLabel");

    const provaDisciplinaSelect = document.getElementById('provaDisciplina');
    const provaProfessorInput = document.getElementById('provaProfessor');
    const provaDataInput = document.getElementById('provaData');
    const provaHorarioInput = document.getElementById('provaHorario');
    const provaLocalInput = document.getElementById('provaLocal');
    const provaStatusSelect = document.getElementById('provaStatus');
    const provaValorNotaInput = document.getElementById('provaValorNota');
    const provaConteudosInput = document.getElementById('provaConteudos');
    const provaObservacoesInput = document.getElementById('provaObservacoes');
    const provaNotaObtidaInput = document.getElementById('provaNotaObtida');

    const modalBusca = document.querySelector("#modalBuscaProvas");
    // const abrirModalBuscaMobileBtn = document.querySelector("#abrirBuscaModal"); // Pode ser removido se o botão for sempre dinâmico
    const fecharModalBuscaBtn = document.querySelector("#fecharModalBusca");
    const inputBuscaProvasModal = document.querySelector("#inputBuscaProvas");
    const aplicarBuscaProvasBtn = document.querySelector("#aplicarBuscaProvas");

    const modalDetalhes = document.querySelector("#modalDetalhesProva");
    const fecharModalDetalhesBtn = document.querySelector("#fecharModalDetalhes");
    const okModalDetalhesBtn = document.querySelector("#okModalDetalhes");
    const modalDetalhesConteudo = document.querySelector("#modalDetalhesProvaConteudo");
    const modalDetalhesProvaLabel = document.querySelector("#modalDetalhesProvaLabel");

    let tabelaProvasDt;

    const listaDisciplinas = [
        { id: "ART101", nome: "Fundamentos Gráficos – ART101", professor: "Prof. Jango" },
        { id: "ITD201", nome: "Web Design Avançado – ITD201", professor: "Prof. João Paulo" },
        { id: "UXD301", nome: "Pesquisa de UX – UXD301", professor: "Prof. Jason" },
        { id: "ANI301", nome: "Técnicas de Animação 3D – ANI301", professor: "Prof. Pryzado" }
    ];

    // --- FUNÇÕES DE VALIDAÇÃO E FEEDBACK DE ERRO ---
    function displayFieldError(inputElement, message) {
        clearFieldError(inputElement);
        inputElement.classList.add('is-invalid');
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'invalid-feedback d-block';
        feedbackDiv.textContent = message;
        const parent = inputElement.closest('.mb-3') || inputElement.parentNode; // Ajustado para pegar o mb-3 para melhor posicionamento
        // Adiciona após o elemento input ou select
        inputElement.parentNode.insertBefore(feedbackDiv, inputElement.nextSibling);
    }

    function clearFieldError(inputElement) {
        inputElement.classList.remove('is-invalid');
        const parent = inputElement.closest('.mb-3') || inputElement.parentNode;
        const feedbackElement = parent.querySelector('.invalid-feedback.d-block');
        if (feedbackElement) {
            feedbackElement.remove();
        }
    }

    function validateFormProva() {
        let isValid = true;
        const fieldsToValidate = [
            { element: provaDisciplinaSelect, message: "Por favor, selecione uma disciplina." },
            { element: provaDataInput, message: "Por favor, informe a data da prova." },
            { element: provaHorarioInput, message: "Por favor, informe o horário da prova." },
            { element: provaLocalInput, message: "Por favor, informe o local da prova." }
        ];

        fieldsToValidate.forEach(field => {
            clearFieldError(field.element);
            if (!field.element.value || (field.element.value === "" && field.element.tagName === "SELECT")) {
                displayFieldError(field.element, field.message);
                isValid = false;
            }
        });
        return isValid;
    }

    // --- FUNÇÕES DE MANIPULAÇÃO DE DADOS E UI ---
    function popularDisciplinasSelect() {
        if (!provaDisciplinaSelect) return;
        while (provaDisciplinaSelect.options.length > 1) {
            provaDisciplinaSelect.remove(1);
        }
        listaDisciplinas.forEach(disciplina => {
            const option = new Option(disciplina.nome, disciplina.id);
            provaDisciplinaSelect.add(option);
        });
    }

    function atualizarProfessorInput() {
        if (!provaDisciplinaSelect || !provaProfessorInput) return;
        const disciplinaIdSelecionada = provaDisciplinaSelect.value;
        const disciplinaEncontrada = listaDisciplinas.find(d => d.id === disciplinaIdSelecionada);
        provaProfessorInput.value = disciplinaEncontrada ? disciplinaEncontrada.professor : '';
    }

    if (provaDisciplinaSelect) {
        provaDisciplinaSelect.addEventListener('change', atualizarProfessorInput);
    }

    function calcularAlturaCorpoTabela() {
        const alturaMediaLinha = 45;
        const numLinhasDesktop = 10;
        const numLinhasMobile = 8; // Aumentado um pouco para mobile
        const alturaMinimaTBody = alturaMediaLinha * 3;
        const numLinhas = window.innerWidth < 768 ? numLinhasMobile : numLinhasDesktop;
        let alturaCalculada = numLinhas * alturaMediaLinha;
        return Math.max(alturaCalculada, alturaMinimaTBody) + 'px';
    }

    // --- INICIALIZAÇÃO DO DATATABLE ---
    function inicializarDataTable() {
        if (!window.jQuery || !$.fn.DataTable) {
            console.error("jQuery ou DataTables não carregado!");
            return null;
        }
        return $('#tabelaProvas').DataTable({
            responsive: {
                details: {
                    type: 'column',
                    target: -1 // Última coluna (Ações)
                }
            },
            dom:
                '<"row dt-custom-header justify-content-between align-items-center mb-3"' + // Adicionado justify-content-between aqui
                    '<"col-12 col-md-auto"f>' + // Filtro (sem me-md-auto para que o space-between funcione)
                    '<"col-12 col-md-auto dt-buttons-container">' + // Container para botões
                '>' +
                't' + // Tabela
                '<"row mt-3 align-items-center"' +
                    '<"col-sm-12 col-md-5"i>' + // Info
                    '<"col-sm-12 col-md-7 dataTables_paginate_wrapper"p>' + // Paginação (se usada)
                '>',
            scrollY: calcularAlturaCorpoTabela(),
            scrollCollapse: true,
            paging: false,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json',
                search: "",
                searchPlaceholder: "Buscar provas...",
                info: "Total de _TOTAL_ provas",
                infoEmpty: "Nenhuma prova encontrada",
                infoFiltered: "(filtrado de _MAX_ provas)",
                paginate: {
                    first: "Primeiro",
                    last: "Último",
                    next: "Próximo",
                    previous: "Anterior"
                }
            },
            columnDefs: [
                { orderable: false, targets: 'no-sort' },
                { responsivePriority: 1, targets: 0 },
                { responsivePriority: 10001, targets: 1 },
                { responsivePriority: 2, targets: 2 },
                { responsivePriority: 10002, targets: 3 },
                { responsivePriority: 3, targets: 4 },
                { responsivePriority: 4, targets: 5, className: "dt-actions-column no-export dtr-control" }
            ],
            initComplete: function (settings, json) {
                const api = this.api();
                const searchInput = $('#tabelaProvas_filter input');
                // Ajuste para o input de busca ocupar mais espaço se necessário
                // A div #tabelaProvas_filter já é col-12 col-md-auto, o input pode precisar de width: 100% dentro dela
                searchInput.addClass('form-control form-control-sm').css('width', '100%'); // Ocupa 100% da coluna do filtro
                searchInput.attr('aria-label', 'Buscar provas na tabela');


                const buttonsContainer = $('.dt-buttons-container');
                if (abrirModalNovaProvaBtnOriginal && buttonsContainer.length) {
                    // ... (lógica de clonagem do botão Adicionar Prova - sem alterações aqui)
                    const abrirModalNovaProvaBtnClone = abrirModalNovaProvaBtnOriginal.cloneNode(true);
                    abrirModalNovaProvaBtnClone.id = 'abrirModalNovaProvaDt';
                    $(abrirModalNovaProvaBtnClone).off('click').on('click', (e) => {
                        e.preventDefault();
                        abrirModalFormProva();
                    });
                    buttonsContainer.append(abrirModalNovaProvaBtnClone);
                    abrirModalNovaProvaBtnOriginal.style.display = 'none';
                }

                $('#tabelaProvas tbody tr').each(function() {
                    // ... (lógica de adicionar "Remover Prova" aos dropdowns existentes - sem alterações aqui)
                    const dropdownMenu = $(this).find('.dropdown-menu');
                    if (dropdownMenu.find('.btn-remover-prova').length === 0) {
                        dropdownMenu.append('<li><hr class="dropdown-divider"></li>');
                        dropdownMenu.append('<li><a class="dropdown-item btn-remover-prova text-danger" href="#"><i class="bi bi-trash me-2"></i>Remover Prova</a></li>');
                    }
                });

                handleResponsiveControls(api);
                $(window).off('resize.dtProvas').on('resize.dtProvas', () => handleResponsiveControls(api)); // Recriar listener com off para evitar múltiplos

                if (modalBusca) modalBusca.style.display = 'none';
                api.columns.adjust().responsive.recalc();
            }
        });
    }

    // Função para lidar com a responsividade dos controles de busca e adicionar
    function handleResponsiveControls(dataTableApi) {
        const searchContainer = $('#tabelaProvas_filter'); // Este é o div que envolve o input
        const buttonsContainer = $('.dt-buttons-container');
        const abrirModalNovaProvaBtnDt = $('#abrirModalNovaProvaDt');

        $('#abrirBuscaModalMobile, #abrirModalNovaProvaIconMobile').remove();

        if (window.innerWidth < 767.98) { // Telas pequenas
            if (searchContainer.length) searchContainer.hide(); // Esconde a div do filtro padrão

            const btnLupa = $('<button id="abrirBuscaModalMobile" class="btn btn-light btn-search-icon-mobile" aria-label="Buscar Provas"><i class="bi bi-search"></i></button>');
            btnLupa.on('click', (e) => {
                e.preventDefault();
                abrirModalDeBusca();
            });

            const btnAdicionarIcone = $('<button id="abrirModalNovaProvaIconMobile" class="btn btn-primary btn-add-proof-icon-mobile ms-2" aria-label="Adicionar Nova Prova"><i class="bi bi-plus-lg"></i></button>');
            btnAdicionarIcone.on('click', (e) => {
                e.preventDefault();
                abrirModalFormProva();
            });

            // Esvazia o container de botões e adiciona os ícones
            buttonsContainer.empty().append(btnLupa).append(btnAdicionarIcone);
            if (abrirModalNovaProvaBtnDt.length) abrirModalNovaProvaBtnDt.hide();

        } else { // Telas grandes
            if (searchContainer.length) {
                searchContainer.show(); // Mostra a div do filtro padrão
                // Garante que o input dentro do filtro esteja visível e com estilo correto
                searchContainer.find('input').addClass('form-control form-control-sm').css('width', '100%');
            }
            // Esvazia o container de botões e adiciona o botão de "Adicionar Prova" completo se ele existir
            buttonsContainer.empty();
            if (abrirModalNovaProvaBtnDt.length) {
                buttonsContainer.append(abrirModalNovaProvaBtnDt); // Adiciona o botão clonado
                abrirModalNovaProvaBtnDt.show();
                abrirModalNovaProvaBtnDt.find('span').removeClass('d-none').addClass('d-sm-inline');
                abrirModalNovaProvaBtnDt.find('i').addClass('me-sm-2');
            }
        }
    }

    tabelaProvasDt = inicializarDataTable();

    let resizeDebounceTimer;
    $(window).on('resize.dtProvasAdjust', function () { // Usar namespace para o evento de resize
        clearTimeout(resizeDebounceTimer);
        resizeDebounceTimer = setTimeout(function () {
            if (tabelaProvasDt) {
                const novaAltura = calcularAlturaCorpoTabela();
                const scrollBody = $('#tabelaProvas_wrapper div.dataTables_scrollBody');
                if (scrollBody.length) {
                    scrollBody.css({ 'height': novaAltura, 'max-height': novaAltura });
                    tabelaProvasDt.columns.adjust().responsive.recalc().draw(false);
                }
            }
        }, 250);
    });


    // --- GERENCIAMENTO DO MODAL DE ADICIONAR/EDITAR PROVA ---
    function abrirModalFormProva(isEditMode = false, dadosProva = null, targetTr = null) {
        if (!formProva || !modalProvaLabel || !modalProva || !provaDisciplinaSelect || !provaProfessorInput) {
            console.error("Elementos do modal de prova não encontrados."); return;
        }
        popularDisciplinasSelect();
        formProva.reset();
        const fieldsToClearValidation = [
            provaDisciplinaSelect, provaProfessorInput, provaDataInput, provaHorarioInput,
            provaLocalInput, provaStatusSelect, provaValorNotaInput, provaConteudosInput,
            provaObservacoesInput, provaNotaObtidaInput
        ];
        fieldsToClearValidation.forEach(clearFieldError);

        provaProfessorInput.value = '';
        delete formProva.dataset.provaId;
        delete formProva.dataset.rowIndex;

        modalProvaLabel.textContent = isEditMode ? "Editar Prova" : "Adicionar Prova";

        if (isEditMode && dadosProva) {
            provaDisciplinaSelect.value = dadosProva.disciplinaValue || '';
            atualizarProfessorInput(); // Garante que o professor seja atualizado
            if (dadosProva.professor && provaProfessorInput.value !== dadosProva.professor && !disciplinaEncontrada) { // Se não achou disciplina mas tem prof
                 provaProfessorInput.value = dadosProva.professor;
            }
            provaDataInput.value = dadosProva.data || '';
            provaHorarioInput.value = dadosProva.horario || '';
            provaLocalInput.value = dadosProva.local || '';
            provaStatusSelect.value = dadosProva.statusValue || 'Agendado';
            provaValorNotaInput.value = dadosProva.valorNota || '';
            provaConteudosInput.value = dadosProva.conteudos || '';
            provaObservacoesInput.value = dadosProva.observacoes || '';
            provaNotaObtidaInput.value = dadosProva.notaObtida || '';
            formProva.dataset.provaId = dadosProva.id;
            if (tabelaProvasDt && targetTr) {
                formProva.dataset.rowIndex = tabelaProvasDt.row(targetTr).index();
            }
        }
        modalProva.showModal();
    }

    function fecharModalFormProva() {
        if (modalProva) modalProva.close();
    }

    // O botão original já não precisa de listener se for sempre clonado e o listener recriado no clone.
    // if (abrirModalNovaProvaBtnOriginal) abrirModalNovaProvaBtnOriginal.addEventListener("click", (e) => { e.preventDefault(); abrirModalFormProva(); });
    if (fecharModalProvaBtn) fecharModalProvaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormProva(); });
    if (cancelarModalProvaBtn) cancelarModalProvaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormProva(); });
    if (modalProva) modalProva.addEventListener("click", e => { if (e.target === modalProva) fecharModalFormProva(); });

    // --- GERENCIAMENTO DO MODAL DE BUSCA ---
    function abrirModalDeBusca() {
        if (modalBusca && inputBuscaProvasModal && tabelaProvasDt) {
            inputBuscaProvasModal.value = tabelaProvasDt.search();
            modalBusca.showModal();
            inputBuscaProvasModal.focus();
        }
    }
    function fecharModalDeBusca() { if (modalBusca) modalBusca.close(); }
    function aplicarBuscaDoModal() {
        if (tabelaProvasDt && inputBuscaProvasModal) {
            tabelaProvasDt.search(inputBuscaProvasModal.value).draw();
        }
        fecharModalDeBusca();
    }

    // O listener para #abrirBuscaModalMobile é adicionado dinamicamente em handleResponsiveControls
    if (fecharModalBuscaBtn) { fecharModalBuscaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeBusca(); }); }
    if (aplicarBuscaProvasBtn) { aplicarBuscaProvasBtn.addEventListener("click", (e) => { e.preventDefault(); aplicarBuscaDoModal(); }); }
    if (inputBuscaProvasModal) { inputBuscaProvasModal.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); aplicarBuscaDoModal(); } }); }
    if (modalBusca) { modalBusca.addEventListener("click", e => { if (e.target === modalBusca) fecharModalDeBusca(); }); }


    // --- FUNÇÕES E LISTENERS DO MODAL DE DETALHES ---
    function abrirModalDeDetalhes(dadosLinhaTabela, dadosCompletosProva = null) {
        if (!modalDetalhes || !modalDetalhesConteudo || !modalDetalhesProvaLabel) {
            console.error("Elementos do modal de detalhes não encontrados.");
            return;
        }

        const disciplina = dadosCompletosProva?.disciplinanome || dadosLinhaTabela[0]; // Ajustado para camelCase do .data()
        modalDetalhesProvaLabel.textContent = "Detalhes da Prova";

        const professor = dadosCompletosProva?.professor ||
            listaDisciplinas.find(d => d.id === dadosCompletosProva?.disciplinaid || d.nome === disciplina)?.professor ||
            "Não informado";
        const notaObtidaOriginal = dadosCompletosProva?.notaobtida !== undefined ? dadosCompletosProva.notaobtida : dadosLinhaTabela[1];
        const valorNotaOriginal = dadosCompletosProva?.valornota || "10,0";
        const notaFormatada = notaObtidaOriginal && notaObtidaOriginal !== '-' ?
            `${String(notaObtidaOriginal).replace('.', ',')} / ${String(valorNotaOriginal).replace('.', ',')}` :
            (notaObtidaOriginal === '-' && valorNotaOriginal ? `- / ${String(valorNotaOriginal).replace('.', ',')}` : '-');

        const dataHorario = dadosLinhaTabela[2];
        const local = dadosCompletosProva?.local !== undefined ? (dadosCompletosProva.local || '-') : dadosLinhaTabela[3];

        let statusParaDetalhes = dadosLinhaTabela[4]; // HTML do badge
        if (dadosCompletosProva?.status) {
            const statusBadgeClass = dadosCompletosProva.status === 'Agendado' ? 'bg-info-subtle text-info' :
                (dadosCompletosProva.status === 'Concluída' ? 'bg-success-subtle text-success' :
                    'bg-danger-subtle text-danger');
            statusParaDetalhes = `<span class="badge ${statusBadgeClass}">${dadosCompletosProva.status}</span>`;
        }

        const conteudos = dadosCompletosProva?.conteudos || '-';
        const observacoes = dadosCompletosProva?.observacoes || '-';

        modalDetalhesConteudo.innerHTML = `
            <dl class="row">
                <dt class="col-sm-4 col-md-3">Disciplina:</dt>
                <dd class="col-sm-8 col-md-9">${disciplina}</dd>
                <dt class="col-sm-4 col-md-3">Professor:</dt>
                <dd class="col-sm-8 col-md-9">${professor}</dd>
                <dt class="col-sm-4 col-md-3">Data & Horário:</dt>
                <dd class="col-sm-8 col-md-9">${dataHorario}</dd>
                <dt class="col-sm-4 col-md-3">Local:</dt>
                <dd class="col-sm-8 col-md-9">${local}</dd>
                <dt class="col-sm-4 col-md-3">Status:</dt>
                <dd class="col-sm-8 col-md-9">${statusParaDetalhes}</dd>
                <dt class="col-sm-4 col-md-3">Valor da Prova:</dt>
                <dd class="col-sm-8 col-md-9">${String(valorNotaOriginal).replace('.', ',') || '-'}</dd>
                <dt class="col-sm-4 col-md-3">Nota Obtida:</dt>
                <dd class="col-sm-8 col-md-9">${notaFormatada}</dd>
                ${conteudos && conteudos !== '-' ? `
                <dt class="col-sm-12">Conteúdos:</dt>
                <dd class="col-sm-12"><pre>${conteudos.replace(/\n/g, '<br>')}</pre></dd>
                ` : ''}
                ${observacoes && observacoes !== '-' ? `
                <dt class="col-sm-12">Observações:</dt>
                <dd class="col-sm-12"><pre>${observacoes.replace(/\n/g, '<br>')}</pre></dd>
                ` : ''}
            </dl>`;
        modalDetalhes.showModal();
    }
    function fecharModalDeDetalhes() { if (modalDetalhes) modalDetalhes.close(); }
    if (fecharModalDetalhesBtn) { fecharModalDetalhesBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhes(); }); }
    if (okModalDetalhesBtn) { okModalDetalhesBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhes(); }); }
    if (modalDetalhes) { modalDetalhes.addEventListener("click", e => { if (e.target === modalDetalhes) fecharModalDeDetalhes(); }); }


    // --- AÇÕES NA TABELA ---
    $('#tabelaProvas tbody').on('click', '.btn-edit-proof', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const trElement = $(this).closest('tr')[0];
        const rowDataArray = tabelaProvasDt.row(trElement).data();
        const dadosCompletosArmazenados = $(trElement).data(); // jQuery .data() converte para camelCase

        if (!rowDataArray) return;

        let dataParaInput = '', horaParaInput = '';
        const dataHoraString = rowDataArray[2];
        if (dataHoraString && typeof dataHoraString === 'string' && dataHoraString !== '-') {
            const partes = dataHoraString.split(',');
            dataParaInput = parsePtBrDateToIso(partes[0].trim());
            if (partes.length > 1) horaParaInput = formatarHoraParaInput(partes[1].trim());
        }

        const statusBadgeHtml = rowDataArray[4];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = statusBadgeHtml;
        const statusTexto = tempDiv.querySelector('.badge')?.textContent.trim() || '';

        const disciplinaNomeDaTabela = String(rowDataArray[0]).trim();
        const disciplinaEncontrada = listaDisciplinas.find(d => d.nome === disciplinaNomeDaTabela);

        const dadosParaModal = {
            id: dadosCompletosArmazenados.id || dadosCompletosArmazenados.provaid || 'tempID-' + new Date().getTime(), // provaid em minúsculo
            disciplinaValue: disciplinaEncontrada ? disciplinaEncontrada.id : (dadosCompletosArmazenados.disciplinaid || ''), // disciplinaid
            disciplinaNome: disciplinaNomeDaTabela,
            professor: dadosCompletosArmazenados.professor || (disciplinaEncontrada ? disciplinaEncontrada.professor : ''),
            notaObtida: dadosCompletosArmazenados.notaobtida !== undefined ? dadosCompletosArmazenados.notaobtida : (rowDataArray[1] === '-' ? '' : String(rowDataArray[1]).split('/')[0].trim().replace(',', '.')), //notaobtida
            data: dataParaInput,
            horario: horaParaInput,
            local: dadosCompletosArmazenados.local !== undefined ? dadosCompletosArmazenados.local : (rowDataArray[3] === '-' ? '' : rowDataArray[3]),
            statusValue: dadosCompletosArmazenados.status || statusTexto,
            valorNota: dadosCompletosArmazenados.valornota || '', // valornota
            conteudos: dadosCompletosArmazenados.conteudos || '',
            observacoes: dadosCompletosArmazenados.observacoes || ''
        };
        abrirModalFormProva(true, dadosParaModal, trElement);
    });

    $('#tabelaProvas tbody').on('click', '.btn-detalhar-prova', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const trElement = $(this).closest('tr')[0];
        const dadosDaLinhaTabela = tabelaProvasDt.row(trElement).data();
        const dadosCompletosArmazenados = $(trElement).data(); // Lembre-se que .data() do jQuery retorna chaves em camelCase

        if (dadosDaLinhaTabela) {
            abrirModalDeDetalhes(dadosDaLinhaTabela, dadosCompletosArmazenados);
        }
    });

    $('#tabelaProvas tbody').on('click', '.btn-marcar-concluida', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const trElement = $(this).closest('tr')[0];
        const row = tabelaProvasDt.row(trElement);
        let rowData = row.data();
        if (rowData) {
            rowData[4] = `<span class="badge bg-success-subtle text-success">Concluída</span>`;
            row.data(rowData).draw(false);
            $(row.node()).data('status', 'Concluída'); // Atualiza o data attribute da TR
            alert("Prova marcada como concluída!");
        }
    });

    $('#tabelaProvas tbody').on('click', '.btn-remover-prova', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const trElement = $(this).closest('tr');
        const row = tabelaProvasDt.row(trElement);
        const rowData = row.data();

        if (confirm(`Tem certeza que deseja remover a prova de "${rowData[0]}"?`)) {
            row.remove().draw(false);
            alert("Prova removida com sucesso!");
        }
    });

    // --- SUBMIT DO FORMULÁRIO DE PROVA ---
    if (formProva) {
        formProva.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!validateFormProva()) return;
            if (!tabelaProvasDt) return;

            const { provaId, rowIndex } = formProva.dataset;
            const disciplinaSelecionadaObj = listaDisciplinas.find(d => d.id === provaDisciplinaSelect.value);

            const dadosCompletosProva = {
                id: provaId || 'newID-' + new Date().getTime(),
                disciplinaId: provaDisciplinaSelect.value,
                disciplinaNome: disciplinaSelecionadaObj ? disciplinaSelecionadaObj.nome : (provaDisciplinaSelect.options[provaDisciplinaSelect.selectedIndex]?.text || 'N/A'),
                professor: provaProfessorInput.value,
                data: provaDataInput.value,
                horario: provaHorarioInput.value,
                local: provaLocalInput.value.trim(),
                status: provaStatusSelect.value,
                valorNota: provaValorNotaInput.value.trim() || "10,0", // Default se vazio
                conteudos: provaConteudosInput.value.trim(),
                observacoes: provaObservacoesInput.value.trim(),
                notaObtida: provaNotaObtidaInput.value.trim()
            };

            let dataHoraFormatadaParaTabela = '-';
            if (dadosCompletosProva.data) {
                const [year, month, day] = dadosCompletosProva.data.split('-');
                const dataObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day))); // UTC para consistência
                const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
                dataHoraFormatadaParaTabela = `${dataObj.getUTCDate()} ${meses[dataObj.getUTCMonth()]} ${dataObj.getUTCFullYear()}`;
                if (dadosCompletosProva.horario) {
                    dataHoraFormatadaParaTabela += ', ' + formatarHora(dadosCompletosProva.horario);
                }
            } else if (dadosCompletosProva.horario) {
                dataHoraFormatadaParaTabela = formatarHora(dadosCompletosProva.horario);
            }

            const statusHtml = `<span class="badge ${dadosCompletosProva.status === 'Agendado' ? 'bg-info-subtle text-info' : (dadosCompletosProva.status === 'Concluída' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger')}">${dadosCompletosProva.status}</span>`;
            const dropdownHtml = `
                <div class="dropdown">
                    <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da prova">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item btn-detalhar-prova" href="#"><i class="bi bi-eye me-2"></i>Detalhar Prova</a></li>
                        <li><a class="dropdown-item btn-marcar-concluida" href="#"><i class="bi bi-check-circle me-2"></i>Marcar Concluída</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item btn-edit-proof" href="#"><i class="bi bi-pencil-square me-2"></i>Editar Prova</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item btn-remover-prova text-danger" href="#"><i class="bi bi-trash me-2"></i>Remover Prova</a></li>
                    </ul>
                </div>`;

            const dadosLinhaTabela = [
                dadosCompletosProva.disciplinaNome,
                dadosCompletosProva.notaObtida ? `${dadosCompletosProva.notaObtida.replace('.', ',')} / ${dadosCompletosProva.valorNota.replace('.', ',')}` : '-',
                dataHoraFormatadaParaTabela,
                dadosCompletosProva.local || '-',
                statusHtml,
                dropdownHtml
            ];

            let targetNode;
            if (provaId && rowIndex !== undefined && tabelaProvasDt.row(parseInt(rowIndex)).node()) { // Verifica se rowIndex é válido
                const linha = tabelaProvasDt.row(parseInt(rowIndex));
                linha.data(dadosLinhaTabela).draw(false);
                targetNode = $(linha.node());
                alert("Prova atualizada com sucesso!");
            } else {
                targetNode = $(tabelaProvasDt.row.add(dadosLinhaTabela).draw(false).node());
                alert("Prova adicionada com sucesso!");
            }
            if (targetNode && targetNode.length) {
                // Armazenar dados completos na TR (jQuery .data() converte para minúsculas)
                Object.keys(dadosCompletosProva).forEach(key => {
                    targetNode.data(key.toLowerCase(), dadosCompletosProva[key]);
                });
            }
            fecharModalFormProva();
            if (tabelaProvasDt) tabelaProvasDt.columns.adjust().responsive.recalc(); // Ajustar após modificação
        });
    }

    // --- FUNÇÕES AUXILIARES DE FORMATAÇÃO ---
    function formatarHora(timeString) {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        let h = parseInt(hour);
        if (isNaN(h) || isNaN(parseInt(minute))) { console.warn("Formato de hora inválido para formatarHora:", timeString); return timeString; } // Retorna original se inválido
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
    }

    function formatarHoraParaInput(displayTime) {
        if (!displayTime || typeof displayTime !== 'string') return '';
        let timePart = displayTime.toUpperCase().trim();
        let modifier = "";
        if (timePart.endsWith('AM')) { modifier = 'AM'; timePart = timePart.slice(0, -2).trim(); }
        else if (timePart.endsWith('PM')) { modifier = 'PM'; timePart = timePart.slice(0, -2).trim(); }
        else { /* Tenta inferir AM/PM se não explicitado, mas pode ser impreciso */ }

        let [hoursStr, minutesStr] = timePart.split(':');
        let hours = parseInt(hoursStr, 10); let minutes = parseInt(minutesStr, 10);
        if (isNaN(hours) || isNaN(minutes)) { console.warn("Formato de hora inválido para formatarHoraParaInput:", displayTime); return ''; }
        if (modifier === 'PM' && hours < 12) hours += 12;
        else if (modifier === 'AM' && hours === 12) hours = 0; // Meia-noite
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    function parsePtBrDateToIso(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return "";
        let parts = dateStr.split(" "); // "25 jan 2025"
        if (parts.length !== 3) {
            const dateSeparators = dateStr.match(/(\d{1,2})[\/\-\. ]([a-zA-ZçÇãÃõÕ]{3,})[\/\-\. ](\d{4})/i); // Melhorado para meses pt-BR
            if (dateSeparators && dateSeparators.length === 4) {
                parts = [dateSeparators[1], dateSeparators[2], dateSeparators[3]];
            } else { console.warn("Formato de data PtBr inválido:", dateStr); return ""; }
        }
        const day = String(parts[0]).padStart(2,'0');
        const monthStr = parts[1].toLowerCase().substring(0, 3);
        const year = parts[2];
        const monthMap = {'jan':'01','fev':'02','mar':'03','abr':'04','mai':'05','jun':'06','jul':'07','ago':'08','set':'09','out':'10','nov':'11','dez':'12'};
        const month = monthMap[monthStr];
        if (!month || !/^\d{4}$/.test(year) || !/^\d{2}$/.test(day)) { console.warn("Componentes de data PtBr inválidos:", dateStr, day, month, year); return "";}
        return `${year}-${month}-${day}`;
    }

    // --- INICIALIZAÇÕES FINAIS ---
    popularDisciplinasSelect();

    // Ajuste final da tabela após tudo estar pronto
    if (tabelaProvasDt) {
        tabelaProvasDt.columns.adjust().responsive.recalc().draw();
    }
});
