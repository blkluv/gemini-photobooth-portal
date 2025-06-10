<?php
// filepath: /photobooth/view_media.php

// Allow cross-origin requests if needed
header("Access-Control-Allow-Origin: *");

$uploadsDir = __DIR__ . '/uploads/';
$baseUrl = 'https://eeelab.xyz/photobooth/uploads/';

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
                <video src="<?php echo htmlspecialchars($fileUrl); ?>" controls autoplay loop></video>
            <?php else: ?>
                <div class="error">Unsupported file type.</div>
            <?php endif; ?>
            <br>
            <a href="<?php echo htmlspecialchars($fileUrl); ?>" download>
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