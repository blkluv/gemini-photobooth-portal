<?php
// api/analytics.php
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
    $event_type = $mysqli->real_escape_string($input['event_type'] ?? '');
    $event_data = $mysqli->real_escape_string(json_encode($input['event_data'] ?? []));
    if (!$device_key || !$event_type) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing device_key or event_type']);
        exit;
    }
    $mysqli->query("INSERT INTO analytics (device_key, event_type, event_data) VALUES ('$device_key', '$event_type', '$event_data')");
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $device_key = $mysqli->real_escape_string($_GET['device'] ?? '');
    $result = $mysqli->query("SELECT * FROM analytics WHERE device_key='$device_key' ORDER BY created_at DESC LIMIT 100");
    $rows = [];
    while ($row = $result->fetch_assoc()) $rows[] = $row;
    echo json_encode(['success' => true, 'data' => $rows]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid request']);

