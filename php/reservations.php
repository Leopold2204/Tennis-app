<?php
session_start();
header('Content-Type: application/json');

/*
 * Hier die DB-Verbindungsdaten anpassen:
 */
// Verbindung zur MySQL-Datenbank herstellen (ohne Passwortverschlüsselung)
$host = "database-5017492070.webspace-host.com";
$user = "dbu311785";    // Deinen MySQL-Benutzer anpassen
$pass = "DevBenq1!t";        // Dein MySQL-Passwort anpassen
$dbname = "dbs14025551";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die(json_encode(["error" => "Datenbankverbindung fehlgeschlagen: " . $conn->connect_error]));
}

/*
 * Falls du noch kein Login-System hast,
 * kannst du hier zum Testen eine Dummy-Session setzen:
 */

/*
 * Tabelle in deiner DB erstellen, falls noch nicht vorhanden:
 * 
 * CREATE TABLE IF NOT EXISTS reservations (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   user_email VARCHAR(255) NOT NULL,
 *   date DATE NOT NULL,
 *   platz VARCHAR(50) NOT NULL,
 *   time TIME NOT NULL,
 *   name VARCHAR(100) NOT NULL,
 *   blocked BOOLEAN DEFAULT 0
 * );
 */

if (!isset($_GET['action'])) {
    echo json_encode(["error" => "Keine Aktion angegeben."]);
    exit;
}

$action = $_GET['action'];

// Hilfsfunktion: Überprüft, ob ein Nutzer eingeloggt ist


// Aktion: Reservierung hinzufügen
// Aktion: Reservierung hinzufügen
if ($action === 'add') {
    // E-Mail aus dem POST-Daten abrufen
    $user_email = isset($_POST['user_email']) ? $_POST['user_email'] : 'test@example.com';  // Hier die E-Mail aus POST

    $date = isset($_POST['date']) ? $_POST['date'] : '';
    $platz = isset($_POST['platz']) ? $_POST['platz'] : '';
    $time = isset($_POST['time']) ? $_POST['time'] : '';
    $name = isset($_POST['name']) ? $_POST['name'] : '';
    $blocked = isset($_POST['blocked']) ? 1 : 0; // Falls Checkbox für Sperrung gesetzt

    if (!$date || !$platz || !$time || !$name || !$user_email) {
        echo json_encode(["error" => "Bitte alle Felder ausfüllen!"]);
        exit;
    }

    // Prüfen, ob bereits eine Reservierung existiert
    $stmt = $conn->prepare("SELECT * FROM reservations WHERE date = ? AND platz = ? AND time = ?");
    $stmt->bind_param("sss", $date, $platz, $time);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        echo json_encode(["error" => "Dieser Platz ist bereits reserviert!"]);
        exit;
    }

    // Reservierung einfügen
    $stmt = $conn->prepare("INSERT INTO reservations (user_email, date, platz, time, name, blocked) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssi", $user_email, $date, $platz, $time, $name, $blocked);
    if ($stmt->execute()) {
        echo json_encode(["success" => "Reservierung erfolgreich!"]);
    } else {
        echo json_encode(["error" => "Fehler beim Speichern der Reservierung."]);
    }
    exit;
}


// Aktion: Reservierungen abrufen
// Aktion: Reservierungen abrufen
if ($action === 'get') {
    // E-Mail aus den POST-Daten abrufen
    if (!isset($_POST['user_email'])) {
        echo json_encode(["error" => "Benutzer nicht eingeloggt."]);
        exit;
    }

    $user_email = $_POST['user_email'];  // Benutzer-E-Mail aus POST

    // Reservierungen des Benutzers abrufen
    $stmt = $conn->prepare("SELECT * FROM reservations WHERE user_email = ?");
    $stmt->bind_param("s", $user_email);
    $stmt->execute();
    $result = $stmt->get_result();

    $reservations = [];
    while ($row = $result->fetch_assoc()) {
        $reservations[] = $row;
    }
    echo json_encode($reservations);
    exit;
}



// Aktion: Reservierung löschen (nur eigene Reservierungen)
if ($action === 'delete') {
    if (!isset($_POST['id'])) {
        echo json_encode(["error" => "Keine ID angegeben."]);
        exit;
    }

    $id = intval($_POST['id']); // ID in eine Zahl umwandeln

    // Überprüfen, ob die Reservierung existiert
    $stmt = $conn->prepare("SELECT * FROM reservations WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["error" => "Reservierung nicht gefunden."]);
        exit;
    }

    // Reservierung löschen
    $stmt = $conn->prepare("DELETE FROM reservations WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(["success" => "Reservierung erfolgreich gelöscht!"]);
    } else {
        echo json_encode(["error" => "Fehler beim Löschen der Reservierung."]);
    }
    exit;
}

if ($action === 'get_all') {
    $stmt = $conn->prepare("SELECT name, blocked, platz, date, time FROM reservations");
    $stmt->execute();
    $result = $stmt->get_result();

    $reservations = [];
    while ($row = $result->fetch_assoc()) {
        $reservations[] = $row;
    }
    echo json_encode($reservations);
    exit;
}



// Falls eine unbekannte Aktion übergeben wird:
echo json_encode(["error" => "Ungültige Aktion!"]);
?>