// Mapeamento de disciplinas para professores
const professoresPorDisciplina = {
  "Fundamentos Gráficos": "Jason",
  "Web Design Avançado": "João",
  "Pesquisa de UX": "Prizy Prizy",
  "Técnicas de Animação 3D": "Jango"
};

$(document).ready(function () {
  // Inicializa DataTable com dom customizado e sem seletor de quantidade
  const tabela = $('#tabelaTarefas').DataTable({
    dom: 'rtip', // r = processing, t = table, i = info, p = paging (remove length menu)
    searching: false, // desativa pesquisa padrão da tabela, pois usamos input externo
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'
    }
  });

  // Atualiza professor ao mudar a disciplina no modal
  $('#disciplina').on('change', function () {
    const disciplina = $(this).val();
    const prof = professoresPorDisciplina[disciplina] || "Professor não definido";
    $('#professorLabel').text(prof);
    $('#professor').val(prof);
  });

  // Atualiza professor ao abrir o modal (trigger para mostrar certo)
  $('#meuModal').on('shown.bs.modal', function () {
    $('#disciplina').trigger('change');
  });

  // Filtra tarefas usando input externo
  $('#searchTarefas').on('keyup', function () {
    tabela.search(this.value).draw();
  });

  // Salvar nova tarefa no DataTable e fechar modal
  $('#salvarBtn').on('click', function () {
    const disciplina = $('#disciplina').val();
    const professor = $('#professor').val();
    const dataEntrega = $('#dataEntrega').val();
    const categoria = $('#categoria').val();
    const formato = $('#formato').val();
    const status = $('#status').val();
    const nota = $('#nota').val();

    if (!disciplina || !dataEntrega) {
      alert('Por favor, preencha pelo menos Disciplina e Data de Entrega.');
      return;
    }

    tabela.row.add([
      disciplina,
      professor,
      dataEntrega,
      categoria,
      formato,
      status,
      nota
    ]).draw(false);

    $('#meuModal').modal('hide');

    // Resetar formulário
    $('#tarefaForm')[0].reset();
    $('#professorLabel').text('Selecione uma disciplina');
    $('#professor').val('');
  });
});
