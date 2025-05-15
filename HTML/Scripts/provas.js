document.addEventListener("DOMContentLoaded", function () {
    const modalProva = document.querySelector("#modalProva");
    const abrirModalNovaProvaBtn = document.querySelector("#abrirModalNovaProva");
    const fecharModalBtn = document.querySelector("#fecharModal"); // Para modal de add/edit
    const cancelarModalBtn = document.querySelector("#cancelarModal"); // Para modal de add/edit
    const formProva = document.querySelector("#formProva");
    const modalProvaLabel = document.querySelector("#modalProvaLabel");

    // Elementos do Modal de Busca
    const modalBusca = document.querySelector("#modalBuscaProvas");
    const abrirModalBuscaBtn = document.querySelector("#abrirBuscaModal");
    const fecharModalBuscaBtn = document.querySelector("#fecharModalBusca");
    const inputBuscaProvas = document.querySelector("#inputBuscaProvas");
    const aplicarBuscaProvasBtn = document.querySelector("#aplicarBuscaProvas");

    // Elementos do Modal de Detalhes
    const modalDetalhes = document.querySelector("#modalDetalhesProva");
    const fecharModalDetalhesBtn = document.querySelector("#fecharModalDetalhes");
    const okModalDetalhesBtn = document.querySelector("#okModalDetalhes");
    const modalDetalhesConteudo = document.querySelector("#modalDetalhesProvaConteudo");
    const modalDetalhesProvaLabel = document.querySelector("#modalDetalhesProvaLabel");


    let tabelaProvasDt;

    if (window.jQuery && $.fn.DataTable) {
        tabelaProvasDt = $('#tabelaProvas').DataTable({
            responsive: {
                details: {
                    type: 'none'
                }
            },
            dom:  '<"row mb-3"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-md-end"f>>' +
                  't' + // A tabela em si
                  '<"row mt-3"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',

            language: {
                url: 'https://cdn.datatables.net/plug-ins/2.0.7/i18n/pt-BR.json',
                search: "_INPUT_", // Remove o label "Search:"
                searchPlaceholder: "Buscar provas...", // Placeholder para o input de busca
                lengthMenu: "Mostrar _MENU_ provas", // Customiza "Show X entries"
                info: "Mostrando de _START_ a _END_ de _TOTAL_ provas",
                infoEmpty: "Mostrando 0 a 0 de 0 provas",
                infoFiltered: "(filtrado de _MAX_ provas no total)",
                paginate: {
                    first: "Primeira",
                    last: "Última",
                    next: "Próxima",
                    previous: "Anterior"
                }
            },
            columnDefs: [
                { orderable: false, targets: 'no-sort' },
                { responsivePriority: 1, targets: 0 },  // Disciplina
                { responsivePriority: 2, targets: 2 },  // Data & Horário
                {
                    responsivePriority: 3,
                    targets: 5, // Ações
                    className: "text-start dt-actions-column" // Mantém o alinhamento à esquerda
                }
            ],
        });

        // Remover o botão de busca por LUPA que era para mobile, já que o search normal estará visível
        if (abrirModalBuscaBtn) {
            abrirModalBuscaBtn.style.display = 'none'; // Esconde o botão da lupa
        }
    } else {
        console.error("jQuery ou DataTables não carregado!");
    }

    function abrirModalEdicao(isEdit = false, dadosProva = null, linhaTr = null) {
        if (!formProva || !modalProvaLabel || !modalProva) return;
        formProva.reset();
        delete formProva.dataset.provaId;
        delete formProva.dataset.rowIndex;

        if (isEdit && dadosProva && linhaTr) {
            modalProvaLabel.textContent = "Editar Prova";
            document.getElementById('provaDisciplina').value = dadosProva.disciplinaValue || '';
            document.getElementById('provaNota').value = dadosProva.nota || '';
            document.getElementById('provaData').value = dadosProva.data || '';
            document.getElementById('provaHorario').value = dadosProva.horario || '';
            document.getElementById('provaLocal').value = dadosProva.local || '';
            document.getElementById('provaStatus').value = dadosProva.statusValue || 'Agendada';
            formProva.dataset.provaId = dadosProva.id;
            if (tabelaProvasDt) {
                formProva.dataset.rowIndex = tabelaProvasDt.row(linhaTr).index();
            }
        } else {
            modalProvaLabel.textContent = "Adicionar Nova Prova";
        }
        modalProva.showModal();
    }

    function fecharModalEdicao() {
        if (modalProva) modalProva.close();
    }

    if (abrirModalNovaProvaBtn) {
        abrirModalNovaProvaBtn.addEventListener("click", (e) => { e.preventDefault(); abrirModalEdicao(); });
    }
    if (fecharModalBtn) {
        fecharModalBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalEdicao(); });
    }
    if (cancelarModalBtn) {
        cancelarModalBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalEdicao(); });
    }
    if (modalProva) {
        modalProva.addEventListener("click", e => { if (e.target === modalProva) fecharModalEdicao(); });
    }

    function abrirModalBusca() {
        if (modalBusca && inputBuscaProvas) {
            inputBuscaProvas.value = tabelaProvasDt ? tabelaProvasDt.search() : "";
            modalBusca.showModal();
            inputBuscaProvas.focus();
        }
    }
    function fecharModalBusca() {
        if (modalBusca) modalBusca.close();
    }
    function aplicarBusca() {
        if (tabelaProvasDt && inputBuscaProvas) {
            tabelaProvasDt.search(inputBuscaProvas.value).draw();
        }
        fecharModalBusca();
    }
    if (abrirModalBuscaBtn) { abrirModalBuscaBtn.addEventListener("click", (e) => { e.preventDefault(); abrirModalBusca(); }); }
    if (fecharModalBuscaBtn) { fecharModalBuscaBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalBusca(); }); }
    if (aplicarBuscaProvasBtn) { aplicarBuscaProvasBtn.addEventListener("click", (e) => { e.preventDefault(); aplicarBusca(); });}
    if (inputBuscaProvas) { inputBuscaProvas.addEventListener('keypress', function (e) { if (e.key === 'Enter') { e.preventDefault(); aplicarBusca(); } });}
    if (modalBusca) { modalBusca.addEventListener("click", e => { if (e.target === modalBusca) fecharModalBusca(); });}

    function abrirModalDetalhes(dadosDaLinha) {
        if (!modalDetalhes || !modalDetalhesConteudo || !modalDetalhesProvaLabel) return;
        modalDetalhesProvaLabel.textContent = "Detalhes da Prova: " + dadosDaLinha[0];
        let detalhesHtml = `
            <dl class="row">
                <dt class="col-sm-4">Disciplina:</dt><dd class="col-sm-8">${dadosDaLinha[0]}</dd>
                <dt class="col-sm-4">Nota:</dt><dd class="col-sm-8">${dadosDaLinha[1]}</dd>
                <dt class="col-sm-4">Data & Horário:</dt><dd class="col-sm-8">${dadosDaLinha[2]}</dd>
                <dt class="col-sm-4">Local:</dt><dd class="col-sm-8">${dadosDaLinha[3]}</dd>
                <dt class="col-sm-4">Status:</dt><dd class="col-sm-8">${dadosDaLinha[4]}</dd>
            </dl>`;
        modalDetalhesConteudo.innerHTML = detalhesHtml;
        modalDetalhes.showModal();
    }

    function fecharModalDetalhes() {
        if (modalDetalhes) modalDetalhes.close();
    }
    if (fecharModalDetalhesBtn) { fecharModalDetalhesBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDetalhes(); }); }
    if (okModalDetalhesBtn) { okModalDetalhesBtn.addEventListener("click", (e) => { e.preventDefault(); fecharModalDetalhes(); }); }
    if (modalDetalhes) { modalDetalhes.addEventListener("click", e => { if (e.target === modalDetalhes) fecharModalDetalhes(); }); }

    $('#tabelaProvas tbody').on('click', '.btn-edit-proof', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const linhaTr = $(this).closest('tr');
        if (linhaTr.length === 0) return;
        const rowNode = tabelaProvasDt.row(linhaTr).node();
        const rowDataArray = tabelaProvasDt.row(linhaTr).data();
        if (!rowDataArray) return;

        let dataParaInput = '', horaParaInput = '';
        const dataHoraString = rowDataArray[2]; // Coluna "Data & Horário" (índice 2)

        if (dataHoraString && typeof dataHoraString === 'string' && dataHoraString !== '-') {
            const partes = dataHoraString.split(',');
            dataParaInput = parsePtBrDateToIso(partes[0].trim());
            if (partes.length > 1) horaParaInput = formatarHoraParaInput(partes[1].trim());
        }
        
        let statusTexto = '';
        const statusElementContent = rowDataArray[4]; // Coluna Status (índice 4)
        if (typeof statusElementContent === 'string') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = statusElementContent;
            const badge = tempDiv.querySelector('.badge');
            statusTexto = badge ? badge.textContent.trim() : statusElementContent.trim();
        }

        const dadosParaEdicao = {
            id: $(rowNode).data('prova-id') || 'tempID-' + new Date().getTime(),
            disciplinaValue: obterValorDoSelectPorTexto(document.getElementById('provaDisciplina'), rowDataArray[0]),
            nota: rowDataArray[1] === '-' ? '' : String(rowDataArray[1]).split('/')[0].trim().replace(',', '.'),
            data: dataParaInput,
            horario: horaParaInput,
            local: rowDataArray[3] === '-' ? '' : rowDataArray[3],
            statusValue: statusTexto
        };
        abrirModalEdicao(true, dadosParaEdicao, linhaTr[0]);
    });

    $('#tabelaProvas tbody').on('click', '.btn-detalhar-prova', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const linhaTr = $(this).closest('tr');
        if (linhaTr.length === 0) return;
        const dadosDaLinha = tabelaProvasDt.row(linhaTr).data();
        if (dadosDaLinha) abrirModalDetalhes(dadosDaLinha);
    });

    $('#tabelaProvas tbody').on('click', '.btn-marcar-concluida', function (e) {
        e.preventDefault();
        if (!tabelaProvasDt) return;
        const linhaTr = $(this).closest('tr');
        if (linhaTr.length === 0) return;
        const row = tabelaProvasDt.row(linhaTr);
        let rowData = row.data();
        if (rowData) {
            rowData[4] = `<span class="badge bg-success-subtle text-success">Concluída</span>`; // Coluna Status (índice 4)
            row.data(rowData).draw(false);
            alert("Prova marcada como concluída!");
        }
    });

    if (formProva) {
        formProva.addEventListener("submit", function(e) {
            e.preventDefault();
            if (!tabelaProvasDt) return;

            const provaId = formProva.dataset.provaId;
            const rowIndex = formProva.dataset.rowIndex;

            const disciplinaSelect = document.getElementById('provaDisciplina');
            const disciplinaTexto = disciplinaSelect.options[disciplinaSelect.selectedIndex].text;
            const notaInput = document.getElementById('provaNota').value.trim();

            const dataInput = document.getElementById('provaData').value;
            const horarioInput = document.getElementById('provaHorario').value;
            const local = document.getElementById('provaLocal').value.trim();
            const statusValue = document.getElementById('provaStatus').value;
            const statusBadgeClass = statusValue === 'Concluída' ? 'bg-success-subtle text-success' : (statusValue === 'Cancelada' ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info');
            const statusHtml = `<span class="badge ${statusBadgeClass}">${statusValue}</span>`;

            let dataHoraFormatadaParaTabela = '-';
            if (dataInput) {
                const [year, month, day] = dataInput.split('-');
                const dataObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
                const diaFormatado = dataObj.getUTCDate().toString();
                const mesesAbreviados = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
                const mesFormatado = mesesAbreviados[dataObj.getUTCMonth()];
                const anoFormatado = dataObj.getUTCFullYear();
                dataHoraFormatadaParaTabela = `${diaFormatado} ${mesFormatado} ${anoFormatado}`;
                if (horarioInput) {
                    dataHoraFormatadaParaTabela += ', ' + formatarHora(horarioInput);
                }
            } else if (horarioInput) {
                dataHoraFormatadaParaTabela = formatarHora(horarioInput);
            }

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
                  </ul>
                </div>`;

            const dadosNovaLinha = [
                disciplinaTexto,
                notaInput ? `${notaInput.replace('.',',')} / 10,0` : '-',
                dataHoraFormatadaParaTabela,
                local || '-',
                statusHtml,
                dropdownHtml
            ];

            if (provaId && rowIndex !== undefined && rowIndex !== null && rowIndex !== "") {
                tabelaProvasDt.row(parseInt(rowIndex)).data(dadosNovaLinha).draw(false);
                alert("Prova atualizada com sucesso! (Simulação)");
            } else {
                tabelaProvasDt.row.add(dadosNovaLinha).draw(false);
                alert("Prova adicionada com sucesso! (Simulação)");
            }
            fecharModalEdicao();
        });
    }

    function formatarHora(timeString) {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        let h = parseInt(hour);
        if (isNaN(h) || isNaN(parseInt(minute))) {
             console.warn("Formato de hora inválido para formatarHora:", timeString);
             return '';
        }
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h}:${minute.padStart(2, '0')} ${ampm}`;
    }

    function formatarHoraParaInput(displayTime) {
        if (!displayTime || typeof displayTime !== 'string') return '';
        let timePart = displayTime.toUpperCase().trim();
        let modifier = "";

        if (timePart.endsWith('AM')) {
            modifier = 'AM';
            timePart = timePart.slice(0, -2).trim();
        } else if (timePart.endsWith('PM')) {
            modifier = 'PM';
            timePart = timePart.slice(0, -2).trim();
        } else {
            if (timePart.includes(' AM')) {
                modifier = 'AM';
                timePart = timePart.replace('AM', '').trim();
            } else if (timePart.includes(' PM')) {
                modifier = 'PM';
                timePart = timePart.replace('PM', '').trim();
            }
        }

        let [hoursStr, minutesStr] = timePart.split(':');
        let hours = parseInt(hoursStr, 10);
        let minutes = parseInt(minutesStr, 10);

        if (isNaN(hours) || isNaN(minutes)) {
            console.warn("Formato de hora inválido para formatarHoraParaInput:", displayTime);
            return '';
        }

        if (modifier === 'PM' && hours < 12) {
            hours += 12;
        } else if (modifier === 'AM' && hours === 12) {
            hours = 0;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    function parsePtBrDateToIso(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return "";
        const parts = dateStr.split(" ");
        if (parts.length !== 3) {
            const dateSeparators = dateStr.match(/(\d{1,2})[\/\-\. ]([a-zA-Z]{3})[\/\-\. ](\d{4})/);
            if (dateSeparators && dateSeparators.length === 4) {
                parts[0] = dateSeparators[1];
                parts[1] = dateSeparators[2];
                parts[2] = dateSeparators[3];
            } else {
                console.warn("Formato de data inválido para parsePtBrDateToIso:", dateStr, ". Esperado 'dd Mmm<y_bin_46>");
                return "";
            }
        }

        const day = parts[0];
        const monthStr = parts[1].toLowerCase().substring(0, 3);
        const year = parts[2];

        const monthMap = {
            'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
            'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
            'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
        };
        const month = monthMap[monthStr];
        
        if (!month || !/^\d{4}$/.test(year) || !/^\d{1,2}$/.test(day)) {
            console.warn("Componentes de data inválidos para parsePtBrDateToIso:", `Dia: ${day}, Mês Str: ${monthStr} (map: ${month}), Ano: ${year}`);
            return "";
        }
        return `${year}-${month.padStart(2,'0')}-${day.padStart(2, '0')}`;
    }

    function obterValorDoSelectPorTexto(selectElement, texto) {
        if (!selectElement || typeof texto !== 'string') return "";
        const textoNormalizado = texto.trim();
        for (let i = 0; i < selectElement.options.length; i++) {
            if (selectElement.options[i].text.trim() === textoNormalizado) {
                return selectElement.options[i].value;
            }
        }
        for (let i = 0; i < selectElement.options.length; i++) {
             if (selectElement.options[i].value === textoNormalizado) {
                return selectElement.options[i].value;
            }
            if (selectElement.options[i].text.trim().includes(textoNormalizado)) {
                 return selectElement.options[i].value;
            }
        }
        console.warn(`Não foi possível encontrar o valor para o select com o texto: "${textoNormalizado}"`);
        return "";
    }
});
