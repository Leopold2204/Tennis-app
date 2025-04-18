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


//weidrekehrende reservierungen


function addWiederReser() {
    const startDate = new Date(document.getElementById('wieder-start-date').value);
    const endDate = new Date(document.getElementById('wieder-end-date').value);
    const weekday = parseInt(document.getElementById('wieder-wochentag').value);
    const time = document.getElementById('wieder-time').value;
    const platz = document.getElementById('wieder-platz').value;
    const name = document.getElementById('wieder-name').value;
    const blocked = "1";

    if (isNaN(startDate) || isNaN(endDate) || !time || !name) {
        alert("Bitte alle Felder ausfüllen!");
        return;
    }

    const reservations = [];
    const current = new Date(startDate);

    while (current <= endDate) {
        if (current.getDay() === weekday) {
            const dateStr = current.toISOString().split('T')[0];
            reservations.push({ date: dateStr, time, platz, name, blocked });
        }
        current.setDate(current.getDate() + 1);
    }

    if (reservations.length === 0) {
        alert("Keine passenden Termine im Zeitraum gefunden.");
        return;
    }

    const promises = reservations.map(r => {
        return fetch("../php/reservations.php?action=add", {
            method: "POST",
            body: new URLSearchParams(r),
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }).then(res => res.json());
    });

    Promise.all(promises).then(results => {
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
            alert(`Einige Reservierungen sind fehlgeschlagen: ${errors.map(e => e.error).join(", ")}`);
        } else {
            alert("Alle wiederkehrenden Reservierungen wurden erfolgreich gespeichert.");
        }
        loadCalendar?.();
        updateReservationList?.();
    });
}


//weidrekehrende reservierungen


//spielplan
document.addEventListener("DOMContentLoaded", function () {
    const spielplanInput = document.getElementById("spielplanLink");
    const saveButton = document.getElementById("saveSpielplan");

    // Aktuellen Link aus der Datenbank abrufen
    fetch("../php/iframe_link.php?get")
        .then(response => response.text()) // Erst als Text lesen
        .then(text => {
            try {
                return JSON.parse(text); // Falls gültiges JSON, parse es
            } catch (error) {
                console.error("Fehlerhafte JSON-Antwort:", text);
                throw new Error("Ungültige JSON-Antwort");
            }
        })
        .then(data => {
            if (data.link) {
                document.getElementById("spielplanLink").value = data.link;
            }
        })
        .catch(error => console.error("Fehler beim Abrufen des Links:", error));


    // Link speichern
    saveButton.addEventListener("click", function () {
        const newLink = spielplanInput.value;

        // Sicherstellen, dass der neue Link eine gültige URL ist
        if (!newLink || !isValidURL(newLink)) {
            alert("Bitte geben Sie eine gültige URL ein.");
            return;
        }

        // Link an den Server senden
        fetch("../php/iframe_link.php?set", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ link: newLink }), // Senden des neuen Links als JSON
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Link erfolgreich gespeichert!");
                } else if (data.error) {
                    alert("Fehler: " + data.error);
                }
            })
            .catch(error => {
                console.error("Fehler beim Speichern des Links:", error);
                alert("Ein Fehler ist beim Speichern des Links aufgetreten.");
            });
    });

    // Funktion zur Überprüfung der URL
    function isValidURL(url) {
        const regex = /^(ftp|http|https):\/\/[^ "]+$/;
        return regex.test(url);
    }
});

//spelplan

//mintglieder liste

// Mitglieder anzeigen
function loadMembers() {

    fetch('../php/mitglieder.php', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            const memberListPopup = document.getElementById("memberListPopup");
            memberListPopup.innerHTML = ''; // Clear current list

            if (data.length === 0) {
                memberListPopup.innerHTML = 'Keine Mitglieder gefunden.';
            } else {
                data.forEach(member => {
                    const li = document.createElement('li');
                    li.innerHTML = `${member.name} (${member.email}) <button class="deleteMember" data-id="${member.id}">Löschen</button>`;
                    memberListPopup.appendChild(li);
                });

                // Event-Listener zum Löschen eines Mitglieds hinzufügen
                const deleteButtons = document.querySelectorAll('.deleteMember');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', function () {
                        const memberId = this.getAttribute('data-id');

                        // Bestätigung, bevor gelöscht wird
                        const confirmDelete = confirm("Möchten Sie dieses Mitglied wirklich löschen?");
                        if (confirmDelete) {
                            // Löschen des Mitglieds per POST-Anfrage
                            fetch('../php/mitglieder.php', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                },
                                body: new URLSearchParams({ id: memberId })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    alert(data.message); // Erfolg oder Fehler anzeigen
                                    if (data.status === 'success') {
                                        this.parentElement.remove(); // Löschen des Mitglieds aus der Liste im UI
                                    }
                                })
                                .catch(error => console.error('Fehler:', error));
                        }
                    });
                });
            }
        })
        .catch(error => console.error('Fehler:', error));
}



//mintglieder liste
