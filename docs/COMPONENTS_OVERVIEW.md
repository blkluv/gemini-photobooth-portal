# Components Overview

This document lists and briefly describes the React components in the `components/` directory.

- `PhotoboothApp.tsx`: Centralizes all photobooth logic and view switching (photo, boomerang, video, slow-mo, photo strip, etc.).
- `MenuPage.tsx`: Main menu for selecting capture modes (Photo, Boomerang, Video, Slow-Mo, Photo Strip) with icons and descriptions.
- `VideoCaptureView.tsx`: Handles video capture functionality, including canvas-based frame capture for GIF/slowmo.
- `SlowMoPreviewView.tsx`: Displays a preview of slow-motion videos.
- `VideoPreviewView.tsx`: Shows a preview of captured videos.
- `SlowMoCaptureView.tsx`: Handles slow-motion video capture, with canvas frame capture for GIF export.
- `BoomerangCaptureView.tsx`: Handles boomerang-style video capture and frame extraction for GIFs.
- `BoomerangPreviewView.tsx`: Shows a preview of boomerang videos and allows GIF export.
- `LandingPage.tsx`: The animated landing page with dark mode, WhatsApp QR, and trial key request.
- `ScanQrPage.tsx`: Page for scanning QR codes.
- `Button.tsx`: Reusable button component.
- `CameraView.tsx`: Manages camera view and controls.
- `FilterPalette.tsx`: UI for selecting filters.
- `MenuPage.tsx`: Main menu page (see above).
- `Modal.tsx`: Reusable modal dialog component.
- `PhotoEditor.tsx`: Provides photo editing features, including AI sticker generation (Gemini API), sticker management, and filter application.
- `PrintView.tsx`: Handles print view functionality.
- `Spinner.tsx`: Loading spinner component.
- `StickerPalette.tsx`: UI for selecting stickers.
- `PhotoStripView.tsx`: Takes 3 photos and creates a printable photo strip.
- `PinGate.tsx`: Handles event/trial key entry, admin PIN, and trial expiry countdown/lockout.
- `AdminSettingsModal.tsx`: Modal for admin settings and logout, now with multi-tab support (General, Security, Analytics, Branding, Support, device key management, support logs, update checks).
- `Clients.tsx`, `Services.tsx`, `AboutUs.tsx`, `ContactUs.tsx`: Landing/marketing page sections using organized images.
- `icons/`: Contains icon components used throughout the app. 