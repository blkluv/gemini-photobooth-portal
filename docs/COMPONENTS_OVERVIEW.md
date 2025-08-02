# Components Overview

This document lists and describes the React components in the `components/` directory, organized by functionality.

## Core Application Components

### Main Application Controller
- **`PhotoboothApp.tsx`**: Central controller managing all photobooth logic and view switching (photo, boomerang, video, slow-mo, photo strip, etc.).

### Navigation and Access Control
- **`PinGate.tsx`**: Handles event/trial key entry, admin PIN, and trial expiry countdown/lockout.
- **`MenuPage.tsx`**: Main menu for selecting capture modes (Photo, Boomerang, Video, Slow-Mo, Photo Strip) with icons and descriptions.
- **`LandingPage.tsx`**: The animated landing page with dark mode, WhatsApp QR, and trial key request.

## Capture Mode Components

### Photo Capture
- **`CameraView.tsx`**: Manages camera view and controls for all capture modes.
- **`PhotoStripView.tsx`**: Takes 3 photos and creates a printable photo strip.

### Video Capture
- **`VideoCaptureView.tsx`**: Handles video capture functionality, including canvas-based frame capture for GIF/slowmo.
- **`VideoPreviewView.tsx`**: Shows a preview of captured videos.

### Specialized Video Modes
- **`BoomerangCaptureView.tsx`**: Handles boomerang-style video capture and frame extraction for GIFs.
- **`BoomerangPreviewView.tsx`**: Shows a preview of boomerang videos and allows GIF export.
- **`SlowMoCaptureView.tsx`**: Handles slow-motion video capture, with canvas frame capture for GIF export.
- **`SlowMoPreviewView.tsx`**: Displays a preview of slow-motion videos.

### QR Code Functionality
- **`ScanQrPage.tsx`**: Page for scanning QR codes.

## Editing and Processing Components

### Photo Editing
- **`PhotoEditor.tsx`**: Provides photo editing features, including AI sticker generation (Gemini API), sticker management, and filter application.
- **`FilterPalette.tsx`**: UI for selecting filters.
- **`StickerPalette.tsx`**: UI for selecting stickers.

### Output and Printing
- **`PrintView.tsx`**: Handles print view functionality.

## Admin and Settings Components

### Administrative Interface
- **`AdminSettingsModal.tsx`**: Modal for admin settings and logout, with multi-tab support:
  - **General**: Basic settings and configuration
  - **Security**: Access control and authentication
  - **Analytics**: Usage statistics and reporting
  - **Branding**: Customization and theming
  - **Support**: Device key management, support logs, update checks

## Marketing and Landing Components

### Landing Page Sections
- **`Clients.tsx`**: Client showcase and testimonials section
- **`Services.tsx`**: Service offerings and features display
- **`AboutUs.tsx`**: Company information and team details
- **`ContactUs.tsx`**: Contact information and form

## Utility Components

### Reusable UI Elements
- **`Button.tsx`**: Reusable button component with various styles and states
- **`Modal.tsx`**: Reusable modal dialog component
- **`Spinner.tsx`**: Loading spinner component

### Icon System
- **`icons/`**: Contains icon components used throughout the app

## Component Architecture

### State Management
- Components use React hooks for local state management
- Context API for global state (user authentication, camera status)
- Service layer for API communication

### Props and Interfaces
```typescript
interface CaptureComponentProps {
  onCapture: (media: MediaFile) => void;
  onError: (error: string) => void;
  settings?: CameraSettings;
}

interface MediaFile {
  id: string;
  filename: string;
  type: 'photo' | 'video' | 'gif' | 'boomerang';
  url: string;
  timestamp: Date;
}
```

### Error Handling
- All components include error boundaries
- Graceful fallbacks for failed operations
- User-friendly error messages
- Loading states for async operations

## Integration Points

### DSLR Integration
- Camera status detection and display
- Capture button integration with DSLR backend
- Settings synchronization
- Gallery management

### Backend Integration
- Upload functionality for all media types
- QR code generation and sharing
- Key validation and trial system
- Analytics and usage tracking

### AI Integration
- Gemini API for sticker generation
- Image processing and enhancement
- Content moderation and filtering

## Performance Considerations

### Optimization Strategies
- Lazy loading for heavy components
- Memoization for expensive calculations
- Image optimization and compression
- Efficient re-rendering patterns

### Mobile Responsiveness
- Touch-friendly interfaces
- Responsive design patterns
- Performance optimization for mobile devices
- Offline capability considerations

## Accessibility Features

### ARIA Support
- Proper labeling and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### User Experience
- Clear visual feedback
- Intuitive navigation
- Consistent design patterns
- Error prevention and recovery

---

*For detailed DSLR integration, see [DSLR Integration Guide](DSLR_INTEGRATION.md)* 