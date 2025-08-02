# API Reference

This document provides a comprehensive reference for all API endpoints in the Gemini Photobooth Portal.

## Base URLs

- **PHP Backend**: `http://localhost/api/` (or your server URL)
- **DSLR Backend**: `http://localhost:3000/api/` (see [DSLR Integration](DSLR_INTEGRATION.md))

## PHP Backend API

### Authentication

All endpoints support CORS and include proper error handling.

### 1. Media Upload

#### Upload Media and Generate QR
```http
POST /api/uploadvideo_and_qr.php
Content-Type: multipart/form-data

{
  "file": [binary file data],
  "type": "photo|video|gif|boomerang",
  "settings": {
    "quality": 85,
    "max_size": 10485760
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "IMG_20240115_103000.jpg",
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "url": "https://example.com/view/abc123",
    "size": 5242880,
    "type": "image/jpeg"
  },
  "message": "Upload successful"
}
```

#### View Media
```http
GET /api/view_media.php?filename=IMG_20240115_103000.jpg
```

**Response:** File download or media display

### 2. Key Management

#### Validate Event/Trial Key
```http
POST /api/validate_key.php
Content-Type: application/json

{
  "key": "EVENT_KEY_12345",
  "device_id": "device_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "type": "event|trial",
    "expires": "2024-02-15T10:30:00Z",
    "permissions": ["upload", "edit", "share"]
  }
}
```

#### Request Trial Key
```http
POST /api/request_trial.php
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "event": "Wedding Reception"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trial_key": "TRIAL_ABC123",
    "expires": "2024-01-15T11:30:00Z",
    "email_sent": true
  },
  "message": "Trial key sent to email"
}
```

### 3. Branding and Customization

#### Get Branding Settings
```http
GET /api/branding.php
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logo": "data:image/png;base64,...",
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#1F2937"
    },
    "company_name": "Gemini Photobooth",
    "contact_info": {
      "email": "info@geminiphotobooth.com",
      "phone": "+1-555-0123"
    }
  }
}
```

#### Update Branding
```http
POST /api/branding.php
Content-Type: application/json

{
  "logo": "data:image/png;base64,...",
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#1F2937"
  },
  "company_name": "New Company Name"
}
```

### 4. Analytics

#### Get Usage Statistics
```http
GET /api/analytics.php?period=7d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "7d",
    "uploads": {
      "total": 150,
      "photos": 120,
      "videos": 20,
      "gifs": 10
    },
    "shares": {
      "qr_scans": 85,
      "social_shares": 45
    },
    "devices": {
      "unique": 25,
      "active": 18
    }
  }
}
```

### 5. Support

#### Submit Support Request
```http
POST /api/support.php
Content-Type: application/json

{
  "type": "technical|billing|feature",
  "subject": "Camera not working",
  "message": "Camera connection failed...",
  "device_id": "device_abc123",
  "user_email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticket_id": "SUPPORT_12345",
    "status": "open",
    "created": "2024-01-15T10:30:00Z"
  }
}
```

## DSLR Backend API

For complete DSLR API documentation, see [DSLR Integration Guide](DSLR_INTEGRATION.md).

### Quick Reference

#### Camera Status
```http
GET /api/status
Authorization: Bearer your_token
```

#### Capture Photo
```http
POST /api/capture
Authorization: Bearer your_token
```

#### Burst Mode
```http
POST /api/burst
Authorization: Bearer your_token
Content-Type: application/json

{
  "count": 5,
  "interval": 1000
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error details",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes

#### PHP Backend
- `INVALID_FILE_TYPE`: Unsupported file format
- `FILE_TOO_LARGE`: File exceeds size limit
- `UPLOAD_FAILED`: File upload failed
- `INVALID_KEY`: Invalid or expired key
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

#### DSLR Backend
- `CAMERA_NOT_FOUND`: No camera detected
- `CAPTURE_FAILED`: Photo/video capture failed
- `AUTHENTICATION_FAILED`: Invalid API token
- `CAMERA_BUSY`: Camera is busy with another operation
- `STORAGE_FULL`: Camera storage is full

## Rate Limiting

### PHP Backend
- **Trial requests**: 3 per hour per IP
- **Uploads**: 100 per hour per key
- **API calls**: 1000 per hour per key

### DSLR Backend
- **Capture operations**: 60 per minute
- **Settings updates**: 10 per minute
- **Status checks**: 120 per minute

## Security

### Authentication
- All DSLR endpoints require Bearer token
- PHP endpoints use key-based authentication
- CORS properly configured for cross-origin requests

### File Upload Security
- File type validation
- Size limit enforcement
- Malware scanning (optional)
- Secure file storage

### Data Protection
- HTTPS encryption for all communications
- Secure key storage and validation
- User data privacy compliance

## Testing

### Using curl

#### Test PHP Upload
```bash
curl -X POST \
  -F "file=@photo.jpg" \
  -F "type=photo" \
  http://localhost/api/uploadvideo_and_qr.php
```

#### Test DSLR Status
```bash
curl -H "Authorization: Bearer your_token" \
  http://localhost:3000/api/status
```

#### Test Key Validation
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"key":"EVENT_KEY_12345"}' \
  http://localhost/api/validate_key.php
```

### Using Postman

1. Import the API collection
2. Set environment variables
3. Test all endpoints
4. Verify error handling

## Monitoring

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.2.0",
  "services": {
    "php": "ok",
    "dslr": "connected",
    "storage": "ok"
  }
}
```

### Log Files
- **PHP errors**: `/api/upload_debug.log`
- **DSLR logs**: Console output
- **Access logs**: Web server logs

---

*For detailed DSLR integration, see [DSLR Integration Guide](DSLR_INTEGRATION.md)* 