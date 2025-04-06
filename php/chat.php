<?php
header("Content-Type: application/json");

// Verbindung zur MySQL-Datenbank herstellen (ohne Passwortverschlüsselung)
$host = "localhost";
$user = "root";    // Deinen MySQL-Benutzer anpassen
$pass = "DevBenq1!";        // Dein MySQL-Passwort anpassen
$dbname = "tennis_app";


$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die(json_encode(["error" => "Verbindung fehlgeschlagen: " . $conn->connect_error]));
}

// Aktion bestimmen
$action = $_GET['action'] ?? '';

// Verarbeite die verschiedenen Aktionen
switch ($action) {
    case "save":
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $name = htmlspecialchars(trim($_POST["name"] ?? ""), ENT_QUOTES, 'UTF-8');
            $message = htmlspecialchars(trim($_POST["message"] ?? ""), ENT_QUOTES, 'UTF-8');

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
        }
        break;


    case "fetch":
        $sql = "SELECT id, name, message, time FROM messages ORDER BY time DESC";
        $result = $conn->query($sql);

        $messages = [];
        while ($row = $result->fetch_assoc()) {
            $messages[] = $row;
        }

        echo json_encode($messages);
        break;
    case "deleteMessage":
        if (isset($_GET['id'])) {
            $messageId = (int) $_GET['id'];

            $stmt = $conn->prepare("DELETE FROM messages WHERE id = ?");
            $stmt->bind_param("i", $messageId);

            if ($stmt->execute()) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["error" => "Fehler beim Löschen der Nachricht"]);
            }
            $stmt->close();
        } else {
            echo json_encode(["error" => "Keine Nachrichten-ID angegeben"]);
        }
        break;


    default:
        echo json_encode(["error" => "Ungültige Aktion"]);
}

// Verbindung schließen (wird nur einmal gemacht)
$conn->close();
?>