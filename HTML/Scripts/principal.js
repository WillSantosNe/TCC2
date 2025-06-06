document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado. principal.js está executando.');

    // --- LÓGICA DO CARROSSEL DE DISCIPLINAS ---
    const btnNextCarousel = document.getElementById('nextCoursesBtn');
    const btnPrevCarousel = document.getElementById('prevCoursesBtn');
    const carouselWrapper = document.querySelector('.courses-carousel-wrapper');
    const carouselInner = document.getElementById('coursesContainer');

    if (btnNextCarousel && btnPrevCarousel && carouselWrapper && carouselInner) {
        const cards = Array.from(carouselInner.children);
        if (cards.length === 0) {
            if(btnPrevCarousel) btnPrevCarousel.disabled = true;
            if(btnNextCarousel) btnNextCarousel.disabled = true;
        }
        let carouselScrollAmount = 0;
        let currentScrollPosition = 0;
        function calculateDimensionsAndScrollAmount() {
            if (cards.length > 0) {
                const firstCard = cards[0];
                if (firstCard && window.getComputedStyle && carouselInner) {
                    const cardStyle = window.getComputedStyle(firstCard);
                    const cardMarginRight = parseFloat(cardStyle.marginRight) || 0;
                    const carouselGap = parseFloat(window.getComputedStyle(carouselInner).gap) || 16; // 1rem = 16px (padrão Bootstrap)
                    carouselScrollAmount = firstCard.offsetWidth + (carouselGap > 0 ? carouselGap : cardMarginRight);
                } else { carouselScrollAmount = 220 + 16; } // Fallback: card width + gap
            } else { carouselScrollAmount = 0; }
        }
        function updateCarouselState() {
            if (!carouselInner || !carouselWrapper) return;
            const maxScrollPossible = Math.max(0, carouselInner.scrollWidth - carouselWrapper.offsetWidth);
            currentScrollPosition = Math.max(0, Math.min(currentScrollPosition, maxScrollPossible));
            carouselInner.style.transform = `translateX(-${currentScrollPosition}px)`;
            if(btnPrevCarousel) btnPrevCarousel.disabled = currentScrollPosition <= 0;
            if(btnNextCarousel) btnNextCarousel.disabled = currentScrollPosition >= maxScrollPossible - 1; // -1 for float precision
        }
        if (btnNextCarousel) btnNextCarousel.addEventListener('click', () => { calculateDimensionsAndScrollAmount(); const max = Math.max(0,carouselInner.scrollWidth - carouselWrapper.offsetWidth); if(currentScrollPosition < max){ currentScrollPosition = Math.min(currentScrollPosition + carouselScrollAmount, max); updateCarouselState();}});
        if (btnPrevCarousel) btnPrevCarousel.addEventListener('click', () => { calculateDimensionsAndScrollAmount(); if(currentScrollPosition > 0){ currentScrollPosition = Math.max(0, currentScrollPosition - carouselScrollAmount); updateCarouselState();}});
        function initializeCarousel() { calculateDimensionsAndScrollAmount(); currentScrollPosition = 0; updateCarouselState(); }
        initializeCarousel();
        let resizeTimeout;
        window.addEventListener('resize', () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(initializeCarousel, 250); });
    }

    // --- DADOS MOCKADOS PARA O DASHBOARD ---
    const disciplinasDashboard = [ { id: "ART101", nome: "Fundamentos de Design Gráfico – ART101" }, { id: "ITD201", nome: "Web Design Avançado – ITD201" }, { id: "UXD301", nome: "Princípios de UX/UI Design – UXD301" }, { id: "HD101", nome: "História do Design – HD101" }, { id: "AD202", nome: "Artes Digitais – AD202" }];
    const tarefasExemploDashboard = [ { id: "T001dash", titulo: "Revisar slides aula 5", disciplinaId: "ART101", tipo: "Tarefa", dataEntrega: "2025-05-30", status: "A Fazer", horarioEntrega: "18:00", descricao: "Focar nos slides sobre Gestalt." }, { id: "T002dash", titulo: "Protótipo de Baixa Fidelidade", disciplinaId: "UXD301", tipo: "Tarefa", dataEntrega: "2025-06-05", status: "Em Andamento", horarioEntrega: "23:59", descricao: "Criar wireframes para as 3 telas principais." }, { id: "T003dash", titulo: "Exercícios Cap 2 Web", disciplinaId: "ITD201", tipo: "Tarefa", dataEntrega: "2025-05-28", status: "A Fazer", horarioEntrega: "", descricao: "Resolver problemas 1 a 10." }, { id: "T004dash", titulo: "Pesquisar referências de logos", disciplinaId: "ART101", tipo: "Tarefa", dataEntrega: "2025-06-10", status: "Agendada", horarioEntrega: "", descricao: "Buscar 10 exemplos de logos minimalistas." }];
    const provasDashboardDados = [ { id: "P001", tituloProva: "Fund. de Design Gráfico", dataOriginal: "2025-01-25", dataFormatada: "25 Jan 2025", horario: "19h30", local: "Design Studio A", status: "Concluída", disciplinaId: "ART101", tipo: "Prova", descricao: "Prova final sobre os conceitos de Gestalt, Teoria das Cores e Tipografia.", anotacoesVinculadas: [] }, { id: "P002", tituloProva: "Avaliação Prática - Ilustração Digital", dataOriginal: "2025-02-05", dataFormatada: "05 Fev 2025", horario: "20h00", local: "Laboratório 2", status: "Concluída", disciplinaId: "AD202", tipo: "Prova", descricao: "Avaliação prática de técnicas de ilustração vetorial e pintura digital.", anotacoesVinculadas: [] }, { id: "P003", tituloProva: "Prova Teórica - Princípios de UX/UI", dataOriginal: "2025-03-10", dataFormatada: "10 Mar 2025", horario: "19h25", local: "Design Lab 1", status: "Agendada", disciplinaId: "UXD301", tipo: "Prova", descricao: "Prova teórica cobrindo heurísticas de Nielsen, wireframing e prototipação.", anotacoesVinculadas: [{id: "A005", titulo: "Resumo Heurísticas"}] }, { id: "P004", tituloProva: "Redação - História do Design", dataOriginal: "2025-04-12", dataFormatada: "12 Abr 2025", horario: "09h00", local: "Sala de Aula B", status: "Agendada", disciplinaId: "HD101", tipo: "Prova", descricao: "Prova discursiva sobre os principais movimentos do design do século XX.", anotacoesVinculadas: [] }];
    const disciplinasFixasParaSelects = ["Nenhuma", ...disciplinasDashboard.map(d => d.nome.split('–')[0].trim()) , "TCC 1", "Outra"];
    const atividadesPorDisciplinaParaSelects = { "Nenhuma": ["Nenhuma"], "Fundamentos de Design Gráfico": ["Nenhuma", "Estudo de Caso", "Apresentação"], "Web Design Avançado": ["Nenhuma", "Projeto Final", "Teste de Usabilidade"], "Princípios de UX/UI Design": ["Nenhuma", "Wireframes", "Protótipo Interativo"], "História do Design": ["Nenhuma", "Resenha Crítica"], "Artes Digitais": ["Nenhuma", "Portfólio Parcial"], "TCC 1": ["Nenhuma", "Definição Tema", "Revisão Bibliográfica"], "Outra": ["Nenhuma", "Atividade Genérica"] };
    const atividadesPadraoParaSelects = ["Nenhuma", "Outra"];


    // --- FUNÇÕES AUXILIARES ---
    function formatarDataParaWidget(dataStr) { if (!dataStr) return 'Sem data'; const [y,m,d]=dataStr.split('-'); const dt=new Date(Date.UTC(Number(y),Number(m)-1,Number(d))); const meses=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]; return `${dt.getUTCDate()} ${meses[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`; }
    function formatarDataHoraModal(dataStr, horaStr) { let f = formatarDataParaWidget(dataStr); if(horaStr){ const [h,min]=horaStr.split(':'); let hr=parseInt(h);const ap=hr>=12?'PM':'AM';hr=hr%12;hr=hr||12;f=(f!=='Sem data'?`${f}, `:``)+`${String(hr).padStart(2,'0')}:${String(min).padStart(2,'0')} ${ap}`;} return f||'-'; }
    function getStatusBadgeClass(s) { switch(s){case'Concluída':return'bg-success-subtle text-success';case'Agendada':case'Em Andamento':return'bg-info-subtle text-info';case'A Fazer':return'bg-warning-subtle text-warning';case'Atrasada':return'bg-danger-subtle text-danger';default:return'bg-secondary-subtle text-secondary';}}
    function getStatusBorderClass(s) { switch(s){case'Concluída':return'border-success-subtle';case'Agendada':case'Em Andamento':return'border-info-subtle';case'A Fazer':return'border-warning-subtle';case'Atrasada':return'border-danger-subtle';default:return'border-secondary-subtle';}}
    function getTipoBadgeClass(t) { if(t==="Prova")return'bg-danger-subtle text-danger';return'bg-primary-subtle text-primary';}
    function popularSelect(el, opts, selVal=null) {if(!el)return;el.innerHTML='';opts.forEach(opt=>{const o=document.createElement('option');o.value=(typeof opt==='object'?opt.id:opt);o.textContent=(typeof opt==='object'?opt.nome:opt);if(selVal&&(String(o.value)===String(selVal)||(typeof opt==='object'&&opt.nome===selVal)))o.selected=true;el.appendChild(o);});}

    // --- LISTA DE TAREFAS NO DASHBOARD ---
    const listaTarefasDashboardEl = document.getElementById('listaTarefasDashboard');
    if (listaTarefasDashboardEl) {
        listaTarefasDashboardEl.innerHTML = '';
        tarefasExemploDashboard.slice(0, 4).forEach(tarefa => {
            const disc = disciplinasDashboard.find(d => d.id === tarefa.disciplinaId);
            const div = document.createElement('div');
            div.className = `task-item border-start ${getStatusBorderClass(tarefa.status)}`;
            div.innerHTML = `<div class="d-flex justify-content-between"><strong class="text-sm">${disc ? disc.nome.split('–')[0].trim() : 'Geral'}</strong><span class="badge ${getStatusBadgeClass(tarefa.status)}">${tarefa.status}</span></div><small>${tarefa.titulo}</small><small>Entrega: ${formatarDataParaWidget(tarefa.dataEntrega)}</small>`;
            div.style.cursor = 'pointer';
            div.addEventListener('click', () => {
                const dadosAdaptados = {...tarefa, tituloProva:tarefa.titulo, disciplinaNome:disc?disc.nome.split('–')[0].trim():'Geral', dataFormatada:formatarDataParaWidget(tarefa.dataEntrega)};
                criarEExibirModalDetalhesItem(dadosAdaptados, "Detalhes da Tarefa");
            });
            listaTarefasDashboardEl.appendChild(div);
        });
    }

    // --- MODAL DE DETALHES (PROVA OU TAREFA) DINÂMICO ---
    const tabelaProvasDashboard = document.getElementById('tabelaProvasDashboard');
    function criarEExibirModalDetalhesItem(dadosItem, tituloModal = "Detalhes") {
        const modalId = 'modalDetalhesDinamicoDashboard';
        let existingDialog = document.getElementById(modalId);
        if (existingDialog) existingDialog.remove(); // Remover modal anterior se existir

        const dialog = document.createElement('div'); // Alterado de 'dialog' para 'div' para modal Bootstrap
        dialog.classList.add('modal', 'fade');
        dialog.id = modalId;
        dialog.tabIndex = -1;
        dialog.setAttribute('aria-labelledby', modalId + 'Label');
        dialog.setAttribute('aria-hidden', 'true');

        const discNomeCompleto = disciplinasDashboard.find(d => d.id === dadosItem.disciplinaId)?.nome.split('–')[0].trim() || dadosItem.disciplinaNome || 'N/A';
        
        dialog.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header-custom modal-header-studyflow">
                        <div class="modal-title-wrapper">
                            <img src="../imgs/logo.png" class="modal-logo-icon" alt="StudyFlow Logo">
                            <h5 class="modal-title-custom" id="${modalId}Label">${tituloModal}</h5>
                        </div>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
                    </div>
                    <div class="modal-body modal-body-custom">
                        <dl class="row mb-3">
                            <dt class="col-sm-4">Título:</dt><dd class="col-sm-8">${dadosItem.tituloProva || dadosItem.titulo || '-'}</dd>
                            <dt class="col-sm-4">Disciplina:</dt><dd class="col-sm-8">${discNomeCompleto}</dd>
                            <dt class="col-sm-4">Tipo:</dt><dd class="col-sm-8"><span class="badge ${getTipoBadgeClass(dadosItem.tipo)}">${dadosItem.tipo}</span></dd>                            ${dadosItem.local ? `<dt class="col-sm-4">Local:</dt><dd class="col-sm-8">${dadosItem.local}</dd>` : ''}
                            <dt class="col-sm-4">Status:</dt><dd class="col-sm-8"><span class="badge ${getStatusBadgeClass(dadosItem.status)}">${dadosItem.status}</span></dd>
                            ${dadosItem.descricao ? `<dt class="col-sm-12 mt-3">Descrição:</dt><dd class="col-sm-12"><pre style="white-space: pre-wrap; word-wrap: break-word; font-family: inherit;">${dadosItem.descricao.replace(/\n/g, '<br>')}</pre></dd>` : ''}
                        </dl>
                        ${dadosItem.anotacoesVinculadas && dadosItem.anotacoesVinculadas.length > 0 ? `<h6>Anotações Vinculadas</h6><ul class="list-group list-group-flush">${dadosItem.anotacoesVinculadas.map(a => `<li class="list-group-item">${a.titulo}</li>`).join('')}</ul>` : ''}
                    </div>
                    <div class="modal-footer-custom modal-footer-studyflow">
                        <button type="button" class="btn btn-modal-ok" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(dialog);
        
        const bsModal = new bootstrap.Modal(dialog);
        dialog.addEventListener('hidden.bs.modal', () => { // Limpar o modal do DOM após ser fechado
            dialog.remove();
        });
        bsModal.show();
    }
    if (tabelaProvasDashboard) {
        tabelaProvasDashboard.addEventListener('click', function(e) {
            const linha = e.target.closest('tr.clicavel-prova');
            if (linha) { const id = linha.dataset.provaId; const dados = provasDashboardDados.find(p => p.id === id); if (dados) criarEExibirModalDetalhesItem(dados, "Detalhes da Prova");}
        });
    }

    // --- MODAIS DE ADIÇÃO RÁPIDA (SIDEBAR) ---
    // Modal Adicionar Disciplina (Bootstrap)
    const modalDisciplinaAdicaoPrincipalEl = document.getElementById('modalDisciplinaAdicaoPrincipal');
    if (modalDisciplinaAdicaoPrincipalEl) {
        const form = modalDisciplinaAdicaoPrincipalEl.querySelector('#formDisciplinaPrincipal');
        modalDisciplinaAdicaoPrincipalEl.addEventListener('show.bs.modal', () => {
            if (form) form.reset();
            // Limpar validações anteriores, se houver
            form.classList.remove('was-validated');
            form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            form.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
            // Definir valores padrão, se necessário
            // Ex: modalDisciplinaAdicaoPrincipalEl.querySelector('#principalDisciplinaStatus').value = 'Ativa';
        });
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!form.checkValidity()) {
                    e.stopPropagation();
                    form.classList.add('was-validated');
                    // Atualizar mensagens de feedback com base na validação do Bootstrap
                    // (O Bootstrap cuida disso se as classes invalid-feedback estiverem corretas)
                    return;
                }
                // Lógica de salvar disciplina (exemplo)
                alert("Salvar Disciplina (Lógica completa em disciplinas.js ou aqui)");
                // Coletar dados do form
                // const nome = form.querySelector('#principalDisciplinaNome').value;
                // ...
                bootstrap.Modal.getInstance(modalDisciplinaAdicaoPrincipalEl).hide();
            });
        }
    }

    // Modal Adicionar Tarefa/Prova (Bootstrap)
    const modalTarefaAdicaoPrincipalEl = document.getElementById('modalTarefaAdicaoPrincipal');
    if (modalTarefaAdicaoPrincipalEl) {
        const form = modalTarefaAdicaoPrincipalEl.querySelector('#formTarefaAdicaoPrincipal');
        modalTarefaAdicaoPrincipalEl.addEventListener('show.bs.modal', () => {
            if (form) form.reset();
            form.classList.remove('was-validated');
            form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            form.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
        });
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (!form.checkValidity()) {
                    e.stopPropagation();
                    form.classList.add('was-validated');
                    return;
                }
                alert("Salvar Tarefa (Lógica completa em tarefas.js ou aqui)");
                bootstrap.Modal.getInstance(modalTarefaAdicaoPrincipalEl).hide();
            });
        }
    }

    // Modal Adicionar Anotação (Bootstrap)
    const modalAnotacaoPrincipalEl = document.getElementById('modalAnotacaoPrincipal');
    if (modalAnotacaoPrincipalEl) {
        const form = modalAnotacaoPrincipalEl.querySelector('#formAnotacaoPrincipal');
        const conteudoTextarea = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoConteudoInput');
        const disciplinaSelect = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoDisciplinaSelect');
        const atividadeSelect = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoAtividadeSelect');
        const tituloInput = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoTituloInput');
        const editInfo = modalAnotacaoPrincipalEl.querySelector('#principalAnotacaoEditInfo');
        
        function atualizarAtividadesAnotacaoPrincipal(disciplinaSelecionada) {
            const atividades = atividadesPorDisciplinaParaSelects[disciplinaSelecionada] || atividadesPadraoParaSelects;
            popularSelect(atividadeSelect, atividades, "Nenhuma");
        }

        modalAnotacaoPrincipalEl.addEventListener('show.bs.modal', () => {
            if (form) form.reset();
            form.classList.remove('was-validated');
            form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            form.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');

            if (editInfo) editInfo.textContent = "Nova anotação";
            if (tituloInput) tituloInput.value = "";


            if (disciplinaSelect) {
                popularSelect(disciplinaSelect, disciplinasFixasParaSelects, "Nenhuma");
                atualizarAtividadesAnotacaoPrincipal(disciplinaSelect.value); // Popula atividades para "Nenhuma" inicialmente
                
                // Remover listener antigo para evitar duplicação se o modal for reaberto
                const newSelect = disciplinaSelect.cloneNode(true); // Clona para remover listeners
                disciplinaSelect.parentNode.replaceChild(newSelect, disciplinaSelect);
                newSelect.addEventListener('change', function() { // Adiciona novo listener
                    atualizarAtividadesAnotacaoPrincipal(this.value);
                });
                // Reatribuir a referência do select para o novo elemento clonado
                // Isso é importante se você acessar `disciplinaSelect` em outros lugares após `show.bs.modal`
                // disciplinaSelect = newSelect; // Descomente se necessário
            }

            if (conteudoTextarea && typeof tinymce !== 'undefined') {
                const editorId = conteudoTextarea.id;
                if (tinymce.get(editorId)) tinymce.get(editorId).destroy();
                tinymce.init({
                    selector: `#${editorId}`,
                    plugins: 'lists link image table code help wordcount autoresize',
                    toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | alignleft aligncenter alignright | link image table | code | help',
                    menubar: 'edit view insert format tools table help',
                    height: 300, min_height: 300, autoresize_bottom_margin: 20,
                    branding: false, statusbar: false,
                    setup: (editor) => {
                        editor.on('init', () => editor.setContent(''));
                        // Ajustar z-index dos dialogs do TinyMCE para ficarem acima do modal Bootstrap
                        editor.on('OpenWindow', function(e) {
                            if (typeof $ !=='undefined' && $('.tox-dialog-wrap').length && $('.modal.show').length){
                                $('.tox-dialog-wrap').css('z-index', parseInt($('.modal.show').css('z-index')) + 100);
                            } else if (document.querySelector('.tox-dialog-wrap') && document.querySelector('.modal.show')) {
                                const modalZIndex = window.getComputedStyle(document.querySelector('.modal.show')).zIndex;
                                document.querySelector('.tox-dialog-wrap').style.zIndex = parseInt(modalZIndex) + 100;
                            }
                        });
                    }
                }).catch(err => console.error("Erro TinyMCE (Anotação Principal):", err));
            }
        });
        modalAnotacaoPrincipalEl.addEventListener('hidden.bs.modal', () => {
            if (conteudoTextarea && tinymce.get(conteudoTextarea.id)) {
                tinymce.get(conteudoTextarea.id).destroy();
            }
        });
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                let isValid = true;
                if (!tituloInput.value.trim()) {
                    tituloInput.classList.add('is-invalid');
                    tituloInput.nextElementSibling.textContent = "Título obrigatório.";
                    isValid = false;
                } else {
                    tituloInput.classList.remove('is-invalid');
                    tituloInput.nextElementSibling.textContent = "";
                }

                if (!isValid) {
                    e.stopPropagation();
                    form.classList.add('was-validated'); // Adiciona para feedback geral, mas a validação do título é manual aqui
                    return;
                }
                alert("Salvar Anotação (Lógica completa em anotacao.js ou aqui)");
                bootstrap.Modal.getInstance(modalAnotacaoPrincipalEl).hide();
            });
        }
    }

    // Configuração do dropdown de usuário Bootstrap
    var userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn && typeof bootstrap !== 'undefined' && bootstrap.Dropdown) { new bootstrap.Dropdown(userMenuBtn); }

    console.log('principal.js finalizado.');
});
