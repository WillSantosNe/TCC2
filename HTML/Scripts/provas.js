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

    // Esta função não é mais usada para o scrollY fixo, mas pode ser útil para outros cálculos de layout se necessário.
    // Se não for usada em mais nenhum lugar, pode ser removida.
    function calcularAlturaCorpoTabela() {
       const alturaMediaLinha = 45;
       const numLinhasDesktop = 10; // Este número agora é apenas uma referência visual para o scrollY fixo
       const numLinhasMobile = 8;
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

        // Destruir instância existente se houver (útil em SPA ou para re-inicializar)
        if ($.fn.DataTable.isDataTable('#tabelaProvas')) {
            $('#tabelaProvas').DataTable().destroy();
             // Limpar o DOM gerado pelo DataTables antes de re-inicializar
            $('#tabelaProvas tbody').empty(); // Limpa o tbody, o HTML original será re-usado
            // Pode ser necessário limpar outras partes do wrapper se o DOM 'dom' for muito customizado
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
                { responsivePriority: 1, targets: 0 },   // Disciplina
                { responsivePriority: 10001, targets: 1 }, // Nota (colapsa primeiro se responsivo)
                { responsivePriority: 2, targets: 2 },   // Data & Horário
                { responsivePriority: 10002, targets: 3 }, // Local (colapsa em seguida se responsivo)
                { responsivePriority: 3, targets: 4 },   // Status
                // Classe dtr-control REMOVIDA desta coluna para não conflitar com o dropdown
                { responsivePriority: 4, targets: 5, className: "dt-actions-column no-export" } // Ações
            ],
             // Esta função pode ser útil se você precisar copiar data attributes do HTML estático inicial
            createdRow: function (row, data, dataIndex) {
                 // DataTables já deve ter lido os data attributes do HTML estático
                 // Se você adicionar linhas via API depois, precisará setar os data attributes
                 // manualmente ou usar .data() do jQuery no nó da linha
             },
            initComplete: function (settings, json) {
                const api = this.api();
                const searchInput = $('#tabelaProvas_filter input');
                // Adicionado width: 100% para mobile e auto para desktop via handleResponsiveControls
                searchInput.addClass('form-control form-control-sm').css('width', 'auto'); // Largura inicial em desktop
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
                         buttonsContainer.append(abrirModalNovaProvaBtnClone);
                    }
                     // Ocultar o botão original em todas as situações
                    abrirModalNovaProvaBtnOriginal.style.display = 'none';
                }


                // Adicionar "Remover Prova" aos dropdowns existentes no HTML inicial (útil para dados estáticos)
                // Esta parte agora é menos crítica se você gerencia as linhas via DataTables API, mas não faz mal manter.
                 $('#tabelaProvas tbody tr').each(function() {
                     const dropdownMenu = $(this).find('.dropdown-menu');
                      if (dropdownMenu.find('.btn-remover-prova').length === 0) {
                          // Adiciona um divisor antes do Remover, se ele não for o primeiro item e não houver divisor
                          // Verifica se há algum item ANTES do Remover
                          const existingItemsCount = dropdownMenu.children('li').length;
                          if(existingItemsCount > 0 && dropdownMenu.find('.dropdown-divider').last().length === 0) {
                               dropdownMenu.append('<li><hr class="dropdown-divider"></li>');
                          }
                          dropdownMenu.append('<li><a class="dropdown-item btn-remover-prova text-danger" href="#"><i class="bi bi-trash me-2"></i>Remover Prova</a></li>');
                      }
                 });


                handleResponsiveControls(api); // Chamada inicial para ajustar layout e botões de responsividade
                // Listener de resize debounce para ajustar colunas e layout
                $(window).off('resize.dtProvasGlobal').on('resize.dtProvasGlobal', function () { // Usar namespace global e remover listeners anteriores
                     handleResponsiveControls(tabelaProvasDt); // Reajusta botões de responsividade (mobile/desktop)
                     // Debounce para ajustar as colunas da tabela e scroll
                     clearTimeout(resizeDebounceTimer);
                     resizeDebounceTimer = setTimeout(function () {
                         if (tabelaProvasDt) {
                             // Com scrollY fixo, apenas ajustamos as colunas e responsividade.
                             // O DataTables cuida da altura do scrollBody.
                             tabelaProvasDt.columns.adjust().responsive.recalc();
                         }
                     }, 250); // Tempo do debounce em ms
                });


                if (modalBusca) modalBusca.style.display = 'none'; // Garante que o modal de busca esteja oculto inicialmente
                // Removido o ajuste final de colunas daqui, pois já é feito no resize handler inicial se necessário
            },
            // Adiciona data attributes do HTML estático para serem facilmente acessíveis via .data()
            // aoColumnDefs é uma alternativa mais antiga a columnDefs. Você pode consolidar se quiser.
            // O importante é que os data attributes do TR sejam acessíveis (via .data() do jQuery).
            aoColumnDefs: [
                 {
                     targets: '_all', // Aplica a todas as colunas
                     createdCell: function (td, cellData, rowData, row, col) {
                         // Tenta obter os data attributes da célula original do HTML
                         const originalCell = $(td).closest('tr').find('td').eq(col);
                         if (originalCell.length) {
                              // Use $.each para iterar sobre todos os data attributes da célula original
                              $.each(originalCell.data(), function (key, value) {
                                 // Armazena os data attributes na célula gerada pelo DataTables
                                 $(td).data(key, value);
                              });
                         }
                     }
                 }
            ]

        });

        return tabelaProvasDt; // Retorna a instância do DataTable
    }


    // Função para lidar com a responsividade dos controles de busca e adicionar na área do header
    function handleResponsiveControls(dataTableApi) {
        const searchContainer = $('#tabelaProvas_filter'); // Container do input de busca gerado pelo DataTables
        const searchInput = searchContainer.find('input');
        const buttonsContainer = $('.dt-buttons-container'); // Container customizado para os botões (definido no 'dom')
        const abrirModalNovaProvaBtnDt = $('#abrirModalNovaProvaDt'); // Botão "Adicionar Prova" clonado

        // Remove botões de ícone mobile existentes para evitar duplicatas ao rodar em resize
        $('#abrirBuscaModalMobile, #abrirModalNovaProvaIconMobile').remove();

        // Verifica a largura da janela para alternar entre layout mobile e desktop
        if (window.innerWidth < 768) { // Breakpoint 'md' do Bootstrap
            // Layout Mobile: Esconde a busca inline
            if (searchContainer.length) searchInput.css('width', '100%').parent().hide(); // Força 100% de largura no input antes de esconder

            // Layout Mobile: Adiciona botões de ícone de busca e adicionar
            if (buttonsContainer.length) {
                 // Botão de busca (lupa)
                 const btnLupa = $('<button id="abrirBuscaModalMobile" class="btn btn-light btn-search-icon-mobile" aria-label="Buscar Provas"><i class="bi bi-search"></i></button>');
                 btnLupa.on('click', (e) => {
                     e.preventDefault();
                     abrirModalDeBusca(); // Abre o modal de busca em mobile
                 });

                 // Botão de adicionar (só ícone)
                 const btnAdicionarIcone = $('<button id="abrirModalNovaProvaIconMobile" class="btn btn-primary btn-add-proof-icon-mobile ms-2" aria-label="Adicionar Nova Prova"><i class="bi bi-plus-lg"></i></button>');
                 btnAdicionarIcone.on('click', (e) => {
                     e.preventDefault();
                     abrirModalFormProva(); // Abre o modal de adicionar/editar
                 });

                 // Adiciona os botões de ícone ao container
                 buttonsContainer.append(btnLupa).append(btnAdicionarIcone);
            }

             // Esconde o botão "Adicionar Prova" completo (com texto) se ele existir no container de botões
            if (abrirModalNovaProvaBtnDt.length) abrirModalNovaProvaBtnDt.hide();

        } else { // Layout Desktop (>= 768px)
             // Layout Desktop: Mostra a busca inline
             if (searchContainer.length) searchInput.css('width', 'auto').parent().show(); // Restaura largura e mostra o container

             // Layout Desktop: Remove os botões de ícone mobile
             $('#abrirBuscaModalMobile, #abrirModalNovaProvaIconMobile').remove();

             // Layout Desktop: Mostra o botão "Adicionar Prova" completo se ele existir
            if (abrirModalNovaProvaBtnDt.length) {
                 abrirModalNovaProvaBtnDt.show();
                 // Garante que o texto e ícone estejam corretos para desktop (usa classes d-none, d-sm-inline do Bootstrap)
                 abrirModalNovaProvaBtnDt.find('span').removeClass('d-none').addClass('d-sm-inline');
                 abrirModalNovaProvaBtnDt.find('i').addClass('me-sm-2').removeClass('me-0'); // Adiciona margem no ícone em desktop
             }
        }

         // Não force ajuste de colunas aqui, ele é feito no debounce do resize global
         // if(dataTableApi) dataTableApi.columns.adjust().responsive.recalc();
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
          // Opcional: limpar formulário e validações ao fechar sem salvar para o caso de reabrir logo em seguida para Adicionar
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

    // Listeners para fechar modal de prova (o listener para o botão clonado #abrirModalNovaProvaDt é configurado em initComplete)
    if (fecharModalProvaBtn) fecharModalProvaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormProva(); });
    if (cancelarModalProvaBtn) cancelarModalProvaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalFormProva(); });
    // Fechar modal clicando fora (apenas para o elemento <dialog>)
    if (modalProva) modalProva.addEventListener("click", e => { if (e.target === modalProva) fecharModalFormProva(); });


    // --- GERENCIAMENTO DO MODAL DE BUSCA ---
    // Função para abrir o modal de busca (usado em layout mobile)
    function abrirModalDeBusca() {
        // Abre o modal de busca em mobile. Em desktop, a busca é inline (controlado por handleResponsiveControls).
        if (modalBusca && inputBuscaProvasModal && tabelaProvasDt) {
             // Preenche o input do modal com o valor atual da busca do DataTables
            inputBuscaProvasModal.value = tabelaProvasDt.search();
            modalBusca.showModal(); // Exibe o modal de busca
            inputBuscaProvasModal.focus(); // Foca no campo de busca ao abrir para digitação imediata
        }
    }
    // Função para fechar o modal de busca
    function fecharModalDeBusca() { if (modalBusca) modalBusca.close(); }

    // Função para aplicar o filtro digitado no modal de busca
    function aplicarBuscaDoModal() {
        if (tabelaProvasDt && inputBuscaProvasModal) {
             // Aplica o filtro do input do modal na tabela do DataTables e redesenha
            tabelaProvasDt.search(inputBuscaProvasModal.value).draw();
        }
        fecharModalDeBusca(); // Fecha o modal após aplicar a busca
    }

    // Listeners para o modal de busca (o listener para o botão mobile é dinâmico)
    if (fecharModalBuscaBtn) { fecharModalBuscaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeBusca(); }); }
    if (aplicarBuscaProvasBtn) { aplicarBuscaProvasBtn.addEventListener("click", (e) => { e.preventDefault(); aplicarBuscaDoModal(); }); }
    // Permite aplicar a busca pressionando Enter no input do modal
    if (inputBuscaProvasModal) { inputBuscaProvasModal.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); aplicarBuscaDoModal(); } }); }
    // Fechar modal clicando fora (apenas para o elemento <dialog>)
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
         // Preferir dados completos armazenados se disponíveis, fallback para dados da linha da tabela
         const disciplina = dadosCompletosProva?.disciplinaNome || dadosLinhaTabela[0] || 'N/A';
         modalDetalhesProvaLabel.textContent = "Detalhes da Prova"; // Define o título do modal

         // Tenta encontrar o professor na lista de disciplinas com base no ID ou nome, fallback para o dado armazenado ou 'Não informado'
         const professorDaLista = listaDisciplinas.find(d => d.id === dadosCompletosProva?.disciplinaId || d.nome === disciplina)?.professor;
         const professor = dadosCompletosProva?.professor || professorDaLista || "Não informado";

         // Formata a nota para exibição (usa vírgula)
         const notaObtidaOriginal = dadosCompletosProva?.notaObtida !== undefined ? dadosCompletosProva.notaObtida : (dadosLinhaTabela[1] !== '-' ? String(dadosLinhaTabela[1]).split('/')[0].trim().replace(',', '.') : '');
         const valorNotaOriginal = dadosCompletosProva?.valorNota || (dadosLinhaTabela[1] !== '-' ? String(dadosLinhaTabela[1]).split('/')[1]?.trim().replace(',', '.') : '10,0');
         const notaFormatada = notaObtidaOriginal && notaObtidaOriginal !== '-' ?
              `${String(notaObtidaOriginal).replace('.', ',')} / ${String(valorNotaOriginal).replace('.', ',')}` :
              (dadosLinhaTabela[1] === '-' && valorNotaOriginal ? `- / ${String(valorNotaOriginal).replace('.', ',')}` : '-');


         const dataHorario = dadosLinhaTabela[2] || '-'; // Usa o valor já formatado na tabela (DD Mon YYYY, HH:MM AM/PM ou similar)
         const local = dadosCompletosProva?.local !== undefined ? (dadosCompletosProva.local || '-') : (dadosLinhaTabela[3] || '-');


         // Tenta obter o status em texto dos dados completos, fallback para o HTML do badge da célula da tabela
         let statusParaDetalhes = dadosLinhaTabela[4];
         if (dadosCompletosProva?.status) {
             const statusBadgeClass = dadosCompletosProva.status === 'Agendado' ? 'bg-info-subtle text-info' :
                 (dadosCompletosProva.status === 'Concluída' ? 'bg-success-subtle text-success' :
                     'bg-danger-subtle text-danger');
             statusParaDetalhes = `<span class="badge ${statusBadgeClass}">${dadosCompletosProva.status}</span>`;
         } else {
              // Se não tiver o status em texto nos dados completos, tenta extrair do HTML da célula (menos confiável)
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = dadosLinhaTabela[4];
              statusParaDetalhes = tempDiv.innerHTML || '-'; // Usa o HTML original da célula
         }

         const conteudos = dadosCompletosProva?.conteudos || '-';
         const observacoes = dadosCompletosProva?.observacoes || '-';

         // Monta o HTML do corpo do modal de detalhes usando os dados preparados
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
         modalDetalhes.showModal(); // Exibe o modal de detalhes
    }
    // Função para fechar o modal de detalhes
    function fecharModalDeDetalhes() { if (modalDetalhes) modalDetalhes.close(); }
    // Listeners para fechar modal de detalhes
    if (fecharModalDetalhesBtn) { fecharModalDetalhesBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhes(); }); }
    if (okModalDetalhesBtn) { okModalDetalhesBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDeDetalhes(); }); }
    // Fechar modal clicando fora (apenas para o elemento <dialog>)
    if (modalDetalhes) modalDetalhes.addEventListener("click", e => { if (e.target === modalDetalhes) fecharModalDeDetalhes(); });


    // --- AÇÕES NA TABELA (Usando delegação de eventos no tbody para botões de ação) ---
    // Usamos delegação (.on('click', selector, handler)) no tbody para que os listeners
    // funcionem mesmo para linhas adicionadas ou modificadas dinamicamente pelo DataTables.

    // Listener para cliques nos botões de Editar (.btn-edit-proof)
    $('#tabelaProvas tbody').on('click', '.btn-edit-proof', function (e) {
         e.preventDefault(); // Evita o comportamento padrão do link
         // Verifica se a instância do DataTables existe
         if (!tabelaProvasDt) return;

         // Encontra a linha (tr) pai do botão clicado
         const trElement = $(this).closest('tr')[0];
         // Obtém os dados visíveis da linha conforme gerenciados pelo DataTables
         const rowDataArray = tabelaProvasDt.row(trElement).data();
         // Obtém os dados completos da prova que foram armazenados no data attribute da TR
         const dadosCompletosArmazenados = $(trElement).data();

         // Verifica se conseguimos obter os dados da linha
         if (!rowDataArray) {
             console.error("Não foi possível obter os dados da linha para edição.");
             return;
         }

          // Prepara os dados para preencher o formulário do modal de edição.
          // Tenta usar os dados completos armazenados primeiro, fallback para os dados visíveis formatados.

         let dataParaInput = '', horaParaInput = '';
         // Se tiver data e hora nos dados completos (formato ISO ou similar), use-os
         // Senão, tente parsear a string formatada da tabela
         const dataHoraString = dadosCompletosArmazenados.data && dadosCompletosArmazenados.horario
             ? `${dadosCompletosArmazenados.data} ${dadosCompletosArmazenados.horario}`
             : rowDataArray[2];

         if (dataHoraString && typeof dataHoraString === 'string' && dataHoraString !== '-') {
              // Tenta parsear formatos comuns (ISO YYYY-MM-DD HH:mm ou DD Mon YYYY, HH:mm AM/PM)
             if (dataHoraString.includes('-') && dataHoraString.includes(':')) { // Possível formato ISO YYYY-MM-DD HH:mm
                  const [datePart, timePart] = dataHoraString.split(' ');
                  dataParaInput = datePart;
                  horaParaInput = timePart;
             } else if (dataHoraString.includes(',') && dataHoraString.match(/\d{1,2} [a-zçãõ]{3,5} \d{4}/i)) { // Possível formato DD Mon YYYY, HH:mm AM/PM (Pt-BR meses)
                  const partes = dataHoraString.split(',');
                  dataParaInput = parsePtBrDateToIso(partes[0].trim()); // Converte a data
                  if (partes.length > 1) horaParaInput = formatarHoraParaInput(partes[1].trim()); // Converte a hora
             } else if (dataHoraString.match(/^\d{4}-\d{2}-\d{2}$/)) { // Só data ISO
                  dataParaInput = dataHoraString;
             } else if (dataHoraString.match(/^\d{1,2} [a-zçãõ]{3,5} \d{4}$/i)) { // Só data DD Mon YYYY (Pt-BR meses)
                  dataParaInput = parsePtBrDateToIso(dataHoraString.trim());
             } else if (dataHoraString.includes(':')) { // Só hora
                  horaParaInput = formatarHoraParaInput(dataHoraString.trim());
             }
              // console.log(`Parseando "${dataHoraString}" -> Data: "${dataParaInput}", Hora: "${horaParaInput}"`); // Debugging
         }


          // Tenta obter o status dos dados completos primeiro, fallback para o texto do badge na tabela
         const statusTexto = dadosCompletosArmazenados.status
             ? dadosCompletosArmazenados.status
             : ($(trElement).find('.badge').text().trim() || '');


          // Tenta encontrar a disciplina na lista original usando o ID armazenado, fallback para o nome visível
         const disciplinaIdArmazenada = dadosCompletosArmazenados.disciplinaId || '';
         const disciplinaNomeDaTabela = String(rowDataArray[0]).trim();
         const disciplinaEncontradaPorId = listaDisciplinas.find(d => d.id === disciplinaIdArmazenada);
         const disciplinaEncontradaPorNome = listaDisciplinas.find(d => d.nome === disciplinaNomeDaTabela);

         const disciplinaParaModal = disciplinaEncontradaPorId
             ? disciplinaEncontradaPorId.id // Usa o ID se achou por ID (preferencial)
             : (disciplinaEncontradaPorNome ? disciplinaEncontradaPorNome.id : disciplinaIdArmazenada || ''); // Senão, tenta ID da encontrada por nome, senão ID armazenado (mesmo que não encontre na lista)


          // Objeto com os dados para preencher o modal de edição
         const dadosParaModal = {
             id: dadosCompletosArmazenados.id || dadosCompletosArmazenados.provaId || 'tempID-' + new Date().getTime(), // ID da prova (usa o que foi armazenado, gera temporário se não existir)
             disciplinaId: disciplinaParaModal, // O ID que será selecionado no <select>
             // Os campos abaixo são usados para preencher os outros inputs do modal
             disciplinaNome: disciplinaNomeDaTabela, // O nome visível na tabela (para referência)
             professor: dadosCompletosArmazenados.professor || (disciplinaEncontradaPorId ? disciplinaEncontradaPorId.professor : (disciplinaEncontradaPorNome ? disciplinaEncontradaPorNome.professor : '')),
             notaObtida: dadosCompletosArmazenados.notaObtida !== undefined ? String(dadosCompletosArmazenados.notaObtida).replace('.', ',') : (rowDataArray[1] === '-' ? '' : String(rowDataArray[1]).split('/')[0].trim()), // Nota obtida (formata para usar vírgula no input)
             data: dataParaInput, // Data no formato YYYY-MM-DD para o input type="date"
             horario: horaParaInput, // Horário no formato HH:mm para o input type="time"
             local: dadosCompletosArmazenados.local !== undefined ? dadosCompletosArmazenados.local : (rowDataArray[3] === '-' ? '' : rowDataArray[3]),
             status: statusTexto, // O texto do status (Agendada, Concluída, Cancelada)
             valorNota: dadosCompletosArmazenados.valorNota !== undefined ? String(dadosCompletosArmazenados.valorNota).replace('.', ',') : (rowDataArray[1] === '-' ? '10,0' : (String(rowDataArray[1]).split('/')[1]?.trim() || '10,0').replace('.', ',')), // Valor da nota (formata para usar vírgula, fallback para 10,0)
             conteudos: dadosCompletosArmazenados.conteudos || '',
             observacoes: dadosCompletosArmazenados.observacoes || ''
         };
          // console.log("Dados para o modal:", dadosParaModal); // Debugging: Verifique os dados que vão para o modal

         // Abre o modal de edição, passando os dados e a referência da linha
         abrirModalFormProva(true, dadosParaModal, trElement);
    });

    // Listener para cliques nos botões Detalhar (.btn-detalhar-prova)
    $('#tabelaProvas tbody').on('click', '.btn-detalhar-prova', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const trElement = $(this).closest('tr')[0];
        const dadosDaLinhaTabela = tabelaProvasDt.row(trElement).data(); // Dados visíveis
        const dadosCompletosArmazenados = $(trElement).data(); // Dados completos armazenados com .data()

        if (dadosDaLinhaTabela) {
             abrirModalDeDetalhes(dadosDaLinhaTabela, dadosCompletosArmazenados); // Passa ambos os conjuntos de dados
        }
    });

    // Listener para cliques nos botões Marcar Concluída (.btn-marcar-concluida)
    $('#tabelaProvas tbody').on('click', '.btn-marcar-concluida', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const trElement = $(this).closest('tr')[0];
        const row = tabelaProvasDt.row(trElement);
        let rowData = row.data(); // Dados visíveis da linha (array)
        const dadosCompletosArmazenados = $(trElement).data(); // Dados completos armazenados

        // Verifica se a prova já não está marcada como concluída nos dados completos
        if (dadosCompletosArmazenados?.status === 'Concluída') {
             alert("Esta prova já está marcada como concluída.");
             return; // Sai da função se já estiver concluída
        }

        // Altera o status nos dados completos armazenados
        if (dadosCompletosArmazenados) {
            dadosCompletosArmazenados.status = 'Concluída';
            $(trElement).data('status', 'Concluída'); // Garante que o data attribute também seja atualizado
        }

        // Atualiza a célula de status visível na tabela (cria o HTML do badge de Concluída)
        if (rowData) {
             rowData[4] = `<span class="badge bg-success-subtle text-success">Concluída</span>`;
             // Atualiza os dados da linha no DataTables e redesenha (sem reordenar/repaginar - draw(false))
            row.data(rowData).draw(false);
            alert("Prova marcada como concluída!");
             // Opcional: Chamar função para salvar essa mudança no backend
        } else {
            console.error("Não foi possível obter os dados da linha para marcar como concluída.");
        }
    });

    // Listener para cliques nos botões Remover Prova (.btn-remover-prova)
    $('#tabelaProvas tbody').on('click', '.btn-remover-prova', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const trElement = $(this).closest('tr'); // Encontra a TR pai
        const row = tabelaProvasDt.row(trElement); // Obtém o objeto linha do DataTables
        const rowData = row.data(); // Dados visíveis para a mensagem de confirmação

        if (!rowData) {
            console.error("Não foi possível obter os dados da linha para remoção.");
            return;
        }

        // Pega o nome da disciplina para a mensagem de confirmação (primeira célula)
        const disciplinaNome = rowData[0] || "esta prova";

        // Exibe um modal de confirmação nativo do navegador
        if (confirm(`Tem certeza que deseja remover a prova de "${disciplinaNome}"?`)) {
            // Remove a linha do DataTables e redesenha (sem reordenar/repaginar)
            row.remove().draw(false);
            alert("Prova removida com sucesso!");
             // Opcional: Chamar função para enviar requisição para o backend para remover permanentemente
        }
    });


    // --- SUBMIT DO FORMULÁRIO DE PROVA ---
    if (formProva) {
        formProva.addEventListener("submit", function (e) {
            e.preventDefault(); // Impede o envio padrão do formulário (reload da página)

            // Valida o formulário antes de prosseguir
            if (!validateFormProva()) {
                console.warn("Formulário de prova inválido.");
                return; // Se a validação falhar, para a execução da submissão
            }

            // Verifica se a instância do DataTables existe
            if (!tabelaProvasDt) {
                console.error("DataTables não inicializado.");
                return;
            }

             // Obtém dados do formulário e data attributes (ID e rowIndex para edição)
            const provaId = formProva.dataset.provaId || 'newID-' + new Date().getTime(); // Usa o ID existente se estiver editando, senão gera um temporário único
            const rowIndex = formProva.dataset.rowIndex !== undefined ? parseInt(formProva.dataset.rowIndex) : undefined; // Índice da linha se estiver editando

             // Encontra o objeto disciplina completo com base no ID selecionado no <select> para obter o nome e professor corretos
            const disciplinaSelecionadaObj = listaDisciplinas.find(d => d.id === provaDisciplinaSelect.value);

             // Reúne *todos* os dados da prova a partir dos inputs do formulário em um objeto
            const dadosCompletosProva = {
                id: provaId, // Mantém ou gera o ID
                disciplinaId: provaDisciplinaSelect.value, // ID da disciplina selecionada
                disciplinaNome: disciplinaSelecionadaObj ? disciplinaSelecionadaObj.nome : (provaDisciplinaSelect.options[provaDisciplinaSelect.selectedIndex]?.text || 'N/A'), // Nome da disciplina (fallback para texto do select)
                professor: provaProfessorInput.value.trim(), // Professor
                data: provaDataInput.value, // Data em formato YYYY-MM-DD
                horario: provaHorarioInput.value, // Horário em formato HH:mm
                local: provaLocalInput.value.trim(), // Local
                status: provaStatusSelect.value, // Status (Agendado, Concluída, Cancelada)
                 // Nota e Valor Nota: Guarda como ponto para facilitar futuros cálculos se necessário, mas preenche/exibe com vírgula
                valorNota: provaValorNotaInput.value.trim().replace(',', '.') || "10.0", // Valor da nota (converte vírgula para ponto, default 10.0)
                conteudos: provaConteudosInput.value.trim(), // Conteúdos
                observacoes: provaObservacoesInput.value.trim(), // Observações
                notaObtida: provaNotaObtidaInput.value.trim().replace(',', '.') // Nota Obtida (converte vírgula para ponto)
            };

             // Formata a data e horário para exibição na tabela (DD Mon YYYY, HH:mm AM/PM)
            let dataHoraFormatadaParaTabela = '-';
            if (dadosCompletosProva.data) {
                const [year, month, day] = dadosCompletosProva.data.split('-');
                // Usar Date.UTC para evitar problemas de fuso horário ao criar a data para formatação
                const dataObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
                const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
                dataHoraFormatadaParaTabela = `${dataObj.getUTCDate()} ${meses[dataObj.getUTCMonth()]} ${dataObj.getUTCFullYear()}`;
                if (dadosCompletosProva.horario) {
                    dataHoraFormatadaParaTabela += ', ' + formatarHora(dadosCompletosProva.horario);
                }
            } else if (dadosCompletosProva.horario) {
                 // Se só tiver horário, exibe apenas o horário formatado
                 dataHoraFormatadaParaTabela = formatarHora(dadosCompletosProva.horario);
            }


             // Cria o HTML para a coluna de Status (Badge Bootstrap) com base no status em texto
            const statusHtml = `<span class="badge ${dadosCompletosProva.status === 'Agendado' ? 'bg-info-subtle text-info' : (dadosCompletosProva.status === 'Concluída' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger')}">${dadosCompletosProva.status}</span>`;

             // Cria o HTML para a coluna de Ações (Dropdown Bootstrap)
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

             // Prepara os dados visíveis para a linha da tabela (array na ordem das colunas)
             const notaExibicao = dadosCompletosProva.notaObtida
                ? `${String(dadosCompletosProva.notaObtida).replace('.', ',')} / ${String(dadosCompletosProva.valorNota).replace('.', ',')}` // Formata para exibição com vírgula
                : '-';

            const dadosLinhaTabela = [
                 dadosCompletosProva.disciplinaNome, // Coluna 0
                 notaExibicao,   // Coluna 1
                 dataHoraFormatadaParaTabela, // Coluna 2
                 dadosCompletosProva.local || '-', // Coluna 3
                 statusHtml,   // Coluna 4
                 dropdownHtml // Coluna 5
            ];

            let targetNode; // Variável para guardar o nó TR da linha manipulada

            // Verifica se estamos editando uma linha existente ou adicionando uma nova
            if (provaId && rowIndex !== undefined && tabelaProvasDt.row(rowIndex).node()) { // Verifica se rowIndex é válido e se a linha existe no DataTables
                 // Modo Edição: Obtém a linha pelo índice e atualiza seus dados
                const linha = tabelaProvasDt.row(rowIndex);
                linha.data(dadosLinhaTabela).draw(false); // Atualiza dados e redesenha (sem reordenar/repaginar)
                targetNode = $(linha.node()); // Obtém o nó TR atualizado
                alert("Prova atualizada com sucesso!");
            } else {
                 // Modo Adicionar: Adiciona uma nova linha com os dados e obtém o nó TR
                targetNode = $(tabelaProvasDt.row.add(dadosLinhaTabela).draw(false).node()); // Adiciona linha, redesenha e obtém o nó TR
                alert("Prova adicionada com sucesso!");
            }

            // Armazenar todos os dados completos no nó TR usando jQuery .data()
            // Isso é crucial para acessar os dados completos (como ID, conteúdos, observações, etc.)
            // ao editar, detalhar ou marcar como concluída a prova novamente.
            // jQuery .data() armazena no cache de dados e converte chaves para camelCase automaticamente.
            if (targetNode && targetNode.length) {
                 // Armazena o objeto completo
                 targetNode.data('completo', dadosCompletosProva);
                 // Também pode armazenar propriedades individuais se preferir, mas o objeto completo é mais eficiente
                 targetNode.data('id', dadosCompletosProva.id); // Acessível via .data('id')
                 targetNode.data('disciplinaId', dadosCompletosProva.disciplinaId); // Acessível via .data('disciplinaId')
                 targetNode.data('professor', dadosCompletosProva.professor);
                 targetNode.data('data', dadosCompletosProva.data); // Data em formato YYYY-MM-DD
                 targetNode.data('horario', dadosCompletosProva.horario); // Horario em formato HH:mm
                 targetNode.data('local', dadosCompletosProva.local);
                 targetNode.data('status', dadosCompletosProva.status); // Status em texto
                 targetNode.data('valorNota', dadosCompletosProva.valorNota); // Valor da nota original (com ponto)
                 targetNode.data('conteudos', dadosCompletosProva.conteudos);
                 targetNode.data('observacoes', dadosCompletosProva.observacoes);
                 targetNode.data('notaObtida', dadosCompletosProva.notaObtida); // Nota obtida original (com ponto)

                 //console.log("Dados armazenados na TR:", targetNode.data('completo')); // Debugging: Verifique os dados armazenados
            }

             // Opcional: Chamar função para salvar os dados completos no backend (AJAX, Fetch API, etc.)
             // saveProvaToBackend(dadosCompletosProva);

            fecharModalFormProva(); // Fecha o modal após salvar/adicionar
            // Ajustar colunas novamente após adicionar/editar (especialmente com responsive)
            if (tabelaProvasDt) tabelaProvasDt.columns.adjust().responsive.recalc();
        });
    }

    // --- FUNÇÕES AUXILIARES DE FORMATAÇÃO ---
    // Formata hora de formato HH:mm (do input type="time") para HH:mm AM/PM (para exibição na tabela)
    function formatarHora(timeString) {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        let h = parseInt(hour);
        if (isNaN(h) || isNaN(parseInt(minute))) { console.warn("Formato de hora inválido para formatarHora:", timeString); return timeString; } // Retorna original se inválido
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // '00' (meia-noite) e '12' (meio-dia) horas se tornam '12' no formato 12 horas
        return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
    }

    // Formata hora de formato HH:mm AM/PM (da exibição na tabela) para HH:mm (para o input type="time")
    function formatarHoraParaInput(displayTime) {
        if (!displayTime || typeof displayTime !== 'string') return '';
        let timePart = displayTime.toUpperCase().trim();
        let modifier = "";
        // Verifica se termina com AM ou PM
        if (timePart.endsWith('AM')) { modifier = 'AM'; timePart = timePart.slice(0, -2).trim(); }
        else if (timePart.endsWith('PM')) { modifier = 'PM'; timePart = timePart.slice(0, -2).trim(); }
        // Note: Se a string não tiver AM/PM, a conversão pode ser imprecisa. Assume 24h se não especificado.

        let [hoursStr, minutesStr] = timePart.split(':');
        let hours = parseInt(hoursStr, 10);
        let minutes = parseInt(minutesStr, 10);

        if (isNaN(hours) || isNaN(minutes)) { console.warn("Formato de hora inválido para formatarHoraParaInput:", displayTime); return ''; }

        // Ajusta as horas para o formato 24h
        if (modifier === 'PM' && hours < 12) hours += 12;
        else if (modifier === 'AM' && hours === 12) hours = 0; // 12 AM (meia-noite) é 00:00

        // Retorna no formato HH:mm para o input type="time"
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // Converte data de formato DD Mon YYYY (Pt-BR, ex: "25 jan 2025") para ISO YYYY-MM-DD
    function parsePtBrDateToIso(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return "";
        let parts = dateStr.trim().split(" "); // Espera "Dia MêsAno Ano"
        if (parts.length !== 3) {
             // Tenta parsear formatos com separadores, mas o formato "DD Mon YYYY" é o que vem da tabela por padrão
             const dateSeparators = dateStr.match(/(\d{1,2})[\/\-\. ]([a-zA-ZçÇãÃõÕ]{3,})[\/\-\. ](\d{4})/i); // Permite separadores comuns e meses pt-BR com/sem acento
             if (dateSeparators && dateSeparators.length === 4) {
                 parts = [dateSeparators[1], dateSeparators[2], dateSeparators[3]];
             } else { console.warn("Formato de data PtBr inesperado ou inválido para parsePtBrDateToIso:", dateStr); return ""; }
        }
        const day = String(parts[0]).padStart(2,'0'); // Garante 2 dígitos para o dia
        const monthStr = parts[1].toLowerCase().substring(0, 3); // Pega as 3 primeiras letras do mês (ex: jan, fev, mar...)
        const year = parts[2];

        // Mapa para converter abreviações de mês para números
        const monthMap = {
            'jan':'01','fev':'02','mar':'03','abr':'04',
            'mai':'05','jun':'06','jul':'07','ago':'08',
            'set':'09','out':'10','nov':'11','dez':'12'
        };
        const month = monthMap[monthStr];

        // Validação básica dos componentes
        if (!month || !/^\d{4}$/.test(year) || !/^\d{2}$/.test(day)) {
             console.warn("Componentes de data PtBr inválidos após parse:", dateStr, "-> Dia:", day, "Mês:", monthStr, "Ano:", year);
             return ""; // Retorna string vazia se a data não puder ser parseada corretamente
        }

        // Retorna a data no formato ISO YYYY-MM-DD
        return `${year}-${month}-${day}`;
    }


    // --- INICIALIZAÇÕES FINAIS ---

    // Popula o select de disciplinas ao carregar a página pela primeira vez
    popularDisciplinasSelect();

    // A inicialização do DataTables é feita na função inicializarDataTable que é chamada
    // uma vez no final deste script e também pode ser chamada para re-inicializar se necessário.

    // O ajuste final da tabela e responsividade (columns.adjust().responsive.recalc())
    // é feito em initComplete do DataTables e no listener de resize,
    // para garantir que a tabela se ajuste corretamente ao conteúdo e ao layout da página.

}); 
