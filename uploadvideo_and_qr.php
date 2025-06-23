<?php
require_once(__DIR__ . '/upload_debug_functions.php');

// Set appropriate headers for CORS and content type
$allowed_origins = array(
    'http://localhost:5173',  // Vite dev server
    'http://localhost:8000',   // PHP test server
    'https://eeelab.xyz'     // Production domain
);

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, Authorization");
    header("Access-Control-Allow-Credentials: true");
}
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

// Check for upload errors
if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
    $errorMessage = match($uploadedFile['error']) {
        UPLOAD_ERR_INI_SIZE => 'The uploaded file exceeds the upload_max_filesize directive',
        UPLOAD_ERR_FORM_SIZE => 'The uploaded file exceeds the MAX_FILE_SIZE directive',
        UPLOAD_ERR_PARTIAL => 'The uploaded file was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload',
        default => 'Unknown upload error'
    };
    log_debug("Upload error", [
        'error_code' => $uploadedFile['error'],
        'error_message' => $errorMessage
    ]);
    json_error_response($errorMessage, null, 400);
}

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
    // Validate file format and mime type
    $allowedTypes = [
        'webm' => ['video/webm'],
        'mp4' => ['video/mp4'],
        'mov' => ['video/quicktime'],
        'gif' => ['image/gif']
    ];

    if (!array_key_exists($ext, $allowedTypes)) {
        log_debug("Rejected: unsupported format", ['ext' => $ext]);
        json_error_response('Unsupported video format. Allowed: webm, mp4, mov, gif');
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $uploadedFile['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes[$ext])) {
        log_debug("Rejected: invalid mime type", [
            'ext' => $ext,
            'mime' => $mimeType,
            'allowed' => $allowedTypes[$ext]
        ]);
        json_error_response('Invalid file type. File extension does not match content.');
    }

    // Validate upload
    $validationErrors = validate_upload($uploadedFile, 100 * 1024 * 1024); // 100MB limit
    if (!empty($validationErrors)) {
        json_error_response('Upload validation failed', $validationErrors);
    }

    // Generate unique filename and full path
    $newFileName = uniqid() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    $destination = $uploadDirectory . $newFileName;

    // Check if file is actually an uploaded file
    if (!is_uploaded_file($uploadedFile['tmp_name'])) {
        log_debug("Security check failed - not an uploaded file", [
            'tmp' => $uploadedFile['tmp_name']
        ]);
        json_error_response('Security check failed', null, 400);
    }

    // Ensure the file is readable
    if (!is_readable($uploadedFile['tmp_name'])) {
        log_debug("Uploaded file is not readable", [
            'tmp' => $uploadedFile['tmp_name']
        ]);
        json_error_response('Uploaded file is not readable', null, 400);
    }

    // Attempt to move uploaded file
    if (!move_uploaded_file($uploadedFile['tmp_name'], $destination)) {
        $moveError = error_get_last();
        log_debug("move_uploaded_file failed", [
            'tmp' => $uploadedFile['tmp_name'],
            'dest' => $destination,
            'error' => $moveError ? $moveError['message'] : 'Unknown error',
            'upload_dir_writable' => is_writable(dirname($destination))
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

    // --- ffprobe video validation ---
    $ffprobePath = '/opt/homebrew/bin/ffprobe'; // Homebrew default on Apple Silicon
    if (!file_exists($ffprobePath)) {
        $ffprobePath = '/usr/local/bin/ffprobe'; // Intel Mac Homebrew default
    }
    if (!file_exists($ffprobePath)) {
        $ffprobePath = 'ffprobe'; // fallback to PATH
    }
    $cmd = escapeshellcmd($ffprobePath) . ' -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ' . escapeshellarg($destination);
    $duration = trim(shell_exec($cmd));
    if (!is_numeric($duration) || $duration <= 0) {
        log_debug("ffprobe validation failed", [
            'file' => $destination,
            'duration' => $duration
        ]);
        @unlink($destination);
        json_error_response('Uploaded file is not a valid playable video (ffprobe validation failed).', null, 400);
    }
    log_debug("ffprobe validation success", [
        'file' => $destination,
        'duration' => $duration
    ]);
    // --- end ffprobe validation ---

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
