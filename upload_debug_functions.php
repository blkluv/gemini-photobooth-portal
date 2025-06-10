<?php
// Helper functions for logging and error handling in uploads

$logFile = __DIR__ . '/upload_debug.log';

function log_debug($msg, $data = null) {
    global $logFile;
    $logEntry = date('Y-m-d H:i:s') . ' ' . $msg;
    if ($data !== null) {
        $logEntry .= ' ' . json_encode($data);
    }
    file_put_contents($logFile, $logEntry . "\n", FILE_APPEND);
}

function json_error_response($message, $details = null, $httpCode = 400) {
    http_response_code($httpCode);
    header('Content-Type: application/json');
    $response = [
        'success' => false,
        'message' => $message
    ];
    if ($details !== null) {
        $response['details'] = $details;
    }
    echo json_encode($response);
    exit;
}

function get_file_size_readable($size) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $i = 0;
    while ($size >= 1024 && $i < count($units) - 1) {
        $size /= 1024;
        $i++;
    }
    return round($size, 2) . ' ' . $units[$i];
}

function validate_upload($file, $maxSize = 104857600) { // 100MB default
    $errors = [];
    
    // Check basic upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the upload'
        ];
        $errors[] = $errorMessages[$file['error']] ?? 'Unknown upload error';
        log_debug("Upload error", ['error' => $file['error'], 'message' => $errors[0]]);
    }

    // Check file size
    if ($file['size'] > $maxSize) {
        $errors[] = sprintf('File size (%dMB) exceeds limit (%dMB)',
            round($file['size'] / 1048576, 2),
            round($maxSize / 1048576, 2));
        log_debug("File too large", ['size' => $file['size'], 'max' => $maxSize]);
    }

    // Log validation result
    log_debug("Upload validation complete", [
        'filename' => $file['name'],
        'size' => $file['size'],
        'type' => $file['type'],
        'errors' => $errors
    ]);

    return $errors;
}

function ensure_upload_directory($dir) {
    if (!file_exists($dir)) {
        if (!mkdir($dir, 0755, true)) {
            log_debug("Failed to create upload directory", ['dir' => $dir]);
            return false;
        }
    }
    if (!is_writable($dir)) {
        log_debug("Upload directory not writable", ['dir' => $dir]);
        return false;
    }
    return true;
}
