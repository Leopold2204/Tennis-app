let currentDate = new Date();
let selectedDate = null;
let reservations = [];
let reservationList = [];

document.addEventListener('keydown', function(event) {
    if (event.key === 'ö') {
        openDateMenu();
    }
});

function openDateMenu() {
    // Hier das Popup oder Menü für die Datumsauswahl anzeigen
    const menu = document.getElementById('date-selection-menu');
    menu.style.display = 'block'; // Das Menü sichtbar machen
}


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

    const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    weekdays.forEach(day => {
        const headerCell = document.createElement('div');
        headerCell.className = 'calendar-header';
        headerCell.textContent = day;
        calendar.appendChild(headerCell);
    });

    // Leere Zellen für den Anfang des Monats
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day';
        calendar.appendChild(emptyCell);
    }

    // Erstelle die Tageszellen
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;

        // Berechnete Farbe basierend auf der Anzahl der Reservierungen
        const reservedCount = reservations.filter(reservation => {
            const resDate = new Date(reservation.date);
            return resDate.getDate() === day && resDate.getMonth() === currentDate.getMonth();
        }).length;

        if (reservedCount > 0) {
            const greenShade = Math.min(255, reservedCount * 40); // Je mehr Reservierungen, desto dunkler
            dayCell.style.backgroundColor = `rgb(0, ${255 - greenShade}, 0)`;
        }

        // Event für das Anzeigen der Reservierungen
        dayCell.addEventListener('click', () => {
            const reservedText = reservations.filter(reservation => {
                const resDate = new Date(reservation.date);
                return resDate.getDate() === day && resDate.getMonth() === currentDate.getMonth();
            }).map(reservation => `${reservation.name} - ${reservation.platz} um ${reservation.time}`).join('\n');
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

    // Funktion zum Blockieren von Zeiträumen
function blockTimeRange(startDate, endDate) {
    const calendar = document.getElementById('calendar');
    const dayCells = calendar.querySelectorAll('.calendar-day');

    dayCells.forEach(dayCell => {
        const day = parseInt(dayCell.textContent);
        const currentDate = new Date();
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

        if (dayDate >= startDate && dayDate <= endDate) {
            dayCell.style.backgroundColor = 'red'; // Rot für blockierte Tage
        }
    });
}

// Beispiel für die Anwendung
const startDate = new Date('2025-02-08'); // Startdatum
const endDate = new Date('2025-02-10'); // Enddatum
blockTimeRange(startDate, endDate);


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
        addButton.textContent = 'Kalender';
        addButton.onclick = () => addToCalendar(index);

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

// Reservierung zum Kalender hinzufügen
function addToCalendar(index) {
    const reservation = reservationList[index];
    const dayCell = document.querySelectorAll('.calendar-day');

    for (let cell of dayCell) {
        if (parseInt(cell.textContent) === reservation.date.getDate()) {
            cell.classList.add('reserved');
            const reservationText = cell.querySelector('.reservation-text');
            reservationText.textContent = `🟢 ${reservation.name} - ${reservation.platz} um ${reservation.time}`;
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
