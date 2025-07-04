<?php
// api/config.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$mysqli = new mysqli('localhost', 'eeelab46_snapboothuser', 'snapbooth@2025@@', 'eeelab46_snapboothdb');
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $device_key = $mysqli->real_escape_string($_GET['device'] ?? '');
    $result = $mysqli->query("SELECT * FROM device_config WHERE device_key='$device_key' LIMIT 1");
    $row = $result->fetch_assoc();
    if ($row && $row['config_json']) {
        echo $row['config_json'];
    } else {
        echo json_encode(['success' => true, 'config' => []]);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);
