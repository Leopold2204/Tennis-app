let currentDate = new Date();
let selectedDate = null;
let reservations = [];
let reservationList = [];

// Initialisiert den Kalender
function loadCalendar() {
    const monthName = currentDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
    document.getElementById('current-month').innerText = monthName;

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    // Kalenderkopf (Wochentage)
    const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    weekdays.forEach(day => {
        const headerCell = document.createElement('div');
        headerCell.className = 'calendar-header';
        headerCell.textContent = day;
        calendar.appendChild(headerCell);
    });

    // Leerfelder für die Tage vor dem 1. Tag des Monats
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day';
        calendar.appendChild(emptyCell);
    }

    // Alle Tage im Monat anzeigen
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;

        // Tooltip-Container
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        dayCell.appendChild(tooltip);

        // Check, ob Reservierungen für diesen Tag existieren
        let reservedText = '';
        reservations.forEach(reservation => {
            const resDate = new Date(reservation.date);
            if (resDate.getDate() === day && resDate.getMonth() === currentDate.getMonth()) {
                dayCell.classList.add('reserved');
                reservedText += `🟢 ${reservation.name} - ${reservation.platz} um ${reservation.time}\n`;
            }
        });

        if (reservedText) {
            tooltip.textContent = reservedText.trim();
        }

        // Tooltip-Anzeige bei Hover und Klick
        dayCell.addEventListener('mouseover', () => {
            if (reservedText) tooltip.style.visibility = 'visible';
        });
        dayCell.addEventListener('mouseout', () => {
            tooltip.style.visibility = 'hidden';
        });

        // Für mobile Geräte (Tooltip beim Klicken anzeigen)
        dayCell.addEventListener('click', () => {
            if (reservedText) {
                alert(`Reservierungen für den ${day}.${currentDate.getMonth() + 1}.${currentDate.getFullYear()}:\n\n${reservedText}`);
            }
        });

        calendar.appendChild(dayCell);
    }
}


function selectDate(date) {
    selectedDate = new Date(date);
    document.getElementById('date').value = selectedDate.toISOString().split('T')[0]; // Datumsfeld aktualisieren
}


// Reservierung zur Liste hinzufügen
function addReservation() {
    const dateInput = document.getElementById('date').value; // Datum aus dem Input-Feld holen
    const platz = document.getElementById('platz').value;
    const time = document.getElementById('time').value;
    const name = document.getElementById('name').value;

    if (!dateInput) {  // Überprüfen, ob das Feld leer ist
        alert("Bitte wählen Sie ein Datum aus.");
        return;
    }

    if (!name) {
        alert("Bitte geben Sie Ihren Namen ein.");
        return;
    }

    const selectedDate = new Date(dateInput); // Konvertiere den String in ein Date-Objekt

    const reservation = { date: selectedDate, platz, time, name };
    reservationList.push(reservation);
    updateReservationList();
}

// Anzeige der Reservierungsliste
function updateReservationList() {
    const reservationListUl = document.getElementById('reservation-list-ul');
    reservationListUl.innerHTML = '';

    reservationList.forEach((reservation, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${reservation.date.toLocaleDateString()} - ${reservation.platz} um ${reservation.time} (Name: ${reservation.name})`;

        const addButton = document.createElement('button');
        addButton.textContent = 'Zum Kalender hinzufügen';
        addButton.onclick = () => downloadICS(reservation);
        addToCalendar(index);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Löschen';
        deleteButton.onclick = () => {
            reservationList.splice(index, 1);
            updateReservationList();
        };
        listItem.appendChild(deleteButton);


        listItem.appendChild(addButton);
        reservationListUl.appendChild(listItem);
    });
}
function downloadICS(reservation) {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(reservation.date, reservation.time)}
SUMMARY:Reservierung - ${reservation.name}
DESCRIPTION:Platz: ${reservation.platz}, Zeit: ${reservation.time}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reservierung_${reservation.date.toISOString().split('T')[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatICSDate(date, time) {
    const [hours, minutes] = time.split(':');
    const eventDate = new Date(date);
    eventDate.setHours(hours, minutes, 0);
    return eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Reservierung zum Kalender hinzufügen
function addToCalendar(index) {
    const reservation = reservationList[index];
    const dayCell = document.querySelectorAll('.calendar-day');

    for (let cell of dayCell) {
        if (parseInt(cell.textContent) === reservation.date.getDate()) {
            cell.classList.add('reserved');
            reservations.push(reservation);
            reservationList.splice(index, 1);
            updateReservationList();
            break;
        }
    }
}

// Monatswechsel (vor und zurück)
function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    loadCalendar();
}

loadCalendar(); // Kalender initialisieren