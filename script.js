
document.getElementById('open-popup').addEventListener('click', function () {
    document.getElementById('spieler-suchen-popup').classList.add('show');
});

document.getElementById('spieler-schliessen').addEventListener('click', function () {
    document.getElementById('spieler-suchen-popup').classList.remove('show');
});

// Schließen, wenn außerhalb des Popups geklickt wird
document.getElementById('spieler-suchen-popup').addEventListener('click', function (event) {
    if (event.target === this) {
        this.classList.remove('show');
    }
});
function spilersuche() {
    // Eingabefelder abrufen & Leerzeichen entfernen
    let name = document.getElementById('spieler-name').value.trim();
    let email = document.getElementById('spieler-email').value.trim();
    let telefon = document.getElementById('spieler-telefon').value.trim();
    let nachricht = document.getElementById('spieler-nachricht').value.trim();
    let date = document.getElementById('spieler-date').value.trim();

    // Reguläre Ausdrücke (RegEx) zur Überprüfung
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Einfache E-Mail-Validierung
    let telefonRegex = /^[0-9+\-\s()]{6,20}$/; // Erlaubt nur Zahlen, -, +, () und mind. 6 Zeichen
    let dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Datum im Format YYYY-MM-DD
    let maxTextLength = 500; // Maximal 500 Zeichen für Nachricht
    let verboteneZeichenRegex = /[{}\[\]<>|$]/;

    if (
        verboteneZeichenRegex.test(name) ||
        verboteneZeichenRegex.test(email) ||
        verboteneZeichenRegex.test(telefon) ||
        verboteneZeichenRegex.test(nachricht) ||
        verboteneZeichenRegex.test(date)
    ) {
        alert('Die Eingabe enthält unzulässige Sonderzeichen { } [ ] < > | $');
        return;
    }

    // Validierung: Prüfen, ob alle Felder ausgefüllt sind
    if (!name || !nachricht || !date) {
        alert('Bitte füllen Sie alle Felder aus!');
        return;
    }

    // Validierung: E-Mail prüfen
    if (email !== '' && !emailRegex.test(email)) {
        alert('Bitte geben Sie eine gültige E-Mail-Adresse ein!');
        return;
    }


    // Validierung: Telefonnummer prüfen
    if (telefon !== '' && !telefonRegex.test(telefon)) {
        alert('Bitte geben Sie eine gültige Telefonnummer ein!');
        return;
    }


    // Validierung: Datum prüfen
    if (!dateRegex.test(date)) {
        alert('Bitte geben Sie ein gültiges Datum ein (Format: YYYY-MM-DD)!');
        return;
    }

    // Validierung: Nachricht auf zu viele Zeichen prüfen
    if (nachricht.length > maxTextLength) {
        alert('Die Nachricht ist zu lang (max. 500 Zeichen)!');
        return;
    }

    // Sicherheitsfilter: HTML-Tags und gefährliche Zeichen entfernen
    function sanitizeInput(input) {
        return input.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // HTML-Tags entschärfen
    }

    name = sanitizeInput(name);
    email = sanitizeInput(email);
    telefon = sanitizeInput(telefon);
    nachricht = sanitizeInput(nachricht);
    date = sanitizeInput(date);

    // Nachricht schön formulieren
    let ganznachricht = `${name} sucht für den ${date} einen Mitspieler. Nachricht: "${nachricht}". Kontakt: ${email}, Tel.: ${telefon}.`;

    // Wichtigkeit (Beispielwert)
    let wichtigkeit = 1;

    // Nachricht senden
    fetch('php/nachrichten.php', {
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
                document.getElementById('spieler-suchen-popup').classList.remove('show');
                ladeNachrichten();  // Nachrichten neu laden

                // Eingabefelder leeren
                document.getElementById('spieler-name').value = '';
                document.getElementById('spieler-email').value = '';
                document.getElementById('spieler-telefon').value = '';
                document.getElementById('spieler-nachricht').value = '';
                document.getElementById('spieler-date').value = '';
            } else {
                alert('Fehler beim Senden der Nachricht!');
            }
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Fehler beim Senden der Nachricht!');
        });
}









function ladeNachrichten() {
    fetch('php/nachrichten.php')
        .then(response => response.text())  // Antwort als Text zurückgeben
        .then(responseText => {

            try {
                const messages = JSON.parse(responseText);  // JSON parsen
                let contentDiv = document.getElementById('content');
                contentDiv.innerHTML = '';

                messages.reverse().forEach(message => {
                    let messageElement = document.createElement('div');
                    messageElement.classList.add('message');

                    // Teilnehmerliste verarbeiten
                    let teilnehmerListe = message.eingtragung ? message.eingtragung.split(',').join(', ') : "Noch keine Teilnehmer";

                    if (message.wichtigkeit == 1) {
                        messageElement.innerHTML = `<h1>${message.nachricht}</h1>`;
                    } else if (message.wichtigkeit == 2) {
                        messageElement.innerHTML = `
                    <h2>${message.nachricht}
                        <button id='${message.id}' class="teilnehmen-button">Ich bin dabei</button>
                        <br>
                        <span style="font-size: small; color: gray;"><strong>Teilnehmer:</strong> ${teilnehmerListe}</span>
                    </h2>
                `;
                    } else if (message.wichtigkeit == 3) {
                        messageElement.innerHTML = `<h3>${message.nachricht}</h3>`;
                    } else {
                        messageElement.innerHTML = `<p>${message.nachricht}</p>`;
                    }
                    contentDiv.appendChild(messageElement);
                });

                contentDiv.scrollTop = contentDiv.scrollHeight;
            } catch (error) {
                console.error('Fehler beim Parsen der Antwort:', error);
                // alert('Fehler beim Abrufen der Nachrichten!');
            }
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Nachrichten:', error);
            // alert('Fehler beim Abrufen der Nachrichten!');
        });
}








// Beim Laden der Seite die Nachrichten abrufen
document.addEventListener("DOMContentLoaded", ladeNachrichten);



document.addEventListener("DOMContentLoaded", function () {
    const contentSection = document.getElementById('content');
    if (contentSection) {
        contentSection.scrollTop = contentSection.scrollHeight;
    }
});


document.addEventListener('DOMContentLoaded', function () {
    let aktuellerEintragID = null;

    document.getElementById('content').addEventListener('click', function (event) {
        if (event.target.classList.contains('teilnehmen-button')) {
            aktuellerEintragID = event.target.id;
            document.getElementById('teilnehmen-popup').classList.add('show');
        }
    });

    document.getElementById('teilnehmen-speichern').addEventListener('click', function () {
        let teilnehmerName = document.getElementById('teilnehmer-name').value;

        if (teilnehmerName.trim() === '') {
            alert('Bitte gib deinen Namen ein.');
            return;
        }

        fetch('php/nachrichten.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                id: aktuellerEintragID,
                teilnehmer: teilnehmerName
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('teilnehmen-popup').classList.remove('show');
                    ladeNachrichten();  // Aktualisiert die Liste der Teilnehmer
                } else {
                    alert('Fehler beim Eintragen!');
                }
            })
            .catch(error => {
                console.error('Fehler:', error);
                alert('Fehler beim Senden der Teilnahme!');
            });
    });

    document.getElementById('teilnehmen-schliessen').addEventListener('click', function () {
        document.getElementById('teilnehmen-popup').classList.remove('show');
    });
});


document.addEventListener('DOMContentLoaded', function () {
    let aktuellerEintragID = null;

    document.getElementById('content').addEventListener('click', function (event) {
        if (event.target.classList.contains('teilnehmen-button')) {
            aktuellerEintragID = event.target.id;
            document.getElementById('teilnehmen-popup').classList.add('show');
        }
    });

    document.getElementById('teilnehmen-schliessen').addEventListener('click', function () {
        document.getElementById('teilnehmen-popup').classList.remove('show');
    });


});

document.addEventListener('DOMContentLoaded', function () {
    const roleimstorage = localStorage.getItem("Rolle");
    const adminElement = document.querySelector('#toolbar #Admin');

    // Überprüfen, ob das Admin-Element gefunden wird
    if (adminElement) {
        console.log('Admin-Element gefunden:', adminElement);
    } else {
        console.log('Admin-Element wurde nicht gefunden.');
    }

    if (roleimstorage !== '1') {
        adminElement.style.display = 'none';  // Falls es gefunden wurde

    } else {
        adminElement.style.display = 'block';  // Falls es gefunden wurde

    }
});








document.addEventListener("DOMContentLoaded", function () {
    // Prüfen, ob der Code bereits in der Session gespeichert ist
    if (sessionStorage.getItem("authCode")) {
        console.log("Authentifizierung bereits bestätigt.");
        return;
    }

    // Daten aus dem Local Storage abrufen
    const storedEmail = localStorage.getItem("Email");
    const storedPassword = localStorage.getItem("Passwort"); // Falls "Angemeldet bleiben" aktiviert wurde
    const storedRole = localStorage.getItem("Rolle");

    // Falls keine Daten vorhanden sind, zur Anmeldung weiterleiten
    if (!storedEmail || !storedPassword) {
        console.log("Keine gespeicherten Anmeldeinformationen gefunden.");
        window.location.href = "anmeldung/anmeldung.html";
        return;
    }

    // Server-Anfrage zur Überprüfung der Anmeldedaten
    fetch("anmeldung/anmeldung.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            action: "auto",
            email: storedEmail,
            password: storedPassword || "",
        }),
    })
        .then(response => response.text())  // Hier auf .text() ändern
        .then(text => {
            console.log("Server-Antwort:", text);  // Debugging-Ausgabe

            let data;
            try {
                data = JSON.parse(text);  // Versuchen, die Antwort zu parsen
            } catch (e) {
                console.error("Fehler beim Parsen der Antwort:", e); // Fehlerausgabe
                alert("Fehler beim Parsen der Antwort: " + e);
                return;
            }

            if (data.status === "success") {
                console.log("Benutzer erfolgreich authentifiziert.");
                sessionStorage.setItem("authCode", "verified");
                ladeNachrichten()
            } else {
                console.log("Ungültige Anmeldeinformationen, Weiterleitung zur Anmeldung.");
                localStorage.clear();
                window.location.href = "anmeldung/anmeldung.html";
            }
        })
        .catch(error => {
            console.error("Fehler bei der Authentifizierung:", error);
            window.location.href = "anmeldung/anmeldung.html";
        });

});



document.addEventListener("DOMContentLoaded", function () {
    let installPromptEvent = null;
    const installBanner = document.getElementById("install-banner");
    const installButton = document.getElementById("install-button");
    const closeButton = document.getElementById("close-banner");

    // Prüfen, ob die App bereits installiert wurde
    function isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            localStorage.getItem("app_installed") === "true";
    }

    // Android: "beforeinstallprompt" Event abfangen
    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault(); // Standard-Installationsbanner unterdrücken
        installPromptEvent = event;

        if (!isAppInstalled()) {
            installBanner.classList.remove("hidden"); // Banner anzeigen
        }
    });

    // iOS: Prüfen, ob es auf Safari läuft
    function isIosSafari() {
        return /iPhone|iPad|iPod/.test(navigator.userAgent) && navigator.standalone === false;
    }

    // Falls es sich um iOS handelt und die App nicht installiert ist, Banner anzeigen
    if (isIosSafari() && !isAppInstalled()) {
        installBanner.classList.remove("hidden");
    }

    // Wenn der Benutzer "Ja, hinzufügen" klickt
    installButton.addEventListener("click", () => {
        if (installPromptEvent) {
            installPromptEvent.prompt(); // Installationsaufforderung anzeigen
            installPromptEvent.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === "accepted") {
                    console.log("App wurde installiert");
                    localStorage.setItem("app_installed", "true");
                }
                installPromptEvent = null;
                installBanner.classList.add("hidden");
            });
        } else if (isIosSafari()) {
            alert("Füge diese Seite zum Home-Bildschirm hinzu: Klicke auf das Teilen-Symbol und wähle 'Zum Home-Bildschirm' aus.");
            installBanner.classList.add("hidden");
        }
    });

    // Wenn der Benutzer "Später" klickt
    closeButton.addEventListener("click", () => {
        installBanner.classList.add("hidden");
    });
});


