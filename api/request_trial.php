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

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get email from request
$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Generate trial key
$trialKey = 'TRIAL-' . strtoupper(substr(md5(uniqid()), 0, 4));

// Store trial key with expiry (1 hour from now)
$trialData = [
    'key' => $trialKey,
    'email' => $email,
    'created' => time(),
    'expires' => time() + 3600, // 1 hour
    'used' => false
];

// Save to file (in production, use a database)
$trialsFile = 'trials.json';
$trials = [];
if (file_exists($trialsFile)) {
    $trials = json_decode(file_get_contents($trialsFile), true) ?: [];
}

// Add new trial
$trials[] = $trialData;

// Save back to file
file_put_contents($trialsFile, json_encode($trials, JSON_PRETTY_PRINT));

// Send email with trial key
$subject = "Your Snapbooth Trial Key";
$message = "
Hi there!

Thank you for requesting a trial key for Snapbooth!

Your trial key is: {$trialKey}

This key will give you 1 hour of unlimited access to all Snapbooth features:
• Video recording & slowmo
• Boomerang & GIF creation  
• QR code sharing
• All premium features

To use your trial:
1. Go to https://snapbooth.eeelab.xyz
2. Click 'Get Started' 
3. Enter your trial key when prompted

Your trial expires in 1 hour from now.

If you love Snapbooth, get your event key at https://snapbooth.eeelab.xyz/#pricing

Best regards,
The Snapbooth Team
";

$headers = "From: noreply@snapbooth.eeelab.xyz\r\n";
$headers .= "Reply-To: support@snapbooth.eeelab.xyz\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Send email
$emailSent = mail($email, $subject, $message, $headers);

if ($emailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'Trial key sent to your email!',
        'key' => $trialKey // For immediate use if needed
    ]);
} else {
    // If email fails, still return the key
    echo json_encode([
        'success' => true,
        'message' => 'Trial key generated! Check your email or use this key: ' . $trialKey,
        'key' => $trialKey
    ]);
} 