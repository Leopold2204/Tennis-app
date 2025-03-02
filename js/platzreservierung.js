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




// Initialisiert den Kalender
function loadCalendar() {
    const monthName = currentDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
    document.getElementById('current-month').innerText = monthName;

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    let firstDayIndex = firstDay.getDay(); // 0 = Sonntag, 1 = Montag, ..., 6 = Samstag

    // Korrigieren, damit Montag der erste Tag ist
    firstDayIndex = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    // Neue Reihenfolge: Montag zuerst
    const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
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


    // Im Kalender-Rendering: Für jede Tageszelle
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;

        // Bestehende Logik für Hintergrundfarbe etc.
        // ...

        // Event Listener: Beim Hovern werden nur die Reservierungen für diesen Tag angezeigt
        dayCell.addEventListener('mouseover', () => {
            // Achtung: Da day hier 1-basiert ist und currentDate.getMonth() 0-indexiert ist, passt das direkt
            updateDayReservations(day, currentDate.getMonth(), currentDate.getFullYear());
        });

        // Optionaler Klick-Event für zusätzliche Funktionalitäten:
        dayCell.addEventListener('click', () => {
            const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            selectDate(clickedDate);
        });

        calendar.appendChild(dayCell);
    }



}

function updateDayReservations(day, month, year) {
    fetch('../php/reservations.php?action=get_all')
        .then(response => response.json())
        .then(data => {
            // Filtere die Reservierungen für das angeklickte Datum
            let dayReservations = data.filter(reservation => {
                let resDate = new Date(reservation.date);
                return resDate.getDate() === day &&
                    resDate.getMonth() === month &&  // month ist hier 0-indexiert
                    resDate.getFullYear() === year;
            });

            if (dayReservations.length > 0) {
                let reservedText = dayReservations.map(reservation => {
                    let text = `${reservation.name} - ${reservation.platz} um ${reservation.time} am ${reservation.date}`;
                    if (reservation.blocked == 1) {
                        text += " (GESPERRT)";
                    }
                    return text;
                }).join('\n');

                alert("Reservierungen:\n" + reservedText);
            }
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Reservierungen:', error);
        });
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
                updateReservationList()
            }
        });

}






function updateReservationList() {
    const list = document.getElementById('reservation-list-ul');
    list.innerHTML = '';

    // AJAX-Request an die PHP-Datei senden
    fetch('../php/reservations.php?action=get')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                list.innerHTML = '<li id="no-reservation-message">' + data.error + '</li>';
                return;
            }
            console.log('Antwort vom Server:', data);

            if (data.length === 0) {
                list.innerHTML = '<li id="no-reservation-message">Noch keine Reservierungen.</li>';
                return;
            }

            data.forEach((res, index) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `${res.date} - ${res.platz} um ${res.time}`;



                listItem.innerHTML += ` <button onclick="deleteReservation(${res.id})">Löschen</button>`;
                list.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Reservierungen:', error);
            list.innerHTML = '<li id="no-reservation-message">Fehler beim Laden.</li>';
        });
}

function deleteReservation(id) {
    if (!confirm("Möchtest du diese Reservierung wirklich löschen?")) {
        return; // Abbrechen, wenn der Benutzer auf "Abbrechen" klickt
    }

    fetch("../php/reservations.php?action=delete", {
        method: "POST",
        body: new URLSearchParams({ id }),  // ID an den Server senden
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.success);
                updateReservationList(); // Liste nach dem Löschen aktualisieren
                loadCalendar(); // Kalender ebenfalls aktualisieren
            }
        })
        .catch(error => {
            console.error("Fehler beim Löschen der Reservierung:", error);
        });
}




// Reservierung zum Kalender hinzufügen


// Monatswechsel (vor und zurück)
function changeMonth(offset) {
    currentDate.setMonth(currentDate.getMonth() + offset);
    loadCalendar();
}


console.log("Reservierungen geladen:", reservations);



document.getElementById("date").min = new Date().toISOString().split("T")[0];

loadCalendar(); // Kalender initialisieren
