document.addEventListener("DOMContentLoaded", function () {
    // --- SELETORES DE ELEMENTOS ---
    const modalProva = document.querySelector("#modalProva");
    const abrirModalNovaProvaBtnOriginal = document.querySelector("#abrirModalNovaProva");
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
    const fecharModalBuscaBtn = document.querySelector("#fecharModalBusca");
    const inputBuscaProvasModal = document.querySelector("#inputBuscaProvas");
    const aplicarBuscaProvasBtn = document.querySelector("#aplicarBuscaProvas");

    const modalDetalhes = document.querySelector("#modalDetalhesProva");
    const fecharModalDetalhesBtn = document.querySelector("#fecharModalDetalhes");
    const okModalDetalhesBtn = document.querySelector("#okModalDetalhes");
    const modalDetalhesConteudo = document.querySelector("#modalDetalhesProvaConteudo");
    const modalDetalhesProvaLabel = document.querySelector("#modalDetalhesProvaLabel");

    let tabelaProvasDt;
    let resizeDebounceTimer;

    // Lista de disciplinas completa (ajustada para incluir todas do HTML)
    const listaDisciplinas = [
        { id: "ART101", nome: "Fundamentos de Design Gráfico – ART101", professor: "Prof. Jango" },
        { id: "ITD201", nome: "Web Design Avançado – ITD201", professor: "Prof. João Paulo" },
        { id: "UXD301", nome: "Princípios de UX/UI Design – UXD301", professor: "Prof. Jason" },
        { id: "ANI301", nome: "Técnicas de Animação 3D – ANI301", professor: "Prof. Pryzado" },
        { id: "HAR202", nome: "História da Arte – HAR202", professor: "Prof. Olivia" },
        { id: "PHO110", nome: "Fotografia Digital – PHO110", professor: "Prof. Lucas" },
        { id: "CCO200", nome: "Programação Orientada a Objetos – CCO200", professor: "Prof. Ana" },
        { id: "CCO210", nome: "Banco de Dados – CCO210", professor: "Prof. Carlos" },
        { id: "CCO300", nome: "Redes de Computadores – CCO300", professor: "Prof. Beatriz" },
        { id: "CCO401", nome: "Inteligência Artificial – CCO401", professor: "Prof. Eduardo" },
        { id: "CCO310", nome: "Engenharia de Software – CCO310", professor: "Prof. Fernanda" },
        { id: "UXD205", nome: "Design de Interação – UXD205", professor: "Prof. Gustavo" },
        { id: "MKT300", nome: "Marketing Digital – MKT300", professor: "Prof. Helena" },
        { id: "MOB400", nome: "Desenvolvimento Mobile – MOB400", professor: "Prof. Igor" },
        { id: "SEG500", nome: "Segurança da Informação – SEG500", professor: "Prof. Juliana" },
    ];


    // --- FUNÇÕES DE VALIDAÇÃO E FEEDBACK DE ERRO ---
    function displayFieldError(inputElement, message) {
        clearFieldError(inputElement);
        inputElement.classList.add('is-invalid');
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'invalid-feedback d-block';
        feedbackDiv.textContent = message;
        const parent = inputElement.closest('.mb-3') || inputElement.parentNode;
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
            option.setAttribute('data-professor', disciplina.professor);
            provaDisciplinaSelect.add(option);
        });
    }

    function atualizarProfessorInput() {
        if (!provaDisciplinaSelect || !provaProfessorInput) return;
        const disciplinaOptionSelecionada = provaDisciplinaSelect.options[provaDisciplinaSelect.selectedIndex];
        const professor = disciplinaOptionSelecionada ? disciplinaOptionSelecionada.getAttribute('data-professor') : '';
        provaProfessorInput.value = professor || '';
    }

    if (provaDisciplinaSelect) {
        provaDisciplinaSelect.addEventListener('change', atualizarProfessorInput);
    }


    // --- INICIALIZAÇÃO DO DATATABLE ---
    function inicializarDataTable() {
        if (!window.jQuery || !$.fn.DataTable) {
            console.error("jQuery ou DataTables não carregado!");
            return null;
        }

        if ($.fn.DataTable.isDataTable('#tabelaProvas')) {
            $('#tabelaProvas').DataTable().destroy();
            $('#tabelaProvas tbody').empty();
        }


        tabelaProvasDt = $('#tabelaProvas').DataTable({
            responsive: {
                details: {
                    type: 'column',
                    target: -1
                }
            },
            dom:
                '<"row dt-custom-header align-items-center mb-3"' +
                    '<"col-12 col-md-auto me-md-auto"f>' +
                    '<"col-12 col-md-auto dt-buttons-container">' +
                '>' +
                't' +
                '<"row mt-3 align-items-center"' +
                    '<"col-sm-12 col-md-5"i>' +
                    '<"col-sm-12 col-md-7 dataTables_paginate_wrapper"p>' +
                '>',
            paging: false,
            scrollY: '450px',
            scrollCollapse: true,
            lengthChange: false,
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
                { responsivePriority: 1, targets: 5, className: "dt-actions-column no-export" }
            ],
            aoColumnDefs: [
                {
                    targets: '_all',
                    createdCell: function (td, cellData, rowData, row, col) {
                        const originalCell = $(td).closest('tr').find('td').eq(col);
                        if (originalCell.length) {
                            $.each(originalCell.data(), function (key, value) {
                                $(td).data(key, value);
                            });
                        }
                    }
                }
            ],
            initComplete: function (settings, json) {
                const api = this.api();
                const searchInput = $('#tabelaProvas_filter input');
                searchInput.addClass('form-control form-control-sm').css('width', 'auto');
                searchInput.attr('aria-label', 'Buscar provas na tabela');


                const buttonsContainer = $('.dt-buttons-container');
                if (abrirModalNovaProvaBtnOriginal && buttonsContainer.length) {
                    if($('#abrirModalNovaProvaDt').length === 0) {
                        const abrirModalNovaProvaBtnClone = abrirModalNovaProvaBtnOriginal.cloneNode(true);
                        abrirModalNovaProvaBtnClone.id = 'abrirModalNovaProvaDt';
                        $(abrirModalNovaProvaBtnClone).off('click').on('click', (e) => {
                            e.preventDefault();
                            abrirModalFormProva();
                        });
                        buttonsContainer.append(abrirModalNovaProvaBtnClone);
                    }
                    abrirModalNovaProvaBtnOriginal.style.display = 'none';
                }


                $('#tabelaProvas tbody tr').each(function() {
                    const dropdownMenu = $(this).find('.dropdown-menu');
                    if (dropdownMenu.find('.btn-remover-prova').length === 0) {
                        const existingItemsCount = dropdownMenu.children('li').length;
                        if(existingItemsCount > 0 && dropdownMenu.find('.dropdown-divider').last().length === 0) {
                            dropdownMenu.append('<li><hr class="dropdown-divider"></li>');
                        }
                        dropdownMenu.append('<li><a class="dropdown-item btn-remover-prova text-danger" href="#"><i class="bi bi-trash me-2"></i>Remover Prova</a></li>');
                    }
                });

                // --- Lógica para mover o dropdown ao abrir/fechar ---
                $('#tabelaProvas tbody').off('show.bs.dropdown move.dropdown');
                $('body').off('hide.bs.dropdown move.dropdown');

                $('#tabelaProvas tbody').on('show.bs.dropdown move.dropdown', '.dropdown', function (e) {
                    const $dropdown = $(this);
                    const $dropdownMenu = $dropdown.find('.dropdown-menu');

                    if (!$dropdownMenu.parent().is('body')) {
                        $dropdownMenu.data('bs-dropdown-original-parent', $dropdown);
                        $dropdownMenu.data('bs-dropdown-toggle-button', $(e.target)); // $(e.target) é o botão que abriu
                        $dropdownMenu.appendTo('body');
                        const bsDropdown = bootstrap.Dropdown.getInstance(e.target);
                        if (bsDropdown && bsDropdown._popper) {
                            bsDropdown._popper.update();
                        }
                    }
                });

                $('body').on('hide.bs.dropdown move.dropdown', '.dropdown-menu', function (e) {
                    const $dropdownMenu = $(this);
                    const $originalParent = $dropdownMenu.data('bs-dropdown-original-parent');

                    if ($originalParent && !$dropdownMenu.parent().is($originalParent)) {
                        $dropdownMenu.prependTo($originalParent);
                        $dropdownMenu.removeData('bs-dropdown-original-parent');
                        $dropdownMenu.removeData('bs-dropdown-toggle-button');
                    }
                });
                // --- FIM Lógica para mover o dropdown ---

                // function handleResponsiveControls(api) { /* Defina ou remova esta chamada */ }
                // $(window).off('resize.dtLayoutProvas').on('resize.dtLayoutProvas', function() {
                //     handleResponsiveControls(tabelaProvasDt);
                // });

                $(window).off('resize.dtProvasGlobal').on('resize.dtProvasGlobal', function () {
                    clearTimeout(resizeDebounceTimer);
                    resizeDebounceTimer = setTimeout(function () {
                        if (tabelaProvasDt) {
                            tabelaProvasDt.columns.adjust().responsive.recalc();
                        }
                    }, 250);
                });

                if (modalBusca) modalBusca.style.display = 'none';
            }
        });

        return tabelaProvasDt;
    }


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
            provaDisciplinaSelect.value = dadosProva.disciplinaId || '';
            atualizarProfessorInput();
            const disciplinaEncontradaNoSelect = listaDisciplinas.find(d => d.id === provaDisciplinaSelect.value);
            if (!disciplinaEncontradaNoSelect && dadosProva.professor) {
                provaProfessorInput.value = dadosProva.professor;
            } else if(disciplinaEncontradaNoSelect && disciplinaEncontradaNoSelect.professor !== provaProfessorInput.value) {
                provaProfessorInput.value = disciplinaEncontradaNoSelect.professor;
            }

            provaDataInput.value = dadosProva.data || '';
            provaHorarioInput.value = dadosProva.horario || '';
            provaLocalInput.value = dadosProva.local || '';
            provaStatusSelect.value = dadosProva.status || 'Agendado';
            provaValorNotaInput.value = dadosProva.valorNota ? String(dadosProva.valorNota).replace('.', ',') : '';
            provaConteudosInput.value = dadosProva.conteudos || '';
            provaObservacoesInput.value = dadosProva.observacoes || '';
            provaNotaObtidaInput.value = dadosProva.notaObtida ? String(dadosProva.notaObtida).replace('.', ',') : '';

            formProva.dataset.provaId = dadosProva.id;
            if (tabelaProvasDt && targetTr) {
                formProva.dataset.rowIndex = tabelaProvasDt.row(targetTr).index();
            }
        } else {
            provaDisciplinaSelect.value = "";
            provaProfessorInput.value = "";
        }

        // Lógica para abrir modal (tentar <dialog> ou Bootstrap)
        if (modalProva && typeof modalProva.showModal === 'function') {
            modalProva.showModal();
        } else if (window.bootstrap && modalProva) {
             const bsModal = bootstrap.Modal.getInstance(modalProva) || new bootstrap.Modal(modalProva);
             bsModal.show();
        } else {
            console.error("modalProva não é um elemento <dialog> válido ou Bootstrap Modal não está disponível.");
        }
    }


    function fecharModalFormProva() {
        if (modalProva && typeof modalProva.close === 'function') {
             modalProva.close();
        } else if (window.bootstrap && modalProva) {
            const bsModal = bootstrap.Modal.getInstance(modalProva);
            if (bsModal) bsModal.hide();
        }

        if (formProva) {
            formProva.reset();
            const fieldsToClearValidation = [
                provaDisciplinaSelect, provaProfessorInput, provaDataInput, provaHorarioInput,
                provaLocalInput, provaStatusSelect, provaValorNotaInput, provaConteudosInput,
                provaObservacoesInput, provaNotaObtidaInput
            ];
            fieldsToClearValidation.forEach(clearFieldError);
            delete formProva.dataset.provaId;
            delete formProva.dataset.rowIndex;
        }
    }

    if (fecharModalProvaBtn) fecharModalProvaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormProva(); });
    if (cancelarModalProvaBtn) cancelarModalProvaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormProva(); });
    if (modalProva) modalProva.addEventListener("click", e => {
        if (e.target === modalProva && typeof modalProva.close === 'function') {
            fecharModalFormProva();
        }
    });


    // --- GERENCIAMENTO DO MODAL DE BUSCA ---
    function abrirModalDeBusca() {
        if (modalBusca && inputBuscaProvasModal && tabelaProvasDt) {
            inputBuscaProvasModal.value = tabelaProvasDt.search();
            if (typeof modalBusca.showModal === 'function') modalBusca.showModal();
            else if (window.bootstrap) {
                const bsModal = bootstrap.Modal.getInstance(modalBusca) || new bootstrap.Modal(modalBusca);
                bsModal.show();
            }
            inputBuscaProvasModal.focus();
        }
    }
    function fecharModalDeBusca() {
        if (modalBusca && typeof modalBusca.close === 'function') modalBusca.close();
        else if (window.bootstrap && modalBusca) {
            const bsModal = bootstrap.Modal.getInstance(modalBusca);
            if (bsModal) bsModal.hide();
        }
    }

    function aplicarBuscaDoModal() {
        if (tabelaProvasDt && inputBuscaProvasModal) {
            tabelaProvasDt.search(inputBuscaProvasModal.value).draw();
        }
        fecharModalDeBusca();
    }

    if (fecharModalBuscaBtn) { fecharModalBuscaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeBusca(); }); }
    if (aplicarBuscaProvasBtn) { aplicarBuscaProvasBtn.addEventListener("click", (e) => { e.preventDefault(); aplicarBuscaDoModal(); }); }
    if (inputBuscaProvasModal) { inputBuscaProvasModal.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); aplicarBuscaDoModal(); } }); }
    if (modalBusca) modalBusca.addEventListener("click", e => {
        if (e.target === modalBusca && typeof modalBusca.close === 'function') {
            fecharModalDeBusca();
        }
    });


    // --- FUNÇÕES E LISTENERS DO MODAL DE DETALHES ---
    function abrirModalDeDetalhes(dadosLinhaTabela, dadosCompletosProva = null) {
        if (!modalDetalhes || !modalDetalhesConteudo || !modalDetalhesProvaLabel) {
            console.error("Elementos do modal de detalhes não encontrados.");
            return;
        }

        const disciplina = dadosCompletosProva?.disciplinaNome || (dadosLinhaTabela ? dadosLinhaTabela[0] : null) || 'N/A';
        modalDetalhesProvaLabel.textContent = "Detalhes da Prova";

        const professorDaLista = listaDisciplinas.find(d => d.id === dadosCompletosProva?.disciplinaId || d.nome === disciplina)?.professor;
        const professor = dadosCompletosProva?.professor || professorDaLista || "Não informado";

        let notaObtidaOriginal = '';
        let valorNotaOriginal = '10.0'; // Default
        if (dadosCompletosProva) {
            notaObtidaOriginal = dadosCompletosProva.notaObtida !== undefined ? dadosCompletosProva.notaObtida : '';
            valorNotaOriginal = dadosCompletosProva.valorNota || '10.0';
        } else if (dadosLinhaTabela && dadosLinhaTabela[1] && dadosLinhaTabela[1] !== '-') {
            const partesNota = String(dadosLinhaTabela[1]).split('/');
            notaObtidaOriginal = partesNota[0]?.trim().replace(',', '.') || '';
            valorNotaOriginal = partesNota[1]?.trim().replace(',', '.') || '10.0';
        }

        const notaFormatada = notaObtidaOriginal && notaObtidaOriginal !== '' ?
            `${String(notaObtidaOriginal).replace('.', ',')} / ${String(valorNotaOriginal).replace('.', ',')}` :
            (valorNotaOriginal ? `- / ${String(valorNotaOriginal).replace('.', ',')}` : '-');


        const dataHorario = (dadosLinhaTabela ? dadosLinhaTabela[2] : null) || '-';
        const local = dadosCompletosProva?.local !== undefined ? (dadosCompletosProva.local || '-') : ((dadosLinhaTabela ? dadosLinhaTabela[3] : null) || '-');

        let statusParaDetalhes = (dadosLinhaTabela ? dadosLinhaTabela[4] : null); // Assume que já é HTML com o badge
        if (dadosCompletosProva?.status) {
            const statusBadgeClass = dadosCompletosProva.status === 'Agendado' ? 'bg-info-subtle text-info' :
                (dadosCompletosProva.status === 'Concluída' ? 'bg-success-subtle text-success' :
                    'bg-danger-subtle text-danger');
            statusParaDetalhes = `<span class="badge ${statusBadgeClass}">${dadosCompletosProva.status}</span>`;
        } else if (typeof statusParaDetalhes !== 'string' || !String(statusParaDetalhes).includes('<span')) {
            statusParaDetalhes = dadosCompletosProva?.status || String(statusParaDetalhes || '-') ;
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
        if (modalDetalhes && typeof modalDetalhes.showModal === 'function') modalDetalhes.showModal();
        else if (window.bootstrap && modalDetalhes) {
            const bsModal = bootstrap.Modal.getInstance(modalDetalhes) || new bootstrap.Modal(modalDetalhes);
            bsModal.show();
        }
    }
    function fecharModalDeDetalhes() {
        if (modalDetalhes && typeof modalDetalhes.close === 'function') modalDetalhes.close();
        else if (window.bootstrap && modalDetalhes) {
            const bsModal = bootstrap.Modal.getInstance(modalDetalhes);
            if (bsModal) bsModal.hide();
        }
    }
    if (fecharModalDetalhesBtn) { fecharModalDetalhesBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhes(); }); }
    if (okModalDetalhesBtn) { okModalDetalhesBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhes(); }); }
    if (modalDetalhes) modalDetalhes.addEventListener("click", e => {
        if (e.target === modalDetalhes && typeof modalDetalhes.close === 'function') {
            fecharModalDeDetalhes();
        }
    });

    // --- AÇÕES NA TABELA ---
    $('body').on('click', '.btn-detalhar-prova, .btn-marcar-concluida, .btn-edit-proof, .btn-remover-prova', function (e) {
        e.preventDefault();

        const $clickedItem = $(this);
        const $dropdownMenu = $clickedItem.closest('.dropdown-menu');
        const $originalButton = $dropdownMenu.data('bs-dropdown-toggle-button');

        // Função auxiliar para fechar o dropdown
        const hideDropdown = () => {
            if ($originalButton && $originalButton.length > 0 && window.bootstrap) {
                const dropdownInstance = bootstrap.Dropdown.getInstance($originalButton[0]);
                if (dropdownInstance) {
                    dropdownInstance.hide();
                } else {
                     // console.warn("Instância do dropdown não encontrada para fechar.");
                }
            } else {
                // console.warn("Botão original do dropdown não disponível para fechar o dropdown.");
            }
        };

        if (!$originalButton || $originalButton.length === 0) {
            console.error("Ação na Tabela: Botão original do dropdown não encontrado nos dados do menu. A ação pode falhar.");
            // Tentar fechar qualquer dropdown visível como último recurso, embora menos preciso
            if(window.bootstrap && $('.dropdown-menu.show').length > 0) {
                // Esta é uma tentativa genérica, pode não ser o dropdown correto
                // $('.dropdown-menu.show').each(function() {
                //    const possibleToggle = $(this).data('bs-dropdown-toggle-button') || $(this).siblings('[data-bs-toggle="dropdown"]')[0];
                //    if(possibleToggle) {
                //        const instance = bootstrap.Dropdown.getInstance(possibleToggle);
                //        if(instance) instance.hide();
                //    }
                // });
            }
            return;
        }

        let trElement = $originalButton.closest('tr')[0];

        // Fallback original do seu código (usar com cautela, o método primário é mais confiável)
        if (!trElement) {
            console.warn("Ação Tabela: trElement não encontrado via $originalButton.closest('tr'). Tentando fallback...");
            const $associatedButtonFallback = $dropdownMenu.prev('.btn.btn-sm.btn-icon');
            if ($associatedButtonFallback.length) {
                trElement = $associatedButtonFallback.closest('tr')[0];
                 console.log("Ação Tabela: trElement encontrado via fallback.");
            }
        }

        if (!tabelaProvasDt || !trElement) {
            console.error("Ação Tabela: DataTables não inicializado ou trElement não encontrado.");
            hideDropdown(); // Tenta fechar antes de sair
            return;
        }

        const row = tabelaProvasDt.row(trElement);
        if (!row || !row.length || !row.node()) {
             console.error("Ação Tabela: Linha do DataTables não encontrada para o trElement:", trElement);
             hideDropdown(); // Tenta fechar antes de sair
             return;
        }

        const rowDataArray = row.data(); // Dados visíveis da linha
        const dadosCompletosArmazenados = $(trElement).data('completo'); // Dados completos armazenados no TR

        // --- LÓGICA DAS AÇÕES ---
        if ($clickedItem.hasClass('btn-detalhar-prova')) {
            if (!dadosCompletosArmazenados && !rowDataArray) {
                alert("Erro: Dados insuficientes para detalhar a prova.");
            } else {
                abrirModalDeDetalhes(rowDataArray, dadosCompletosArmazenados);
            }
        } else if ($clickedItem.hasClass('btn-marcar-concluida')) {
            if (!dadosCompletosArmazenados) {
                console.error("Marcar Concluída: dadosCompletosArmazenados não encontrados para a linha TR:", trElement, "ID Debug:", $(trElement).attr('data-prova-id-debug'));
                alert("Erro: Não foi possível obter os dados completos da prova para marcar como concluída.");
            } else if (dadosCompletosArmazenados.status === 'Concluída') {
                alert("Esta prova já está marcada como concluída.");
            } else {
                dadosCompletosArmazenados.status = 'Concluída';
                $(trElement).data('completo', dadosCompletosArmazenados); // Atualiza os dados armazenados

                if (rowDataArray) {
                    rowDataArray[4] = `<span class="badge bg-success-subtle text-success">Concluída</span>`; // Atualiza a célula de status
                    row.data(rowDataArray).draw(false); // Redesenha a linha
                    alert("Prova marcada como concluída!");
                } else {
                    console.error("Marcar Concluída: rowDataArray não encontrado. A tabela pode não ser atualizada visualmente.");
                    alert("Prova marcada como concluída (dados internos atualizados, mas pode haver erro na visualização).");
                     // Forçar um redesenho geral pode ajudar se rowDataArray estiver dessincronizado, mas é melhor investigar a causa.
                     // tabelaProvasDt.draw(false);
                }
            }
        } else if ($clickedItem.hasClass('btn-edit-proof')) {
            if (!dadosCompletosArmazenados) {
                console.error("Editar Prova: dadosCompletosArmazenados não encontrados para a linha TR:", trElement, "ID Debug:", $(trElement).attr('data-prova-id-debug'));
                alert("Erro: Não foi possível obter os dados completos da prova para edição.");
            } else {
                const dadosParaModal = {
                    id: dadosCompletosArmazenados.id || 'tempID-' + new Date().getTime(),
                    disciplinaId: dadosCompletosArmazenados.disciplinaId || '',
                    professor: dadosCompletosArmazenados.professor || '',
                    notaObtida: dadosCompletosArmazenados.notaObtida !== undefined ? String(dadosCompletosArmazenados.notaObtida).replace('.', ',') : '',
                    data: dadosCompletosArmazenados.data || '',
                    horario: dadosCompletosArmazenados.horario || '',
                    local: dadosCompletosArmazenados.local || '',
                    status: dadosCompletosArmazenados.status || 'Agendado',
                    valorNota: dadosCompletosArmazenados.valorNota !== undefined ? String(dadosCompletosArmazenados.valorNota).replace('.', ',') : '',
                    conteudos: dadosCompletosArmazenados.conteudos || '',
                    observacoes: dadosCompletosArmazenados.observacoes || ''
                };
                abrirModalFormProva(true, dadosParaModal, trElement);
            }
        } else if ($clickedItem.hasClass('btn-remover-prova')) {
            const disciplinaNome = rowDataArray ? (rowDataArray[0] || "esta prova") : "esta prova";
            if (confirm(`Tem certeza que deseja remover a prova de "${disciplinaNome}"?`)) {
                row.remove().draw(false);
                alert("Prova removida com sucesso!");
            }
        }

        hideDropdown(); // Chama a função para fechar o dropdown
    });


    // --- SUBMIT DO FORMULÁRIO DE PROVA ---
    if (formProva) {
        formProva.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!validateFormProva()) {
                console.warn("Formulário de prova inválido.");
                return;
            }

            if (!tabelaProvasDt) {
                console.error("DataTables não inicializado.");
                return;
            }

            const provaId = formProva.dataset.provaId || 'newID-' + new Date().getTime();
            const rowIndex = formProva.dataset.rowIndex !== undefined ? parseInt(formProva.dataset.rowIndex) : undefined;

            const disciplinaSelecionadaObj = listaDisciplinas.find(d => d.id === provaDisciplinaSelect.value);

            const dadosCompletosProva = {
                id: provaId,
                disciplinaId: provaDisciplinaSelect.value,
                disciplinaNome: disciplinaSelecionadaObj ? disciplinaSelecionadaObj.nome : (provaDisciplinaSelect.options[provaDisciplinaSelect.selectedIndex]?.text || 'N/A'),
                professor: provaProfessorInput.value.trim(),
                data: provaDataInput.value,
                horario: provaHorarioInput.value,
                local: provaLocalInput.value.trim(),
                status: provaStatusSelect.value,
                valorNota: provaValorNotaInput.value.trim().replace(',', '.') || "10.0",
                conteudos: provaConteudosInput.value.trim(),
                observacoes: provaObservacoesInput.value.trim(),
                notaObtida: provaNotaObtidaInput.value.trim().replace(',', '.')
            };

            let dataHoraFormatadaParaTabela = '-';
            if (dadosCompletosProva.data) {
                const [year, month, day] = dadosCompletosProva.data.split('-');
                const dataObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
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
                    <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da prova" data-bs-popper-boundary="window">
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

            const notaExibicao = dadosCompletosProva.notaObtida && dadosCompletosProva.notaObtida !== '' ?
                `${String(dadosCompletosProva.notaObtida).replace('.', ',')} / ${String(dadosCompletosProva.valorNota).replace('.', ',')}`
                : (dadosCompletosProva.valorNota && dadosCompletosProva.valorNota !== '' ? `- / ${String(dadosCompletosProva.valorNota).replace('.', ',')}` : '-');

            const dadosLinhaTabela = [
                dadosCompletosProva.disciplinaNome,
                notaExibicao,
                dataHoraFormatadaParaTabela,
                dadosCompletosProva.local || '-',
                statusHtml,
                dropdownHtml
            ];

            let targetRowNode; // Alterado de targetRow para targetRowNode para clareza

            if (provaId && rowIndex !== undefined && tabelaProvasDt.row(rowIndex).node()) {
                targetRowNode = tabelaProvasDt.row(rowIndex).data(dadosLinhaTabela).draw(false).node();
                alert("Prova atualizada com sucesso!");
            } else {
                targetRowNode = tabelaProvasDt.row.add(dadosLinhaTabela).draw(false).node();
                alert("Prova adicionada com sucesso!");
            }

            if (targetRowNode) { // Verifica se targetRowNode é válido
                console.log("FORM SUBMIT: Armazenando dados 'completo' no TR Node:", targetRowNode, "Com dados:", dadosCompletosProva);
                $(targetRowNode).data('completo', dadosCompletosProva);
                // $(targetRowNode).attr('data-prova-id-debug', dadosCompletosProva.id); // Para ajudar na depuração

                // Opcional: armazenar outros dados individualmente se necessário
                $(targetRowNode).data('id', dadosCompletosProva.id);
                $(targetRowNode).data('status', dadosCompletosProva.status);
                 // ... etc.
                const dadosVerificados = $(targetRowNode).data('completo');
                console.log("FORM SUBMIT: Verificando 'completo' data após armazenamento:", dadosVerificados);
                if (!dadosVerificados) {
                    console.error("FORM SUBMIT: FALHA ao verificar os dados 'completo' imediatamente após o armazenamento no TR:", targetRowNode);
                }
            } else {
                console.error("FORM SUBMIT: targetRowNode não foi definido. Dados 'completo' não foram armazenados.");
            }

            fecharModalFormProva();
            if (tabelaProvasDt) tabelaProvasDt.columns.adjust().responsive.recalc();
        });
    }

    // --- FUNÇÕES AUXILIARES DE FORMATAÇÃO ---
    function formatarHora(timeString) {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        let h = parseInt(hour);
        if (isNaN(h) || isNaN(parseInt(minute))) { console.warn("Invalid time format for formatarHora:", timeString); return timeString; }
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

        let [hoursStr, minutesStr] = timePart.split(':');
        let hours = parseInt(hoursStr, 10);
        let minutes = parseInt(minutesStr, 10);

        if (isNaN(hours) || isNaN(minutes)) { console.warn("Invalid time format for formatarHoraParaInput:", displayTime); return ''; }

        if (modifier === 'PM' && hours < 12) hours += 12;
        else if (modifier === 'AM' && hours === 12) hours = 0;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    function parsePtBrDateToIso(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return "";
        let parts = dateStr.trim().split(" ");
        if (parts.length !== 3) {
            const dateSeparators = dateStr.match(/(\d{1,2})[\/\-\. ]([a-zA-ZçÇãÃõÕ]{3,})[\/\-\. ](\d{4})/i);
            if (dateSeparators && dateSeparators.length === 4) {
                parts = [dateSeparators[1], dateSeparators[2], dateSeparators[3]];
            } else { console.warn("Unexpected or invalid PtBr date format for parsePtBrDateToIso:", dateStr); return ""; }
        }
        const day = String(parts[0]).padStart(2,'0');
        const monthStr = parts[1].toLowerCase().substring(0, 3);
        const year = parts[2];

        const monthMap = {
            'jan':'01','fev':'02','mar':'03','abr':'04',
            'mai':'05','jun':'06','jul':'07','ago':'08',
            'set':'09','out':'10','nov':'11','dez':'12'
        };
        const month = monthMap[monthStr];

        if (!month || !/^\d{4}$/.test(year) || !/^\d{2}$/.test(day)) {
            console.warn("Invalid PtBr date components after parse:", dateStr, "-> Day:", day, "Month:", monthStr, "Year:", year);
            return "";
        }
        return `${year}-${month}-${day}`;
    }

    // --- FINAL INITIALIZATIONS ---
    popularDisciplinasSelect();
    inicializarDataTable();
});
