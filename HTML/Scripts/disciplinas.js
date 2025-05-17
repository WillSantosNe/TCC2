document.addEventListener("DOMContentLoaded", function () {
    // --- ELEMENT SELECTORS ---
    const modalDisciplina = document.querySelector("#modalDisciplina");
    const abrirModalNovaDisciplinaBtnOriginal = document.querySelector("#abrirModalNovaDisciplina");
    const fecharModalDisciplinaBtn = document.querySelector("#fecharModalDisciplina");
    const cancelarModalDisciplinaBtn = document.querySelector("#cancelarModalDisciplina");
    const formDisciplina = document.querySelector("#formDisciplina");
    const modalDisciplinaLabel = document.querySelector("#modalDisciplinaLabel");

    const disciplinaIdInput = document.getElementById('disciplinaId');
    const disciplinaNomeInput = document.getElementById('disciplinaNome');
    const disciplinaProfessorInput = document.getElementById('disciplinaProfessor');
    const disciplinaDiasInput = document.getElementById('disciplinaDias');
    const disciplinaHorarioInicioInput = document.getElementById('disciplinaHorarioInicio');
    const disciplinaHorarioFimInput = document.getElementById('disciplinaHorarioFim');
    const disciplinaLocalInput = document.getElementById('disciplinaLocal');

    // Details Modal Selectors (se você for usá-los)
    const modalDetalhesDisciplina = document.querySelector("#modalDetalhesDisciplina");
    const fecharModalDetalhesDisciplinaBtn = document.querySelector("#fecharModalDetalhesDisciplina");
    const okModalDetalhesDisciplinaBtn = document.querySelector("#okModalDetalhesDisciplina");
    const modalDetalhesDisciplinaConteudo = document.querySelector("#modalDetalhesDisciplinaConteudo");
    const modalDetalhesDisciplinaLabel = document.querySelector("#modalDetalhesDisciplinaLabel");

    let tabelaDisciplinasDt;
    let resizeDebounceTimer;

    // --- VALIDATION AND ERROR FEEDBACK FUNCTIONS ---
    function displayFieldError(inputElement, message) {
        clearFieldError(inputElement);
        inputElement.classList.add('is-invalid');
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'invalid-feedback d-block';
        feedbackDiv.textContent = message;
        const parent = inputElement.closest('.mb-3, .col-sm-6') || inputElement.parentNode;
        if (parent) {
             parent.insertBefore(feedbackDiv, inputElement.nextSibling);
        } else if (inputElement.parentNode) { // Fallback mais simples
            inputElement.parentNode.insertBefore(feedbackDiv, inputElement.nextSibling);
        }
    }

    function clearFieldError(inputElement) {
        inputElement.classList.remove('is-invalid');
        const parent = inputElement.closest('.mb-3, .col-sm-6') || inputElement.parentNode;
        if (parent) {
            const feedbackElement = parent.querySelector('.invalid-feedback.d-block');
            if (feedbackElement) {
                feedbackElement.remove();
            }
        } else if (inputElement.parentNode) { // Fallback mais simples
             const feedbackElement = inputElement.parentNode.querySelector('.invalid-feedback.d-block');
             if (feedbackElement) feedbackElement.remove();
        }
    }

    function validateFormDisciplina() {
        let isValid = true;
        const fieldsToValidate = [
            { element: disciplinaNomeInput, message: "Por favor, informe o nome da disciplina." },
            { element: disciplinaDiasInput, message: "Por favor, informe os dias da semana." },
            { element: disciplinaHorarioInicioInput, message: "Por favor, informe o horário de início." },
            { element: disciplinaHorarioFimInput, message: "Por favor, informe o horário de fim." },
            { element: disciplinaLocalInput, message: "Por favor, informe o local da disciplina." }
        ];

        fieldsToValidate.forEach(field => {
            if (!field.element) {
                console.warn("ValidateFormDisciplina: Elemento não encontrado para validação", field);
                return;
            }
            clearFieldError(field.element);
            if (!field.element.value || field.element.value.trim() === "") {
                displayFieldError(field.element, field.message);
                isValid = false;
            }
        });

        if (disciplinaHorarioInicioInput && disciplinaHorarioFimInput && disciplinaHorarioInicioInput.value && disciplinaHorarioFimInput.value) {
            if (disciplinaHorarioInicioInput.value >= disciplinaHorarioFimInput.value) {
                displayFieldError(disciplinaHorarioFimInput, "O horário de fim deve ser depois do horário de início.");
                isValid = false;
            }
        }
        return isValid;
    }

    // --- DATA AND UI MANIPULATION FUNCTIONS ---
    function formatTime(timeString) {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        let h = parseInt(hour);
        if (isNaN(h) || isNaN(parseInt(minute))) { return timeString; }
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
    }

    function formatTimeForInput(displayTime) {
        if (!displayTime || typeof displayTime !== 'string') return '';
        let timePart = displayTime.toUpperCase().trim();
        let modifier = "";
        if (timePart.endsWith('AM')) { modifier = 'AM'; timePart = timePart.slice(0, -2).trim(); }
        else if (timePart.endsWith('PM')) { modifier = 'PM'; timePart = timePart.slice(0, -2).trim(); }

        let [hoursStr, minutesStr] = timePart.split(':');
        let hours = parseInt(hoursStr, 10);
        let minutes = parseInt(minutesStr, 10);

        if (isNaN(hours) || isNaN(minutes)) { return ''; }

        if (modifier === 'PM' && hours < 12) hours += 12;
        else if (modifier === 'AM' && hours === 12) hours = 0;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // --- DATATABLE INITIALIZATION ---
    function inicializarDataTable() {
        if (!window.jQuery || !$.fn.DataTable) {
            console.error("jQuery or DataTables not loaded!");
            return null;
        }

        if ($.fn.DataTable.isDataTable('#tabelaDisciplinas')) {
            $('#tabelaDisciplinas').DataTable().destroy();
        }

        tabelaDisciplinasDt = $('#tabelaDisciplinas').DataTable({
            responsive: {
                details: { type: 'column', target: -1 }
            },
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto me-md-auto"f><"col-12 col-md-auto dt-buttons-container">>t<"row mt-3 align-items-center"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7 dataTables_paginate_wrapper"p>>',
            paging: false,
            scrollY: '450px',
            scrollCollapse: true,
            lengthChange: false,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json',
                search: "",
                searchPlaceholder: "Buscar disciplinas...",
                info: "Total de _TOTAL_ disciplinas",
                infoEmpty: "Nenhuma disciplina encontrada",
                infoFiltered: "(filtrado de _MAX_ disciplinas)",
            },
            columnDefs: [
                { orderable: false, targets: 'no-sort' },
                { responsivePriority: 1, targets: 0 },
                { responsivePriority: 3, targets: 1 },
                { responsivePriority: 2, targets: 2 },
                { responsivePriority: 4, targets: 3 },
                { responsivePriority: 5, targets: 4 },
                { responsivePriority: 1, targets: 5, className: "dt-actions-column no-export" }
            ],
            createdRow: function (row, data, dataIndex) {
                const $row = $(row);
                const initialDataAttrs = {};
                $.each(row.attributes, function(index, attr) {
                    if (attr.name.startsWith('data-')) {
                        let key = attr.name.substring(5).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                        initialDataAttrs[key] = attr.value;
                    }
                });

                if (!$row.data('completo') && initialDataAttrs.disciplinaId) {
                    const completo = {
                        id: initialDataAttrs.disciplinaId,
                        nome: data[0], professor: data[1], dias: initialDataAttrs.dias,
                        horarioInicio: initialDataAttrs.horarioInicio, horarioFim: initialDataAttrs.horarioFim,
                        local: initialDataAttrs.local
                    };
                    $row.data('completo', completo);
                    $row.data('id', initialDataAttrs.disciplinaId); // Armazena ID individualmente
                    // console.log("CREATED ROW: Stored 'completo'", completo, "on TR:", row);
                }
            },
            initComplete: function (settings, json) {
                const api = this.api();
                $('#tabelaDisciplinas_filter input').addClass('form-control form-control-sm').css('width', 'auto').attr('aria-label', 'Buscar disciplinas');

                const buttonsContainer = $(this.api().table().container()).find('.dt-custom-header .dt-buttons-container');
                console.log("DataTables initComplete: buttonsContainer encontrado:", buttonsContainer.length > 0);

                if (abrirModalNovaDisciplinaBtnOriginal) {
                    if (buttonsContainer.length > 0) {
                        if ($('#abrirModalNovaDisciplinaDt').length === 0) {
                            const abrirModalBtnClone = abrirModalNovaDisciplinaBtnOriginal.cloneNode(true);
                            abrirModalBtnClone.id = 'abrirModalNovaDisciplinaDt';
                            $(abrirModalBtnClone).off('click').on('click', (e) => {
                                e.preventDefault();
                                console.log("'Adicionar Disciplina' (clone) button clicked.");
                                abrirModalFormDisciplina();
                            });
                            buttonsContainer.append(abrirModalBtnClone);
                            console.log("Botão 'Adicionar Disciplina' CLONADO e listener anexado ao clone no header do DataTables.");
                        }
                        abrirModalNovaDisciplinaBtnOriginal.style.display = 'none';
                    } else {
                        console.warn("Container de botões do DataTables (.dt-buttons-container) não encontrado. O botão 'Adicionar Disciplina' original será usado.");
                        // Fallback: Adiciona listener ao botão original se o container não for encontrado
                        $(abrirModalNovaDisciplinaBtnOriginal).off('click.original').on('click.original', (e) => {
                            e.preventDefault();
                            console.log("Botão 'Adicionar Disciplina' ORIGINAL clicado (container do clone não encontrado).");
                            abrirModalFormDisciplina();
                        });
                    }
                } else {
                    console.warn("Botão original 'abrirModalNovaDisciplina' não encontrado no DOM.");
                }


                $('#tabelaDisciplinas tbody').off('show.bs.dropdown.disciplinas').on('show.bs.dropdown.disciplinas', '.dropdown', function (e) {
                    const $dropdown = $(this);
                    const $dropdownMenu = $dropdown.find('.dropdown-menu');
                    if (!$dropdownMenu.parent().is('body')) {
                        $dropdownMenu.data('bs-dropdown-original-parent', $dropdown);
                        $dropdownMenu.data('bs-dropdown-toggle-button', $(e.target));
                        $dropdownMenu.appendTo('body');
                        const bsDropdown = bootstrap.Dropdown.getInstance(e.target);
                        if (bsDropdown && bsDropdown._popper) bsDropdown._popper.update();
                    }
                });

                $('body').off('hide.bs.dropdown.disciplinas').on('hide.bs.dropdown.disciplinas', '.dropdown-menu', function (e) {
                    const $dropdownMenu = $(this);
                    const $originalParent = $dropdownMenu.data('bs-dropdown-original-parent');
                     // Verifica se o dropdown pertence a esta tabela antes de mover de volta
                    if ($originalParent && $originalParent.closest('#tabelaDisciplinas').length && !$dropdownMenu.parent().is($originalParent)) {
                        $dropdownMenu.prependTo($originalParent);
                        $dropdownMenu.removeData('bs-dropdown-original-parent');
                        $dropdownMenu.removeData('bs-dropdown-toggle-button');
                    } else if (!$originalParent && $(this).data('bs-dropdown-toggle-button')?.closest('#tabelaDisciplinas').length) {
                        // Caso o originalParent não tenha sido setado mas o botão seja desta tabela (pouco provável aqui)
                        // Limpa os dados para evitar comportamento inesperado
                        $dropdownMenu.removeData('bs-dropdown-original-parent');
                        $dropdownMenu.removeData('bs-dropdown-toggle-button');
                    }
                });

                $(window).off('resize.dtDisciplinas').on('resize.dtDisciplinas', function () {
                    clearTimeout(resizeDebounceTimer);
                    resizeDebounceTimer = setTimeout(() => { if (tabelaDisciplinasDt) tabelaDisciplinasDt.columns.adjust().responsive.recalc(); }, 250);
                });
                // Se você tem a função handleResponsiveControls e quer chamá-la:
                // if (typeof handleResponsiveControls === 'function') {
                // handleResponsiveControls(api);
                // }
            }
        });
        return tabelaDisciplinasDt;
    }

    // --- MANAGE ADD/EDIT DISCIPLINA MODAL ---
    function abrirModalFormDisciplina(isEditMode = false, dadosDisciplina = null, targetTr = null) {
        console.log("abrirModalFormDisciplina INVOCADO. isEditMode:", isEditMode, "Dados:", dadosDisciplina);
        if (!formDisciplina || !modalDisciplinaLabel || !modalDisciplina || !disciplinaNomeInput) {
            console.error("Discipline modal elements not found. Cannot open modal."); return;
        }
        formDisciplina.reset();
        [disciplinaNomeInput, disciplinaProfessorInput, disciplinaDiasInput,
         disciplinaHorarioInicioInput, disciplinaHorarioFimInput, disciplinaLocalInput]
        .forEach(clearFieldError);

        delete formDisciplina.dataset.disciplinaId;
        delete formDisciplina.dataset.rowIndex;
        disciplinaIdInput.value = '';

        modalDisciplinaLabel.textContent = isEditMode ? "Editar Disciplina" : "Adicionar Disciplina";

        if (isEditMode && dadosDisciplina) {
            console.log("Modo Edição - Populando formulário:", dadosDisciplina);
            disciplinaIdInput.value = dadosDisciplina.id || '';
            disciplinaNomeInput.value = dadosDisciplina.nome || '';
            disciplinaProfessorInput.value = dadosDisciplina.professor || '';
            disciplinaDiasInput.value = dadosDisciplina.dias || '';
            disciplinaHorarioInicioInput.value = dadosDisciplina.horarioInicio || '';
            disciplinaHorarioFimInput.value = dadosDisciplina.horarioFim || '';
            disciplinaLocalInput.value = dadosDisciplina.local || '';
            formDisciplina.dataset.disciplinaId = dadosDisciplina.id;
            if (tabelaDisciplinasDt && targetTr) {
                formDisciplina.dataset.rowIndex = tabelaDisciplinasDt.row(targetTr).index();
            }
        } else {
            console.log("Modo Adição - Formulário resetado.");
        }

        if (modalDisciplina && typeof modalDisciplina.showModal === 'function') {
            modalDisciplina.showModal();
            console.log("Modal disciplina (dialog) aberto.");
        } else {
            console.error("modalDisciplina não é um elemento <dialog> válido ou showModal não é uma função.");
        }
    }

    function fecharModalFormDisciplina() {
        if (modalDisciplina && typeof modalDisciplina.close === 'function') modalDisciplina.close();
        if (formDisciplina) {
            formDisciplina.reset();
            [disciplinaNomeInput, disciplinaProfessorInput, disciplinaDiasInput,
             disciplinaHorarioInicioInput, disciplinaHorarioFimInput, disciplinaLocalInput]
            .forEach(clearFieldError);
            delete formDisciplina.dataset.disciplinaId;
            delete formDisciplina.dataset.rowIndex;
            disciplinaIdInput.value = '';
        }
    }

    if (abrirModalNovaDisciplinaBtnOriginal && !$('#tabelaDisciplinas').closest('.dataTables_wrapper').find('.dt-buttons-container').length) {
        // Adiciona listener ao botão original APENAS se o container de botões do DT não for encontrado
        // e o botão clonado não for criado.
        console.log("Anexando listener ao botão ADICIONAR DISCIPLINA ORIGINAL como fallback (container DT não encontrado).");
        $(abrirModalNovaDisciplinaBtnOriginal).on('click', function(e) {
            e.preventDefault();
            abrirModalFormDisciplina();
        });
    }

    if (fecharModalDisciplinaBtn) fecharModalDisciplinaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormDisciplina(); });
    if (cancelarModalDisciplinaBtn) cancelarModalDisciplinaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormDisciplina(); });
    if (modalDisciplina) modalDisciplina.addEventListener("click", e => { if (e.target === modalDisciplina) fecharModalFormDisciplina(); });


    // --- TABLE ACTIONS (EDITAR, REMOVER) ---
    $('body').on('click', '.btn-edit-disciplina, .btn-remover-disciplina', function (e) {
        e.preventDefault();

        const $clickedItem = $(this);
        const $dropdownMenu = $clickedItem.closest('.dropdown-menu');
        const $originalButton = $dropdownMenu.data('bs-dropdown-toggle-button');

        const hideDropdown = () => {
            if ($originalButton && $originalButton.length > 0 && window.bootstrap) {
                const dropdownInstance = bootstrap.Dropdown.getInstance($originalButton[0]);
                if (dropdownInstance) dropdownInstance.hide();
            }
        };

        if (!$originalButton || $originalButton.length === 0) {
            console.error("Ações Disciplina: Botão original do dropdown não encontrado. Ação cancelada.");
            return;
        }
        let trElement = $originalButton.closest('tr')[0];
        if (!trElement) { // Fallback simples se o botão não estiver diretamente em um TR (improvável aqui)
             trElement = $clickedItem.closest('tr')[0];
        }


        if (!tabelaDisciplinasDt || !trElement) {
            console.error("Ações Disciplina: DataTables não inicializado ou trElement não encontrado.");
            hideDropdown(); return;
        }
        const row = tabelaDisciplinasDt.row(trElement);
        if (!row || !row.length || !row.node()) {
             console.error("Ações Disciplina: Linha do DataTables não encontrada.", trElement);
             hideDropdown(); return;
        }

        const rowDataArray = row.data();
        const dadosCompletosArmazenados = $(trElement).data('completo');
        console.log("Ação Disciplina: TR Element:", trElement);
        console.log("Ação Disciplina: Dados Completos Armazenados:", dadosCompletosArmazenados);


        if ($clickedItem.hasClass('btn-edit-disciplina')) {
            if (!dadosCompletosArmazenados) {
                console.error("Editar Disciplina: dadosCompletosArmazenados não encontrados.");
                alert("Erro: Não foi possível obter os dados completos da disciplina para edição.");
            } else {
                abrirModalFormDisciplina(true, dadosCompletosArmazenados, trElement);
            }
        } else if ($clickedItem.hasClass('btn-remover-disciplina')) {
            const nomeDisciplina = dadosCompletosArmazenados?.nome || (rowDataArray ? rowDataArray[0] : "esta disciplina");
            if (confirm(`Tem certeza que deseja remover a disciplina "${nomeDisciplina}"?`)) {
                row.remove().draw(false);
                alert("Disciplina removida com sucesso!");
            }
        }
        hideDropdown();
    });

    // --- FORM SUBMISSION ---
    if (formDisciplina) {
        formDisciplina.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!validateFormDisciplina()) return;
            if (!tabelaDisciplinasDt) { console.error("DataTables (disciplinas) não inicializado."); return; }

            const formDisciplinaId = formDisciplina.dataset.disciplinaId;
            const rowIndex = formDisciplina.dataset.rowIndex !== undefined ? parseInt(formDisciplina.dataset.rowIndex) : undefined;

            const dadosCompletosDisciplina = {
                id: formDisciplinaId || 'disc-' + new Date().getTime(),
                nome: disciplinaNomeInput.value.trim(),
                professor: disciplinaProfessorInput.value.trim(),
                dias: disciplinaDiasInput.value.trim(),
                horarioInicio: disciplinaHorarioInicioInput.value,
                horarioFim: disciplinaHorarioFimInput.value,
                local: disciplinaLocalInput.value.trim()
            };

            const horarioFormatadoParaTabela = dadosCompletosDisciplina.horarioInicio && dadosCompletosDisciplina.horarioFim
                ? `${formatTime(dadosCompletosDisciplina.horarioInicio)} - ${formatTime(dadosCompletosDisciplina.horarioFim)}` : '-';

            const dropdownHtml = `
                <div class="dropdown">
                    <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da disciplina"><i class="bi bi-three-dots-vertical"></i></button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item btn-edit-disciplina" href="#"><i class="bi bi-pencil-square me-2"></i>Editar Disciplina</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item btn-remover-disciplina text-danger" href="#"><i class="bi bi-trash me-2"></i>Remover Disciplina</a></li>
                    </ul>
                </div>`;

            const dadosLinhaTabela = [
                dadosCompletosDisciplina.nome, dadosCompletosDisciplina.professor || '-',
                dadosCompletosDisciplina.dias || '-', horarioFormatadoParaTabela,
                dadosCompletosDisciplina.local || '-', dropdownHtml
            ];

            let targetRowNode;
            if (formDisciplinaId && rowIndex !== undefined && tabelaDisciplinasDt.row(rowIndex).node()) {
                targetRowNode = tabelaDisciplinasDt.row(rowIndex).data(dadosLinhaTabela).draw(false).node();
                alert("Disciplina atualizada com sucesso!");
            } else {
                targetRowNode = tabelaDisciplinasDt.row.add(dadosLinhaTabela).draw(false).node();
                alert("Disciplina adicionada com sucesso!");
            }

            if (targetRowNode) {
                $(targetRowNode).data('completo', dadosCompletosDisciplina);
                $(targetRowNode).data('id', dadosCompletosDisciplina.id);
                // console.log("Form Submit: Stored 'completo'", $(targetRowNode).data('completo'));
            }
            fecharModalFormDisciplina();
            if (tabelaDisciplinasDt) tabelaDisciplinasDt.columns.adjust().responsive.recalc();
        });
    }

    // --- FINAL INITIALIZATIONS ---
    inicializarDataTable();
});
