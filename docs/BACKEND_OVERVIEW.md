# Backend Overview

This document summarizes the PHP backend scripts and their roles in the project.

- `uploadvideo_and_qr.php`: Handles video uploads and QR code generation/processing. Only converts WebM to MP4 if needed.
- `view_media.php`: Provides functionality to view uploaded media files (photo, video, slowmo, boomerang, GIF).
- `upload_debug_functions.php`: Contains debugging functions for the upload process.
- `validate_key.php`: Validates event and trial keys for app access.
- `request_trial.php`: Handles trial key requests and sends trial keys via email.
- `upload_debug.log`: Log file for tracking upload-related issues.

## Key/Trial System
- Supports event keys and 1-hour trial keys.
- Trial keys are delivered via email and enforced with localStorage expiry on the frontend.
- Admin PIN unlocks admin settings modal.

## Improved Upload/Conversion Logic
- Only attempts MP4 conversion for WebM files.
- Robust error handling and logging for uploads and conversions.

## API Structure
- All backend PHP endpoints are in the `api/` directory, clearly separated from frontend code.
- Key validation and trial request APIs are robust and documented. 