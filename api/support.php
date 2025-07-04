<?php
// api/support.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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
    $log_message = $mysqli->real_escape_string($input['log_message'] ?? '');
    if (!$device_key || !$log_message) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing device_key or log_message']);
        exit;
    }
    $mysqli->query("INSERT INTO support_logs (device_key, log_message) VALUES ('$device_key', '$log_message')");
    echo json_encode(['success' => true]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);
