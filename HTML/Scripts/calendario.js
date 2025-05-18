// calendario.js - script completo para inicialização e interatividade do FullCalendar

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl   = document.getElementById('calendar');
  const switcherBtn  = document.createElement('button');
  let viewDropdown; // será inicializado depois de renderizar o calendário

  // Inicializa o calendário
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: '100%',
    locale: 'pt-br',

    // Apenas o botão de menu customizado aparece
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'viewMenu'
    },

    customButtons: {
      viewMenu: {
        text: '⋯',
        click: () => {
          // alterna a exibição do dropdown que foi injetado abaixo
          viewDropdown.classList.toggle('show');
        }
      }
    },

    events: fetchEvents,

    dateClick: info => openEventModal({
      date: info.dateStr,
      allDay: info.allDay
    }),

    eventClick: info => openEventModal({
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      allDay: info.event.allDay
    })
  });

  calendar.render();

  // --- INJEÇÃO DO BOTÃO ⋯ E DO DROPDOWN DE VIEWS ---
  // encontra o botão que o FullCalendar gerou
  const fcButton = document.querySelector('.fc-viewMenu-button');

  // cria o dropdown e injeta dentro do botão
  viewDropdown = document.createElement('div');
  viewDropdown.className = 'fc-view-dropdown';
  viewDropdown.innerHTML = `
    <button data-view="dayGridMonth">Mês</button>
    <button data-view="timeGridWeek">Semana</button>
    <button data-view="timeGridDay">Dia</button>
    <button data-view="listWeek">Lista</button>
  `;
  fcButton.appendChild(viewDropdown);

  // ao clicar numa opção, muda a visualização e fecha
  viewDropdown.addEventListener('click', e => {
    if (e.target.matches('button[data-view]')) {
      calendar.changeView(e.target.getAttribute('data-view'));
      viewDropdown.classList.remove('show');
    }
  });

  // fecha o dropdown ao clicar em qualquer lugar fora dele
  document.addEventListener('click', e => {
    if (!fcButton.contains(e.target)) {
      viewDropdown.classList.remove('show');
    }
  });
});

/**
 * Busca eventos de API e chama os callbacks do FullCalendar
 */
function fetchEvents(info, successCallback, failureCallback) {
  fetch(`/api/eventos?start=${info.startStr}&end=${info.endStr}`)
    .then(r => r.json())
    .then(data => {
      const events = data.map(evt => ({
        id: evt.id,
        title: evt.titulo,
        start: evt.data_inicio,
        end: evt.data_fim,
        allDay: evt.allDay || false,
        classNames: [evt.tipo]
      }));
      successCallback(events);
    })
    .catch(err => {
      console.error('Erro ao carregar eventos:', err);
      failureCallback(err);
    });
}

/**
 * Abre modal de evento (criação/edição)
 */
function openEventModal(eventData) {
  const modalEl = document.getElementById('eventModal');
  new bootstrap.Modal(modalEl).show();
  // aqui você pode preencher campos do modal com eventData, se quiser
}
