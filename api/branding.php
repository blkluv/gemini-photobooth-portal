<?php
// api/branding.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$mysqli = new mysqli('localhost', 'eeelab46_snapboothuser', 'snapbooth@2025@@', 'eeelab46_snapboothdb');
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $device_key = $mysqli->real_escape_string($input['device_key'] ?? '');
    $logo_url = $mysqli->real_escape_string($input['logo_url'] ?? '');
    $primary_color = $mysqli->real_escape_string($input['primary_color'] ?? '');
    $welcome_message = $mysqli->real_escape_string($input['welcome_message'] ?? '');
    if (!$device_key) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing device_key']);
        exit;
    }
    $mysqli->query("REPLACE INTO branding (device_key, logo_url, primary_color, welcome_message) VALUES ('$device_key', '$logo_url', '$primary_color', '$welcome_message')");
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $device_key = $mysqli->real_escape_string($_GET['device'] ?? '');
    $result = $mysqli->query("SELECT * FROM branding WHERE device_key='$device_key' LIMIT 1");
    $row = $result->fetch_assoc();
    echo json_encode(['success' => true, 'data' => $row]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);

