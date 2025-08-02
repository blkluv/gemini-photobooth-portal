# Architecture Overview

The Gemini Photobooth Portal is a multi-layered application that combines React frontend with PHP and Node.js backends to provide a comprehensive photobooth solution.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   PHP Backend   │    │ DSLR Helper     │
│   (Frontend)    │◄──►│   (Upload/QR)   │    │   (Camera)      │
│                 │    │                 │    │                 │
│ • Photo Capture │    │ • File Upload   │    │ • Camera Control│
│ • Video/Boomerang│   │ • QR Generation │    │ • Live View     │
│ • Photo Editor  │    │ • Key Validation│    │ • Burst Mode    │
│ • Admin Panel   │    │ • Trial System  │    │ • Video Capture │
│ • Landing Page  │    │ • Media Viewing │    │ • Gallery       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Interaction Flow

### 1. User Interface Layer (React)
- **PhotoboothApp.tsx**: Central controller managing all views and modes
- **Capture Views**: Photo, Video, Boomerang, SlowMo, PhotoStrip
- **Preview Views**: Display captured media with editing options
- **Admin Interface**: Settings, analytics, branding, support

### 2. Service Layer
- **geminiService.ts**: AI sticker generation via Gemini API
- **API Services**: HTTP calls to PHP and DSLR backends
- **Utility Services**: Image processing, GIF creation, QR generation

### 3. Backend Services

#### PHP Backend (`api/`)
- **uploadvideo_and_qr.php**: Handles media uploads and QR generation
- **validate_key.php**: Event/trial key validation
- **request_trial.php**: Trial key email delivery
- **view_media.php**: Media file serving
- **branding.php**: Customization settings
- **analytics.php**: Usage statistics

#### DSLR Helper Backend (Node.js)
- **REST API**: Camera control endpoints
- **WebSocket**: Real-time status updates
- **gphoto2 Integration**: Direct camera communication
- **Cross-platform Support**: macOS, Linux, Windows

## Data Flow

### Photo/Video Capture
1. User selects capture mode in React app
2. React calls DSLR helper for camera control
3. DSLR helper captures image/video via gphoto2
4. Media is processed (resize, filter, convert)
5. React uploads to PHP backend
6. PHP generates QR code and stores media
7. User can view, edit, or share media

### Key/Trial System
1. User enters event key or requests trial
2. React validates with PHP backend
3. PHP checks key validity or sends trial email
4. React stores key in localStorage with expiry
5. Admin PIN unlocks additional features

### AI Features
1. User selects AI sticker generation
2. React calls Gemini API via geminiService
3. Generated sticker is applied to photo
4. User can adjust, save, or share

## Technology Stack

### Frontend
- **React 18**: Component-based UI
- **TypeScript**: Type safety and better DX
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool and dev server

### Backend
- **PHP 8.0+**: Upload handling, QR generation, key validation
- **Node.js**: DSLR control and camera integration
- **gphoto2**: Camera communication library

### Utilities
- **GIF.js**: Client-side GIF creation
- **Canvas API**: Image processing and frame extraction
- **WebRTC**: Camera access for fallback modes

## Security Considerations

- **Token-based Authentication**: All DSLR API calls require valid token
- **Key Validation**: Event and trial keys are validated server-side
- **File Upload Security**: PHP backend validates file types and sizes
- **CORS Configuration**: Proper cross-origin request handling
- **Environment Variables**: Sensitive data stored in .env files

## Performance Optimizations

- **Client-side Processing**: GIF creation and image editing done in browser
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Automatic resizing and compression
- **Caching**: Static assets and API responses cached appropriately

## Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Server    │    │   Application   │    │   File Storage  │
│   (Nginx/Apache)│    │   Server        │    │                 │
│                 │    │                 │    │                 │
│ • Static Files  │    │ • React App     │    │ • Uploaded Media│
│ • SSL/TLS       │    │ • PHP Backend   │    │ • Generated QR  │
│ • Load Balancing│    │ • DSLR Helper   │    │ • Logs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Monitoring and Logging

- **Frontend**: Console logs for debugging, error boundaries
- **PHP Backend**: upload_debug.log for upload issues
- **DSLR Helper**: Console output and error logging
- **Analytics**: Usage tracking via PHP backend

---

*For detailed setup instructions, see [Installation Guide](INSTALLATION.md)* 