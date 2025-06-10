<?php
require_once(__DIR__ . '/upload_debug_functions.php');

// Set appropriate headers for CORS and content type
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Increase memory limit and execution time for large files
ini_set('memory_limit', '512M');
ini_set('max_execution_time', 300);
ini_set('post_max_size', '100M');
ini_set('upload_max_filesize', '100M');

$uploadDirectory = $_SERVER['DOCUMENT_ROOT'] . '/photobooth/uploads/';

// Ensure upload directory exists and is writable
if (!ensure_upload_directory($uploadDirectory)) {
    json_error_response('Server configuration error: Upload directory not accessible', null, 500);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    log_debug("Invalid request method", ['method' => $_SERVER['REQUEST_METHOD']]);
    json_error_response('Invalid request method', null, 405);
}

if (!isset($_FILES['video'])) {
    log_debug("No file uploaded", ['post_data' => $_POST, 'files' => $_FILES]);
    json_error_response('No file uploaded', null, 400);
}

$uploadedFile = $_FILES['video'];
$originalName = $uploadedFile['name'];
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

// Log upload attempt
log_debug("Upload attempt", [
    'name' => $originalName,
    'ext' => $ext,
    'size' => $uploadedFile['size'],
    'type' => $uploadedFile['type'],
    'error' => $uploadedFile['error']
]);
    // Validate file format
    if (!in_array($ext, ['mp4', 'webm', 'mov', 'gif'])) {
        log_debug("Rejected: unsupported format", ['ext' => $ext]);
        json_error_response('Unsupported video format. Allowed: mp4, webm, mov, gif.');
    }

    // Validate upload
    $validationErrors = validate_upload($uploadedFile, 100 * 1024 * 1024); // 100MB limit
    if (!empty($validationErrors)) {
        json_error_response('Upload validation failed', $validationErrors);
    }

    // Generate unique filename and full path
    $newFileName = uniqid() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    $destination = $uploadDirectory . $newFileName;

    // Attempt to move uploaded file
    if (!move_uploaded_file($uploadedFile['tmp_name'], $destination)) {
        $moveError = error_get_last();
        log_debug("move_uploaded_file failed", [
            'tmp' => $uploadedFile['tmp_name'],
            'dest' => $destination,
            'error' => $moveError ? $moveError['message'] : 'Unknown error'
        ]);
        json_error_response('Failed to save uploaded file', null, 500);
    }

    // Verify file exists and is readable
    if (!file_exists($destination) || !is_readable($destination)) {
        log_debug("File verification failed after move", [
            'exists' => file_exists($destination),
            'readable' => is_readable($destination),
            'path' => $destination
        ]);
        json_error_response('File verification failed after upload', null, 500);
    }

    // Generate QR code link
    $qrCodeLink = 'https://eeelab.xyz/photobooth/view_media.php?file=' . urlencode($newFileName);
    
    log_debug("Upload success", [
        'filename' => $newFileName,
        'size' => filesize($destination),
        'link' => $qrCodeLink
    ]);

    // Return success response
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Video uploaded successfully',
        'qrCodeLink' => $qrCodeLink
    ]);
?>
