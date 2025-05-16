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

    // Remove references and logic related to the separate mobile search modal
    const modalBusca = document.querySelector("#modalBuscaProvas"); // Still needed for the element, but logic for triggering it from a button is removed
    const fecharModalBuscaBtn = document.querySelector("#fecharModalBusca"); // Still needed for closing the modal itself
    const inputBuscaProvasModal = document.querySelector("#inputBuscaProvas"); // Still needed for the modal input
    const aplicarBuscaProvasBtn = document.querySelector("#aplicarBuscaProvas"); // Still needed for applying search from modal

    const modalDetalhes = document.querySelector("#modalDetalhesProva");
    const fecharModalDetalhesBtn = document.querySelector("#fecharModalDetalhes");
    const okModalDetalhesBtn = document.querySelector("#okModalDetalhes");
    const modalDetalhesConteudo = document.querySelector("#modalDetalhesProvaConteudo");
    const modalDetalhesProvaLabel = document.querySelector("#modalDetalhesProvaLabel");

    let tabelaProvasDt;
    let resizeDebounceTimer; // Timer for debouncing the resize event

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

    // This function is not needed for fixed scrollY and can be removed if not used elsewhere.
    // function calcularAlturaCorpoTabela() { ... }


    // --- INICIALIZAÇÃO DO DATATABLE ---
    function inicializarDataTable() {
        if (!window.jQuery || !$.fn.DataTable) {
            console.error("jQuery ou DataTables não carregado!");
            return null;
        }

        // Destruir instância existente se houver (útil em SPA ou para re-inicializar)
        if ($.fn.DataTable.isDataTable('#tabelaProvas')) {
            $('#tabelaProvas').DataTable().destroy();
             // Limpar o DOM gerado pelo DataTables antes de re-inicializar
            $('#tabelaProvas tbody').empty(); // Limpa o tbody, o HTML original será re-usado
        }


        tabelaProvasDt = $('#tabelaProvas').DataTable({
            responsive: {
                details: {
                    type: 'column',
                    target: -1 // Última coluna (Ações) será usada para o controle (ícone +) SE necessário (se houver colunas colapsadas)
                }
            },
            dom:
                '<"row dt-custom-header align-items-center mb-3"' +
                    '<"col-12 col-md-auto me-md-auto"f>' + // Filtro
                    '<"col-12 col-md-auto dt-buttons-container">' + // Container para botões
                '>' +
                't' + // Tabela
                '<"row mt-3 align-items-center"' +
                    '<"col-sm-12 col-md-5"i>' + // Info
                    '<"col-sm-12 col-md-7 dataTables_paginate_wrapper"p>' + // Paginação (se usada) - será ocultada pelo paging: false
                '>',
            // --- OPÇÕES MODIFICADAS PARA SCROLL FIXO ---
            paging: false, // Desabilita a paginação padrão (botões Anterior/Próximo)
            scrollY: '450px', // Define uma altura fixa para o corpo da tabela (ajuste este valor se necessário para 10 linhas)
            scrollCollapse: true, // Permite que a tabela encolha abaixo do scrollY se houver menos dados
            lengthChange: false, // Oculta o dropdown "Show X entries"
            // --- FIM OPÇÕES MODIFICADAS ---
            language: {
                url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json',
                search: "",
                searchPlaceholder: "Buscar provas...",
                info: "Total de _TOTAL_ provas",
                infoEmpty: "Nenhuma prova encontrada",
                infoFiltered: "(filtrado de _MAX_ provas)",
                 // Paginação (se usar, mesmo que hidden, as strings podem ser necessárias)
                paginate: {
                     first: "Primeiro",
                     last: "Último",
                     next: "Próximo",
                     previous: "Anterior"
                }
            },
             columnDefs: [
                { orderable: false, targets: 'no-sort' }, // Coluna de Ações
                { responsivePriority: 1, targets: 0 },  // Disciplina (Prioridade Alta)
                { responsivePriority: 10001, targets: 1 }, // Nota (Colapsa cedo)
                { responsivePriority: 2, targets: 2 },  // Data & Horário
                { responsivePriority: 10002, targets: 3 }, // Local (Colapsa cedo)
                { responsivePriority: 3, targets: 4 },  // Status
                // Ações coluna deve ter alta prioridade para ficar visível
                { responsivePriority: 1, targets: 5, className: "dt-actions-column no-export" } // Ações (Prioridade Alta)
            ],
             // This function can be useful if you need to copy data attributes from the initial static HTML
             // aoColumnDefs is an older alternative to columnDefs. You can consolidate if you want.
             // The important thing is that the data attributes of the TR are accessible (via .data() of jQuery).
             aoColumnDefs: [
                {
                     targets: '_all', // Applies to all columns
                     createdCell: function (td, cellData, rowData, row, col) {
                         // Try to get data attributes from the original HTML cell
                         const originalCell = $(td).closest('tr').find('td').eq(col);
                         if (originalCell.length) {
                              // Use $.each to iterate over all data attributes of the original cell
                              $.each(originalCell.data(), function (key, value) {
                                   // Store the data attributes in the cell generated by DataTables
                                   $(td).data(key, value);
                               });
                         }
                     }
                }
            ],
            initComplete: function (settings, json) {
                const api = this.api();
                const searchInput = $('#tabelaProvas_filter input');
                // Add form-control classes and set initial width for desktop
                searchInput.addClass('form-control form-control-sm').css('width', 'auto');
                searchInput.attr('aria-label', 'Buscar provas na tabela');


                const buttonsContainer = $('.dt-buttons-container');
                // Clonar e mover o botão "Adicionar Prova"
                if (abrirModalNovaProvaBtnOriginal && buttonsContainer.length) {
                    // Verifica se o botão já não foi clonado para evitar duplicatas em re-inicializações
                    if($('#abrirModalNovaProvaDt').length === 0) {
                         const abrirModalNovaProvaBtnClone = abrirModalNovaProvaBtnOriginal.cloneNode(true);
                         abrirModalNovaProvaBtnClone.id = 'abrirModalNovaProvaDt';
                         // Remove listeners antigos antes de adicionar novos
                         $(abrirModalNovaProvaBtnClone).off('click').on('click', (e) => {
                              e.preventDefault();
                              abrirModalFormProva();
                         });
                         // Append the cloned button to the buttons container
                         buttonsContainer.append(abrirModalNovaProvaBtnClone);
                    }
                     // Always hide the original button in the HTML
                    abrirModalNovaProvaBtnOriginal.style.display = 'none';
                }


                // Add "Remover Prova" to the dropdowns for existing static HTML rows
                // This is less critical if you manage rows via DataTables API but harmless to keep.
                $('#tabelaProvas tbody tr').each(function() {
                     const dropdownMenu = $(this).find('.dropdown-menu');
                      if (dropdownMenu.find('.btn-remover-prova').length === 0) {
                           // Add a divider if it's not the first item and no divider exists
                           const existingItemsCount = dropdownMenu.children('li').length;
                           if(existingItemsCount > 0 && dropdownMenu.find('.dropdown-divider').last().length === 0) {
                                dropdownMenu.append('<li><hr class="dropdown-divider"></li>');
                           }
                           dropdownMenu.append('<li><a class="dropdown-item btn-remover-prova text-danger" href="#"><i class="bi bi-trash me-2"></i>Remover Prova</a></li>');
                      }
                });


                handleResponsiveControls(api); // Initial call to adjust layout and button visibility
                // Debounce resize listener to adjust columns and layout
                $(window).off('resize.dtProvasGlobal').on('resize.dtProvasGlobal', function () { // Use a global namespace
                    // No need to call handleResponsiveControls here, it's called separately below
                    clearTimeout(resizeDebounceTimer);
                    resizeDebounceTimer = setTimeout(function () {
                        if (tabelaProvasDt) {
                             // With fixed scrollY, just adjust columns and responsive visibility.
                             // DataTables manages the height of the scrollBody.
                            tabelaProvasDt.columns.adjust().responsive.recalc();
                        }
                    }, 250); // Debounce time in ms
                });

                // Add a separate resize listener for layout adjustments that don't need debouncing
                $(window).off('resize.dtLayoutProvas').on('resize.dtLayoutProvas', function() {
                     handleResponsiveControls(tabelaProvasDt); // Call handleResponsiveControls on every resize
                });


                 // Ensure the mobile search modal is hidden initially if it exists
                if (modalBusca) modalBusca.style.display = 'none';
            }
        });

        return tabelaProvasDt; // Return the DataTable instance
    }


    // Function to handle the responsiveness of search controls and add button
    function handleResponsiveControls(dataTableApi) {
        const searchContainer = $('#tabelaProvas_filter'); // Container do input de busca gerado pelo DataTables
        const searchInput = searchContainer.find('input');
        // The DataTables DOM structure places the filter in a column and buttons in another column
        const filterColumn = searchContainer.closest('.col-12, .col-md-auto'); // Get the column element containing the filter
        const buttonsContainer = $('.dt-buttons-container'); // Container customizado para os botões (definido no 'dom')
        const abrirModalNovaProvaBtnDt = $('#abrirModalNovaProvaDt'); // Botão "Adicionar Prova" clonado

        // Remove any dynamically created mobile icon buttons (from previous versions or logic)
        // We are no longer creating a separate search icon or add icon button dynamically.
        $('#abrirBuscaModalMobile, #abrirModalNovaProvaIconMobile').remove();


        // Verifica a largura da janela para alternar entre layout mobile e desktop
        if (window.innerWidth < 768) { // Breakpoint 'md' do Bootstrap
            // Layout Mobile: Show the inline search and the cloned add button (as icon)
            if (filterColumn.length) {
                filterColumn.show(); // Ensure the filter column is shown
                // CSS will handle making the input take full width and the filter container grow.
            }

            // Layout Mobile: Show the cloned add button (#abrirModalNovaProvaDt) and style it as icon-only
            // This button is already in the buttonsContainer.
            if (abrirModalNovaProvaBtnDt.length) {
                 abrirModalNovaProvaBtnDt.show(); // Ensure the cloned button is shown
                 // Use Bootstrap classes and custom CSS to make it icon-only on mobile
                 // The CSS will handle hiding the text and adjusting padding.
                 abrirModalNovaProvaBtnDt.find('span').addClass('d-none'); // Ensure text is hidden
                 abrirModalNovaProvaBtnDt.find('i').removeClass('me-sm-2').addClass('me-0'); // Remove desktop margin from icon
                 // CSS will add specific padding for the icon-only version
            }

            // Ensure the separate mobile search modal is closed if it was open
            // This modal and its trigger are not used in the new mobile layout.
             if (modalBusca) modalBusca.style.display = 'none'; // Ensure the modal element is hidden

        } else { // Layout Desktop (>= 768px)
            // Layout Desktop: Show the inline search
            if (filterColumn.length) {
                filterColumn.show(); // Ensure the filter column is shown
                // CSS will handle desktop width and non-growing behavior.
            }

             // Layout Desktop: Remove any lingering mobile icon buttons (should not be created)
            $('#abrirModalNovaProvaIconMobile').remove(); // Safety removal

            // Layout Desktop: Show the full "Adicionar Prova" button
            if (abrirModalNovaProvaBtnDt.length) {
                 abrirModalNovaProvaBtnDt.show();
                 // Ensure text and icon are correct for desktop
                 abrirModalNovaProvaBtnDt.find('span').removeClass('d-none').addClass('d-sm-inline'); // Show text on small+ screens
                 abrirModalNovaProvaBtnDt.find('i').addClass('me-sm-2').removeClass('me-0'); // Add desktop margin
            }
        }

        // DataTables columns adjustment and responsive recalc is handled by the debounce resize listener.
        // handleResponsiveControls is now called on every resize to manage element visibility and classes quickly.
        // The debounce handles the more expensive DataTables adjustments.
    }


    // Inicializa o DataTable pela primeira vez ao carregar o DOM
    inicializarDataTable(); // Chama a função para criar a instância do DataTables


    // --- GERENCIAMENTO DO MODAL DE ADICIONAR/EDITAR PROVA ---
    // Função para abrir o modal de adicionar/editar prova
    function abrirModalFormProva(isEditMode = false, dadosProva = null, targetTr = null) {
         // Verifica se os elementos necessários do modal existem
         if (!formProva || !modalProvaLabel || !modalProva || !provaDisciplinaSelect || !provaProfessorInput) {
             console.error("Elementos do modal de prova não encontrados."); return;
         }

         popularDisciplinasSelect(); // Popula o select de disciplinas
         formProva.reset(); // Limpa todos os campos do formulário
         // Limpa validações visuais (bordas vermelhas) e mensagens de erro
         const fieldsToClearValidation = [
             provaDisciplinaSelect, provaProfessorInput, provaDataInput, provaHorarioInput,
             provaLocalInput, provaStatusSelect, provaValorNotaInput, provaConteudosInput,
             provaObservacoesInput, provaNotaObtidaInput
         ];
         fieldsToClearValidation.forEach(clearFieldError); // Chama a função para limpar cada campo

         provaProfessorInput.value = ''; // Garante que o campo professor esteja vazio inicialmente
         // Limpa data attributes do formulário que guardam ID e rowIndex da prova a ser editada
         delete formProva.dataset.provaId;
         delete formProva.dataset.rowIndex;

         // Define o título do modal com base no modo (adicionar ou editar)
         modalProvaLabel.textContent = isEditMode ? "Editar Prova" : "Adicionar Prova";

         // Se for modo edição e dados da prova forem fornecidos, preenche o formulário
         if (isEditMode && dadosProva) {
             // Preenche o formulário com os dados da prova
             provaDisciplinaSelect.value = dadosProva.disciplinaId || ''; // Usa disciplinaId para selecionar a option correta
             atualizarProfessorInput(); // Chama para preencher o professor com base na disciplina selecionada
             // Se por algum motivo o professor da disciplina na lista não for o mesmo dos dados originais (ex: lista desatualizada), mantém o original
              const disciplinaEncontradaNoSelect = listaDisciplinas.find(d => d.id === provaDisciplinaSelect.value);
              if (!disciplinaEncontradaNoSelect && dadosProva.professor) { // Se a disciplina selecionada não foi encontrada na lista (dropdown) ou o professor não bate
                  provaProfessorInput.value = dadosProva.professor; // Mantém o professor original dos dados
              } else if(disciplinaEncontradaNoSelect && disciplinaEncontradaNoSelect.professor !== provaProfessorInput.value) {
                   // Caso raro: disciplina achada mas professor não bateu na atualização automática, force
                   provaProfessorInput.value = disciplinaEncontradaNoSelect.professor;
              }


             provaDataInput.value = dadosProva.data || ''; // Data em formato YYYY-MM-DD
             provaHorarioInput.value = dadosProva.horario || ''; // Horário em formato HH:mm
             provaLocalInput.value = dadosProva.local || '';
             provaStatusSelect.value = dadosProva.status || 'Agendado'; // Status (texto)
             provaValorNotaInput.value = dadosProva.valorNota ? String(dadosProva.valorNota).replace('.', ',') : ''; // Valor da nota (formata para usar vírgula no input)
             provaConteudosInput.value = dadosProva.conteudos || '';
             provaObservacoesInput.value = dadosProva.observacoes || '';
             provaNotaObtidaInput.value = dadosProva.notaObtida ? String(dadosProva.notaObtida).replace('.', ',') : ''; // Nota Obtida (formata para usar vírgula no input)

             // Define data attributes no formulário com ID da prova e índice da linha (para saber qual linha editar depois)
             formProva.dataset.provaId = dadosProva.id;
             // Obtém o índice da linha APÓS o DataTables ter sido inicializado
             if (tabelaProvasDt && targetTr) {
                 formProva.dataset.rowIndex = tabelaProvasDt.row(targetTr).index();
             }
         } else {
             // Modo Adicionar: Garante que a disciplina e professor estejam resetados
             provaDisciplinaSelect.value = ""; // Seleciona a opção placeholder ("Selecione a disciplina...")
             provaProfessorInput.value = ""; // Limpa o campo professor
         }
         modalProva.showModal(); // Exibe o modal usando a API do <dialog>
    }


    // Função para fechar o modal de adicionar/editar prova
    function fecharModalFormProva() {
         if (modalProva) modalProva.close(); // Fecha o modal
          // Optional: clear form and validations when closing without saving to be ready for a new Add
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

    // Listeners para fechar modal de prova (the listener for the cloned button #abrirModalNovaProvaDt is set in initComplete)
    if (fecharModalProvaBtn) fecharModalProvaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormProva(); });
    if (cancelarModalProvaBtn) cancelarModalProvaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormProva(); });
    // Close modal by clicking outside (only for the <dialog> element)
    if (modalProva) modalProva.addEventListener("click", e => { if (e.target === modalProva) fecharModalFormProva(); });


    // --- GERENCIAMENTO DO MODAL DE BUSCA ---
    // The separate mobile search modal logic is being removed from the UI flow on mobile.
    // Keeping the modal element and its close/apply logic in case it's used elsewhere or for desktop.
    // Function to open the search modal (formerly used in mobile layout)
    function abrirModalDeBusca() {
        // This modal is no longer triggered by a button in the main mobile UI.
        // If it's still needed elsewhere, keep this function.
        if (modalBusca && inputBuscaProvasModal && tabelaProvasDt) {
            // Preenche o input do modal com o valor atual da busca do DataTables
            inputBuscaProvasModal.value = tabelaProvasDt.search();
            modalBusca.showModal(); // Exibe o modal de busca
            inputBuscaProvasModal.focus(); // Foca no campo de busca ao abrir para digitação imediata
        }
    }
    // Function to close the search modal
    function fecharModalDeBusca() { if (modalBusca) modalBusca.close(); }

    // Function to apply the filter typed in the search modal
    function aplicarBuscaDoModal() {
        if (tabelaProvasDt && inputBuscaProvasModal) {
             // Applies the filter from the modal input to the DataTables table and redraws
            tabelaProvasDt.search(inputBuscaProvasModal.value).draw();
        }
        fecharModalDeBusca(); // Fecha o modal after applying the search
    }

    // Listeners for the search modal (the mobile button listener is removed from handleResponsiveControls)
    if (fecharModalBuscaBtn) { fecharModalBuscaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeBusca(); }); }
    if (aplicarBuscaProvasBtn) { aplicarBuscaProvasBtn.addEventListener("click", (e) => { e.preventDefault(); aplicarBuscaDoModal(); }); }
    // Allows applying the search by pressing Enter in the modal input
    if (inputBuscaProvasModal) { inputBuscaProvasModal.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); aplicarBuscaDoModal(); } }); }
    // Close modal by clicking outside (only for the <dialog> element)
    if (modalBusca) { modalBusca.addEventListener("click", e => { if (e.target === modalBusca) fecharModalDeBusca(); }); }


    // --- FUNÇÕES E LISTENERS DO MODAL DE DETALHES ---
    // Função para abrir o modal de detalhes da prova
    function abrirModalDeDetalhes(dadosLinhaTabela, dadosCompletosProva = null) {
         // Verifica se os elementos necessários do modal existem
         if (!modalDetalhes || !modalDetalhesConteudo || !modalDetalhesProvaLabel) {
             console.error("Elementos do modal de detalhes não encontrados.");
             return;
         }

         // Prepara os dados para exibição no modal de detalhes
         // Prefer full stored data if available, fallback to table row data
         const disciplina = dadosCompletosProva?.disciplinaNome || dadosLinhaTabela[0] || 'N/A';
         modalDetalhesProvaLabel.textContent = "Detalhes da Prova"; // Define the modal title

         // Try to find the professor in the full discipline list based on ID or name, fallback to stored data or 'Não informado'
         const professorDaLista = listaDisciplinas.find(d => d.id === dadosCompletosProva?.disciplinaId || d.nome === disciplina)?.professor;
         const professor = dadosCompletosProva?.professor || professorDaLista || "Não informado";

         // Format the grade for display (uses comma)
         const notaObtidaOriginal = dadosCompletosProva?.notaObtida !== undefined ? dadosCompletosProva.notaObtida : (dadosLinhaTabela[1] !== '-' ? String(dadosLinhaTabela[1]).split('/')[0].trim().replace(',', '.') : '');
         const valorNotaOriginal = dadosCompletosProva?.valorNota || (dadosLinhaTabela[1] !== '-' ? String(dadosLinhaTabela[1]).split('/')[1]?.trim().replace(',', '.') : '10,0');
         const notaFormatada = notaObtidaOriginal && notaObtidaOriginal !== '-' ?
              `${String(notaObtidaOriginal).replace('.', ',')} / ${String(valorNotaOriginal).replace('.', ',')}` :
              (dadosLinhaTabela[1] === '-' && valorNotaOriginal ? `- / ${String(valorNotaOriginal).replace('.', ',')}` : '-');


         const dataHorario = dadosLinhaTabela[2] || '-'; // Use the already formatted value from the table (DD Mon YYYY, HH:MM AM/PM or similar)
         const local = dadosCompletosProva?.local !== undefined ? (dadosCompletosProva.local || '-') : (dadosLinhaTabela[3] || '-');


         // Try to get the status text from complete data, fallback to the HTML of the badge from the table cell
         let statusParaDetalhes = dadosLinhaTabela[4];
         if (dadosCompletosProva?.status) {
             const statusBadgeClass = dadosCompletosProva.status === 'Agendado' ? 'bg-info-subtle text-info' :
                 (dadosCompletosProva.status === 'Concluída' ? 'bg-success-subtle text-success' :
                     'bg-danger-subtle text-danger');
             statusParaDetalhes = `<span class="badge ${statusBadgeClass}">${dadosCompletosProva.status}</span>`;
         } else {
              // If status text is not available in complete data, try to extract from cell HTML (less reliable)
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = dadosLinhaTabela[4];
              statusParaDetalhes = tempDiv.innerHTML || '-'; // Use the original HTML of the cell
         }

         const conteudos = dadosCompletosProva?.conteudos || '-';
         const observacoes = dadosCompletosProva?.observacoes || '-';

         // Build the HTML for the details modal body using the prepared data
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
         modalDetalhes.showModal(); // Show the details modal
    }
    // Function to close the details modal
    function fecharModalDeDetalhes() { if (modalDetalhes) modalDetalhes.close(); }
    // Listeners to close details modal
    if (fecharModalDetalhesBtn) { fecharModalDetalhesBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhes(); }); }
    if (okModalDetalhesBtn) { okModalDetalhesBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhes(); }); }
    // Close modal by clicking outside (only for the <dialog> element)
    if (modalDetalhes) modalDetalhes.addEventListener("click", e => { if (e.target === modalDetalhes) fecharModalDeDetalhes(); });


    // --- AÇÕES NA TABELA (Using event delegation on tbody for action buttons) ---
    // We use delegation (.on('click', selector, handler)) on tbody so that the listeners
    // work even for rows added or modified dynamically by DataTables.

    // Listener for clicks on Edit buttons (.btn-edit-proof)
    $('#tabelaProvas tbody').on('click', '.btn-edit-proof', function (e) {
         e.preventDefault(); // Prevent default link behavior
         // Check if the DataTables instance exists
         if (!tabelaProvasDt) return;

         // Find the parent row (tr) of the clicked button
         const trElement = $(this).closest('tr')[0];
         // Get the visible row data as managed by DataTables
         const rowDataArray = tabelaProvasDt.row(trElement).data();
         // Get the full proof data that was stored in the TR's data attribute
         const dadosCompletosArmazenados = $(trElement).data('completo'); // Retrieve the complete data object


         // Check if we could get the row data
         if (!rowDataArray || !dadosCompletosArmazenados) {
             console.error("Não foi possível obter os dados da linha para edição.");
             return;
         }

          // Prepare data to populate the edit modal form.
          // Use the complete stored data which is more reliable.

         const dadosParaModal = {
              id: dadosCompletosArmazenados.id || 'tempID-' + new Date().getTime(), // Use existing ID or generate temporary
              disciplinaId: dadosCompletosArmazenados.disciplinaId || '', // Discipline ID for the select
              // Use complete data for other fields
              professor: dadosCompletosArmazenados.professor || '',
              notaObtida: dadosCompletosArmazenados.notaObtida !== undefined ? String(dadosCompletosArmazenados.notaObtida).replace('.', ',') : '', // Format for input
              data: dadosCompletosArmazenados.data || '', // YYYY-MM-DD for date input
              horario: dadosCompletosArmazenados.horario || '', // HH:mm for time input
              local: dadosCompletosArmazenados.local || '',
              status: dadosCompletosArmazenados.status || 'Agendado', // Status text
              valorNota: dadosCompletosArmazenados.valorNota !== undefined ? String(dadosCompletosArmazenados.valorNota).replace('.', ',') : '', // Format for input
              conteudos: dadosCompletosArmazenados.conteudos || '',
              observacoes: dadosCompletosArmazenados.observacoes || ''
         };
          // console.log("Dados para o modal:", dadosParaModal); // Debugging: Check data going to modal

         // Open the edit modal, passing the data and the row reference
         abrirModalFormProva(true, dadosParaModal, trElement);
    });

    // Listener for Detail button clicks (.btn-detalhar-prova)
    $('#tabelaProvas tbody').on('click', '.btn-detalhar-prova', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const trElement = $(this).closest('tr')[0];
        const dadosDaLinhaTabela = tabelaProvasDt.row(trElement).data(); // Visible data (array)
        const dadosCompletosArmazenados = $(trElement).data('completo'); // Full stored data object

        if (dadosDaLinhaTabela) {
             abrirModalDeDetalhes(dadosDaLinhaTabela, dadosCompletosArmazenados); // Pass both sets of data
        }
    });

    // Listener for Mark Completed button clicks (.btn-marcar-concluida)
    $('#tabelaProvas tbody').on('click', '.btn-marcar-concluida', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const trElement = $(this).closest('tr')[0];
        const row = tabelaProvasDt.row(trElement);
        let rowData = row.data(); // Visible row data (array)
        const dadosCompletosArmazenados = $(trElement).data('completo'); // Full stored data object


        // Check if the proof is already marked as completed in the full data
        if (dadosCompletosArmazenados?.status === 'Concluída') {
             alert("Esta prova já está marcada como concluída.");
             return; // Exit if already completed
        }

        // Change the status in the full stored data
        if (dadosCompletosArmazenados) {
            dadosCompletosArmazenados.status = 'Concluída';
            $(trElement).data('completo', dadosCompletosArmazenados); // Update the stored object
             $(trElement).data('status', 'Concluída'); // Also update the individual status data attribute for convenience
        }

        // Update the visible status cell in the table (create the HTML for the Completed badge)
        if (rowData) {
             rowData[4] = `<span class="badge bg-success-subtle text-success">Concluída</span>`;
             // Update row data in DataTables and redraw (without reordering/repaging - draw(false))
             row.data(rowData).draw(false);
             alert("Prova marcada como concluída!");
             // Optional: Call function to save this change to the backend
             // saveStatusChangeToBackend(dadosCompletosArmazenados.id, 'Concluída');
        } else {
            console.error("Não foi possível obter os dados da linha para marcar como concluída.");
        }
    });

    // Listener for Remove Proof button clicks (.btn-remover-prova)
    $('#tabelaProvas tbody').on('click', '.btn-remover-prova', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const trElement = $(this).closest('tr'); // Find the parent TR
        const row = tabelaProvasDt.row(trElement); // Get the DataTables row object
        const rowData = row.data(); // Visible data for confirmation message

        if (!rowData) {
            console.error("Não foi possível obter os dados da linha para remoção.");
            return;
        }

        // Get the discipline name for the confirmation message (first cell)
        const disciplinaNome = rowData[0] || "esta prova";

        // Show a native browser confirmation modal
        if (confirm(`Tem certeza que deseja remover a prova de "${disciplinaNome}"?`)) {
             // Remove the row from DataTables and redraw (without reordering/repaging)
             row.remove().draw(false);
             alert("Prova removida com sucesso!");
             // Optional: Call function to send request to backend to permanently remove
             // const provaId = $(trElement).data('id'); // Get the ID from stored data
             // if(provaId) deleteProvaFromBackend(provaId);
        }
    });


    // --- SUBMIT DO FORMULÁRIO DE PROVA ---
    if (formProva) {
        formProva.addEventListener("submit", function (e) {
            e.preventDefault(); // Prevent default form submission (page reload)

            // Validate the form before proceeding
            if (!validateFormProva()) {
                console.warn("Formulário de prova inválido.");
                return; // Stop execution if validation fails
            }

            // Check if the DataTables instance exists
            if (!tabelaProvasDt) {
                console.error("DataTables não inicializado.");
                return;
            }

             // Get form data and data attributes (ID and rowIndex for editing)
            const provaId = formProva.dataset.provaId || 'newID-' + new Date().getTime(); // Use existing ID if editing, otherwise generate a temporary unique one
            const rowIndex = formProva.dataset.rowIndex !== undefined ? parseInt(formProva.dataset.rowIndex) : undefined; // Row index if editing

             // Find the complete discipline object based on the selected ID in the <select> to get the correct name and professor
            const disciplinaSelecionadaObj = listaDisciplinas.find(d => d.id === provaDisciplinaSelect.value);

             // Gather *all* proof data from form inputs into an object
            const dadosCompletosProva = {
                 id: provaId, // Keep or generate the ID
                 disciplinaId: provaDisciplinaSelect.value, // Selected discipline ID
                 disciplinaNome: disciplinaSelecionadaObj ? disciplinaSelecionadaObj.nome : (provaDisciplinaSelect.options[provaDisciplinaSelect.selectedIndex]?.text || 'N/A'), // Discipline name (fallback to select text)
                 professor: provaProfessorInput.value.trim(), // Professor
                 data: provaDataInput.value, // Date in YYYY-MM-DD format
                 horario: provaHorarioInput.value, // Time in HH:mm format
                 local: provaLocalInput.value.trim(), // Local
                 status: provaStatusSelect.value, // Status (Agendado, Concluída, Cancelada)
                 // Grade and Value: Store with dot for easier calculations if needed, but fill/display with comma
                 valorNota: provaValorNotaInput.value.trim().replace(',', '.') || "10.0", // Grade value (convert comma to dot, default 10.0)
                 conteudos: provaConteudosInput.value.trim(), // Contents
                 observacoes: provaObservacoesInput.value.trim(), // Observations
                 notaObtida: provaNotaObtidaInput.value.trim().replace(',', '.') // Obtained grade (convert comma to dot)
            };

             // Format date and time for display in the table (DD Mon YYYY, HH:mm AM/PM)
            let dataHoraFormatadaParaTabela = '-';
            if (dadosCompletosProva.data) {
                const [year, month, day] = dadosCompletosProva.data.split('-');
                // Use Date.UTC to avoid timezone issues when creating the date for formatting
                const dataObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
                const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
                dataHoraFormatadaParaTabela = `${dataObj.getUTCDate()} ${meses[dataObj.getUTCMonth()]} ${dataObj.getUTCFullYear()}`;
                if (dadosCompletosProva.horario) {
                     dataHoraFormatadaParaTabela += ', ' + formatarHora(dadosCompletosProva.horario);
                }
            } else if (dadosCompletosProva.horario) {
                 // If only time is available, display only the formatted time
                 dataHoraFormatadaParaTabela = formatarHora(dadosCompletosProva.horario);
            }


             // Create HTML for the Status column (Bootstrap Badge) based on status text
            const statusHtml = `<span class="badge ${dadosCompletosProva.status === 'Agendado' ? 'bg-info-subtle text-info' : (dadosCompletosProva.status === 'Concluída' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger')}">${dadosCompletosProva.status}</span>`;

             // Create HTML for the Actions column (Bootstrap Dropdown)
             // Ensure the dropdown-menu-end class is present for right alignment
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

             // Prepare visible data for the table row (array in column order)
            const notaExibicao = dadosCompletosProva.notaObtida && dadosCompletosProva.notaObtida !== '' ?
                 `${String(dadosCompletosProva.notaObtida).replace('.', ',')} / ${String(dadosCompletosProva.valorNota).replace('.', ',')}` // Format for display with comma
                 : (dadosCompletosProva.valorNota && dadosCompletosProva.valorNota !== '' ? `- / ${String(dadosCompletosProva.valorNota).replace('.', ',')}` : '-'); // Display value if obtained grade is empty

            const dadosLinhaTabela = [
                 dadosCompletosProva.disciplinaNome, // Coluna 0
                 notaExibicao,   // Coluna 1
                 dataHoraFormatadaParaTabela, // Coluna 2
                 dadosCompletosProva.local || '-', // Coluna 3
                 statusHtml,   // Coluna 4
                 dropdownHtml // Coluna 5
            ];

            let targetRow; // Variable to hold the DataTables row object

             // Check if we are editing an existing row or adding a new one
             // Check if rowIndex is valid AND if the row exists in DataTables (important after filtering/sorting)
            if (provaId && rowIndex !== undefined && tabelaProvasDt.row(rowIndex).node()) {
                 // Edit Mode: Get the row by index and update its data
                 targetRow = tabelaProvasDt.row(rowIndex);
                 targetRow.data(dadosLinhaTabela).draw(false); // Update data and redraw (without reordering/repaging)
                 alert("Prova atualizada com sucesso!");
            } else {
                 // Add Mode: Add a new row with the data
                 targetRow = tabelaProvasDt.row.add(dadosLinhaTabela).draw(false); // Add row, redraw
                 alert("Prova adicionada com sucesso!");
            }

            // Store all complete data in the TR node using jQuery .data()
            // This is crucial for accessing the full data (like ID, contents, observations, etc.)
            // when editing, detailing, or marking the proof as completed again.
            // jQuery .data() stores in data cache and converts keys to camelCase automatically.
            const targetNode = $(targetRow.node()); // Get the TR node of the manipulated row
            if (targetNode.length) {
                 // Store the complete object
                 targetNode.data('completo', dadosCompletosProva);
                 // Also store individual properties for easier access if preferred
                 targetNode.data('id', dadosCompletosProva.id); // Accessible via .data('id')
                 targetNode.data('disciplinaId', dadosCompletosProva.disciplinaId); // Accessible via .data('disciplinaId')
                 targetNode.data('professor', dadosCompletosProva.professor);
                 targetNode.data('data', dadosCompletosProva.data); // Date in YYYY-MM-DD
                 targetNode.data('horario', dadosCompletosProva.horario); // Time in HH:mm
                 targetNode.data('local', dadosCompletosProva.local);
                 targetNode.data('status', dadosCompletosProva.status); // Status text
                 targetNode.data('valorNota', dadosCompletosProva.valorNota); // Original value (with dot)
                 targetNode.data('conteudos', dadosCompletosProva.conteudos);
                 targetNode.data('observacoes', dadosCompletosProva.observacoes);
                 targetNode.data('notaObtida', dadosCompletosProva.notaObtida); // Original value (with dot)

                 //console.log("Dados stored in TR:", targetNode.data('completo')); // Debugging
            }


             // Optional: Call function to save complete data to backend (AJAX, Fetch API, etc.)
             // saveProvaToBackend(dadosCompletosProva);

            fecharModalFormProva(); // Close the modal after saving/adding
            // Adjust columns again after adding/editing (especially with responsive)
            if (tabelaProvasDt) tabelaProvasDt.columns.adjust().responsive.recalc();
        });
    }

    // --- FUNÇÕES AUXILIARES DE FORMATAÇÃO ---
    // Formats time from HH:mm (from input type="time") to HH:mm AM/PM (for table display)
    function formatarHora(timeString) {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        let h = parseInt(hour);
        if (isNaN(h) || isNaN(parseInt(minute))) { console.warn("Invalid time format for formatarHora:", timeString); return timeString; } // Return original if invalid
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // '00' (midnight) and '12' (noon) hours become '12' in 12-hour format
        return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
    }

    // Formats time from HH:mm AM/PM (from table display) to HH:mm (for input type="time")
    function formatarHoraParaInput(displayTime) {
        if (!displayTime || typeof displayTime !== 'string') return '';
        let timePart = displayTime.toUpperCase().trim();
        let modifier = "";
        // Check if it ends with AM or PM
        if (timePart.endsWith('AM')) { modifier = 'AM'; timePart = timePart.slice(0, -2).trim(); }
        else if (timePart.endsWith('PM')) { modifier = 'PM'; timePart = timePart.slice(0, -2).trim(); }
        // Note: If the string doesn't have AM/PM, the conversion might be imprecise. Assume 24h if not specified.

        let [hoursStr, minutesStr] = timePart.split(':');
        let hours = parseInt(hoursStr, 10);
        let minutes = parseInt(minutesStr, 10);

        if (isNaN(hours) || isNaN(minutes)) { console.warn("Invalid time format for formatarHoraParaInput:", displayTime); return ''; }

        // Adjust hours for 24h format
        if (modifier === 'PM' && hours < 12) hours += 12;
        else if (modifier === 'AM' && hours === 12) hours = 0; // 12 AM (midnight) is 00:00

        // Return in HH:mm format for input type="time"
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // Converts date from DD Mon YYYY (Pt-BR, e.g.: "25 jan 2025") to ISO YYYY-MM-DD
    function parsePtBrDateToIso(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return "";
        let parts = dateStr.trim().split(" "); // Expects "Day MonthName Year"
        if (parts.length !== 3) {
             // Try to parse formats with separators, but "DD Mon YYYY" is the default from the table
             const dateSeparators = dateStr.match(/(\d{1,2})[\/\-\. ]([a-zA-ZçÇãÃõÕ]{3,})[\/\-\. ](\d{4})/i); // Allow common separators and Pt-BR months with/without accent
             if (dateSeparators && dateSeparators.length === 4) {
                 parts = [dateSeparators[1], dateSeparators[2], dateSeparators[3]];
             } else { console.warn("Unexpected or invalid PtBr date format for parsePtBrDateToIso:", dateStr); return ""; }
        }
        const day = String(parts[0]).padStart(2,'0'); // Ensure 2 digits for the day
        const monthStr = parts[1].toLowerCase().substring(0, 3); // Get the first 3 letters of the month (e.g.: jan, fev, mar...)
        const year = parts[2];

        // Map to convert month abbreviations to numbers
        const monthMap = {
             'jan':'01','fev':'02','mar':'03','abr':'04',
             'mai':'05','jun':'06','jul':'07','ago':'08',
             'set':'09','out':'10','nov':'11','dez':'12'
        };
        const month = monthMap[monthStr];

        // Basic validation of components
        if (!month || !/^\d{4}$/.test(year) || !/^\d{2}$/.test(day)) {
             console.warn("Invalid PtBr date components after parse:", dateStr, "-> Day:", day, "Month:", monthStr, "Year:", year);
             return ""; // Return empty string if the date cannot be parsed correctly
        }

        // Return date in ISO YYYY-MM-DD format
        return `${year}-${month}-${day}`;
    }


    // --- FINAL INITIALIZATIONS ---

    // Populate the discipline select on page load for the first time
    popularDisciplinasSelect();

    // DataTables initialization is done in the inicializarDataTable function which is called
    // once at the end of this script and can also be called to re-initialize if necessary.

    // The final table and responsiveness adjustment (columns.adjust().responsive.recalc())
    // is done in DataTables' initComplete and in the resize listener,
    // to ensure the table adjusts correctly to content and page layout.

}); // End of DOMContentLoaded listener
