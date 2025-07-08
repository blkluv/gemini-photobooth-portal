<?php
// Add CORS headers for cross-origin requests
$allowed_origins = array(
    'http://localhost:5173',  // Vite dev server
    'http://localhost:8000',   // PHP test server
    'https://snapbooth.eeelab.xyz', // Production domain
    'https://eeelab.xyz'     // Production domain
);

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, Authorization");
    header("Access-Control-Allow-Credentials: true");
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json');
$key = isset($_REQUEST['key']) ? trim($_REQUEST['key']) : '';

// Hardcoded valid keys for demo
$validKeys = [
  'EVENT-1234',
  'EVENT-5678',
  'EVENT-9999',
];

$response = [
  'valid' => false,
  'type' => null,
  'expires' => null
];

if (in_array($key, $validKeys)) {
  $response['valid'] = true;
  $response['type'] = 'event';
  $response['expires'] = null; // No expiry for event keys
} elseif (preg_match('/^TRIAL-[A-Z0-9]{4,}$/i', $key)) {
  // Check trial keys from file
  $trialsFile = 'trials.json';
  if (file_exists($trialsFile)) {
    $trials = json_decode(file_get_contents($trialsFile), true) ?: [];
    
    foreach ($trials as $trial) {
      if ($trial['key'] === $key) {
        // Check if trial has expired
        if (time() > $trial['expires']) {
          $response['valid'] = false;
          $response['error'] = 'Trial key has expired';
          break;
        }
        
        $response['valid'] = true;
        $response['type'] = 'trial';
        $response['expires'] = $trial['expires'];
        break;
      }
    }
  }
  
  // If not found in file, generate a temporary trial (for testing)
  if (!$response['valid']) {
    $response['valid'] = true;
    $response['type'] = 'trial';
    $response['expires'] = time() + 3600; // 1 hour from now
  }
}

echo json_encode($response); 