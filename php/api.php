<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// --- ADATBÁZIS ADATOK ---
$host = "mysql.rackhost.hu";
$db_name = "c94620STDB";
$username = "c94620ST";
$password = "9Dave2005252.";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(["success" => false, "message" => "Adatbázis hiba!"]));
}

// --- 1. EMAIL AKTIVÁLÁS (GET kérés a linkről) ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'verify') {
    $token = $_GET['token'] ?? '';

    // 1. Megkeressük a felhasználót a token alapján
    $stmt = $conn->prepare("SELECT id, is_verified FROM users WHERE verification_token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    $statusMessage = "";
    $isAlreadyDone = false;

    if ($user) {
        if ($user['is_verified'] == 1) {
            // MÁR AKTIVÁLVA VAN
            $statusMessage = "A fiókod már korábban aktiválva lett!";
            $isAlreadyDone = true;
        } else {
            // MOST AKTIVÁLJUK
            $update = $conn->prepare("UPDATE users SET is_verified = 1 WHERE id = ?");
            $update->execute([$user['id']]);
            $statusMessage = "Sikeres Aktiválás!";
            $isAlreadyDone = false;
        }
    } else {
        die("Érvénytelen aktiváló kód.");
    }

    // HTML MEGJELENÍTÉS
    ?>
    <!DOCTYPE html>
    <html lang="hu">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Aktiválás | Stranger Trading</title>
        <link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Inter:wght@400;800&display=swap" rel="stylesheet">
        <style>
            :root { --bg: #0a0a0f; --accent: #e50914; }
            body { background: #000; color: #fff; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; overflow: hidden; }
            .hero-bg { position: fixed; inset: 0; z-index: -1; background: radial-gradient(circle at 50% 50%, #1a0505 0%, #000 100%); }
            
            .box { 
                position: relative; 
                border: 2px solid <?php echo $isAlreadyDone ? '#aaa' : 'var(--accent)'; ?>; 
                padding: 60px 40px; 
                border-radius: 20px; 
                text-align: center; 
                background: rgba(10, 10, 15, 0.95); 
                box-shadow: 0 0 40px rgba(0,0,0,1); 
                width: 90%; max-width: 400px; 
                backdrop-filter: blur(10px);
                overflow: hidden;
            }

            .logo-text { font-family: 'Alfa Slab One', cursive; color: var(--accent); font-size: 26px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; display: block; }
            h1 { font-size: 20px; text-transform: uppercase; margin-bottom: 15px; color: <?php echo $isAlreadyDone ? '#aaa' : '#fff'; ?>; }
            p { color: #888; font-size: 15px; margin-bottom: 30px; }

            .timer-container { position: absolute; bottom: 0; left: 0; right: 0; height: 8px; background: rgba(255,255,255,0.05); overflow: hidden; }
            .timer-bar { 
                height: 100%; 
                background: <?php echo $isAlreadyDone ? '#aaa' : 'var(--accent)'; ?>; 
                width: 100%; 
                animation: shrinkBar 4s linear forwards; 
                transform-origin: left;
            }
            
            @keyframes shrinkBar { from { transform: scaleX(1); } to { transform: scaleX(0); } }
            .btn { display: inline-block; background: var(--accent); color: white; padding: 12px 25px; border-radius: 5px; font-weight: 800; text-decoration: none; text-transform: uppercase; }
        </style>
    </head>
    <body>
        <div class="hero-bg"></div>
        <div class="box">
            <span class="logo-text">STRANGER TRADING</span>
            <h1><?php echo $statusMessage; ?></h1>
            <p><?php echo $isAlreadyDone ? "Nincs teendőd, beléphetsz a fiókodba." : "A kapu kinyílt számodra. Hamarosan visszairányítunk..."; ?></p>
            
            <a href="index.html" class="btn">Vissza a főoldalra</a>

            <div class="timer-container">
                <div class="timer-bar"></div>
            </div>
        </div>

        <script>
            setTimeout(() => { 
                window.close(); 
                setTimeout(() => { window.location.href = 'index.html'; }, 500);
            }, 4100);
        </script>
    </body>
    </html>
    <?php
    exit;
}

// --- 2. JAVASCRIPT KÉRÉSEK (POST kérés) ---
header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"));

if ($data) {
    $action = $data->action;

    if ($action === "register") {
        $user = trim($data->username);
        $email = trim($data->email);
        $pass = password_hash($data->password, PASSWORD_BCRYPT);
        $token = bin2hex(random_bytes(16));

        try {
            $stmt = $conn->prepare("INSERT INTO users (username, email, password, verification_token) VALUES (?, ?, ?, ?)");
            $stmt->execute([$user, $email, $pass, $token]);
            
            // Link generálása
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
            $current_url = $protocol . "://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
            $verify_link = explode('?', $current_url)[0] . "?action=verify&token=" . $token;

            // HTML Email küldése
            // HTML Email küldése - Modern & Tiszta
$subject = "Aktiváld a tagságodat | Stranger Trading";
$message = "
<html>
<body style='background-color: #f4f4f4; padding: 40px; font-family: sans-serif;'>
    <div style='max-width: 450px; margin: 0 auto; background: #0a0a0f; border: 2px solid #e50914; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);'>
        <div style='background: #000; padding: 25px; text-align: center; border-bottom: 1px solid #222;'>
            <h1 style='color: #e50914; margin: 0; letter-spacing: 3px; font-size: 22px; text-transform: uppercase;'>Stranger Trading</h1>
        </div>
        <div style='padding: 40px; text-align: center;'>
            <h2 style='color: #ffffff; margin-top: 0; font-size: 20px;'>Üdvözlünk a túloldalon!</h2>
            <p style='color: #aaaaaa; font-size: 15px; line-height: 1.6;'>Szia $user! A regisztrációd majdnem kész. Kattints az alábbi vörös gombra a fiókod aktiválásához.</p>
            <a href='$verify_link' style='display: inline-block; margin-top: 25px; padding: 16px 35px; background: #e50914; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;'>Tagság Aktiválása</a>
        </div>
        <div style='background: #000; padding: 15px; text-align: center; font-size: 10px; color: #444; border-top: 1px solid #222;'>
            &copy; 2025 STRANGER TRADING CLUB
        </div>
    </div>
</body>
</html>";
            
            $headers = "MIME-Version: 1.0" . "\r\n" . "Content-type:text/html;charset=UTF-8" . "\r\n" . "From: Stranger Trading <noreply@" . $_SERVER['HTTP_HOST'] . ">";
            
            @mail($email, $subject, $message, $headers);
            echo json_encode(["success" => true]);
        } catch(Exception $e) {
            echo json_encode(["success" => false, "message" => "Foglalt felhasználónév vagy email!"]);
        }
    } 
    
    elseif ($action === "login") {
        $user = trim($data->username);
        $pass = $data->password;
        $stmt = $conn->prepare("SELECT password, is_verified FROM users WHERE username = ?");
        $stmt->execute([$user]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row && password_verify($pass, $row['password'])) {
            if ($row['is_verified'] == 0) {
                echo json_encode(["success" => false, "unverified" => true, "message" => "Aktiváld az emailed!"]);
            } else {
                echo json_encode(["success" => true]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Hibás név vagy jelszó!"]);
        }
    }

    elseif ($action === "check_status") {
        $user = trim($data->username);
        $stmt = $conn->prepare("SELECT is_verified FROM users WHERE username = ?");
        $stmt->execute([$user]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["is_verified" => ($row && $row['is_verified'] == 1)]);
    }
}