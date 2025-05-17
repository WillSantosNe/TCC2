// calendario.js - script completo para inicialização e interatividade do FullCalendar

// Configurações iniciais do calendário
document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    // Visualizações disponíveis
    initialView: 'dayGridMonth',
    height: '100%',
    locale: 'pt-br',

    // Toolbar personalizada
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },

    // Plugins necessários (caso use modular)
    // plugins: [ dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin ],

    // Data dos eventos (pode ser substituído por fetch de API)
    events: fetchEvents,

    // Clique em um dia vazio para criar um novo evento
    dateClick: function(info) {
      openEventModal({
        date: info.dateStr,
        allDay: info.allDay
      });
    },

    // Clique em um evento existente para editar
    eventClick: function(info) {
      openEventModal({
        id: info.event.id,
        title: info.event.title,
        start: info.event.startStr,
        end: info.event.endStr,
        allDay: info.event.allDay
      });
    },

    // Carregando eventos antes da renderização
    loading: function(isLoading) {
      if (isLoading) {
        // opcional: mostrar spinner
      } else {
        // opcional: ocultar spinner
      }
    }
  });

  calendar.render();
});

/**
 * Função que busca eventos de uma API (exemplo)
 * Retorna promise que resolve em array de eventos
 */
function fetchEvents(info, successCallback, failureCallback) {
  fetch(`/api/eventos?start=${info.startStr}&end=${info.endStr}`)
    .then(response => response.json())
    .then(data => {
      // Mapeia dados do servidor para formato do FullCalendar
      const events = data.map(evt => ({
        id: evt.id,
        title: evt.titulo,
        start: evt.data_inicio,
        end: evt.data_fim,
        allDay: evt.allDay || false,
        classNames: [evt.tipo] // usa classes css como 'secondary'
      }));
      successCallback(events);
    })
    .catch(error => {
      console.error('Erro ao carregar eventos:', error);
      failureCallback(error);
    });
}

function openEventModal(eventData) {
  const modal = document.getElementById('eventModal');

  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}
