document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM carregado. Iniciando anotacao.js");

    // --- SELETORES DE ELEMENTOS PARA ANOTAÇÕES ---
    const modalAnotacaoBootstrap = document.getElementById('modalAnotacao');
    const abrirModalNovaAnotacaoPrincipalBtn = document.getElementById("abrirModalNovaAnotacaoPrincipal");
    const modalAnotacaoLabelTituloElem = document.getElementById('modalAnotacaoLabelTitulo');
    const modalAnotacaoEditInfoElem = document.getElementById('modalAnotacaoEditInfo');
    const totalAnotacoesInfoElem = document.getElementById('totalAnotacoesInfo');

    const anotacaoIdInput = document.getElementById('anotacaoIdInput');
    const anotacaoTituloInputElem = document.getElementById('anotacaoTituloInput');
    const anotacaoStatusTagElem = document.getElementById('anotacaoStatusTag');
    const anotacaoCadernoInputElem = document.getElementById('anotacaoCadernoInput');
    const anotacaoTopicosInputElem = document.getElementById('anotacaoTopicosInput');
    const anotacaoFavoritoCheckElem = document.getElementById('anotacaoFavoritoCheck');
    const salvarAnotacaoBtnElem = document.getElementById('salvarAnotacaoBtn');
    const tituloFeedbackDiv = anotacaoTituloInputElem ? anotacaoTituloInputElem.nextElementSibling : null;

    let tabelaAnotacoesDt;
    let resizeDebounceTimer;

    // --- DADOS MOCADOS ---
    const listaCadernosExemplo = [
        { id: "CAD01", nome: "Trabalho" }, { id: "CAD02", nome: "Estudos Pessoais" },
        { id: "CAD03", nome: "Ideias Aleatórias" }, { id: "TCC", nome: "TCC" },
        { id: "Estudos Web", nome: "Estudos Web" }
    ];

    let listaAnotacoes = [
        { id: "ANOT001", titulo: "Ideias para Projeto TCC", cadernoId: "TCC", cadernoNome: "TCC", topicos: "ideias, pesquisa, ia", conteudo: "<p>Conteúdo TCC...</p>", dataCriacao: "2025-05-20T10:00:00Z", ultimaModificacao: "2025-05-22T15:30:00Z", favorito: true, status: "Em Andamento" },
        { id: "ANOT002", titulo: "Resumo Capítulo Livro Web Design", cadernoId: "Estudos Web", cadernoNome: "Estudos Web", topicos: "ux, ui, html, css", conteudo: "<h2>Conteúdo Web Design...</h2>", dataCriacao: "2025-04-15T09:20:00Z", ultimaModificacao: "2025-04-15T11:05:00Z", favorito: false, status: "Concluída" },
        { id: "ANOT003", titulo: "Lista de Compras Supermercado", cadernoId: "CAD03", cadernoNome: "Ideias Aleatórias", topicos: "compras, casa", conteudo: "<ul><li>Itens...</li></ul>", dataCriacao: "2025-05-24T18:00:00Z", ultimaModificacao: "2025-05-24T18:05:00Z", favorito: false, status: "Inbox" }
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
        console.log("inicializarTabelaAnotacoes chamada");
        if (!window.jQuery || !$.fn.DataTable) {
            console.error("jQuery ou DataTables não carregado!");
            return;
        }

        listaAnotacoes.sort((a, b) => {
            if (a.favorito && !b.favorito) return -1;
            if (!a.favorito && b.favorito) return 1;
            return new Date(b.ultimaModificacao) - new Date(a.ultimaModificacao);
        });
        console.log("Lista de anotações ordenada:", listaAnotacoes);

        const mappedData = mapAnotacoesParaDataTable(listaAnotacoes);
        console.log("Dados mapeados para DataTable:", mappedData);

        if ($.fn.DataTable.isDataTable('#tabelaAnotacoes')) {
            console.log("DataTable já existe. Limpando e adicionando novos dados.");
            tabelaAnotacoesDt = $('#tabelaAnotacoes').DataTable();
            tabelaAnotacoesDt.clear().rows.add(mappedData).draw(false);
        } else {
            console.log("Inicializando DataTable pela primeira vez.");
            tabelaAnotacoesDt = $('#tabelaAnotacoes').DataTable({
                responsive: { details: { type: 'column', target: 0 }},
                dom: '<"row dt-custom-header align-items-center mb-3"<"col-12 col-md-auto me-md-auto"f><"col-12 col-md-auto dt-buttons-anotacoes-container">>t<"row mt-3 align-items-center"<"col-sm-12 col-md-5"l><"col-sm-12 col-md-7 dataTables_paginate_wrapper"p>>',
                paging: true, pageLength: 10, lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
                scrollY: '400px', scrollCollapse: true,
                language: { url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json', search: "", searchPlaceholder: "Buscar anotações...", info: "Exibindo _START_ a _END_ de _TOTAL_ anotações", infoEmpty: "Nenhuma anotação encontrada", infoFiltered: "(filtrado de _MAX_ anotações no total)", lengthMenu: "Exibir _MENU_ anotações", paginate: { first: "Primeiro", last: "Último", next: "Próximo", previous: "Anterior"}},
                columnDefs: [
                    { orderable: false, className: 'dtr-control', targets: 0 },
                    { responsivePriority: 1, targets: 1 }, { responsivePriority: 2, targets: 2 }, 
                    { responsivePriority: 4, targets: 3, type: 'date-br' }, { responsivePriority: 3, targets: 4, type: 'date-br' },
                    { orderable: false, className: "dt-actions-column text-center", targets: -1, responsivePriority: 1 } 
                ],
                data: mappedData,
                createdRow: function(row, data, dataIndex) {
                    const anotacaoOriginal = listaAnotacoes[dataIndex]; 
                    if (anotacaoOriginal) {
                        $(row).data('anotacao-id-interno', anotacaoOriginal.id); 
                    }
                },
                initComplete: function () {
                    console.log("DataTable initComplete");
                    const api = this.api();
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
                }
            });
        }
        
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
        atualizarContagemAnotacoes();
    }
    
    function mapAnotacoesParaDataTable(lista) {
        return lista.map(anotacao => {
            const estrelaHtml = anotacao.favorito ? '<i class="bi bi-star-fill text-warning me-1"></i>' : '';
            const dropdownHtml = `
                <div class="dropdown">
                    <button class="btn btn-sm btn-icon-only btn-icon" type="button" 
                            data-bs-toggle="dropdown" aria-expanded="false" 
                            aria-label="Ações da anotação"
                            data-bs-popper-config='{"strategy":"fixed"}'> 
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item btn-edit-anotacao" href="#" data-anotacao-id="${anotacao.id}"><i class="bi bi-pencil-square me-2"></i>Editar Anotação</a></li>
                        <li><a class="dropdown-item btn-remover-anotacao text-danger" href="#" data-anotacao-id="${anotacao.id}"><i class="bi bi-trash me-2"></i>Remover Anotação</a></li>
                    </ul>
                </div>`;
            return [ '',  estrelaHtml + anotacao.titulo, anotacao.cadernoNome || '-', 
                     formatarDataParaTabela(anotacao.dataCriacao), formatarDataParaTabela(anotacao.ultimaModificacao), dropdownHtml ];
        });
    }

    function atualizarContagemAnotacoes() {
         if (totalAnotacoesInfoElem) { 
            totalAnotacoesInfoElem.innerHTML = `<small>Total de ${listaAnotacoes.length} anotações</small>`;
        }
    }
    
    function abrirModalFormAnotacao(isEditMode = false, dadosAnotacao = null) {
        console.log("abrirModalFormAnotacao - EditMode:", isEditMode, "Dados:", dadosAnotacao);
        clearFieldError(anotacaoTituloInputElem, tituloFeedbackDiv);
        if(anotacaoIdInput) anotacaoIdInput.value = ''; 

        if (isEditMode && dadosAnotacao) {
            if(modalAnotacaoLabelTituloElem) modalAnotacaoLabelTituloElem.textContent = "Editar Anotação";
            if(modalAnotacaoEditInfoElem) modalAnotacaoEditInfoElem.textContent = `Editando: ${dadosAnotacao.titulo.substring(0,30)}${dadosAnotacao.titulo.length > 30 ? '...' : ''}`;
            
            if(anotacaoIdInput) anotacaoIdInput.value = dadosAnotacao.id;
            if(anotacaoTituloInputElem) anotacaoTituloInputElem.value = dadosAnotacao.titulo || '';
            if(anotacaoStatusTagElem) anotacaoStatusTagElem.textContent = dadosAnotacao.status || 'Inbox';
            if(anotacaoCadernoInputElem) anotacaoCadernoInputElem.value = dadosAnotacao.cadernoNome || '';
            if(anotacaoTopicosInputElem) anotacaoTopicosInputElem.value = dadosAnotacao.topicos || '';
            if(anotacaoFavoritoCheckElem) anotacaoFavoritoCheckElem.checked = dadosAnotacao.favorito || false;
        } else {
            if(modalAnotacaoLabelTituloElem) modalAnotacaoLabelTituloElem.textContent = "Nova Anotação";
            if(modalAnotacaoEditInfoElem) modalAnotacaoEditInfoElem.textContent = 'Criando nova anotação';

            if(anotacaoTituloInputElem) anotacaoTituloInputElem.value = '';
            if(anotacaoStatusTagElem) anotacaoStatusTagElem.textContent = 'Inbox';
            if(anotacaoCadernoInputElem) anotacaoCadernoInputElem.value = '';
            if(anotacaoTopicosInputElem) anotacaoTopicosInputElem.value = '';
            if(anotacaoFavoritoCheckElem) anotacaoFavoritoCheckElem.checked = false;
        }
        
        if (!modalAnotacaoBootstrap) {
            console.error("Elemento da modal #modalAnotacao não encontrado no DOM.");
            return;
        }
        const bsModal = bootstrap.Modal.getInstance(modalAnotacaoBootstrap) || new bootstrap.Modal(modalAnotacaoBootstrap);
        if (bsModal) {
             console.log("Exibindo modal Bootstrap.");
            bsModal.show();
        } else {
            console.error("Falha ao obter ou criar instância da modal Bootstrap.");
        }
    }

    $('#tabelaAnotacoes tbody').on('click', '.btn-edit-anotacao, .btn-remover-anotacao', function (e) {
        e.preventDefault();
        e.stopPropagation(); 
        
        const $clickedItem = $(this);
        const anotacaoId = $clickedItem.data('anotacao-id');
        console.log("Ação de tabela clicada. Item:", $clickedItem[0].className, "ID da Anotação:", anotacaoId);

        const anotacaoCompleta = listaAnotacoes.find(a => String(a.id) === String(anotacaoId));
        console.log("Anotação encontrada para ação:", anotacaoCompleta);

        if (!anotacaoCompleta) {
            alert("Erro: Dados da anotação não encontrados (ID: " + anotacaoId + "). Verifique o console.");
            console.error("Não foi possível encontrar a anotação para o ID:", anotacaoId, "em listaAnotacoes:", listaAnotacoes);
            return;
        }

        if ($clickedItem.hasClass('btn-edit-anotacao')) {
            console.log("Chamando abrirModalFormAnotacao para editar.");
            abrirModalFormAnotacao(true, anotacaoCompleta);
        } else if ($clickedItem.hasClass('btn-remover-anotacao')) {
            console.log("Tentando remover anotação:", anotacaoCompleta.titulo);
            if (confirm(`Tem certeza que deseja remover a anotação "${anotacaoCompleta.titulo}"?`)) {
                listaAnotacoes = listaAnotacoes.filter(a => String(a.id) !== String(anotacaoId));
                console.log("Lista após remoção:", listaAnotacoes);
                inicializarTabelaAnotacoes(); 
                alert("Anotação removida com sucesso!");
            }
        }
    });
    
    if (salvarAnotacaoBtnElem) {
        salvarAnotacaoBtnElem.addEventListener("click", function () {
            console.log("Botão Salvar Anotação clicado.");
            if (!validateFormAnotacao()) {
                console.warn("Formulário de anotação inválido.");
                return;
            }

            const idAnotacaoAtual = anotacaoIdInput ? anotacaoIdInput.value : null;
            const isEditMode = !!idAnotacaoAtual;
            const dataAtual = new Date().toISOString();
            const nomeCaderno = anotacaoCadernoInputElem ? anotacaoCadernoInputElem.value.trim() : '';
            const cadernoExistente = nomeCaderno ? listaCadernosExemplo.find(c => c.nome.toLowerCase() === nomeCaderno.toLowerCase()) : null;

            const dadosFormAnotacao = {
                id: isEditMode ? idAnotacaoAtual : 'ANOT' + new Date().getTime(),
                titulo: anotacaoTituloInputElem ? anotacaoTituloInputElem.value.trim() : 'Sem Título',
                cadernoId: cadernoExistente ? cadernoExistente.id : (nomeCaderno ? 'CAD_NOVO_' + nomeCaderno.replace(/\s+/g, '_').toUpperCase() : ''),
                cadernoNome: nomeCaderno || '-', 
                topicos: anotacaoTopicosInputElem ? anotacaoTopicosInputElem.value.trim() : '',
                conteudo: '', // Conteúdo não é editado nesta modal
                favorito: anotacaoFavoritoCheckElem ? anotacaoFavoritoCheckElem.checked : false,
                status: anotacaoStatusTagElem ? anotacaoStatusTagElem.textContent : 'Inbox',
                ultimaModificacao: dataAtual,
                dataCriacao: dataAtual 
            };
            console.log("Dados do formulário coletados:", dadosFormAnotacao);

            if (isEditMode) {
                const index = listaAnotacoes.findIndex(a => String(a.id) === String(idAnotacaoAtual));
                if (index !== -1) {
                    dadosFormAnotacao.dataCriacao = listaAnotacoes[index].dataCriacao; 
                    dadosFormAnotacao.conteudo = listaAnotacoes[index].conteudo; 
                    listaAnotacoes[index] = dadosFormAnotacao;
                    console.log("Anotação atualizada na lista:", listaAnotacoes[index]);
                    alert("Anotação atualizada com sucesso!");
                } else {
                    console.error("Erro ao atualizar: anotação não encontrada na lista para o ID:", idAnotacaoAtual);
                    alert("Erro ao atualizar: anotação não encontrada.");
                    return;
                }
            } else {
                dadosFormAnotacao.conteudo = "<p>Edite para adicionar conteúdo...</p>"; 
                listaAnotacoes.push(dadosFormAnotacao);
                console.log("Nova anotação adicionada:", dadosFormAnotacao);
                alert("Anotação adicionada com sucesso!");
            }
            
            if (modalAnotacaoBootstrap) {
                const bsModal = bootstrap.Modal.getInstance(modalAnotacaoBootstrap);
                if (bsModal) {
                    console.log("Fechando modal Bootstrap.");
                    bsModal.hide();
                } else {
                    console.warn("Instância da modal Bootstrap não encontrada para fechar.");
                }
            } else {
                console.error("Elemento modalAnotacaoBootstrap não encontrado para fechar a modal.");
            }
            
            console.log("Chamando inicializarTabelaAnotacoes após salvar/editar.");
            inicializarTabelaAnotacoes(); 
        });
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
            console.error("Erro ao formatar data:", dataISO, e); return dataISO; 
        }
    }

    $('#tabelaAnotacoes tbody').on('show.bs.dropdown', '.dropdown', function (e) {
        const $dropdown = $(this);
        const $dropdownMenu = $dropdown.find('.dropdown-menu');
        if ($dropdownMenu.length > 0) {
            $dropdownMenu.data('bs-dropdown-original-parent', $dropdown);
            const $toggleButton = $(e.relatedTarget); 
            $dropdownMenu.data('bs-dropdown-toggle-button', $toggleButton);
            $('body').append($dropdownMenu.detach()); 
            const bsDropdownInstance = bootstrap.Dropdown.getInstance(e.relatedTarget);
            if (bsDropdownInstance && typeof bsDropdownInstance.update === 'function') {
                bsDropdownInstance.update();
            } else { 
                const toggleRect = e.relatedTarget.getBoundingClientRect();
                 $dropdownMenu.css({ position: 'fixed', top: (toggleRect.bottom + window.scrollY) + 'px', left: (toggleRect.left + window.scrollX) + 'px'});
            }
        }
    });
    $('body').on('hide.bs.dropdown', '.dropdown-menu', function () {
        const $dropdownMenu = $(this);
        const $originalParent = $dropdownMenu.data('bs-dropdown-original-parent');
        if ($originalParent && $originalParent.length > 0 && !$dropdownMenu.parent().is($originalParent)) {
            $originalParent.append($dropdownMenu.detach()); 
            $dropdownMenu.css({ position: '', top: '', left: ''});
            $dropdownMenu.removeData('bs-dropdown-original-parent');
            $dropdownMenu.removeData('bs-dropdown-toggle-button');
        }
    });

    // --- INICIALIZAÇÕES FINAIS ---
    console.log("Chamando inicializarTabelaAnotacoes pela primeira vez.");
    inicializarTabelaAnotacoes(); 

    document.querySelectorAll('dialog .btn-close-custom, dialog .btn-modal-cancel, dialog .btn-modal-ok').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const dialog = btn.closest('dialog');
            if (dialog && typeof dialog.close === 'function') dialog.close();
        });
    });

    const quickAddAnotacaoSidebarBtn = document.getElementById('quickAddAnotacaoSidebarBtn');
    if(quickAddAnotacaoSidebarBtn) {
        quickAddAnotacaoSidebarBtn.addEventListener('click', function(e){
            e.preventDefault();
            console.log("Botão Adicionar Anotação (sidebar) clicado.");
            abrirModalFormAnotacao(false); 
        });
    }
});