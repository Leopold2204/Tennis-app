let currentDate = new Date();
let selectedDate = null;
let reservations = [];
let reservationList = [];

document.addEventListener("DOMContentLoaded", function () {
    const list = document.getElementById('reservation-list-ul');
    if (!list) {
        console.error("Fehler: Element mit id='reservation-list-ul' nicht gefunden!");
        return;
    }

    updateReservationList();
});


document.addEventListener('keydown', function (event) {
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

        // Reservierungen für diesen Tag filtern
        const dayReservations = reservations.filter(reservation => {
            const resDate = new Date(reservation.date);
            return resDate.getDate() === day && resDate.getMonth() === currentDate.getMonth();
        });

        // Blockierte Reservierung prüfen
        const isBlocked = dayReservations.some(reservation => reservation.blocked == 1);

        // Farbgebung basierend auf der Anzahl der Reservierungen
        if (isBlocked) {
            dayCell.style.backgroundColor = 'rgba(255, 0, 0, 0.7)'; // Rot für blockierte Reservierungen
        } else if (dayReservations.length > 0) {
            const greenIntensity = 0.3 + dayReservations.length * 0.1;
            dayCell.style.backgroundColor = `rgba(0, 150, 0, ${Math.min(greenIntensity, 1)})`; // Dynamisches Grün
        }

        // Event für das Anzeigen der Reservierungen
        dayCell.addEventListener('click', () => {
            let reservedText = dayReservations.map(reservation =>
                `${reservation.name} - ${reservation.platz} um ${reservation.time} ${reservation.blocked == 1 ? "(GESPERRT)" : ""}`
            ).join('\n');
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




// Funktion zum Blockieren von Zeiträumen
function addReservation() {
    const date = document.getElementById('date').value;
    const platz = document.getElementById('platz').value;
    const time = document.getElementById('time').value;
    const name = document.getElementById('name').value;

    if (!date || !name || !time) {
        alert("Bitte alle Felder ausfüllen!");
        return;
    }

    fetch("../php/reservations.php?action=add", {
        method: "POST",
        body: new URLSearchParams({ date, platz, time, name }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) alert(data.error);
            else {
                alert(data.success);
                loadCalendar();
            }
        });
}






// Anzeige der Reservierungsliste
function updateReservationList() {
    const list = document.getElementById('reservation-list-ul');
    list.innerHTML = '';

    if (reservations.length === 0) {
        list.innerHTML = '<li id="no-reservation-message">Noch keine Reservierungen.</li>';
        return;
    }

    const userEmail = "test@example.com"; // Hier sollte die eingeloggte E-Mail stehen

    reservations.forEach((res, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `${res.date} - ${res.platz} um ${res.time} (Name: ${res.name}) 
            ${res.blocked == 1 ? '<span style="color: red;">(GESPERRT)</span>' : ''}`;

        // Falls es eine eigene Reservierung ist, kennzeichnen
        if (res.user_email === userEmail) {
            listItem.style.fontWeight = "bold";
            listItem.innerHTML += ' <span style="color: blue;">(DEINE RESERVIERUNG)</span>';
        }

        listItem.innerHTML += ` <button onclick="deleteReservation(${index})">Löschen</button>`;
        list.appendChild(listItem);
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


console.log("Reservierungen geladen:", reservations);



document.getElementById("date").min = new Date().toISOString().split("T")[0];

loadCalendar(); // Kalender initialisieren
