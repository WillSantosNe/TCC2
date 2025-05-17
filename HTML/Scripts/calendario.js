// calendario.js - script completo para inicialização e interatividade do FullCalendar

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    // Visualizações disponíveis
    initialView: 'dayGridMonth',
    height: '100%',
    locale: 'pt-br',

    // Toolbar personalizada com menu de três pontinhos apenas
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'viewMenu'
    },

    // Botão customizado para o menu de views
    customButtons: {
      viewMenu: {
        text: '⋯',
        click: function() {
          document.querySelector('.fc-view-dropdown').classList.toggle('show');
        }
      }
    },

    // Fonte dos eventos (substitua por sua API)
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
    }
  });

  calendar.render();

  // --- INJEÇÃO DO DROPDOWN DE VIEWS ---
  const switcherBtn     = document.querySelector('.fc-viewMenu-button');
  const switcherWrapper = switcherBtn.parentNode;

  const dropdown = document.createElement('div');
  dropdown.className = 'fc-view-dropdown';
  dropdown.innerHTML = `
    <button data-view="dayGridMonth">Mês</button>
    <button data-view="timeGridWeek">Semana</button>
    <button data-view="timeGridDay">Dia</button>
    <button data-view="listWeek">Lista</button>
  `;
  switcherWrapper.appendChild(dropdown);

  // Muda de view e fecha menu ao clicar na opção
  dropdown.addEventListener('click', e => {
    if (e.target.matches('button[data-view]')) {
      calendar.changeView(e.target.getAttribute('data-view'));
      dropdown.classList.remove('show');
    }
  });

  // Fecha o menu se clicar fora
  document.addEventListener('click', e => {
    if (!switcherWrapper.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
});

/**
 * Função que busca eventos de uma API (exemplo)
 * Retorna promise que resolve em array de eventos
 */
function fetchEvents(info, successCallback, failureCallback) {
  fetch(`/api/eventos?start=${info.startStr}&end=${info.endStr}`)
    .then(response => response.json())
    .then(data => {
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

/**
 * Abre modal de evento (criação/edição)
 */
function openEventModal(eventData) {
  const modal = document.getElementById('eventModal');
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  // Aqui você pode pré-preencher campos do modal com eventData
}
