document.addEventListener("DOMContentLoaded", function () {
    // --- SELETORES DE ELEMENTOS ---
    const modalTarefaDialog = document.querySelector("#modalTarefa");
    const abrirModalNovaTarefaBtnOriginal = document.querySelector("#abrirModalNovaTarefa");
    const fecharModalTarefaBtn = document.querySelector("#fecharModalTarefa");
    const cancelarModalTarefaBtn = document.querySelector("#cancelarModalTarefa");
    const formTarefa = document.querySelector("#formTarefa");
    const modalTarefaLabel = document.querySelector("#modalTarefaLabel");
    const tarefaIdInput = document.getElementById('tarefaId');
    const tarefaTituloInput = document.getElementById('tarefaTitulo');
    const tarefaDisciplinaSelect = document.getElementById('tarefaDisciplina');
    const tarefaTipoSelect = document.getElementById('tarefaTipo');
    const tarefaDataEntregaInput = document.getElementById('tarefaDataEntrega');
    const tarefaStatusSelect = document.getElementById('tarefaStatus');
    const tarefaDescricaoInput = document.getElementById('tarefaDescricao'); // Permanece como textarea simples no modal de Tarefa
    const modalDetalhesDialog = document.querySelector("#modalDetalhesTarefa");
    const fecharModalDetalhesBtn = document.querySelector("#fecharModalDetalhesTarefa");
    const okModalDetalhesBtn = document.querySelector("#okModalDetalhesTarefa");
    const modalDetalhesConteudo = document.querySelector("#modalDetalhesTarefaConteudo");
    const modalDetalhesTarefaLabel = document.getElementById('modalDetalhesTarefaLabel');

    // --- Seletores para o modal de ANOTAÇÃO RÁPIDA (onde o TinyMCE será inicializado) ---
    // Importante: usei modalAnotacaoAdicaoRapidaEl que corresponde ao HTML fornecido
    const modalAnotacaoAdicaoRapidaEl = document.getElementById('modalAnotacaoAdicaoRapida');
    const formAnotacaoAdicaoRapida = modalAnotacaoAdicaoRapidaEl ? modalAnotacaoAdicaoRapidaEl.querySelector('#formAnotacaoAdicaoRapida') : null;
    const rapidaAnotacaoTituloInput = document.getElementById('rapidaAnotacaoTituloInput');
    const rapidaAnotacaoDisciplinaSelect = document.getElementById('rapidaAnotacaoDisciplinaSelect');
    const rapidaAnotacaoAtividadeSelect = document.getElementById('rapidaAnotacaoAtividadeSelect');
    const rapidaAnotacaoConteudoTextarea = document.getElementById('rapidaAnotacaoConteudoInput'); // Onde o TinyMCE será inicializado
    const salvarAnotacaoRapidaBtn = document.getElementById('salvarAnotacaoRapidaBtn'); // Botão de submit para anotação rápida

    let tabelaTarefasDt;

    // --- DADOS MOCADOS ---
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

    // Dados para os selects de Anotações Rápidas (como no principal.js)
    const disciplinasFixasParaSelects = ["Nenhuma", ...listaDisciplinas.map(d => d.nome), "TCC 1", "Outra"];
    const atividadesPorDisciplinaParaSelects = {
        "Nenhuma": ["Nenhuma"],
        "Algoritmos e Estrutura de Dados": ["Nenhuma", "Implementação de Estrutura", "Análise de Algoritmo"],
        "Redes de Computadores": ["Nenhuma", "Programação de Sockets"],
        "Banco de Dados": ["Nenhuma", "Modelagem de Dados"],
        "Inteligência Artificial": ["Nenhuma", "Treinamento de Modelo"],
        "Compiladores": ["Nenhuma", "Analisador Léxico"],
        "TCC 1": ["Nenhuma", "Revisão Bibliográfica"],
        "Outra": ["Nenhuma"]
    };
    const atividadesPadraoParaSelects = ["Nenhuma", "Outra"];

    // --- FUNÇÕES DOS MODAIS DE TAREFA ---
    function abrirModalTarefa(isEditMode = false, dadosTarefa = null, targetTr = null) {
        if (!modalTarefaDialog) return;
        formTarefa.reset();
        popularSelectDisciplinas(); // Este é para o select oculto no modal de tarefa
        modalTarefaLabel.textContent = isEditMode ? "Editar Tarefa/Prova" : "Adicionar Tarefa/Prova";
        if (isEditMode && dadosTarefa) {
            tarefaIdInput.value = dadosTarefa.id;
            tarefaTituloInput.value = dadosTarefa.titulo || '';
            tarefaDescricaoInput.value = dadosTarefa.descricao || ''; // Continua sendo um textarea normal
            tarefaDataEntregaInput.value = dadosTarefa.dataEntrega || '';
            tarefaTipoSelect.value = dadosTarefa.tipo || '';
            tarefaDisciplinaSelect.value = dadosTarefa.disciplinaId || '';
            tarefaStatusSelect.value = dadosTarefa.status || 'A Fazer';
            if (tabelaTarefasDt && targetTr) {
                formTarefa.dataset.rowIndex = tabelaTarefasDt.row(targetTr).index();
            }
        } else {
            tarefaIdInput.value = '';
            tarefaTipoSelect.value = "";
            tarefaDisciplinaSelect.value = "";
            tarefaStatusSelect.value = "A Fazer";
        }
        modalTarefaDialog.showModal();
    }

    function fecharModalTarefa() {
        if (modalTarefaDialog) modalTarefaDialog.close();
    }

    function abrirModalDetalhes(tarefaData) {
        if (!modalDetalhesDialog) return;
        const disciplina = listaDisciplinas.find(d => d.id === tarefaData.disciplinaId);
        const dataFormatada = formatarData(tarefaData.dataEntrega);
        modalDetalhesTarefaLabel.textContent = `Detalhes: ${tarefaData.titulo}`;
        const conteudoHtml = `
            <div class="detalhes-tarefa p-2">
                <p><strong><i class="bi bi-calendar-event me-2"></i>Data de Entrega:</strong><br>${dataFormatada}</p>
                <p><strong><i class="bi bi-journal-bookmark-fill me-2"></i>Disciplina:</strong><br>${disciplina ? disciplina.nome : 'Não especificada'}</p>
                <p><strong><i class="bi bi-tags-fill me-2"></i>Tipo:</strong> ${tarefaData.tipo || '-'}</p>
                <p><strong><i class="bi bi-flag-fill me-2"></i>Status:</strong> ${tarefaData.status || '-'}</p>
                <hr>
                <p><strong><i class="bi bi-card-text me-2"></i>Descrição:</strong><br>${tarefaData.descricao || 'Nenhuma descrição fornecida.'}</p>
            </div>`;
        modalDetalhesConteudo.innerHTML = conteudoHtml;
        modalDetalhesDialog.showModal();
    }

    // --- LISTENERS DOS MODAIS ---
    if (fecharModalTarefaBtn) fecharModalTarefaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalTarefa(); });
    if (cancelarModalTarefaBtn) cancelarModalTarefaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalTarefa(); });
    if (modalTarefaDialog) modalTarefaDialog.addEventListener("click", e => { if (e.target === modalTarefaDialog) fecharModalTarefa(); });
    if (fecharModalDetalhesBtn) fecharModalDetalhesBtn.addEventListener('click', () => modalDetalhesDialog.close());
    if (okModalDetalhesBtn) okModalDetalhesBtn.addEventListener('click', () => modalDetalhesDialog.close());
    if (modalDetalhesDialog) modalDetalhesDialog.addEventListener("click", e => { if (e.target === modalDetalhesDialog) modalDetalhesDialog.close(); });

    // --- SUBMISSÃO DO FORMULÁRIO ---
    if (formTarefa) {
        formTarefa.addEventListener("submit", function (e) {
            e.preventDefault();
            const isEditMode = !!tarefaIdInput.value;
            const tarefaId = isEditMode ? tarefaIdInput.value : 'T-' + new Date().getTime();
            const rowIndex = formTarefa.dataset.rowIndex;
            const dadosCompletosTarefa = {
                id: tarefaId,
                titulo: tarefaTituloInput.value.trim(),
                disciplinaId: tarefaDisciplinaSelect.value, // Mantém este, mesmo que oculto
                tipo: tarefaTipoSelect.value,
                dataEntrega: tarefaDataEntregaInput.value,
                status: tarefaStatusSelect.value, // Mantém este, mesmo que oculto
                descricao: tarefaDescricaoInput.value.trim(), // Pega o valor do textarea normal
            };
            salvarOuAtualizarTarefaNaTabela(dadosCompletosTarefa, isEditMode, rowIndex);
            fecharModalTarefa();
        });
    }

    // --- FUNÇÕES DA TABELA ---
    function salvarOuAtualizarTarefaNaTabela(dadosTarefa, isEditMode, rowIndex) {
        const dadosLinhaTabela = formatarDadosParaLinha(dadosTarefa);
        if (isEditMode && rowIndex !== undefined) {
            tabelaTarefasDt.row(rowIndex).data(dadosLinhaTabela).draw(false);
            const indexLista = listaTarefas.findIndex(t => t.id === dadosTarefa.id);
            if (indexLista !== -1) listaTarefas[indexLista] = dadosTarefa;
        } else {
            tabelaTarefasDt.row.add(dadosLinhaTabela).draw();
            listaTarefas.push(dadosTarefa);
        }
    }

    function formatarDadosParaLinha(tarefa) {
        const disciplinaObj = listaDisciplinas.find(d => d.id === tarefa.disciplinaId);
        const disciplinaNome = disciplinaObj ? disciplinaObj.nome : '-';
        const dataFormatada = formatarData(tarefa.dataEntrega);
        const statusBadgeHtml = `<span class="badge ${getStatusBadgeClass(tarefa.status)}">${tarefa.status}</span>`;
        const tipoBadgeHtml = `<span class="badge ${getTipoBadgeClass(tarefa.tipo)}">${tarefa.tipo}</span>`;
        const dropdownHtml = `
            <div class="dropdown">
                <button class="btn btn-sm btn-icon btn-actions" type="button" aria-expanded="false" aria-label="Ações da tarefa">
                    <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item btn-detalhar-tarefa" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-eye me-2"></i>Detalhar</a></li>
                    <li><a class="dropdown-item btn-edit-tarefa" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-pencil-square me-2"></i>Editar</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item btn-remover-tarefa" href="#" data-tarefa-id="${tarefa.id}"><i class="bi bi-trash me-2"></i>Remover</a></li>
                </ul>
            </div>`;
        return ['', tarefa.titulo, disciplinaNome, tipoBadgeHtml, dataFormatada, statusBadgeHtml, dropdownHtml];
    }

    function inicializarDataTable() {
        if ($.fn.DataTable.isDataTable('#tabelaTarefas')) {
            $('#tabelaTarefas').DataTable().destroy();
        }
        tabelaTarefasDt = $('#tabelaTarefas').DataTable({
            responsive: { details: { type: 'column', target: 0 } },
            dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto"f><"col-12 col-md-auto ms-md-auto dt-buttons-container">>t<"row dt-footer-controls mt-3 align-items-center"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
            paging: false,
            scrollY: '450px',
            scrollCollapse: true,
            language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar tarefas..." },
            columnDefs: [{ orderable: false, targets: [0, -1] }],
            data: listaTarefas.map(formatarDadosParaLinha),
            initComplete: function () {
                const api = this.api();
                const buttonsContainer = $('.dt-buttons-container');
                if (abrirModalNovaTarefaBtnOriginal && buttonsContainer.length && $('#abrirModalNovaTarefaDt').length === 0) {
                    const btnClone = $(abrirModalNovaTarefaBtnOriginal).clone().attr('id', 'abrirModalNovaTarefaDt').show();
                    buttonsContainer.append(btnClone);
                    btnClone.on('click', (e) => {
                        e.preventDefault();
                        abrirModalTarefa();
                    });
                }
                const filterHtml = `<select id="filterTipoTarefa" class="form-select form-select-sm dt-filter-select ms-2"><option value="">Todos os Tipos</option><option value="Tarefa">Tarefa</option><option value="Prova">Prova</option></select><select id="filterDisciplina" class="form-select form-select-sm dt-filter-select ms-2"><option value="">Todas as Disciplinas</option></select>`;
                buttonsContainer.prepend(filterHtml);
                listaDisciplinas.forEach(d => $('#filterDisciplina').append(new Option(d.nome, d.nome)));
                $('#filterTipoTarefa').on('change', function () { api.column(3).search(this.value ? '^' + $.fn.dataTable.util.escapeRegex(this.value) + '$' : '', true, false).draw(); });
                $('#filterDisciplina').on('change', function () { api.column(2).search(this.value ? '^' + $.fn.dataTable.util.escapeRegex(this.value) + '$' : '', true, false).draw(); });
            }
        });
    }

    // --- FUNÇÕES UTILITÁRIAS E EVENTOS DE EDIÇÃO/REMOÇÃO ---
    function popularSelectDisciplinas() {
        if (!tarefaDisciplinaSelect) return;
        // Adiciona uma opção vazia "Selecione..." para o modal de tarefa
        tarefaDisciplinaSelect.innerHTML = '<option value="" selected disabled>Selecione...</option>';
        listaDisciplinas.forEach(d => tarefaDisciplinaSelect.add(new Option(d.nome, d.id)));
        // Não define valor padrão se for nova tarefa, o "Selecione..." já cuida
    }

    // Função auxiliar para popular selects genéricos
    function popularSelect(element, options, selectedValue = null) {
        if (!element) return;
        element.innerHTML = '';
        options.forEach(option => {
            const optElement = document.createElement('option');
            const value = (typeof option === 'object' && option !== null) ? option.id : option;
            const textContent = (typeof option === 'object' && option !== null) ? option.nome : option;

            optElement.value = value;
            optElement.textContent = textContent;

            if (selectedValue !== null && (String(value) === String(selectedValue) || (typeof option === 'object' && option !== null && option.nome === selectedValue))) {
                optElement.selected = true;
            }
            element.appendChild(optElement);
        });
    }
    
    // -- LÓGICA DE CONTROLE DO DROPDOWN --
    function closeAndResetDropdown(menuElement) {
        if (!menuElement || menuElement.length === 0) return;
        const originalParent = menuElement.data('originalParent');
        if (originalParent) {
            menuElement.removeClass('show').appendTo(originalParent);
        }
    }

    $(document).on('click', '.btn-edit-tarefa', function (e) {
        e.preventDefault();
        const menu = $(this).closest('.dropdown-menu');
        const rowIndex = menu.data('rowIndex');
        const tarefaId = $(this).data('tarefa-id');
        const tarefaData = listaTarefas.find(t => t.id === tarefaId);
        const linhaNode = tabelaTarefasDt.row(rowIndex).node();
        
        if (tarefaData) {
            abrirModalTarefa(true, tarefaData, linhaNode);
        }
        closeAndResetDropdown(menu);
    });

    $(document).on('click', '.btn-detalhar-tarefa', function (e) {
        e.preventDefault();
        const menu = $(this).closest('.dropdown-menu');
        const tarefaId = $(this).data('tarefa-id');
        const tarefaData = listaTarefas.find(t => t.id === tarefaId);
        if (tarefaData) {
            abrirModalDetalhes(tarefaData);
        }
        closeAndResetDropdown(menu);
    });

    $(document).on('click', '.btn-remover-tarefa', function (e) {
        e.preventDefault();
        const menu = $(this).closest('.dropdown-menu');
        const rowIndex = menu.data('rowIndex');
        const tarefaId = $(this).data('tarefa-id');
        const tarefa = listaTarefas.find(t => t.id === tarefaId);

        if (tarefa && confirm(`Tem certeza que deseja remover a tarefa "${tarefa.titulo}"?`)) {
            listaTarefas = listaTarefas.filter(t => t.id !== tarefaId);
            tabelaTarefasDt.row(rowIndex).remove().draw();
        }
        closeAndResetDropdown(menu);
    });

    const formatarData = (data) => {
        if (!data) return '-';
        const [year, month, day] = data.split('-');
        return `${day}/${month}/${year}`;
    };

    const getStatusBadgeClass = status => ({ 'Concluída': 'bg-success-subtle text-success', 'Em Andamento': 'bg-info-subtle text-info', 'Agendada': 'bg-primary-subtle text-primary', 'A Fazer': 'bg-warning-subtle text-warning', 'Atrasada': 'bg-danger-subtle text-danger' }[status] || 'bg-secondary-subtle text-secondary');
    const getTipoBadgeClass = tipo => tipo === 'Prova' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary';

    // --- BLOCO PRINCIPAL DE EXECUÇÃO ---
    inicializarDataTable();

    $('#tabelaTarefas tbody').on('click', '.btn-actions', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const triggerButton = this;
        const dropdownMenu = $(triggerButton).next('.dropdown-menu');
        const isAlreadyOpen = dropdownMenu.hasClass('show');

        closeAndResetDropdown($('.dropdown-menu.show'));

        if (isAlreadyOpen) return;

        const triggerRow = $(triggerButton).closest('tr');
        const rowIndex = tabelaTarefasDt.row(triggerRow).index();
        
        dropdownMenu.data('originalParent', dropdownMenu.parent());
        dropdownMenu.data('rowIndex', rowIndex);
        
        dropdownMenu.appendTo('body');
        const rect = triggerButton.getBoundingClientRect();

        dropdownMenu.css({
            position: 'fixed',
            top: rect.bottom + 'px',
            left: 'auto',
            right: (window.innerWidth - rect.right) + 'px',
            zIndex: 1060
        });

        dropdownMenu.addClass('show');
        setTimeout(() => {
            $(document).one('click.closeDropdown', function (clickEvent) {
                if (!$(clickEvent.target).closest(dropdownMenu).length) {
                    closeAndResetDropdown(dropdownMenu);
                }
            });
        }, 0);
    });

    // ================== LÓGICA DO MODAL DE ADIÇÃO RÁPIDA DE TAREFAS (no tarefas.html) ==================
    // Este modal é o que o HTML da página de tarefas utiliza para "Adicionar Tarefa/Prova" via sidebar
    const modalTarefaAdicaoRapidaEl = document.getElementById('modalTarefaAdicaoRapida');
    if (modalTarefaAdicaoRapidaEl) {
        const form = modalTarefaAdicaoRapidaEl.querySelector('#formTarefaAdicaoRapida');
        modalTarefaAdicaoRapidaEl.addEventListener('show.bs.modal', () => {
            if (form) form.reset();
            // Remover validação do formulário ao abrir para evitar erro inicial
            form.classList.remove('was-validated');
            form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            // Você pode popular selects específicos para este modal aqui, se necessário
        });
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                // Validar o formulário do Bootstrap
                if (!form.checkValidity()) {
                    e.stopPropagation(); // Impede o envio
                    form.classList.add('was-validated'); // Adiciona a classe para exibir feedbacks
                    return;
                }
                // Lógica para salvar a tarefa/prova deste modal
                alert("Salvar Tarefa/Prova (lógica a ser implementada no tarefas.js para modalTarefaAdicaoRapida)");
                // Esconder o modal
                const bsModal = bootstrap.Modal.getInstance(modalTarefaAdicaoRapidaEl);
                bsModal?.hide();
            });
        }
    }


    // ================== LÓGICA DO MODAL DE ADIÇÃO RÁPIDA DE ANOTAÇÕES (COM TINYMCE) ==================
    // Este é o modal que está no tarefas.html para "Adicionar Anotação" via sidebar
    if (modalAnotacaoAdicaoRapidaEl) {
        /**
         * Atualiza as opções do select de atividades com base na disciplina selecionada.
         * @param {string} disciplinaSelecionada - O nome da disciplina selecionada.
         */
        function atualizarAtividadesAnotacaoRapida(disciplinaSelecionada) {
            const atividades = atividadesPorDisciplinaParaSelects[disciplinaSelecionada] || atividadesPadraoParaSelects;
            popularSelect(rapidaAnotacaoAtividadeSelect, atividades, "Nenhuma");
        }

        // Listener para quando o modal de anotação rápida é aberto
        modalAnotacaoAdicaoRapidaEl.addEventListener('show.bs.modal', () => {
            formAnotacaoAdicaoRapida?.reset(); // Reseta o formulário
            // Limpa o estado de validação do input do título
            rapidaAnotacaoTituloInput?.classList.remove('is-invalid');
            if (rapidaAnotacaoTituloInput?.nextElementSibling) {
                // Remove qualquer mensagem de erro do feedback
                rapidaAnotacaoTituloInput.nextElementSibling.textContent = ""; 
            }
            // Garante que o formulário não inicie com a classe 'was-validated'
            formAnotacaoAdicaoRapida?.classList.remove('was-validated');


            // Popula os selects ao abrir o modal
            popularSelect(rapidaAnotacaoDisciplinaSelect, disciplinasFixasParaSelects, "Nenhuma");
            atualizarAtividadesAnotacaoRapida(rapidaAnotacaoDisciplinaSelect?.value || "Nenhuma");

            // Inicializa ou re-inicializa o TinyMCE
            if (typeof tinymce !== 'undefined' && rapidaAnotacaoConteudoTextarea) {
                const editorId = rapidaAnotacaoConteudoTextarea.id;
                // Destroi qualquer instância anterior para evitar duplicidade ou erros
                tinymce.get(editorId)?.destroy();

                tinymce.init({
                    selector: `#${editorId}`,
                    plugins: 'lists link image table code help wordcount autoresize',
                    toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image table | code | help',
                    menubar: 'edit view insert format tools table help',
                    height: 400, // Altura inicial do editor (igual ao principal.js)
                    min_height: 400, // Altura mínima que o editor pode ter (igual ao principal.js)
                    autoresize_bottom_margin: 30, // Margem inferior ao usar autoresize (igual ao principal.js)
                    branding: false, // Remove a marca TinyMCE
                    statusbar: false, // Remove a barra de status
                    setup: (editor) => {
                        editor.on('init', () => {
                            // Limpa o conteúdo ao inicializar para nova anotação (igual ao principal.js)
                            editor.setContent('');
                        });
                        // Garante que os diálogos do TinyMCE fiquem sobre o modal do Bootstrap (igual ao principal.js)
                        editor.on('OpenWindow', function(e) {
                            const modalZIndex = parseInt(window.getComputedStyle(modalAnotacaoAdicaoRapidaEl).zIndex, 10);
                            const toxDialog = document.querySelector('.tox-dialog-wrap');
                            if (toxDialog) {
                                toxDialog.style.zIndex = modalZIndex + 50; // Coloca o diálogo acima do modal
                            }
                        });
                    }
                }).catch(err => console.error("Erro ao inicializar TinyMCE no modal de anotações rápidas:", err));
            }
        });

        // Destroi a instância do TinyMCE ao fechar o modal para liberar recursos (igual ao principal.js)
        modalAnotacaoAdicaoRapidaEl.addEventListener('hidden.bs.modal', () => {
            if (typeof tinymce !== 'undefined' && rapidaAnotacaoConteudoTextarea && tinymce.get(rapidaAnotacaoConteudoTextarea.id)) {
                tinymce.get(rapidaAnotacaoConteudoTextarea.id).destroy();
            }
        });

        // Listener para mudança na disciplina do modal de anotação rápida
        if (rapidaAnotacaoDisciplinaSelect) {
            rapidaAnotacaoDisciplinaSelect.addEventListener('change', function() {
                atualizarAtividadesAnotacaoRapida(this.value);
            });
        }
        
        // Listener para o botão de salvar anotação rápida (igual ao principal.js)
        if (salvarAnotacaoRapidaBtn) {
            salvarAnotacaoRapidaBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Impede o envio padrão do formulário
                
                let isValid = true;
                // Validação para o título (igual ao principal.js)
                if (!rapidaAnotacaoTituloInput || !rapidaAnotacaoTituloInput.value.trim()) {
                    rapidaAnotacaoTituloInput?.classList.add('is-invalid');
                    // Garante que a mensagem de erro seja exibida ao tentar salvar
                    if (rapidaAnotacaoTituloInput?.nextElementSibling) {
                        rapidaAnotacaoTituloInput.nextElementSibling.textContent = "Título da anotação é obrigatório.";
                    }
                    isValid = false;
                } else {
                    rapidaAnotacaoTituloInput.classList.remove('is-invalid');
                    if (rapidaAnotacaoTituloInput?.nextElementSibling) {
                        rapidaAnotacaoTituloInput.nextElementSibling.textContent = ""; // Limpa a mensagem
                    }
                }

                if (!isValid) {
                    // Adiciona a classe 'was-validated' ao formulário para exibir feedback de validação do Bootstrap
                    formAnotacaoAdicaoRapida?.classList.add('was-validated');
                    return; // Interrompe se a validação falhar
                }
                
                // Remover 'was-validated' após validação bem-sucedida (opcional, mas boa prática)
                formAnotacaoAdicaoRapida?.classList.remove('was-validated');

                // Obter o conteúdo do editor TinyMCE
                const conteudoAnotacao = (typeof tinymce !== 'undefined' && rapidaAnotacaoConteudoTextarea && tinymce.get(rapidaAnotacaoConteudoTextarea.id))
                                        ? tinymce.get(rapidaAnotacaoConteudoTextarea.id).getContent()
                                        : rapidaAnotacaoConteudoTextarea?.value.trim(); // Fallback

                // Coletar outros dados da anotação
                const novaAnotacao = {
                    // id: rapidaAnotacaoIdInput?.value || 'A-' + new Date().getTime(), // Descomente se usar o input hidden
                    id: 'A-' + new Date().getTime(), // Gera um ID simples
                    titulo: rapidaAnotacaoTituloInput?.value.trim(),
                    disciplina: rapidaAnotacaoDisciplinaSelect?.value,
                    atividade: rapidaAnotacaoAtividadeSelect?.value,
                    conteudo: conteudoAnotacao
                    // Adicione aqui outros campos se houver
                };

                console.log("Nova Anotação Salva (Tarefas):", novaAnotacao);
                alert("Salvar Anotação (lógica a ser implementada). Ver console para detalhes.");

                // Fechar o modal
                const bsModal = bootstrap.Modal.getInstance(modalAnotacaoAdicaoRapidaEl);
                bsModal?.hide();
            });
        }
    }
});
