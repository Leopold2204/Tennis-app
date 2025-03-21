<?php
// Verbindung zur MySQL-Datenbank herstellen (ohne Passwortverschlüsselung)
$host = "database-5017492070.webspace-host.com";
$user = "dbu311785";    // Deinen MySQL-Benutzer anpassen
$pass = "DevBenq1!t";        // Dein MySQL-Passwort anpassen
$dbname = "dbs14025551";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

// Prüfen, ob eine Nachricht gesendet wird
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Formulardaten erhalten
    $nachricht = $_POST['nachricht'];
    $wichtigkeit = $_POST['wichtigkeit'];  // Wichtigkeit als Zahl (1, 2 oder 3)
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $mac_address = isset($_SERVER['HTTP_X_MAC_ADDRESS']) ? $_SERVER['HTTP_X_MAC_ADDRESS'] : 'nicht verfügbar';

    // SQL-Statement zum Einfügen der Nachricht
    $sql = "INSERT INTO backbrett (nachricht, wichtigkeit, ip_address, mac_address) 
            VALUES ('$nachricht', '$wichtigkeit', '$ip_address', '$mac_address')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
} else {
    // Wenn eine GET-Anfrage kommt (z.B. zum Abrufen der Nachrichten)
    $sql = "SELECT nachricht, wichtigkeit FROM backbrett ORDER BY timestamp DESC";
    $result = $conn->query($sql);

    $messages = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $messages[] = $row;
        }
    }

    // JSON-Antwort mit allen Nachrichten
    echo json_encode($messages);

}

$conn->close();
?>