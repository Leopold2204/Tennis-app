<?php
// Verbindung zur MySQL-Datenbank herstellen (ohne Passwortverschlüsselung)
$host = "database-5017492070.webspace-host.com";
$user = "dbu311785";    // Deinen MySQL-Benutzer anpassen
$pass = "DevBenq1!t";        // Dein MySQL-Passwort anpassen
$dbname = "dbs14025551";

$conn = new mysqli($host, $user, $pass, $dbname);

// Verbindung prüfen
if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

// Prüfen, ob ein POST-Request vorliegt
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action'])) {
    $action = $_POST['action'];

    if ($action === "register") {
        // Registrierung
        $name = trim($_POST['name']);
        $email = trim($_POST['email']);
        $password = trim($_POST['password']); // Unverschlüsselt speichern (nicht empfohlen)

        // Überprüfen, ob Felder leer sind
        if (empty($name) || empty($email) || empty($password)) {
            echo "Bitte alle Felder ausfüllen.";
            exit;
        }

        // Überprüfen, ob die E-Mail bereits existiert
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            echo "Diese E-Mail wird bereits verwendet.";
            exit;
        }
        $stmt->close();

        // Optional: Standardrolle NULL oder "user"
        $rolle = NULL; // oder z. B. "user"

        // Neuen Benutzer einfügen
        $stmt = $conn->prepare("INSERT INTO users (name, email, password, rolle) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $name, $email, $password, $rolle);

        if ($stmt->execute()) {
            echo "success";
        } else {
            echo "Fehler bei der Registrierung: " . $stmt->error;
        }
        $stmt->close();

    } elseif ($action === "login") {
        // Login
        $email = trim($_POST['email']);
        $password = trim($_POST['password']);

        if (empty($email) || empty($password)) {
            echo "Bitte alle Felder ausfüllen.";
            exit;
        }

        // Benutzer anhand der E-Mail suchen und Name, Passwort sowie Rolle abrufen
        $stmt = $conn->prepare("SELECT name, password, rolle FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->bind_result($name, $db_password, $rolle);
            $stmt->fetch();

            // Direkter Vergleich, da Passwort unverschlüsselt gespeichert ist
            if ($password === $db_password) {
                echo json_encode(["status" => "success", "name" => $name, "rolle" => $rolle]);
            } else {
                echo "Falsches Passwort.";
            }
        } else {
            echo "Benutzer nicht gefunden.";
        }
        $stmt->close();
    } elseif ($action === "auto") {
        $email = trim($_POST['email']);
        $password = trim($_POST['password']);

        if (empty($email) || empty($password)) {
            echo "Bitte alle Felder ausfüllen.";
            exit;
        }

        // Benutzer anhand der E-Mail suchen und Name, Passwort sowie Rolle abrufen
        $stmt = $conn->prepare("SELECT name, password, rolle FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->bind_result($name, $db_password, $rolle);
            $stmt->fetch();

            // Passwort mit password_verify() überprüfen
            // Einfacher Passwortvergleich
            if ($password == $db_password) {
                echo json_encode(["status" => "success", "name" => $name, "rolle" => $rolle]);
            } else {
                echo "Falsches Passwort.";
            }

        } else {
            echo "Benutzer nicht gefunden.";
        }
        $stmt->close();
    }



}

$conn->close();
?>