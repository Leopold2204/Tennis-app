<?php
// Verbindung zur MySQL-Datenbank herstellen (ohne Passwortverschlüsselung)
$host = "database-5017492070.webspace-host.com";
$user = "dbu311785";    // Deinen MySQL-Benutzer anpassen
$pass = "DevBenq1!t";        // Dein MySQL-Passwort anpassen
$dbname = "dbs14025551";

$conn = new mysqli($host, $user, $pass, $dbname);

// Verbindungsprüfung
if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

// Mitglieder anzeigen (GET-Anfrage)
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $sql = "SELECT id, name, email FROM users"; // Hier werden nur ID, Name und E-Mail abgefragt
    $result = $conn->query($sql);
    $members = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $members[] = $row;
        }
        echo json_encode($members); // Rückgabe der Mitglieder als JSON
    } else {
        echo json_encode([]); // Falls keine Mitglieder vorhanden sind, wird ein leeres Array zurückgegeben
    }
}

// Mitglied löschen (POST-Anfrage mit ID)
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['id'])) {
    $id = $_POST['id'];

    // SQL-Anweisung zum Löschen des Mitglieds
    $sql = "DELETE FROM users WHERE id = ?";

    // Bereitstellung und Ausführung der vorbereiteten Anweisung
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id); // "i" steht für Integer
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Mitglied erfolgreich gelöscht']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Fehler beim Löschen des Mitglieds']);
    }

    $stmt->close();
}

// Verbindung schließen
$conn->close();
?>
