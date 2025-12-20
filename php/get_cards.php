<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// --- ADATBÁZIS KONFIG ---
$host = "mysql.rackhost.hu";
$db_name = "c94620STDB";
$username = "c94620ST";
$password = "9Dave2005252.";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode([]);
    exit;
}

try {
    // Select columns matching existing table: name, type, username
    $stmt = $conn->prepare("SELECT id, name, type, username, city, image_path FROM cards ORDER BY id DESC");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Normalize the keys expected by frontend
    $out = array_map(function($r){
        return [
            'id' => (int)$r['id'],
            // frontend expects 'title' and 'series' keys — map from DB columns
            'title' => $r['name'],
            'series' => $r['type'],
            'owner' => $r['username'],
            'city' => $r['city'],
            'image' => $r['image_path'] ?: null
        ];
    }, $rows);

    echo json_encode($out);
} catch (Exception $e) {
    echo json_encode([]);
}

?>
