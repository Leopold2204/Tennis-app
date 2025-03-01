<?php
session_start();
header('Content-Type: application/json');

/*
 * Hier die DB-Verbindungsdaten anpassen:
 */
$dbHost = "localhost";
$dbUser = "root";
$dbPass = "DevBenq1!";
$dbName = "tennis_app"; // Name deiner Datenbank

// Verbindung herstellen
$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
if ($conn->connect_error) {
    die(json_encode(["error" => "Datenbankverbindung fehlgeschlagen: " . $conn->connect_error]));
}

/*
 * Falls du noch kein Login-System hast,
 * kannst du hier zum Testen eine Dummy-Session setzen:
 */
// $_SESSION['user_email'] = "test@example.com";

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
function checkLogin()
{
    $user_email = isset($_POST['user_email']) ? $_POST['user_email'] : '';
    if (!$user_email) {
        echo json_encode(["error" => "Kein Nutzer angegeben!"]);
        exit;
    }
    return $user_email;
}


// Aktion: Reservierung hinzufügen
if ($action === 'add') {
    $user_email = 'test';  // Holt den per POST gesendeten Wert
    checkLogin();

    $user_email = isset($_POST['user_email']) ? $_POST['user_email'] : '';
    $date = isset($_POST['date']) ? $_POST['date'] : '';
    $platz = isset($_POST['platz']) ? $_POST['platz'] : '';
    $time = isset($_POST['time']) ? $_POST['time'] : '';
    $name = isset($_POST['name']) ? $_POST['name'] : '';
    $blocked = isset($_POST['blocked']) ? 1 : 0; // Falls Checkbox für Sperrung gesetzt

    if (!$date || !$platz || !$time || !$name) {
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
if ($action === 'get') {
    $user_email = isset($_SESSION['user_email']) ? $_SESSION['user_email'] : '';

    $query = "SELECT * FROM reservations";
    $result = $conn->query($query);

    $reservations = [];
    while ($row = $result->fetch_assoc()) {
        // Markiere, ob die Reservierung zum eingeloggten Nutzer gehört
        $row["own"] = ($row["user_email"] === $user_email);
        $reservations[] = $row;
    }
    echo json_encode($reservations);
    exit;
}

// Aktion: Reservierung löschen (nur eigene Reservierungen)
if ($action === 'delete') {
    checkLogin();

    $user_email = isset($_POST['user_email']) ? $_POST['user_email'] : '';
    $id = isset($_POST['id']) ? $_POST['id'] : '';

    if (!$id) {
        echo json_encode(["error" => "Keine ID angegeben."]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM reservations WHERE id = ? AND user_email = ?");
    $stmt->bind_param("is", $id, $user_email);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => "Reservierung gelöscht!"]);
    } else {
        echo json_encode(["error" => "Löschen nicht erlaubt oder Reservierung nicht gefunden."]);
    }
    exit;
}

// Falls eine unbekannte Aktion übergeben wird:
echo json_encode(["error" => "Ungültige Aktion!"]);
?>