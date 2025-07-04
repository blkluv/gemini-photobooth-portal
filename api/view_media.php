<?php
// filepath: /photobooth/view_media.php

// Allow cross-origin requests if needed
header("Access-Control-Allow-Origin: *");

$uploadsDir = __DIR__ . '/uploads/';
$baseUrl = 'https://snapbooth.eeelab.xyz/uploads/';

$file = isset($_GET['file']) ? basename($_GET['file']) : null;
$filePath = $uploadsDir . $file;
$fileUrl = $baseUrl . $file;

function is_image($filename) {
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    return in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp']);
}

function is_video($filename) {
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    return in_array($ext, ['mp4', 'webm', 'mov']);
}

if ($file && file_exists($filePath) && isset($_GET['download'])) {
    $mimeType = mime_content_type($filePath);
    header('Content-Description: File Transfer');
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($filePath));
    readfile($filePath);
    exit;
}

if ($file && file_exists($filePath)) {
    // --- Analytics logging ---
    $device_key = $_GET['device_key'] ?? 'unknown';
    $analyticsData = [
        'device_key' => $device_key,
        'event_type' => 'media_view',
        'event_data' => [
            'filename' => $file,
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
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Photobooth Media Viewer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: sans-serif; background: #181818; color: #fff; text-align: center; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #232323; border-radius: 12px; padding: 24px; }
        img, video { max-width: 100%; border-radius: 8px; margin: 16px 0; }
        .error { color: #ff5555; margin: 32px 0; }
        .download-btn { background: #00b894; color: #fff; padding: 12px 24px; border: none; border-radius: 6px; font-size: 1.1em; cursor: pointer; margin-top: 16px; }
        .logo { font-size: 2em; font-weight: bold; margin-bottom: 16px; color: #00b894; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">📸 Photobooth</div>
        <?php if ($file && file_exists($filePath)): ?>
            <?php if (is_image($file)): ?>
                <img src="<?php echo htmlspecialchars($fileUrl); ?>" alt="Uploaded Photo">
            <?php elseif (is_video($file)): ?>
                <video src="<?php echo htmlspecialchars($fileUrl); ?>" controls autoplay loop>
                    Your browser does not support WebM video. Please use Chrome/Firefox, or download as GIF.
                </video>
            <?php else: ?>
                <div class="error">Unsupported file type.</div>
            <?php endif; ?>
            <br>
            <a href="?file=<?php echo urlencode($file); ?>&download=1">
                <button class="download-btn">Download</button>
            </a>
        <?php else: ?>
            <div class="error">Media not found.</div>
        <?php endif; ?>
        <div style="margin-top:32px; font-size:0.9em; color:#aaa;">
            Powered by eeelab.xyz Photobooth
        </div>
    </div>
</body>
</html>