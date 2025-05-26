document.addEventListener("DOMContentLoaded", function () {
    // console.log("DOMContentLoaded em anotacao.js FOI DISPARADO!");

    // --- SELETORES DE ELEMENTOS PARA ANOTAÇÕES ---
    const modalAnotacaoBootstrap = document.getElementById('modalAnotacao');
    const abrirModalNovaAnotacaoPrincipalBtn = document.getElementById("abrirModalNovaAnotacaoPrincipal");
    const modalAnotacaoLabelTituloElem = document.getElementById('modalAnotacaoLabelTitulo');
    const modalAnotacaoEditInfoElem = document.getElementById('modalAnotacaoEditInfo');

    const anotacaoIdInput = document.getElementById('anotacaoIdInput');
    const anotacaoTituloInputElem = document.getElementById('anotacaoTituloInput');
    const anotacaoDisciplinaInputElem = document.getElementById('anotacaoDisciplinaInput');
    const anotacaoAtividadeInputElem = document.getElementById('anotacaoAtividadeInput');
    // const anotacaoTopicosInputElem = document.getElementById('anotacaoTopicosInput'); // Removido
    const anotacaoConteudoInputElem = document.getElementById('anotacaoConteudoInput');
    const salvarAnotacaoBtnElem = document.getElementById('salvarAnotacaoBtn');
    const tituloFeedbackDiv = anotacaoTituloInputElem ? anotacaoTituloInputElem.nextElementSibling : null;

    // Seletores para o novo Modal de Visualização
    const modalVisualizarAnotacaoBootstrap = document.getElementById('modalVisualizarAnotacao');
    const visualizarAnotacaoModalTituloElem = document.getElementById('visualizarAnotacaoModalTitulo');
    const visualizarAnotacaoTituloElem = document.getElementById('visualizarAnotacaoTitulo');
    const visualizarAnotacaoSubInfoElem = document.getElementById('visualizarAnotacaoSubInfo');
    const visualizarAnotacaoDisciplinaElem = document.getElementById('visualizarAnotacaoDisciplina');
    const visualizarAnotacaoAtividadeElem = document.getElementById('visualizarAnotacaoAtividade');
    // const visualizarAnotacaoTopicosElem = document.getElementById('visualizarAnotacaoTopicos'); // Removido
    const visualizarAnotacaoConteudoElem = document.getElementById('visualizarAnotacaoConteudo');

    if (!modalAnotacaoBootstrap) console.error("ERRO: Elemento #modalAnotacao não encontrado!");
    if (!modalVisualizarAnotacaoBootstrap) console.error("ERRO: Elemento #modalVisualizarAnotacao não encontrado!");
    if (!salvarAnotacaoBtnElem) console.error("ERRO: Elemento #salvarAnotacaoBtn não encontrado!");

    let tabelaAnotacoesDt;
    let resizeDebounceTimer;

    let listaAnotacoes = [
        {
            id: "ANOT001",
            titulo: "Ideias para Projeto TCC",
            disciplinaNome: "TCC",
            atividadeVinculadaNome: "Brainstorm Inicial TCC",
            // topicos: "ideias, pesquisa, ia", // Removido
            conteudo: "<p>Conteúdo inicial da anotação sobre o TCC.</p><p>Precisa detalhar mais os <strong>requisitos</strong> e o <em>escopo</em>.</p><ul><li>Item 1</li><li>Item 2</li></ul>",
            dataCriacao: "2025-05-20T10:00:00Z",
            ultimaModificacao: "2025-05-22T15:30:00Z"
        },
        {
            id: "ANOT002",
            titulo: "Resumo Capítulo Livro Web Design",
            disciplinaNome: "Web Design Avançado",
            atividadeVinculadaNome: "Leitura Cap. 3",
            // topicos: "ux, ui, html, css", // Removido
            conteudo: "<h2>Principais Pontos do Capítulo 3</h2><p>O capítulo aborda a importância do HTML semântico para acessibilidade e SEO. Destaca também seletores CSS avançados que permitem estilizações mais complexas e eficientes.</p><p>Princípios de UX para Web incluem:</p><ol><li>Foco no usuário</li><li>Consistência no design</li><li>Feedback claro das ações</li></ol><p>Explorar mais sobre microinterações.</p>",
            dataCriacao: "2025-04-15T09:20:00Z",
            ultimaModificacao: "2025-04-15T11:05:00Z"
        },
        {
            id: "ANOT003",
            titulo: "Lista de Compras Supermercado",
            disciplinaNome: "Pessoal",
            atividadeVinculadaNome: "",
            // topicos: "compras, casa", // Removido
            conteudo: "- Leite\n- Pão\n- Ovos\n- Frutas (maçã, banana)\n- Queijo\n- Presunto",
            dataCriacao: "2025-05-24T18:00:00Z",
            ultimaModificacao: "2025-05-24T18:05:00Z"
        }
    ];

    function displayFieldError(inputElement, message, feedbackElem) {
        clearFieldError(inputElement, feedbackElem);
        if (inputElement) inputElement.classList.add('is-invalid');
        if (feedbackElem) { feedbackElem.textContent = message; feedbackElem.style.display = 'block'; }
    }

    function clearFieldError(inputElement, feedbackElem) {
        if (inputElement) inputElement.classList.remove('is-invalid');
        if (feedbackElem) { feedbackElem.textContent = ''; feedbackElem.style.display = 'none'; }
    }

    function validateFormAnotacao() {
        let isValid = true;
        clearFieldError(anotacaoTituloInputElem, tituloFeedbackDiv);
        if (!anotacaoTituloInputElem || !anotacaoTituloInputElem.value.trim()) {
            displayFieldError(anotacaoTituloInputElem, "Por favor, informe o título da anotação.", tituloFeedbackDiv);
            isValid = false;
        }
        return isValid;
    }

    function inicializarTabelaAnotacoes() {
        // console.log("inicializarTabelaAnotacoes: Iniciando...");
        if (!window.jQuery || !$.fn.DataTable) {
            console.error("inicializarTabelaAnotacoes: jQuery ou DataTables não carregado!");
            return;
        }
        listaAnotacoes.sort((a, b) => new Date(b.ultimaModificacao) - new Date(a.ultimaModificacao));
        const mappedData = mapAnotacoesParaDataTable(listaAnotacoes);

        if ($.fn.DataTable.isDataTable('#tabelaAnotacoes')) {
            // console.log("inicializarTabelaAnotacoes: DataTable existente encontrada. Destruindo...");
            var existingTable = $('#tabelaAnotacoes').DataTable();
            existingTable.clear().destroy();
            $('#tabelaAnotacoes tbody').empty();
            // console.log("inicializarTabelaAnotacoes: DataTable destruída.");
        }

        // console.log("inicializarTabelaAnotacoes: Inicializando nova DataTable...");
        tabelaAnotacoesDt = $('#tabelaAnotacoes').DataTable({
            responsive: { details: { type: 'column', target: 0 }},
            dom:
                '<"row dt-custom-header align-items-center mb-3"' +
                    '<"col-12 col-md-auto me-md-auto"f>' +
                    '<"col-12 col-md-auto dt-buttons-anotacoes-container">' +
                '>' +
                't' +
                '<"row mt-3 align-items-center"' +
                    '<"col-sm-12 col-md-5"i>' +
                    '<"col-sm-12 col-md-7 dataTables_paginate_wrapper"p>' +
                '>',
            paging: false,
            lengthChange: false,
            scrollY: '450px',
            scrollCollapse: true,
            language: {
                url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json',
                search: "",
                searchPlaceholder: "Buscar anotações...",
                info: "Total de _TOTAL_ anotações",
                infoEmpty: "Nenhuma anotação encontrada",
                infoFiltered: "(filtrado de _MAX_ anotações)",
                paginate: { first: "Primeiro", last: "Último", next: "Próximo", previous: "Anterior"}
            },
            columnDefs: [
                { orderable: false, className: 'dtr-control', targets: 0 },
                { responsivePriority: 1, targets: 1 },
                { responsivePriority: 2, targets: 2 },
                { responsivePriority: 3, targets: 3 },
                { responsivePriority: 5, targets: 4, type: 'date-br' },
                { responsivePriority: 4, targets: 5, type: 'date-br' },
                { orderable: false, className: "dt-actions-column text-center", targets: 6, responsivePriority: 1 }
            ],
            data: mappedData,
            createdRow: function(row, data, dataIndex) {
                const anotacaoOriginal = listaAnotacoes[dataIndex];
                if (anotacaoOriginal) {
                    $(row).data('anotacao-id-interno', anotacaoOriginal.id);
                }
            },
            initComplete: function (settings, json) {
                // console.log("inicializarTabelaAnotacoes: initComplete DataTable.");
                const searchInput = $('#tabelaAnotacoes_filter input');
                searchInput.addClass('form-control form-control-sm').attr('aria-label', 'Buscar anotações na tabela');
                $('#tabelaAnotacoes_filter label').contents().filter(function() { return this.nodeType === 3; }).remove();

                const buttonsContainer = $('.dt-buttons-anotacoes-container');
                if (abrirModalNovaAnotacaoPrincipalBtn && buttonsContainer.length) {
                    if($('#abrirModalNovaAnotacaoDt').length === 0) {
                        const abrirModalBtnClone = abrirModalNovaAnotacaoPrincipalBtn.cloneNode(true);
                        abrirModalBtnClone.id = 'abrirModalNovaAnotacaoDt';
                        abrirModalBtnClone.style.display = 'inline-flex';
                        $(abrirModalBtnClone).removeClass('d-none');
                        $(abrirModalBtnClone).off('click').on('click', (e) => {
                            e.preventDefault();
                            abrirModalFormAnotacao(false);
                        });
                        buttonsContainer.append(abrirModalBtnClone);
                        if (abrirModalNovaAnotacaoPrincipalBtn) {
                            abrirModalNovaAnotacaoPrincipalBtn.style.display = 'none';
                        }
                    }
                }
                if (tabelaAnotacoesDt) {
                    tabelaAnotacoesDt.columns.adjust().responsive.recalc();
                }
            }
        });

        if ($.fn.dataTable.ext) {
            $.extend($.fn.dataTable.ext.type.order, {
                "date-br-pre": function (d) {
                    if (!d || typeof d !== 'string') return 0;
                    const parts = d.match(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/);
                    return parts ? parseInt(parts[3] + parts[2] + parts[1] + parts[4] + parts[5]) : 0;
                },
                "date-br-asc":  function (a, b) { return ((a < b) ? -1 : ((a > b) ? 1 : 0)); },
                "date-br-desc": function (a, b) { return ((a < b) ? 1 : ((a > b) ? -1 : 0)); }
            });
        }

        $(window).off('resize.dtAnotacoesGlobal').on('resize.dtAnotacoesGlobal', function () {
            clearTimeout(resizeDebounceTimer);
            resizeDebounceTimer = setTimeout(function () {
                if (tabelaAnotacoesDt) {
                    tabelaAnotacoesDt.columns.adjust().responsive.recalc();
                }
            }, 250);
        });
        // console.log("inicializarTabelaAnotacoes: Finalizada.");
    }

    function mapAnotacoesParaDataTable(lista) {
        return lista.map(anotacao => {
            const dropdownHtml = `
                <div class="dropdown">
                    <button class="btn btn-sm btn-icon-only btn-icon" type="button"
                            data-bs-toggle="dropdown" aria-expanded="false"
                            aria-label="Ações da anotação"
                            data-bs-popper-config='{"strategy":"fixed"}'>
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item btn-visualizar-anotacao" href="#" data-anotacao-id="${anotacao.id}"><i class="bi bi-eye me-2"></i>Visualizar</a></li>
                        <li><a class="dropdown-item btn-edit-anotacao" href="#" data-anotacao-id="${anotacao.id}"><i class="bi bi-pencil-square me-2"></i>Editar</a></li>
                        <li><a class="dropdown-item btn-remover-anotacao text-danger" href="#" data-anotacao-id="${anotacao.id}"><i class="bi bi-trash me-2"></i>Remover</a></li>
                    </ul>
                </div>`;
            return [
                '',
                anotacao.titulo,
                anotacao.disciplinaNome || '-',
                anotacao.atividadeVinculadaNome || '-',
                formatarDataParaTabela(anotacao.dataCriacao),
                formatarDataParaTabela(anotacao.ultimaModificacao),
                dropdownHtml
            ];
        });
    }

    function abrirModalFormAnotacao(isEditMode = false, dadosAnotacao = null) {
        // console.log("abrirModalFormAnotacao: Chamada. EditMode:", isEditMode, "Dados:", dadosAnotacao);
        clearFieldError(anotacaoTituloInputElem, tituloFeedbackDiv);
        if(anotacaoIdInput) anotacaoIdInput.value = '';
        if(anotacaoConteudoInputElem) anotacaoConteudoInputElem.value = '';

        if (isEditMode && dadosAnotacao) {
            if(modalAnotacaoLabelTituloElem) modalAnotacaoLabelTituloElem.textContent = "Editar Anotação";
            if(modalAnotacaoEditInfoElem) modalAnotacaoEditInfoElem.textContent = `Editando: ${dadosAnotacao.titulo.substring(0,30)}${dadosAnotacao.titulo.length > 30 ? '...' : ''}`;

            if(anotacaoIdInput) anotacaoIdInput.value = dadosAnotacao.id;
            if(anotacaoTituloInputElem) anotacaoTituloInputElem.value = dadosAnotacao.titulo || '';
            if(anotacaoDisciplinaInputElem) anotacaoDisciplinaInputElem.value = dadosAnotacao.disciplinaNome || '';
            if(anotacaoAtividadeInputElem) anotacaoAtividadeInputElem.value = dadosAnotacao.atividadeVinculadaNome || '';
            // if(anotacaoTopicosInputElem) anotacaoTopicosInputElem.value = dadosAnotacao.topicos || ''; // Removido
            if(anotacaoConteudoInputElem) anotacaoConteudoInputElem.value = dadosAnotacao.conteudo || '';
        } else {
            if(modalAnotacaoLabelTituloElem) modalAnotacaoLabelTituloElem.textContent = "Nova Anotação";
            if(modalAnotacaoEditInfoElem) modalAnotacaoEditInfoElem.textContent = 'Criando nova anotação';

            if(anotacaoTituloInputElem) anotacaoTituloInputElem.value = '';
            if(anotacaoDisciplinaInputElem) anotacaoDisciplinaInputElem.value = '';
            if(anotacaoAtividadeInputElem) anotacaoAtividadeInputElem.value = '';
            // if(anotacaoTopicosInputElem) anotacaoTopicosInputElem.value = ''; // Removido
            if(anotacaoConteudoInputElem) anotacaoConteudoInputElem.value = '';
        }

        if (!modalAnotacaoBootstrap) {
            console.error("abrirModalFormAnotacao: Modal de Adicionar/Editar Anotação (#modalAnotacao) não encontrado.");
            return;
        }
        try {
            const bsModal = bootstrap.Modal.getInstance(modalAnotacaoBootstrap) || new bootstrap.Modal(modalAnotacaoBootstrap);
            bsModal.show();
        } catch (error) {
            console.error("abrirModalFormAnotacao: Erro ao tentar exibir modal #modalAnotacao:", error);
        }
    }

    function abrirModalVisualizarAnotacao(dadosAnotacao) {
        // console.log("abrirModalVisualizarAnotacao: Chamada com dados:", dadosAnotacao);
        if (!dadosAnotacao) {
            console.warn("abrirModalVisualizarAnotacao: Nenhum dado de anotação fornecido.");
            return;
        }

        if (visualizarAnotacaoModalTituloElem) visualizarAnotacaoModalTituloElem.textContent = "Visualizar Anotação";
        if (visualizarAnotacaoTituloElem) visualizarAnotacaoTituloElem.textContent = dadosAnotacao.titulo || 'Sem Título';

        let subInfo = `Criado em: ${formatarDataParaTabela(dadosAnotacao.dataCriacao)}`;
        subInfo += ` | Última Modificação: ${formatarDataParaTabela(dadosAnotacao.ultimaModificacao)}`;
        if(visualizarAnotacaoSubInfoElem) visualizarAnotacaoSubInfoElem.innerHTML = subInfo;

        if (visualizarAnotacaoDisciplinaElem) visualizarAnotacaoDisciplinaElem.textContent = dadosAnotacao.disciplinaNome || '-';
        if (visualizarAnotacaoAtividadeElem) visualizarAnotacaoAtividadeElem.textContent = dadosAnotacao.atividadeVinculadaNome || '-';
        // if (visualizarAnotacaoTopicosElem) visualizarAnotacaoTopicosElem.textContent = dadosAnotacao.topicos || '-'; // Removido

        if (visualizarAnotacaoConteudoElem) {
            let conteudoFormatado = dadosAnotacao.conteudo || '';
            if (!conteudoFormatado.includes('<p>') && !conteudoFormatado.includes('<div>') && !conteudoFormatado.includes('<li>')) {
                conteudoFormatado = conteudoFormatado.replace(/\n/g, '<br>');
            }
            visualizarAnotacaoConteudoElem.innerHTML = conteudoFormatado || '<p class="text-muted"><em>Nenhum conteúdo para exibir.</em></p>';
        } else {
            console.error("abrirModalVisualizarAnotacao: Elemento #visualizarAnotacaoConteudo não encontrado.")
        }

        if (!modalVisualizarAnotacaoBootstrap) {
            console.error("abrirModalVisualizarAnotacao: Modal de Visualizar Anotação (#modalVisualizarAnotacao) não encontrado.");
            return;
        }
        try {
            const bsModal = bootstrap.Modal.getInstance(modalVisualizarAnotacaoBootstrap) || new bootstrap.Modal(modalVisualizarAnotacaoBootstrap);
            bsModal.show();
        } catch (error) {
            console.error("abrirModalVisualizarAnotacao: Erro ao tentar exibir modal #modalVisualizarAnotacao:", error);
        }
    }

    // console.log("Anexando listener de clique ao DOCUMENT para os botões de ação do dropdown.");
    $(document).on('click', '.dropdown-menu .btn-visualizar-anotacao, .dropdown-menu .btn-edit-anotacao, .dropdown-menu .btn-remover-anotacao', function (e) {
        const $clickedItem = $(this);
        const $dropdownMenu = $clickedItem.closest('.dropdown-menu');
        const $toggleButton = $dropdownMenu.data('bs-dropdown-toggle-button');

        if (!$toggleButton || !$toggleButton.closest('#tabelaAnotacoes').length) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();

        const anotacaoId = $clickedItem.data('anotacao-id');
        // console.log("Listener (document): Item clicado:", $clickedItem.attr('class'), "ID da Anotação:", anotacaoId);

        if (typeof anotacaoId === 'undefined') {
            console.error("Listener (document): ID da anotação é undefined.");
            return;
        }
        const anotacaoCompleta = listaAnotacoes.find(a => String(a.id) === String(anotacaoId));

        if (!anotacaoCompleta) {
            alert("Erro: Dados da anotação não encontrados (ID: " + anotacaoId + ").");
            console.error("Listener (document): Não foi possível encontrar a anotação para o ID:", anotacaoId);
            return;
        }
        // console.log("Listener (document): Anotação encontrada:", anotacaoCompleta);

        if ($clickedItem.hasClass('btn-visualizar-anotacao')) {
            abrirModalVisualizarAnotacao(anotacaoCompleta);
        } else if ($clickedItem.hasClass('btn-edit-anotacao')) {
            abrirModalFormAnotacao(true, anotacaoCompleta);
        } else if ($clickedItem.hasClass('btn-remover-anotacao')) {
            if (confirm(`Tem certeza que deseja remover a anotação "${anotacaoCompleta.titulo}"?`)) {
                listaAnotacoes = listaAnotacoes.filter(a => String(a.id) !== String(anotacaoId));
                inicializarTabelaAnotacoes();
                alert("Anotação removida com sucesso!");
            }
        }
    });

    if (salvarAnotacaoBtnElem) {
        // console.log("Anexando listener de clique ao #salvarAnotacaoBtn.");
        salvarAnotacaoBtnElem.addEventListener("click", function () {
            // console.log("Botão Salvar Anotação (#salvarAnotacaoBtn) clicado.");
            if (!validateFormAnotacao()) {
                console.warn("Salvar Anotação: Formulário inválido.");
                return;
            }

            const idAnotacaoAtual = anotacaoIdInput ? anotacaoIdInput.value : null;
            const isEditMode = !!idAnotacaoAtual;
            const dataAtual = new Date().toISOString();

            const dadosFormAnotacao = {
                id: isEditMode ? idAnotacaoAtual : 'ANOT' + new Date().getTime(),
                titulo: anotacaoTituloInputElem ? anotacaoTituloInputElem.value.trim() : 'Sem Título',
                disciplinaNome: anotacaoDisciplinaInputElem ? anotacaoDisciplinaInputElem.value.trim() : '',
                atividadeVinculadaNome: anotacaoAtividadeInputElem ? anotacaoAtividadeInputElem.value.trim() : '',
                // topicos: anotacaoTopicosInputElem ? anotacaoTopicosInputElem.value.trim() : '', // Removido
                conteudo: anotacaoConteudoInputElem ? anotacaoConteudoInputElem.value.trim() : '',
                ultimaModificacao: dataAtual,
                dataCriacao: isEditMode ? (listaAnotacoes.find(a => String(a.id) === String(idAnotacaoAtual))?.dataCriacao || dataAtual) : dataAtual
            };
            // console.log("Salvar Anotação: Dados do formulário:", dadosFormAnotacao);

            if (isEditMode) {
                const index = listaAnotacoes.findIndex(a => String(a.id) === String(idAnotacaoAtual));
                if (index !== -1) {
                    listaAnotacoes[index] = {...listaAnotacoes[index], ...dadosFormAnotacao};
                    alert("Anotação atualizada com sucesso!");
                } else {
                    alert("Erro ao atualizar: anotação não encontrada.");
                    console.error("Salvar Anotação: Erro ao atualizar, ID não encontrado:", idAnotacaoAtual);
                    return;
                }
            } else {
                listaAnotacoes.push(dadosFormAnotacao);
                alert("Anotação adicionada com sucesso!");
            }

            if (modalAnotacaoBootstrap) {
                const bsModal = bootstrap.Modal.getInstance(modalAnotacaoBootstrap);
                if (bsModal) {
                    bsModal.hide();
                }
            }
            inicializarTabelaAnotacoes();
        });
    } else {
        console.error("Elemento #salvarAnotacaoBtn não foi encontrado, listener não anexado.");
    }

    function formatarDataParaTabela(dataISO) {
        if (!dataISO) return '-';
        try {
            const dataObj = new Date(dataISO);
            const dia = String(dataObj.getDate()).padStart(2, '0');
            const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
            const ano = dataObj.getFullYear();
            const hora = String(dataObj.getHours()).padStart(2, '0');
            const minuto = String(dataObj.getMinutes()).padStart(2, '0');
            return `${dia}/${mes}/${ano}, ${hora}:${minuto}`;
        } catch (e) {
            console.error("Erro ao formatar data:", dataISO, e);
            return dataISO;
        }
    }

    $('#tabelaAnotacoes tbody').on('show.bs.dropdown', '.dropdown', function (e) {
        const $dropdown = $(this);
        const $dropdownMenu = $dropdown.find('.dropdown-menu');
        if ($dropdownMenu.length > 0) {
            $dropdownMenu.data('bs-dropdown-original-parent', $dropdown);
            const $toggleButton = $dropdown.find('[data-bs-toggle="dropdown"]');
            $dropdownMenu.data('bs-dropdown-toggle-button', $toggleButton);
            $('body').append($dropdownMenu.detach());
            const bsDropdownInstance = bootstrap.Dropdown.getInstance($toggleButton[0]);
            if (bsDropdownInstance && typeof bsDropdownInstance.update === 'function') {
                bsDropdownInstance.update();
            } else {
                const toggleRect = $toggleButton[0].getBoundingClientRect();
                const menuHeight = $dropdownMenu.outerHeight();
                const menuWidth = $dropdownMenu.outerWidth();
                const windowHeight = $(window).height();
                const windowWidth = $(window).width();
                let topPosition = toggleRect.bottom;
                if (topPosition + menuHeight > windowHeight) {
                    topPosition = toggleRect.top - menuHeight;
                }
                if (topPosition < 0) topPosition = 0;
                let leftPosition = toggleRect.left;
                if ($dropdownMenu.hasClass('dropdown-menu-end')) {
                    leftPosition = toggleRect.right - menuWidth;
                }
                if (leftPosition + menuWidth > windowWidth) {
                    leftPosition = windowWidth - menuWidth - 5;
                }
                if (leftPosition < 0) leftPosition = 5;
                $dropdownMenu.css({
                    position: 'fixed', top: topPosition + 'px', left: leftPosition + 'px', right: 'auto', bottom: 'auto'
                });
            }
        }
    });

    $('body').on('hide.bs.dropdown', '.dropdown-menu', function (e) {
        const $dropdownMenu = $(this);
        const $originalParent = $dropdownMenu.data('bs-dropdown-original-parent');
        if ($originalParent && $originalParent.length > 0 && $dropdownMenu.parent().is('body')) {
            $originalParent.append($dropdownMenu.detach());
            $dropdownMenu.css({ position: '', top: '', left: '', right: '', bottom: ''});
            $dropdownMenu.removeData('bs-dropdown-original-parent');
            $dropdownMenu.removeData('bs-dropdown-toggle-button');
        }
    });

    // console.log("Chamando inicializarTabelaAnotacoes pela primeira vez no final do script.");
    inicializarTabelaAnotacoes();

    document.querySelectorAll('dialog .btn-close-custom, dialog .btn-modal-cancel, dialog .btn-modal-ok').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const dialog = btn.closest('dialog');
            if (dialog && typeof dialog.close === 'function') {
                dialog.close();
            }
        });
    });

    const quickAddAnotacaoSidebarBtn = document.getElementById('quickAddAnotacaoSidebarBtn');
    if(quickAddAnotacaoSidebarBtn) {
        quickAddAnotacaoSidebarBtn.addEventListener('click', function(e){
            e.preventDefault();
            abrirModalFormAnotacao(false);
        });
    } else {
        console.error("Elemento #quickAddAnotacaoSidebarBtn não encontrado.");
    }
});
