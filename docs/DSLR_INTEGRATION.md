# DSLR Integration Guide

This guide covers the integration between the React frontend and the DSLR Helper backend for camera control and media capture.

## Overview

The DSLR Helper backend provides a REST API and WebSocket interface for controlling DSLR cameras via gphoto2. The React frontend communicates with this backend to capture photos, videos, and manage camera settings.

## Backend Repository

**DSLR Helper Backend**: [snapbooth-dslr-helper](https://github.com/fihircio/dslr-snapbooth/tree/main/snapbooth-dslr-helper)

## API Endpoints

### Authentication
All endpoints require a valid API token passed in the `Authorization` header:
```
Authorization: Bearer your_token_here
```

### Core Endpoints

#### 1. Status Check
```http
GET /api/status
```
**Response:**
```json
{
  "status": "connected",
  "camera": "Canon EOS R5",
  "battery": 85,
  "storage": {
    "free": "15.2 GB",
    "total": "64 GB"
  }
}
```

#### 2. Capture Photo
```http
POST /api/capture
```
**Response:**
```json
{
  "success": true,
  "filename": "IMG_001.jpg",
  "path": "/path/to/image",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 3. Burst Mode
```http
POST /api/burst
Content-Type: application/json

{
  "count": 5,
  "interval": 1000
}
```
**Response:**
```json
{
  "success": true,
  "files": [
    "IMG_001.jpg",
    "IMG_002.jpg",
    "IMG_003.jpg",
    "IMG_004.jpg",
    "IMG_005.jpg"
  ]
}
```

#### 4. Video Recording
```http
POST /api/video/start
```
**Response:**
```json
{
  "success": true,
  "session_id": "video_12345"
}
```

```http
POST /api/video/stop
```
**Response:**
```json
{
  "success": true,
  "filename": "VID_001.mp4",
  "duration": 30
}
```

#### 5. Live View
```http
GET /api/liveview
```
**Response:** JPEG stream or WebSocket connection

#### 6. Camera Settings
```http
GET /api/settings
```
**Response:**
```json
{
  "aperture": "f/2.8",
  "shutter_speed": "1/125",
  "iso": 100,
  "white_balance": "auto",
  "focus_mode": "auto"
}
```

```http
POST /api/settings
Content-Type: application/json

{
  "aperture": "f/4.0",
  "iso": 200
}
```

#### 7. Gallery Management
```http
GET /api/images
```
**Response:**
```json
{
  "images": [
    {
      "filename": "IMG_001.jpg",
      "timestamp": "2024-01-15T10:30:00Z",
      "size": 5242880,
      "thumbnail": "data:image/jpeg;base64,..."
    }
  ]
}
```

```http
GET /api/download?filename=IMG_001.jpg
```
**Response:** File download

#### 8. Print Function
```http
POST /api/print
Content-Type: application/json

{
  "filename": "IMG_001.jpg",
  "copies": 1
}
```

## Frontend Integration

### Service Layer Setup

Create a DSLR service in your React app:

```typescript
// services/dslrService.ts
class DSLRService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_DSLR_BACKEND_URL || 'http://localhost:3000';
    this.token = process.env.REACT_APP_DSLR_API_TOKEN || '';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`DSLR API error: ${response.status}`);
    }

    return response.json();
  }

  async getStatus() {
    return this.request('/api/status');
  }

  async capturePhoto() {
    return this.request('/api/capture', { method: 'POST' });
  }

  async startBurst(count: number, interval: number) {
    return this.request('/api/burst', {
      method: 'POST',
      body: JSON.stringify({ count, interval }),
    });
  }

  async startVideo() {
    return this.request('/api/video/start', { method: 'POST' });
  }

  async stopVideo() {
    return this.request('/api/video/stop', { method: 'POST' });
  }

  async getSettings() {
    return this.request('/api/settings');
  }

  async updateSettings(settings: any) {
    return this.request('/api/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async getImages() {
    return this.request('/api/images');
  }

  async downloadImage(filename: string) {
    const response = await fetch(`${this.baseUrl}/api/download?filename=${filename}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    return response.blob();
  }

  async printImage(filename: string, copies: number = 1) {
    return this.request('/api/print', {
      method: 'POST',
      body: JSON.stringify({ filename, copies }),
    });
  }
}

export const dslrService = new DSLRService();
```

### Component Integration

#### Camera Status Component
```typescript
// components/CameraStatus.tsx
import React, { useState, useEffect } from 'react';
import { dslrService } from '../services/dslrService';

export const CameraStatus: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await dslrService.getStatus();
        setStatus(result);
        setError('');
      } catch (err) {
        setError('Camera not connected');
        setStatus(null);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!status) {
    return <div className="text-gray-500">Checking camera...</div>;
  }

  return (
    <div className="bg-green-100 p-4 rounded">
      <h3 className="font-bold">Camera Connected</h3>
      <p>Model: {status.camera}</p>
      <p>Battery: {status.battery}%</p>
      <p>Storage: {status.storage.free} free</p>
    </div>
  );
};
```

#### Capture Button Component
```typescript
// components/CaptureButton.tsx
import React, { useState } from 'react';
import { dslrService } from '../services/dslrService';

interface CaptureButtonProps {
  onCapture: (filename: string) => void;
  mode: 'photo' | 'burst' | 'video';
}

export const CaptureButton: React.FC<CaptureButtonProps> = ({ onCapture, mode }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleCapture = async () => {
    setIsCapturing(true);
    setError('');

    try {
      let result;
      
      switch (mode) {
        case 'photo':
          result = await dslrService.capturePhoto();
          break;
        case 'burst':
          result = await dslrService.startBurst(5, 1000);
          break;
        case 'video':
          result = await dslrService.startVideo();
          break;
      }

      onCapture(result.filename);
    } catch (err) {
      setError('Capture failed');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleCapture}
        disabled={isCapturing}
        className="bg-blue-500 text-white px-6 py-3 rounded disabled:opacity-50"
      >
        {isCapturing ? 'Capturing...' : `Capture ${mode}`}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};
```

## Error Handling

### Common Errors

1. **Camera Not Connected**
   - Check USB connection
   - Verify camera is in PTP mode
   - Check gphoto2 installation

2. **Authentication Failed**
   - Verify API token in .env
   - Check token format (Bearer prefix)

3. **Capture Failed**
   - Check camera settings
   - Verify storage space
   - Check camera permissions

### Error Response Format
```json
{
  "error": "Camera not found",
  "code": "CAMERA_NOT_FOUND",
  "details": "No camera detected on USB port"
}
```

## Platform-Specific Notes

### macOS
- May require PTPCamera permissions
- Use `gphoto2 --list-cameras` to test connection
- Check System Preferences > Security & Privacy

### Linux
- Ensure user is in `plugdev` group
- May need udev rules for camera access
- Test with `gphoto2 --auto-detect`

### Windows
- Use WSL2 or Docker for gphoto2
- Ensure USB passthrough is enabled
- Test camera detection in WSL2

## Testing

### Manual API Testing
```bash
# Test status
curl -H "Authorization: Bearer your_token" http://localhost:3000/api/status

# Test capture
curl -X POST -H "Authorization: Bearer your_token" http://localhost:3000/api/capture

# Test settings
curl -H "Authorization: Bearer your_token" http://localhost:3000/api/settings
```

### Frontend Testing
1. Start DSLR helper backend
2. Connect camera
3. Test status component
4. Test capture functionality
5. Verify error handling

## Troubleshooting

### Camera Not Detected
1. Check USB connection
2. Verify camera is in PTP mode
3. Test with `gphoto2 --list-cameras`
4. Check system permissions

### API Connection Issues
1. Verify backend is running on correct port
2. Check firewall settings
3. Verify token in .env file
4. Test with curl commands

### Capture Issues
1. Check camera battery and storage
2. Verify camera settings
3. Check gphoto2 logs
4. Test with manual gphoto2 commands

---

*For more detailed setup instructions, see the [DSLR Helper documentation](https://github.com/fihircio/dslr-snapbooth/tree/main/snapbooth-dslr-helper/docs)* 