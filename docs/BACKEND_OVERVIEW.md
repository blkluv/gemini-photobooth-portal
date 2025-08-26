# Backend Overview

This document summarizes the PHP backend scripts and their roles in the project.

## PHP Backend Scripts

### Core Upload and Media Handling
- **`uploadvideo_and_qr.php`**: Handles video uploads and QR code generation/processing. Only converts WebM to MP4 if needed.
- **`view_media.php`**: Provides functionality to view uploaded media files (photo, video, slowmo, boomerang, GIF).
- **`upload_debug_functions.php`**: Contains debugging functions for the upload process.
- **`upload_debug.log`**: Log file for tracking upload-related issues.

### Authentication and Access Control
- **`validate_key.php`**: Validates event and trial keys for app access.
- **`request_trial.php`**: Handles trial key requests and sends trial keys via email.

### Additional Features
- **`branding.php`**: Handles customization settings and branding options.
- **`analytics.php`**: Provides usage statistics and analytics data.
- **`support.php`**: Manages support requests and logging.

## Key/Trial System

### Event Keys
- Long-term access keys for events or installations
- Stored securely and validated server-side
- Can be customized per event

### Trial Keys
- 1-hour temporary access keys
- Delivered via email with secure token generation
- Enforced with localStorage expiry on the frontend
- Automatic cleanup and rate limiting

### Admin Access
- Admin PIN unlocks admin settings modal
- Multi-tab support: General, Security, Analytics, Branding, Support
- Device key management and support logs

## Upload and Conversion Logic

### File Processing
- Supports multiple media types: photos, videos, GIFs, boomerangs
- Automatic format detection and validation
- Only attempts MP4 conversion for WebM files
- Robust error handling and logging

### QR Code Generation
- Automatic QR code generation for all uploaded media
- Customizable QR code styling and content
- Support for different sharing platforms

## API Structure

### Directory Organization
- All backend PHP endpoints are in the `api/` directory
- Clearly separated from frontend code
- Consistent error handling and response formats

### Security Features
- Input validation and sanitization
- File upload security checks
- CORS configuration for cross-origin requests
- Rate limiting for trial key requests

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Debug mode for development
- Graceful fallbacks for failed operations


## Integration with Frontend

### Print API (DSLR Backend)

- The frontend sends print jobs to `http://localhost:3000/api/print`.
- Print jobs require an `X-DSLR-Token` header for authentication.
- The image is sent as a base64 string in the `imageBase64` field.
- The print size is sent as `printSize` (4R, 5R, 6R, A4).
- The backend validates the token and processes the print job.

### Example Print Request
```json
{
  "imageBase64": "data:image/png;base64,...",
  "printSize": "4R"
}
```

### Response Format
```json
{
  "success": true,
  "message": "Print job accepted",
  "jobId": "print_12345"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid token or request",
  "code": "AUTH_ERROR|INVALID_REQUEST|PRINT_ERROR"
}
```

## Configuration

### Environment Variables
- Database connection settings
- Email configuration for trial keys
- File upload limits and paths
- Security settings and API keys

### File Structure
```
api/
├── uploadvideo_and_qr.php
├── view_media.php
├── validate_key.php
├── request_trial.php
├── branding.php
├── analytics.php
├── support.php
├── upload_debug_functions.php
└── upload_debug.log
```

## Monitoring and Logging

### Debug Logging
- Detailed upload process logging
- Error tracking and reporting
- Performance monitoring
- Security event logging

### Analytics
- Usage statistics collection
- Feature usage tracking
- Error rate monitoring
- Performance metrics

---

*For DSLR backend integration, see [DSLR Integration Guide](DSLR_INTEGRATION.md)* 