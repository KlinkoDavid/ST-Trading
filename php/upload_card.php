<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// --- ADATBÁZIS KONFIG --- (megegyezik az `api.php`-val)
$host = "mysql.rackhost.hu";
$db_name = "c94620STDB";
$username = "c94620ST";
$password = "9Dave2005252.";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Adatbázis kapcsolat sikertelen."]);
    exit;
}

// Csak POST fogadása
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Csak POST engedélyezett."]);
    exit;
}


$name = trim($_POST['title'] ?? '');
$type = trim($_POST['type'] ?? '');
$city = trim($_POST['city'] ?? '');
$username_field = trim($_POST['username'] ?? '');

if ($name === '' || $type === '' || $city === '') {
    echo json_encode(["success" => false, "message" => "Hiányzó kötelező mező(k)."]);
    exit;
}

// Ellenőrizzük, hogy a feltöltésnél megadott felhasználónév valóban létezik-e az adatbázisban
if ($username_field === '') {
    echo json_encode(["success" => false, "message" => "Nem ismert feltöltő — jelentkezz be!"]); 
    exit;
}

$checkUser = $conn->prepare("SELECT id, is_verified FROM users WHERE username = ?");
$checkUser->execute([$username_field]);
$userRow = $checkUser->fetch(PDO::FETCH_ASSOC);
if (!$userRow) {
    echo json_encode(["success" => false, "message" => "Ismeretlen felhasználó. Jelentkezz be vagy regisztrálj."]);
    exit;
}

// Kép kezelése (opcionális)
$imagePath = null;
if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
    $file = $_FILES['image'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(["success" => false, "message" => "Hiba a fájl feltöltésekor."]);
        exit;
    }

    // Egyszerű validáció
    $maxSize = 3 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        echo json_encode(["success" => false, "message" => "A fájl túl nagy (max 3MB)."]);
        exit;
    }

    $allowed = ['image/jpeg' => '.jpg', 'image/png' => '.png', 'image/webp' => '.webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!array_key_exists($mime, $allowed)) {
        echo json_encode(["success" => false, "message" => "Csak JPG/PNG/WEBP képek engedélyezettek."]);
        exit;
    }

    $ext = $allowed[$mime];
    $uploadsDir = __DIR__ . '/../img/uploads/';
    if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);

    $baseName = bin2hex(random_bytes(12)) . $ext;
    $dest = $uploadsDir . $baseName;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        echo json_encode(["success" => false, "message" => "Nem sikerült menteni a képet."]);
        exit;
    }

    // Web path
    $imagePath = 'img/uploads/' . $baseName;
}
    try {
        // Beszúrás a meglévő tábla szerkezet szerint: name, type, username, city, image_path
        $stmt = $conn->prepare("INSERT INTO cards (name, type, username, city, image_path) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $type, $username_field, $city, $imagePath]);

        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Adatbázis hiba: " . $e->getMessage()]);
    }

?>
