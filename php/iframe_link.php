<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verbindung zur Datenbank
$servername = "localhost";
$username = "root";  // Passe den DB-User an
$password = "DevBenq1!";  // Falls erforderlich, passe das Passwort an
$database = "tennis_app";

$conn = new mysqli($servername, $username, $password, $database);

// Fehlerprüfung
if ($conn->connect_error) {
    die(json_encode(["error" => "Datenbankverbindung fehlgeschlagen: " . $conn->connect_error]));
}

// GET: Link abrufen
if (isset($_GET["get"])) {
    $sql = "SELECT wert FROM sonstiges WHERE name = 'iframe_link' LIMIT 1";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode(["link" => $row["wert"]]);
    } else {
        echo json_encode(["error" => "Kein Link gefunden."]);
    }
    exit;
}

// POST: Link setzen (falls ?set in der URL ist)
if (isset($_GET["set"]) && $_SERVER["REQUEST_METHOD"] === "POST") {
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!isset($data["link"]) || !filter_var($data["link"], FILTER_VALIDATE_URL)) {
        echo json_encode(["error" => "Ungültige oder fehlende URL"]);
        exit;
    }

    $newLink = $data["link"];

    // Falls der Eintrag existiert, aktualisieren, sonst einfügen
    $stmt = $conn->prepare("INSERT INTO sonstiges (name, wert) VALUES ('iframe_link', ?) ON DUPLICATE KEY UPDATE wert = ?");
    $stmt->bind_param("ss", $newLink, $newLink);

    if ($stmt->execute()) {
        echo json_encode(["success" => "Link erfolgreich gespeichert"]);
    } else {
        echo json_encode(["error" => "Fehler beim Speichern"]);
    }
    exit;
}

echo json_encode(["error" => "Ungültige Anfrage"]);
$conn->close();
?>