<?php
header("Content-Type: application/json");

// DB-Verbindung (angepasst an die eigene Konfiguration)
$servername = "localhost";
$username = "root"; 
$password = "DevBenq1!"; 
$dbname = "tennis_app";

// MySQLi-Verbindung
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $conn->connect_error]));
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Nachrichten speichern
if ($action === "save" && $_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"] ?? "";
    $message = $_POST["message"] ?? "";

    if (!empty($name) && !empty($message)) {
        $stmt = $conn->prepare("INSERT INTO messages (name, message) VALUES (?, ?)");
        $stmt->bind_param("ss", $name, $message);
        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["error" => "Fehler beim Speichern"]);
        }
        $stmt->close();
    } else {
        echo json_encode(["error" => "Name und Nachricht sind erforderlich"]);
    }
    exit;
}

// Nachrichten abrufen
if ($action === "fetch") {
    $sql = "SELECT name, message, time FROM messages ORDER BY time DESC";
    $result = $conn->query($sql);

    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }

    echo json_encode($messages);
    exit;
}

// Nachrichten löschen (PDO für die zweite Logik)
if (isset($_GET['action']) && $_GET['action'] === 'deleteMessage') {
    if (isset($_GET['id'])) {
        $messageId = (int)$_GET['id'];

        // PDO-Verbindung für Löschvorgang
        $host = 'localhost';
        $dbname = 'tennis_app';
        $pdoUsername = 'root';
        $pdoPassword = 'DevBenq1!';
        $dsn = "mysql:host=$host;dbname=$dbname";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];

        try {
            $pdo = new PDO($dsn, $pdoUsername, $pdoPassword, $options);
            $stmt = $pdo->prepare("DELETE FROM messages WHERE id = ?");
            $stmt->execute([$messageId]);

            echo json_encode(["success" => "Nachricht erfolgreich gelöscht"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "Fehler beim Löschen der Nachricht: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["error" => "Keine Nachrichten-ID angegeben"]);
    }
    exit;
}

$conn->close();
?>
