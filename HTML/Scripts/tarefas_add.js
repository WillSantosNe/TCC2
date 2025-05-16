// Mapeamento de disciplinas para professores
const professoresPorDisciplina = {
  "Fundamentos Gráficos": "Jason",
  "Web Design Avançado": "João",
  "Pesquisa de UX": "Prizy Prizy",
  "Técnicas de Animação 3D": "Jango"
};

$(document).ready(function() {
  // Inicializa o DataTable
  const tabela = $('#tabelaTarefas').DataTable({
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json'
    }
  });

  // Atualiza professor ao mudar a disciplina
  $('#disciplina').on('change', function() {
    const disciplina = $(this).val();
    const prof = professoresPorDisciplina[disciplina] || "Professor não definido";
    $('#professorLabel').text(prof);
    $('#professor').val(prof);
  });

  // Aciona a atualização inicial do professor no modal ao abrir (se precisar)
  $('#meuModal').on('shown.bs.modal', function () {
    $('#disciplina').trigger('change');
  });

  // Salvar nova tarefa
  $('#salvarBtn').on('click', function() {
    // Captura valores do formulário
    const disciplina = $('#disciplina').val();
    const professor = $('#professor').val();
    const dataEntrega = $('#dataEntrega').val();
    const categoria = $('#categoria').val();
    const formato = $('#formato').val();
    const status = $('#status').val();
    const nota = $('#nota').val();

    // Validação simples (exemplo)
    if (!disciplina || !dataEntrega) {
      alert('Por favor, preencha pelo menos Disciplina e Data de Entrega.');
      return;
    }

    // Adiciona linha na tabela DataTables
    tabela.row.add([
      disciplina,
      professor,
      dataEntrega,
      categoria,
      formato,
      status,
      nota
    ]).draw(false);

    // Fecha o modal
    $('#meuModal').modal('hide');

    // Reseta o formulário
    $('#tarefaForm')[0].reset();
    $('#professorLabel').text('Selecione uma disciplina');
    $('#professor').val('');
  });
});
