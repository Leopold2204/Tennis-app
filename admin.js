//chat Administation

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
        // Nachrichten aus der Datenbank abrufen
        fetch("../php/chat.php?action=fetch")
            .then(response => response.json())
            .then(data => {
                const messageListPopup = document.getElementById("messageListPopup");
                messageListPopup.innerHTML = ''; // Bestehende Nachrichten entfernen
                data.forEach(message => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <strong>${message.name}</strong>: ${message.message} 
                        <button class="deleteMessage" data-id="${message.id}">Löschen</button>
                    `;
                    messageListPopup.appendChild(li);
                });

                document.getElementById("messagesPopup").classList.remove("hidden");


            });
    });

    document.getElementById("closeMessagesPopup").addEventListener("click", function () {
        document.getElementById("messagesPopup").classList.add("hidden");
    });
});

//chat Administation