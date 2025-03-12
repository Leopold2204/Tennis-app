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


// Schließ-Button
document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("reservationModal").style.display = "none";
});

// Modal schließt sich, wenn außerhalb des Inhalts geklickt wird
window.addEventListener("click", (event) => {
    const modal = document.getElementById("reservationModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Modal schließt sich, wenn die Maus das Modal-Fenster verlässt
//document.querySelector(".calendar-day").addEventListener("mouseleave", () => {
//    document.getElementById("reservationModal").style.display = "none";
//});
//



// Initialisiert den Kalender
function loadCalendar() {
    const monthName = currentDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
    document.getElementById('current-month').innerText = monthName;

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    let firstDayIndex = firstDay.getDay();
    firstDayIndex = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    // Erstelle Header für Wochentage
    const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    weekdays.forEach(day => {
        const headerCell = document.createElement('div');
        headerCell.className = 'calendar-header';
        headerCell.textContent = day;
        calendar.appendChild(headerCell);
    });

    // Leere Zellen am Monatsanfang
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day';
        calendar.appendChild(emptyCell);
    }

    // Erstelle Tageszellen
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;

        // Beispiel: Füge hier die Hintergrundfarbe für reservierte Tage hinzu
        // (Falls es Reservierungen gibt, kannst du den Code hier ergänzen.)

        // Event-Listener: Bei mouseenter das Modal aktualisieren und positionieren
        dayCell.addEventListener('mouseenter', function (e) {
            console.log("mouseenter ausgelöst für Tag:", day);
            updateDayReservations(day, currentDate.getMonth(), currentDate.getFullYear(), this);
        });

        // Schließe das Modal, wenn die Maus die Zelle verlässt
        dayCell.addEventListener('mouseleave', function () {
            document.getElementById("reservationModal").style.display = "none";
        });

        // Beim Klicken das Datum auswählen
        dayCell.addEventListener('click', () => {
            const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            selectDate(clickedDate);
        });

        calendar.appendChild(dayCell);
    }
}

let modalTimeout; // Variable für verzögertes Schließen

function updateDayReservations(day, month, year, cellElement) {
    fetch('../php/reservations.php?action=get_all')
        .then(response => response.json())
        .then(data => {
            let dayReservations = data.filter(reservation => {
                let resDate = new Date(reservation.date);
                return resDate.getDate() === day &&
                    resDate.getMonth() === month &&
                    resDate.getFullYear() === year;
            });

            const modal = document.getElementById("reservationModal");
            const modalDate = document.getElementById("modalDate");
            const modalList = document.getElementById("modalReservationList");

            modalDate.textContent = `${day}.${month + 1}.${year}`;
            modalList.innerHTML = "";

            if (dayReservations.length > 0) {
                dayReservations.forEach(reservation => {
                    const li = document.createElement("li");
                    li.textContent = `${reservation.name} – ${reservation.platz} um ${reservation.time}`;
                    modalList.appendChild(li);
                });
            } else {
                const li = document.createElement("li");
                li.textContent = "Keine Reservierungen für diesen Tag.";
                modalList.appendChild(li);
            }

            modal.style.display = "block"; // Erst jetzt sichtbar machen

            // Nutze `requestAnimationFrame`, um sicherzustellen, dass das Modal korrekt positioniert wird
            requestAnimationFrame(() => {
                const rect = cellElement.getBoundingClientRect();
                const modalHeight = modal.offsetHeight;

                modal.style.position = "absolute";
                modal.style.top = `${window.scrollY + rect.top - modalHeight - 10}px`;
                modal.style.left = `${window.scrollX + rect.left}px`;
            });
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Reservierungen:', error);
        });
}


// Verzögertes Schließen des Modals
function closeModal() {
    modalTimeout = setTimeout(() => {
        document.getElementById("reservationModal").style.display = "none";
    }, 200); // 200ms Verzögerung, um Flackern zu verhindern
}

// Event-Handling für das Modal
document.getElementById("reservationModal").addEventListener("mouseenter", () => {
    clearTimeout(modalTimeout); // Falls das Modal unterbrochen wird, nicht schließen
});

document.getElementById("reservationModal").addEventListener("mouseleave", closeModal);








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
