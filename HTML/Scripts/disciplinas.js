document.addEventListener("DOMContentLoaded", function () {
    // --- ELEMENT SELECTORS ---
    // Selectors for the Discipline modal and form
    const modalDisciplina = document.querySelector("#modalDisciplina"); // Adjusted ID
    // Original button in HTML (used for cloning by DataTables)
    const abrirModalNovaDisciplinaBtnOriginal = document.querySelector("#abrirModalNovaDisciplina"); // Adjusted ID
    const fecharModalDisciplinaBtn = document.querySelector("#fecharModalDisciplina"); // Adjusted ID
    const cancelarModalDisciplinaBtn = document.querySelector("#cancelarModalDisciplina"); // Adjusted ID
    const formDisciplina = document.querySelector("#formDisciplina"); // Adjusted ID
    const modalDisciplinaLabel = document.querySelector("#modalDisciplinaLabel"); // Adjusted ID

    // Selectors for Discipline form inputs
    const disciplinaIdInput = document.getElementById('disciplinaId'); // Adjusted ID (Hidden input for ID)
    const disciplinaNomeInput = document.getElementById('disciplinaNome'); // Adjusted ID
    const disciplinaProfessorInput = document.getElementById('disciplinaProfessor'); // Adjusted ID
    const disciplinaDiasInput = document.getElementById('disciplinaDias'); // Adjusted ID (Text input for days)
    const disciplinaHorarioInicioInput = document.getElementById('disciplinaHorarioInicio'); // Adjusted ID
    const disciplinaHorarioFimInput = document.getElementById('disciplinaHorarioFim'); // Adjusted ID
    const disciplinaLocalInput = document.getElementById('disciplinaLocal'); // Adjusted ID


    let tabelaDisciplinasDt; // Adjusted variable name
    let resizeDebounceTimer; // Timer for debouncing the resize event

    // Sample Discipline Data (replace with actual data fetching if needed)
    // Using a more complete structure to store all details
    let listaDisciplinasData = [
         { id: "ITD201", nome: "Web Design Avançado – ITD201", professor: "Prof. João Paulo", dias: "Seg, Qua, Sex", horarioInicio: "08:00", horarioFim: "10:00", local: "Sala B12" },
         { id: "UXD301", nome: "Princípios de UX/UI Design – UXD301", professor: "Prof. Jason", dias: "Ter, Qui", horarioInicio: "14:30", horarioFim: "16:00", local: "Lab UX" },
         // Add more sample data here, ensuring 'id' is unique
    ];


    // --- VALIDATION AND ERROR FEEDBACK FUNCTIONS ---
    // Reusing these functions, ensuring selectors for parents are correct
    function displayFieldError(inputElement, message) {
        clearFieldError(inputElement);
        inputElement.classList.add('is-invalid');
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'invalid-feedback d-block';
        feedbackDiv.textContent = message;
        // Include Bootstrap column parent in closest check
        const parent = inputElement.closest('.mb-3, .col-sm-6') || inputElement.parentNode;
        inputElement.parentNode.insertBefore(feedbackDiv, inputElement.nextSibling);
    }

    function clearFieldError(inputElement) {
        inputElement.classList.remove('is-invalid');
         // Include Bootstrap column parent in closest check
        const parent = inputElement.closest('.mb-3, .col-sm-6') || inputElement.parentNode;
        const feedbackElement = parent.querySelector('.invalid-feedback.d-block');
        if (feedbackElement) {
            feedbackElement.remove();
        }
    }

    // Validation for the Discipline form (Adjusted from validateFormProva)
    function validateFormDisciplina() {
        let isValid = true;
        const fieldsToValidate = [
            { element: disciplinaNomeInput, message: "Por favor, informe o nome da disciplina." },
            // Professor might be optional based on your requirements, uncomment if required
            // { element: disciplinaProfessorInput, message: "Por favor, informe o professor." },
            { element: disciplinaDiasInput, message: "Por favor, informe os dias da semana." },
            { element: disciplinaHorarioInicioInput, message: "Por favor, informe o horário de início." },
            { element: disciplinaHorarioFimInput, message: "Por favor, informe o horário de fim." },
            { element: disciplinaLocalInput, message: "Por favor, informe o local da disciplina." }
        ];

        fieldsToValidate.forEach(field => {
            clearFieldError(field.element);
            if (!field.element.value || field.element.value.trim() === "") {
                displayFieldError(field.element, field.message);
                isValid = false;
            }
        });

        // Add validation for start time being before end time
         if (disciplinaHorarioInicioInput.value && disciplinaHorarioFimInput.value) {
             if (disciplinaHorarioInicioInput.value >= disciplinaHorarioFimInput.value) {
                 displayFieldError(disciplinaHorarioFimInput, "O horário de fim deve ser depois do horário de início.");
                 isValid = false;
             }
         }

        return isValid;
    }

    // --- DATA AND UI MANIPULATION FUNCTIONS ---

     // Helper function to format time from HH:mm (24h) to HH:mm AM/PM for display
     function formatTime(timeString) {
         if (!timeString) return '';
         const [hour, minute] = timeString.split(':');
         let h = parseInt(hour);
         if (isNaN(h) || isNaN(parseInt(minute))) { console.warn("Invalid time format for formatTime:", timeString); return timeString; }
         const ampm = h >= 12 ? 'PM' : 'AM';
         h = h % 12;
         h = h ? h : 12; // 0 (midnight) and 12 (noon) become 12
         return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
     }

    // Helper function to format time from HH:mm AM/PM to HH:mm (24h) for input[type="time"]
    function formatTimeForInput(displayTime) {
         if (!displayTime || typeof displayTime !== 'string') return '';
         let timePart = displayTime.toUpperCase().trim();
         let modifier = "";
         // Check if it ends with AM or PM
         if (timePart.endsWith('AM')) { modifier = 'AM'; timePart = timePart.slice(0, -2).trim(); }
         else if (timePart.endsWith('PM')) { modifier = 'PM'; timePart = timePart.slice(0, -2).trim(); }


         let [hoursStr, minutesStr] = timePart.split(':');
         let hours = parseInt(hoursStr, 10);
         let minutes = parseInt(minutesStr, 10);

         if (isNaN(hours) || isNaN(minutes)) { console.warn("Invalid time format for formatTimeForInput:", displayTime); return ''; }

         // Adjust hours for 24h format
         if (modifier === 'PM' && hours < 12) hours += 12;
         else if (modifier === 'AM' && hours === 12) hours = 0; // 12 AM (midnight) is 00:00

         // Return in HH:mm format for input type="time"
         return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
     }


    // Function to render the table rows with data from listaDisciplinasData
    function renderTable() {
         if (!tabelaDisciplinasDt) return;

         // Clear existing table data if necessary (only needed if repopulating)
         // tabelaDisciplinasDt.clear();

         // Add data from the listaDisciplinasData array
         // This approach assumes listaDisciplinasData is the single source of truth
         // If using static HTML + JS, you might need to handle initial data differently
         // For now, we'll assume listaDisciplinasData is used to add/replace rows.

         // Since we start with static HTML, we will only add/update via the form submission.
         // The initial data is already in the HTML tbody.
         // If you planned to fetch data initially, you would clear() and then add() it here.

         // Example of how to add data dynamically if needed:
         /*
         listaDisciplinasData.forEach(disciplina => {
              const horarioFormatado = disciplina.horarioInicio && disciplina.horarioFim
                  ? `${formatTime(disciplina.horarioInicio)} - ${formatTime(disciplina.horarioFim)}`
                  : '-';

              const rowData = [
                  disciplina.nome || '-',
                  disciplina.professor || '-',
                  disciplina.dias || '-',
                  horarioFormatado,
                  disciplina.local || '-',
                  // Actions column HTML
                  `
                  <div class="dropdown">
                      <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da disciplina">
                          <i class="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                          <li><a class="dropdown-item btn-edit-disciplina" href="#"><i class="bi bi-pencil-square me-2"></i>Editar Disciplina</a></li>
                          <li><hr class="dropdown-divider"></li>
                          <li><a class="dropdown-item btn-remover-disciplina text-danger" href="#"><i class="bi bi-trash me-2"></i>Remover Disciplina</a></li>
                      </ul>
                  </div>
                  `
              ];

              const newRow = tabelaDisciplinasDt.row.add(rowData).draw(false).node();
              $(newRow).data('completo', disciplina); // Store full data
              $(newRow).data('id', disciplina.id); // Store ID
         });
         tabelaDisciplinasDt.columns.adjust().responsive.recalc();
         */
         // Leaving the initial static HTML is fine if that's your source.
         // The DataTables initialization handles reading the static HTML.
         // The event delegation and form submission logic will work on these rows.
    }


    // --- DATATABLE INITIALIZATION ---
    function inicializarDataTable() {
        if (!window.jQuery || !$.fn.DataTable) {
            console.error("jQuery or DataTables not loaded!");
            return null;
        }

        // Destroy existing instance if any
        if ($.fn.DataTable.isDataTable('#tabelaDisciplinas')) { // Adjusted ID
            $('#tabelaDisciplinas').DataTable().destroy(); // Adjusted ID
            // Clear the DOM generated by DataTables before re-initializing
            $('#tabelaDisciplinas tbody').empty(); // Adjusted ID
        }


        tabelaDisciplinasDt = $('#tabelaDisciplinas').DataTable({ // Adjusted ID
            responsive: {
                details: {
                    type: 'column',
                    target: -1 // Last column (Actions) will be used for the control
                }
            },
            dom:
                '<"row dt-custom-header align-items-center mb-3"' +
                    '<"col-12 col-md-auto me-md-auto"f>' + // Filter
                    '<"col-12 col-md-auto dt-buttons-container">' + // Container for buttons
                '>' +
                't' + // Table
                '<"row mt-3 align-items-center"' +
                    '<"col-sm-12 col-md-5"i>' + // Info
                    '<"col-sm-12 col-md-7 dataTables_paginate_wrapper"p>' + // Pagination (if used)
                '>',
            paging: false, // Disable default pagination
            scrollY: '450px', // Fixed height for table body
            scrollCollapse: true, // Allow table to shrink below scrollY
            lengthChange: false, // Hide "Show X entries" dropdown
            language: {
                url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json',
                search: "",
                searchPlaceholder: "Buscar disciplinas...", // Updated placeholder
                info: "Total de _TOTAL_ disciplinas", // Updated info text
                infoEmpty: "Nenhuma disciplina encontrada", // Updated empty text
                infoFiltered: "(filtrado de _MAX_ disciplinas)", // Updated filtered text
            },
            columnDefs: [
                { orderable: false, targets: 'no-sort' }, // Actions column
                { responsivePriority: 1, targets: 0 },  // Disciplina (High Priority)
                { responsivePriority: 3, targets: 1 },  // Professor
                { responsivePriority: 2, targets: 2 },  // Dias da Semana
                { responsivePriority: 4, targets: 3 },  // Horário
                { responsivePriority: 5, targets: 4 },  // Local
                { responsivePriority: 1, targets: 5, className: "dt-actions-column no-export" } // Ações (High Priority)
            ],
             // Adicione ou modifique a callback createdRow se você precisar passar dados completos
             // para as linhas geradas pelo DataTables a partir do HTML estático.
             // O código que você já tem para createdRow parece OK para isso.
             createdRow: function (row, data, dataIndex) {
                 const initialData = $(row).data();
                 if (!$(row).data('completo') && initialData.disciplinaId) {
                      $(row).data('completo', {
                          id: initialData.disciplinaId,
                          nome: data[0],
                          professor: data[1],
                          dias: initialData.dias,
                          horarioInicio: initialData.horarioInicio, // Certifique-se de que está lendo o atributo correto
                          horarioFim: initialData.horarioFim,  // Certifique-se de que está lendo o atributo correto
                          local: initialData.local
                      });
                      $(row).data('id', initialData.disciplinaId);
                      $(row).data('dias', initialData.dias); // Garante que os dados atributos estejam no TR
                      $(row).data('horarioInicio', initialData.horarioInicio);
                      $(row).data('horarioFim', initialData.horarioFim);
                      $(row).data('local', initialData.local);
                 }
             },

            initComplete: function (settings, json) {
                // ... (seu código existente em initComplete) ...

                // --- Lógica para mover o dropdown ao abrir/fechar ---
                // Remove listeners anteriores para evitar duplicação
                $('#tabelaDisciplinas tbody').off('show.bs.dropdown move.dropdown'); // Remove apenas nossos listeners específicos
                 $('body').off('hide.bs.dropdown move.dropdown'); // Remove apenas nossos listeners específicos


                // Listener para quando um dropdown *dentro* do tbody da tabela é mostrado
                $('#tabelaDisciplinas tbody').on('show.bs.dropdown move.dropdown', '.dropdown', function (e) {
                    const $dropdown = $(this); // O elemento .dropdown
                    const $dropdownMenu = $dropdown.find('.dropdown-menu'); // O menu dropdown

                    // Se o menu já não está no body, mova-o
                    if (!$dropdownMenu.parent().is('body')) {
                        // Armazene uma referência ao pai original (o div .dropdown)
                        $dropdownMenu.data('bs-dropdown-original-parent', $dropdown);

                        // Mova o menu dropdown para o final do body
                        $dropdownMenu.appendTo('body');

                        // Forçar o reposicionamento pelo Popper.js (às vezes necessário após mover no DOM)
                        // Bootstrap 5 geralmente faz isso automaticamente, mas podemos forçar se necessário
                        const bsDropdown = bootstrap.Dropdown.getInstance(e.target); // Obtém a instância do Dropdown do Bootstrap
                        if (bsDropdown && bsDropdown._popper) {
                            bsDropdown._popper.update(); // Força o update da posição
                        }
                    }
                });

                // Listener para quando um dropdown *que está no body* é ocultado
                // Delegamos para o body porque o menu está lá quando é ocultado
                $('body').on('hide.bs.dropdown move.dropdown', '.dropdown-menu', function (e) {
                    const $dropdownMenu = $(this); // O elemento .dropdown-menu
                    const $originalParent = $dropdownMenu.data('bs-dropdown-original-parent'); // Recupera o pai original

                    // Se temos uma referência ao pai original e o menu ainda não está lá, mova-o de volta
                    // A verificação !$dropdownMenu.parent().is($originalParent) previne mover de volta duas vezes se os eventos hide firem em cascata
                    if ($originalParent && !$dropdownMenu.parent().is($originalParent)) {
                        $dropdownMenu.prependTo($originalParent); // Mova de volta para antes de qualquer outro conteúdo no pai original

                        // Limpe a referência após mover
                        $dropdownMenu.removeData('bs-dropdown-original-parent');
                    }
                });

                // Opcional: Adicione um listener para reposicionar em scroll da janela
                // O Popper.js já tenta fazer isso, mas em casos complexos pode precisar de ajuste manual ou debounce.
                // Por enquanto, vamos confiar no update() forçado no show e no comportamento padrão do Popper.js.


                // ... (resto do seu código em initComplete) ...
            }
        });

        return tabelaDisciplinasDt; // Return the DataTable instance
    }



    // Function to handle the responsiveness of search controls and add button
    // Adapted from provas.js - selectors updated for disciplinas table
    function handleResponsiveControls(dataTableApi) {
        const searchContainer = $('#tabelaDisciplinas_filter'); // Adjusted selector
        const searchInput = searchContainer.find('input');
        const filterColumn = searchContainer.closest('.col-12, .col-md-auto');
        const buttonsContainer = $('.dt-buttons-container');
        const abrirModalNovaDisciplinaBtnDt = $('#abrirModalNovaDisciplinaDt'); // Adjusted selector (cloned button)


        // Remove any dynamically created mobile icon buttons (not used in the new logic)
        // Safety removal in case they were created by older code or other scripts
        $('#abrirBuscaModalMobile, #abrirModalNovaDisciplinaIconMobile').remove(); // Adjusted selectors


        // Check window width to switch between mobile and desktop layout
        if (window.innerWidth < 768) { // Bootstrap 'md' breakpoint
            // Mobile Layout: Show the inline search and the cloned add button (as icon)
            if (filterColumn.length) {
                filterColumn.show(); // Ensure the filter column is shown
                // CSS handles making the input take full width and the filter container grow.
            }

            // Mobile Layout: Show the cloned add button (#abrirModalNovaDisciplinaDt) and style it as icon-only
            // This button is already in the buttonsContainer due to the initComplete logic.
            // We just need to ensure it's shown and styled correctly for mobile.
            if (abrirModalNovaDisciplinaBtnDt.length) {
                 abrirModalNovaDisciplinaBtnDt.show(); // Ensure the cloned button is shown
                 // Use Bootstrap classes and custom CSS to make it icon-only on mobile
                 // The CSS will handle hiding the text and adjusting padding.
                 abrirModalNovaDisciplinaBtnDt.find('span').addClass('d-none').removeClass('d-sm-inline'); // Hide text on small screens
                 abrirModalNovaDisciplinaBtnDt.find('i').removeClass('me-sm-2').addClass('me-0'); // Remove desktop margin from icon
                 // CSS will add specific padding for the icon-only version (#abrirModalNovaDisciplinaDt in CSS)
            }

            // Ensure the separate mobile search modal (if it exists for provas page) is closed
            // This modal and its trigger are not used in the new mobile layout.
             if (document.querySelector("#modalBuscaProvas")) {
                 document.querySelector("#modalBuscaProvas").style.display = 'none';
             }


        } else { // Desktop Layout (>= 768px)
            // Desktop Layout: Show the inline search
            if (filterColumn.length) {
                filterColumn.show(); // Ensure the filter column is shown
                // CSS handles desktop width and non-growing behavior.
            }

             // Desktop Layout: Remove any lingering mobile icon buttons (should not be created by this script)
            $('#abrirModalNovaDisciplinaIconMobile').remove(); // Safety removal

            // Desktop Layout: Show the full "Adicionar Disciplina" button
            if (abrirModalNovaDisciplinaBtnDt.length) {
                 abrirModalNovaDisciplinaBtnDt.show();
                 // Ensure text and icon are correct for desktop
                 abrirModalNovaDisciplinaBtnDt.find('span').removeClass('d-none').addClass('d-sm-inline'); // Show text on small+ screens
                 abrirModalNovaDisciplinaBtnDt.find('i').addClass('me-sm-2').removeClass('me-0'); // Add desktop margin
                 // CSS will ensure correct padding for desktop (#abrirModalNovaDisciplinaDt in CSS)
            }
        }
        // DataTables columns adjustment and responsive recalc is handled by the debounce resize listener.
    }


    // --- MANAGE ADD/EDIT DISCIPLINA MODAL ---
    // Function to open the add/edit discipline modal (Adjusted from abrirModalFormProva)
    function abrirModalFormDisciplina(isEditMode = false, dadosDisciplina = null, targetTr = null) {
         // Check if necessary modal elements exist (Adjusted selectors)
         if (!formDisciplina || !modalDisciplinaLabel || !modalDisciplina || !disciplinaNomeInput || !disciplinaLocalInput) {
             console.error("Discipline modal elements not found."); return;
         }

         formDisciplina.reset(); // Clear all form fields
         // Clear visual validations and error messages (Adjusted fields)
         const fieldsToClearValidation = [
             disciplinaNomeInput, disciplinaProfessorInput, disciplinaDiasInput,
             disciplinaHorarioInicioInput, disciplinaHorarioFimInput, disciplinaLocalInput
         ];
         fieldsToClearValidation.forEach(clearFieldError);

         // Clear form data attributes that store ID and rowIndex (Adjusted dataset keys)
         delete formDisciplina.dataset.disciplinaId;
         delete formDisciplina.dataset.rowIndex;

         // Set modal title based on mode (add or edit) (Adjusted selector)
         modalDisciplinaLabel.textContent = isEditMode ? "Editar Disciplina" : "Adicionar Disciplina";

         // If in edit mode and discipline data is provided, populate the form
         if (isEditMode && dadosDisciplina) {
             // Populate the form with discipline data (Adjusted inputs)
             disciplinaIdInput.value = dadosDisciplina.id || ''; // Set hidden ID input
             disciplinaNomeInput.value = dadosDisciplina.nome || '';
             disciplinaProfessorInput.value = dadosDisciplina.professor || '';
             disciplinaDiasInput.value = dadosDisciplina.dias || '';
             disciplinaHorarioInicioInput.value = dadosDisciplina.horarioInicio || ''; // HH:mm for time input
             disciplinaHorarioFimInput.value = dadosDisciplina.horarioFim || ''; // HH:mm for time input
             disciplinaLocalInput.value = dadosDisciplina.local || '';


             // Set data attributes on the form with discipline ID and row index (Adjusted dataset keys)
             formDisciplina.dataset.disciplinaId = dadosDisciplina.id;
             // Get row index AFTER DataTables has been initialized
             if (tabelaDisciplinasDt && targetTr) {
                 formDisciplina.dataset.rowIndex = tabelaDisciplinasDt.row(targetTr).index();
             }
         }
         modalDisciplina.showModal(); // Show the modal (Adjusted selector)
    }


    // Function to close the add/edit discipline modal (Adjusted from fecharModalFormProva)
    function fecharModalFormDisciplina() {
         if (modalDisciplina) modalDisciplina.close(); // Close the modal (Adjusted selector)
          // Optional: clear form and validations when closing without saving
          if (formDisciplina) {
              formDisciplina.reset();
               // Adjusted fields to clear validation
               const fieldsToClearValidation = [
                 disciplinaNomeInput, disciplinaProfessorInput, disciplinaDiasInput,
                 disciplinaHorarioInicioInput, disciplinaHorarioFimInput, disciplinaLocalInput
                 ];
              fieldsToClearValidation.forEach(clearFieldError);
              // Adjusted dataset keys
              delete formDisciplina.dataset.disciplinaId;
              delete formDisciplina.dataset.rowIndex;
              disciplinaIdInput.value = ''; // Also clear the hidden ID input
          }
    }

    // Listeners to close discipline modal (Adjusted selectors)
    if (fecharModalDisciplinaBtn) fecharModalDisciplinaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormDisciplina(); });
    if (cancelarModalDisciplinaBtn) cancelarModalDisciplinaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormDisciplina(); });
    // Close modal by clicking outside (only for the <dialog> element) (Adjusted selector)
    if (modalDisciplina) modalDisciplina.addEventListener("click", e => { if (e.target === modalDisciplina) fecharModalFormDisciplina(); });

    // --- MANAGE DETAILS DISCIPLINA MODAL (Optional - Added for consistency) ---
    // Adjusted from Provas details modal
    const modalDetalhesDisciplina = document.querySelector("#modalDetalhesDisciplina"); // Adjusted ID
    const fecharModalDetalhesDisciplinaBtn = document.querySelector("#fecharModalDetalhesDisciplina"); // Adjusted ID
    const okModalDetalhesDisciplinaBtn = document.querySelector("#okModalDetalhesDisciplina"); // Adjusted ID
    const modalDetalhesDisciplinaConteudo = document.querySelector("#modalDetalhesDisciplinaConteudo"); // Adjusted ID
    const modalDetalhesDisciplinaLabel = document.querySelector("#modalDetalhesDisciplinaLabel"); // Adjusted ID

    // Function to open the discipline details modal
    function abrirModalDeDetalhesDisciplina(dadosLinhaTabela, dadosCompletosDisciplina = null) {
         // Check if necessary modal elements exist (Adjusted selectors)
         if (!modalDetalhesDisciplina || !modalDetalhesDisciplinaConteudo || !modalDetalhesDisciplinaLabel) {
             console.error("Discipline details modal elements not found.");
             return;
         }

         // Prepare data for display (Adjusted fields and fallbacks)
         const nomeDisciplina = dadosCompletosDisciplina?.nome || dadosLinhaTabela[0] || 'N/A';
         modalDetalhesDisciplinaLabel.textContent = "Detalhes da Disciplina"; // Set the modal title

         const professor = dadosCompletosDisciplina?.professor || dadosLinhaTabela[1] || "Não informado";
         const dias = dadosCompletosDisciplina?.dias || dadosLinhaTabela[2] || "Não informado";
         const horario = dadosCompletosDisciplina?.horarioInicio && dadosCompletosDisciplina?.horarioFim
             ? `${formatTime(dadosCompletosDisciplina.horarioInicio)} - ${formatTime(dadosCompletosDisciplina.horarioFim)}`
             : dadosLinhaTabela[3] || "Não informado"; // Fallback to table string if complete data missing
         const local = dadosCompletosDisciplina?.local || dadosLinhaTabela[4] || "Não informado";

         // Build the HTML for the details modal body (Adjusted content)
         modalDetalhesDisciplinaConteudo.innerHTML = `
              <dl class="row">
                  <dt class="col-sm-4 col-md-3">Disciplina:</dt>
                  <dd class="col-sm-8 col-md-9">${nomeDisciplina}</dd>
                  <dt class="col-sm-4 col-md-3">Professor:</dt>
                  <dd class="col-sm-8 col-md-9">${professor}</dd>
                  <dt class="col-sm-4 col-md-3">Dias da Semana:</dt>
                  <dd class="col-sm-8 col-md-9">${dias}</dd>
                   <dt class="col-sm-4 col-md-3">Horário:</dt>
                  <dd class="col-sm-8 col-md-9">${horario}</dd>
                  <dt class="col-sm-4 col-md-3">Local:</dt>
                  <dd class="col-sm-8 col-md-9">${local}</dd>
              </dl>`; // Add other fields if needed

         modalDetalhesDisciplina.showModal(); // Show the details modal
    }

    // Function to close the details modal
    function fecharModalDeDetalhesDisciplina() { if (modalDetalhesDisciplina) modalDetalhesDisciplina.close(); } // Adjusted selector
    // Listeners to close details modal
    if (fecharModalDetalhesDisciplinaBtn) { fecharModalDetalhesDisciplinaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhesDisciplina(); }); } // Adjusted selector
    if (okModalDetalhesDisciplinaBtn) { okModalDetalhesDisciplinaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhesDisciplina(); }); } // Adjusted selector
    // Close modal by clicking outside (only for the <dialog> element)
    if (modalDetalhesDisciplina) modalDetalhesDisciplina.addEventListener("click", e => { if (e.target === modalDetalhesDisciplina) fecharModalDeDetalhesDisciplina(); }); // Adjusted selector


    // --- TABLE ACTIONS (Using event delegation on tbody for action buttons) ---
    // Listener for clicks on Edit buttons (.btn-edit-disciplina) (Adjusted selector)
    $('#tabelaDisciplinas tbody').on('click', '.btn-edit-disciplina', function (e) {
         e.preventDefault(); // Prevent default link behavior
         if (!tabelaDisciplinasDt) return;

         // Find the parent row (tr) of the clicked button
         const trElement = $(this).closest('tr')[0];
         // Get the full discipline data that was stored in the TR's data attribute
         const dadosCompletosArmazenados = $(trElement).data('completo');


         // Check if we could get the row data
         if (!dadosCompletosArmazenados) {
             console.error("Não foi possível obter os dados da linha para edição (dados completos ausentes).");
             // Fallback: try to construct data from visible cells if necessary, but storing complete data is better
             const rowDataArray = tabelaDisciplinasDt.row(trElement).data();
             if (rowDataArray) {
                  console.warn("Using visible table data as fallback for editing.");
                  const horarioParts = rowDataArray[3] ? String(rowDataArray[3]).split(' - ') : ['', ''];
                  // Need to convert AM/PM from display format back to 24h for input[type="time"]
                  const startTime = horarioParts[0] ? formatTimeForInput(horarioParts[0].trim()) : '';
                  const endTime = horarioParts[1] ? formatTimeForInput(horarioParts[1].trim()) : '';


                  // Construct a partial data object from visible cells and data attributes
                  const fallbackData = {
                       // Try to get ID from a data attribute on the TR
                       id: $(trElement).data('id') || 'fallback-' + new Date().getTime(),
                       nome: rowDataArray[0] || '',
                       professor: rowDataArray[1] || '',
                       dias: rowDataArray[2] || '', // Assuming this is text
                       horarioInicio: startTime,
                       horarioFim: endTime,
                       local: rowDataArray[4] || ''
                  };

                  abrirModalFormDisciplina(true, fallbackData, trElement);
                  return;
             }
             console.error("Não foi possível obter dados visíveis da linha para edição fallback.");
             return;
         }


         // Open the edit modal, passing the full data and the row reference
         abrirModalFormDisciplina(true, dadosCompletosArmazenados, trElement);
    });

    // Listener for Remove Discipline button clicks (.btn-remover-disciplina) (Adjusted selector)
    $('#tabelaDisciplinas tbody').on('click', '.btn-remover-disciplina', function (e) {
         e.preventDefault();
         if (!tabelaDisciplinasDt) return;
         const trElement = $(this).closest('tr'); // Find the parent TR
         const row = tabelaDisciplinasDt.row(trElement); // Get the DataTables row object
         const rowData = row.data(); // Visible data for confirmation message
         const disciplinaId = $(trElement).data('id'); // Get the stored ID


         if (!rowData) {
             console.error("Não foi possível obter os dados da linha para remoção.");
             return;
         }

         // Get the discipline name for the confirmation message (first cell)
         const disciplinaNome = rowData[0] || "esta disciplina";

         // Show a native browser confirmation modal
         if (confirm(`Tem certeza que deseja remover a disciplina "${disciplinaNome}"?`)) {
             // Remove the row from DataTables and redraw (without reordering/repaging)
             row.remove().draw(false);
             alert("Disciplina removida com sucesso!");
              // Optional: Call function to send request to backend to permanently remove
              // if(disciplinaId) deleteDisciplinaFromBackend(disciplinaId);

              // Also remove from the listaDisciplinasData array if you are using it as the source of truth
              listaDisciplinasData = listaDisciplinasData.filter(item => item.id !== disciplinaId);
              // console.log("listaDisciplinasData after removal:", listaDisciplinasData); // Debugging
         }
    });


    // --- FORM SUBMISSION ---
    if (formDisciplina) {
        formDisciplina.addEventListener("submit", function (e) {
            e.preventDefault(); // Prevent default form submission

            // Validate the form before proceeding
            if (!validateFormDisciplina()) { // Adjusted function call
                console.warn("Formulário de disciplina inválido.");
                return; // Stop if validation fails
            }

            // Check if the DataTables instance exists
            if (!tabelaDisciplinasDt) { // Adjusted variable name
                console.error("DataTables not initialized.");
                return;
            }

             // Get form data and data attributes (ID and rowIndex for editing)
            const disciplinaId = disciplinaIdInput.value || 'newDiscID-' + new Date().getTime(); // Use hidden input value for ID or generate temporary
            const rowIndex = formDisciplina.dataset.rowIndex !== undefined ? parseInt(formDisciplina.dataset.rowIndex) : undefined;


             // Gather all discipline data from form inputs into an object
            const dadosCompletosDisciplina = {
                 id: disciplinaId, // Keep or generate the ID
                 nome: disciplinaNomeInput.value.trim(),
                 professor: disciplinaProfessorInput.value.trim(),
                 dias: disciplinaDiasInput.value.trim(),
                 horarioInicio: disciplinaHorarioInicioInput.value, // HH:mm format
                 horarioFim: disciplinaHorarioFimInput.value, // HH:mm format
                 local: disciplinaLocalInput.value.trim()
            };

             // Format data for table display
             const horarioFormatadoParaTabela = dadosCompletosDisciplina.horarioInicio && dadosCompletosDisciplina.horarioFim
                 ? `${formatTime(dadosCompletosDisciplina.horarioInicio)} - ${formatTime(dadosCompletosDisciplina.horarioFim)}`
                 : '-';

             // Create HTML for the Actions column (Bootstrap Dropdown)
             const dropdownHtml = `
                 <div class="dropdown">
                                 <button class="btn btn-sm btn-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Ações da disciplina" data-bs-popper-boundary="window">
                                         <i class="bi bi-three-dots-vertical"></i>
                                     </button>
                                     <ul class="dropdown-menu dropdown-menu-end">
                                         <li><a class="dropdown-item btn-edit-disciplina" href="#"><i class="bi bi-pencil-square me-2"></i>Editar Disciplina</a></li>
                                         <li><hr class="dropdown-divider"></li>
                                         <li><a class="dropdown-item btn-remover-disciplina text-danger" href="#"><i class="bi bi-trash me-2"></i>Remover Disciplina</a></li>
                                     </ul>
                                 </div>`;

    // ... o restante da sua função de submit que usa dropdownHtml ...

             // Prepare visible data for the table row (array in column order)
            const dadosLinhaTabela = [
                 dadosCompletosDisciplina.nome, // Coluna 0
                 dadosCompletosDisciplina.professor || '-', // Coluna 1
                 dadosCompletosDisciplina.dias || '-', // Coluna 2
                 horarioFormatadoParaTabela, // Coluna 3
                 dadosCompletosDisciplina.local || '-', // Coluna 4
                 dropdownHtml // Coluna 5
            ];

            let targetRow; // Variable to hold the DataTables row object

             // Check if we are editing an existing row or adding a new one
             // Check if rowIndex is valid AND if the row exists in DataTables (important after filtering/sorting)
            if (disciplinaId && rowIndex !== undefined && tabelaDisciplinasDt.row(rowIndex).node()) { // Adjusted variable name
                 // Edit Mode: Get the row by index and update its data
                 targetRow = tabelaDisciplinasDt.row(rowIndex); // Adjusted variable name
                 targetRow.data(dadosLinhaTabela).draw(false); // Update data and redraw (without reordering/repaging)

                 // Update the data in the source array (listaDisciplinasData)
                 const dataIndex = listaDisciplinasData.findIndex(item => item.id === disciplinaId);
                 if (dataIndex !== -1) {
                      listaDisciplinasData[dataIndex] = dadosCompletosDisciplina;
                 } else {
                     console.warn(`Could not find discipline with ID ${disciplinaId} in source data array to update.`);
                     // If not found by ID, try updating the one at the rowIndex (less reliable)
                     if (rowIndex !== undefined && listaDisciplinasData[rowIndex]) {
                          listaDisciplinasData[rowIndex] = dadosCompletosDisciplina;
                     }
                 }

                 alert("Disciplina atualizada com sucesso!");

            } else {
                 // Add Mode: Add a new row with the data
                 targetRow = tabelaDisciplinasDt.row.add(dadosLinhaTabela).draw(false); // Adjusted variable name

                 // Add the new discipline to the source array (listaDisciplinasData)
                 listaDisciplinasData.push(dadosCompletosDisciplina);
                 // console.log("listaDisciplinasData after add:", listaDisciplinasData); // Debugging

                 alert("Disciplina adicionada com sucesso!");
            }

            // Store all complete data in the TR node using jQuery .data()
            const targetNode = $(targetRow.node()); // Get the TR node of the manipulated row
            if (targetNode.length) {
                 targetNode.data('completo', dadosCompletosDisciplina);
                 targetNode.data('id', dadosCompletosDisciplina.id); // Store ID separately for easy access
                 // Store other individual data attributes for convenience if needed
                 targetNode.data('dias', dadosCompletosDisciplina.dias);
                 targetNode.data('horarioInicio', dadosCompletosDisciplina.horarioInicio);
                 targetNode.data('horarioFim', dadosCompletosDisciplina.horarioFim);
                 targetNode.data('local', dadosCompletosDisciplina.local);

                 //console.log("Data stored in TR:", targetNode.data('completo')); // Debugging
            }


             // Optional: Call function to save complete data to backend
             // saveDisciplinaToBackend(dadosCompletosDisciplina);


            fecharModalFormDisciplina(); // Close the modal after saving/adding (Adjusted function call)
            // Adjust columns again after adding/editing (especially with responsive)
            if (tabelaDisciplinasDt) tabelaDisciplinasDt.columns.adjust().responsive.recalc(); // Adjusted variable name
        });
    }

    // --- AUXILIARY FORMATTING FUNCTIONS ---
    // formatTime function is already defined above and is useful here.
    // formatTimeForInput function is already defined above and is useful here.

    // Note: parsePtBrDateToIso is not needed for this discipline table.


    // --- FINAL INITIALIZATIONS ---

    // Initialize the DataTable for the first time when the DOM is loaded
    inicializarDataTable();


}); // End of DOMContentLoaded listener
