# Quick Start Guide

Get the Gemini Photobooth Portal running in 5 minutes!

## Prerequisites

- Node.js 18+ and npm
- PHP 8.0+ with required extensions
- Camera (optional for testing)

## Quick Setup

### 1. Clone and Install

```bash
git clone https://github.com/fihircio/dslr-snapbooth.git
cd gemini-photobooth-portal
npm install
```

### 2. Environment Setup

Create `.env` file in the root directory:

```env
# DSLR Helper Backend
DSLR_BACKEND_URL=http://localhost:3000
DSLR_API_TOKEN=your_token_here

# PHP Backend
PHP_BACKEND_URL=http://localhost/api

# App Configuration
REACT_APP_TITLE=Gemini Photobooth
REACT_APP_VERSION=1.2.0
```

### 3. Start Development Servers

```bash
# Terminal 1: React Frontend
npm run dev

# Terminal 2: PHP Backend (if using local server)
php -S localhost:8000 -t api/

# Terminal 3: DSLR Helper Backend (optional)
cd ../snapbooth-dslr-helper
npm install
npm start
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **PHP Backend**: http://localhost:8000
- **DSLR Backend**: http://localhost:3000

## Testing

1. **Basic Functionality**: Navigate to the landing page and try the trial key system
2. **Photo Capture**: Test photo capture modes (Photo, Boomerang, Video, SlowMo)
3. **DSLR Integration**: If camera is connected, test DSLR controls
4. **Upload/QR**: Test media upload and QR code generation

## Next Steps

- Read the [Installation Guide](INSTALLATION.md) for detailed setup
- Check [Troubleshooting](TROUBLESHOOTING.md) if you encounter issues
- Review [Architecture Overview](ARCHITECTURE.md) to understand the system

## Common Issues

- **Port conflicts**: Change ports in `.env` or use different ports
- **Camera not detected**: Check camera permissions and USB connection
- **Upload errors**: Ensure PHP backend is running and directories are writable

---

*Need help? Check the [Troubleshooting Guide](TROUBLESHOOTING.md) or create an issue.* 