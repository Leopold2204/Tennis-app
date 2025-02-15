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
