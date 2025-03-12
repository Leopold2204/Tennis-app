//chat managment
document.addEventListener("DOMContentLoaded", function () {
    // Popups steuern
    document.getElementById("openEventModal").addEventListener("click", function () {
        document.getElementById("eventModal").classList.remove("hidden");
    });
    document.getElementById("closeEventModal").addEventListener("click", function () {
        document.getElementById("eventModal").classList.add("hidden");
    });

    // Nachrichten anzeigen
    document.getElementById("loadMessages").addEventListener("click", function () {
        fetch("../php/chat.php?action=fetch")
            .then(response => response.json())
            .then(data => {
                const messageListPopup = document.getElementById("messageListPopup");
                messageListPopup.innerHTML = ''; // Bestehende Nachrichten entfernen

                data.forEach(message => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span class="sender-name">${message.name}</span>
                        <strong>${message.message}</strong>
                        <button id='deletebutton' class="deleteMessage" data-id="${message.id}">&#128465;&#65039;</button>
                    `;
                    messageListPopup.appendChild(li);
                });


                document.getElementById("messagesPopup").classList.remove("hidden");

                // Event-Listener für die Löschen-Buttons
                document.querySelectorAll(".deleteMessage").forEach(button => {
                    button.addEventListener("click", function () {
                        const messageId = this.getAttribute("data-id");

                        fetch(`../php/chat.php?action=deleteMessage&id=${messageId}`)
                            .then(response => response.json())
                            .then(result => {
                                if (result.success) {
                                    this.parentElement.remove(); // Nachricht aus der Liste entfernen
                                } else {
                                    alert("Fehler beim Löschen der Nachricht");
                                }
                            });
                    });
                });
            });
    });

    document.getElementById("closeMessagesPopup").addEventListener("click", function () {
        document.getElementById("messagesPopup").classList.add("hidden");
    });
});
//chat managment



//eventmanagment


function eventanlage() {
    // Hier nur den eigentlichen Nachrichtentext verwenden
    let name = document.getElementById('Eventname').value;
    let datum = document.getElementById('Eventdatum').value;
    let uhrzeit = document.getElementById('Eventuhrzeit').value;
    let beschreibung = document.getElementById('Eventbeschreibung').value;
    let eintragung = document.getElementById('Eventeintragung').checked;



    let wichtigkeit = 3; // Beispielwert für Wichtigkeit, anpassen falls nötig
    if (eintragung) {
        wichtigkeit = 2
    } else {
        wichtigkeit = 3
    }


    let ganznachricht = `📢 Neues Event angekündigt! 🎉 <br><br>\n\n🗓 Datum: ${datum}<br>\n⏰ Uhrzeit: ${uhrzeit}<br>\n📌 Event: ${name}<br>\n📝 Beschreibung: ${beschreibung}<br><br>\n\nSei dabei! 🚀`;

    alert(ganznachricht)
    // Hier den 'fetch'-Request in die Funktion einfügen, um die Nachricht zu senden



    fetch('../php/nachrichten.php', {  // Gib hier den korrekten Pfad zu deinem PHP-Skript an
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            nachricht: ganznachricht,
            wichtigkeit: wichtigkeit
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
            } else {
                alert('Fehler beim Senden der Nachricht!');
            }
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Fehler beim Senden der Nachricht!');
        });
}
//eventmanagment




//reservierungen

function addadminReservation() {
    const date = document.getElementById('platz-date').value;
    const platz = document.getElementById('platz-platz').value;
    const time = document.getElementById('platz-time').value;
    const name = document.getElementById('platz-name').value;
    const blocked = "1"; // Immer auf 1 setzen

    if (!date || !name || !time) {
        alert("Bitte alle Felder ausfüllen!");
        return;
    }

    fetch("../php/reservations.php?action=add", {
        method: "POST",
        body: new URLSearchParams({ date, platz, time, name, blocked }), // blocked hinzugefügt
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) alert(data.error);
            else {
                alert(data.success);
                loadCalendar();
                updateReservationList();
            }
        });
}

//reservierungen