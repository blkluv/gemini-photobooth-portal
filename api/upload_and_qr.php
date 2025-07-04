<?php
// Add these at the VERY TOP of upload_and_qr.php
header("Access-Control-Allow-Origin: *"); // Or your specific domain
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, Authorization"); // Your existing one is fine

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204); // Or 200
    exit;
}

$uploadDirectory = $_SERVER['DOCUMENT_ROOT'] . '/uploads/';


if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $uploadedFile = $_FILES['image'];
    $newFileName = uniqid() . '.png'; // Generate a unique filename
    $destination = $uploadDirectory . $newFileName;

    if (move_uploaded_file($uploadedFile['tmp_name'], $destination)) {
        // Generate the QR code link using $newFileName
        $qrCodeLink = 'https://snapbooth.eeelab.xyz/view_media.php?file=' . $newFileName;

        // --- Analytics logging ---
        $device_key = $_POST['device_key'] ?? 'unknown';
        $analyticsData = [
            'device_key' => $device_key,
            'event_type' => 'upload',
            'event_data' => [
                'filename' => $newFileName,
                'type' => 'image',
                'ip' => $_SERVER['REMOTE_ADDR']
            ]
        ];
        $options = [
            'http' => [
                'header'  => "Content-type: application/json\r\n",
                'method'  => 'POST',
                'content' => json_encode($analyticsData),
                'timeout' => 2
            ]
        ];
        $context  = stream_context_create($options);
        @file_get_contents('https://snapbooth.eeelab.xyz/api/analytics.php', false, $context);
        // --- End analytics logging ---

        $response = array(
            'success' => true,
            'message' => 'Image uploaded successfully',
            'qrCodeLink' => $qrCodeLink
        );

        echo json_encode($response);
    } else {
        $response = array(
            'success' => false,
            'message' => 'Error uploading image'
        );

        echo json_encode($response);
    }
} else {
    $response = array(
        'success' => false,
        'message' => 'Invalid request'
    );

    echo json_encode($response);
}
?>
