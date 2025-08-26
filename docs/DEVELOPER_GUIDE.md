# Developer Guide

This guide is for developers working on the Gemini Photobooth Portal project.

## Project Overview

The photobooth system is built with modern web technologies and follows a microservices architecture:

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **PHP Backend**: File uploads, QR generation, key management
- **DSLR Backend**: Node.js + gphoto2 for camera control
- **Build Tool**: Vite for fast development and building

## Development Environment Setup

### Prerequisites
- Node.js 18+ and npm
- PHP 8.0+ with required extensions
- Git for version control
- Code editor (VS Code recommended)

### Required PHP Extensions
```bash
# Ubuntu/Debian
sudo apt-get install php8.0-gd php8.0-curl php8.0-mbstring php8.0-xml php8.0-zip

# macOS with Homebrew
brew install php@8.0
```

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/fihircio/dslr-snapbooth.git
cd gemini-photobooth-portal

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

## Project Structure

```
gemini-photobooth-portal/
├── components/          # React components
├── services/           # API and business logic
├── utils/              # Utility functions
├── api/                # PHP backend scripts
├── public/             # Static assets
├── docs/               # Documentation
├── types.ts            # TypeScript type definitions
├── constants.ts        # Application constants
└── package.json        # Dependencies and scripts
```

## Development Workflow

### Code Style and Standards

#### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Prefer `interface` over `type` for object shapes

#### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization
- Follow naming conventions: PascalCase for components

#### CSS/Styling
- Use Tailwind CSS utility classes
- Create custom components for reusable styles
- Follow mobile-first responsive design
- Use CSS variables for theming

### Git Workflow

#### Branch Naming
```
feature/dslr-integration
bugfix/camera-connection
hotfix/security-patch
```

#### Commit Messages
```
feat: add DSLR camera integration
fix: resolve camera connection issues
docs: update API documentation
refactor: improve error handling
```

#### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Create pull request with description
5. Request code review
6. Address feedback and merge

## Architecture Patterns

### Frontend Architecture

#### Component Hierarchy
```
PhotoboothApp
├── PinGate (Authentication)
├── MenuPage (Navigation)
├── CameraView (Capture)
├── PhotoEditor (Editing)
├── PrintView (Output)
└── AdminSettingsModal (Admin)
```

#### State Management
- **Local State**: Use useState for component-specific state
- **Context API**: Use for global state (user auth, camera status)
- **Service Layer**: Handle API calls and business logic
- **Custom Hooks**: Extract reusable logic


### Print API Integration (DSLR Backend)

#### Endpoint
```http
POST /api/print
Host: http://localhost:3000
Content-Type: application/json
X-DSLR-Token: <your-auth-token>
```

#### Request Body
```json
{
  "imageBase64": "data:image/png;base64,...",
  "printSize": "4R" // or "5R", "6R", "A4"
}
```

#### Example (TypeScript)
```typescript
await fetch('http://localhost:3000/api/print', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-DSLR-Token': token,
  },
  body: JSON.stringify({
    imageBase64: compositedImage,
    printSize: selectedSize,
  }),
});
```

#### Notes
- The frontend must send the composited image as a base64 string.
- The print size is selected by the user and sent as `printSize`.
- The `X-DSLR-Token` header is required for authentication.
- See PrintView.tsx for implementation details.

### Backend Architecture

#### PHP Backend Structure
```
api/
├── uploadvideo_and_qr.php    # File uploads
├── validate_key.php          # Key validation
├── request_trial.php         # Trial key generation
├── view_media.php           # Media serving
├── branding.php             # Customization
├── analytics.php            # Usage statistics
└── support.php              # Support requests
```

#### Error Handling Pattern
```php
<?php
header('Content-Type: application/json');

try {
    // Validate input
    if (!isset($_POST['key'])) {
        throw new Exception('Missing required parameter: key');
    }
    
    // Process request
    $result = processKey($_POST['key']);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'data' => $result
    ]);
    
} catch (Exception $e) {
    // Return error response
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'code' => 'VALIDATION_ERROR'
    ]);
}
?>
```

## API Development

### RESTful API Design

#### Endpoint Structure
```
GET    /api/status          # Get system status
POST   /api/upload          # Upload media
GET    /api/media/:id       # Get media by ID
PUT    /api/settings        # Update settings
DELETE /api/media/:id       # Delete media
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "filename": "photo.jpg",
    "url": "https://example.com/media/abc123"
  },
  "message": "Upload successful"
}
```

#### Error Response Format
```json
{
  "success": false,
  "error": "Invalid file type",
  "code": "INVALID_FILE_TYPE",
  "details": "Only JPG, PNG, and MP4 files are allowed"
}
```

### DSLR API Integration

#### Service Implementation
```typescript
// services/dslrService.ts
class DSLRService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_DSLR_BACKEND_URL;
    this.token = process.env.REACT_APP_DSLR_API_TOKEN;
  }

  async capturePhoto(): Promise<CaptureResult> {
    return this.request('/api/capture', { method: 'POST' });
  }

  async getStatus(): Promise<CameraStatus> {
    return this.request('/api/status');
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`DSLR API Error: ${response.status}`);
    }

    return response.json();
  }
}
```

## Testing Strategy

### Unit Testing
```typescript
// __tests__/services/dslrService.test.ts
import { DSLRService } from '../../services/dslrService';

describe('DSLRService', () => {
  let service: DSLRService;

  beforeEach(() => {
    service = new DSLRService();
  });

  test('should capture photo successfully', async () => {
    const result = await service.capturePhoto();
    expect(result.success).toBe(true);
    expect(result.filename).toBeDefined();
  });

  test('should handle camera not connected', async () => {
    // Mock fetch to return error
    global.fetch = jest.fn().mockRejectedValue(new Error('Camera not found'));
    
    await expect(service.capturePhoto()).rejects.toThrow('Camera not found');
  });
});
```

### Integration Testing
```typescript
// __tests__/integration/camera.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CameraView } from '../../components/CameraView';

describe('Camera Integration', () => {
  test('should capture photo with DSLR', async () => {
    render(<CameraView onCapture={jest.fn()} mode="photo" />);
    
    const captureButton = screen.getByText('Capture Photo');
    fireEvent.click(captureButton);
    
    await waitFor(() => {
      expect(screen.getByText('Capturing...')).toBeInTheDocument();
    });
  });
});
```

### End-to-End Testing
```typescript
// __tests__/e2e/photobooth.test.ts
import { test, expect } from '@playwright/test';

test('complete photo capture flow', async ({ page }) => {
  await page.goto('/');
  
  // Enter trial key
  await page.fill('[data-testid="trial-key-input"]', 'TRIAL_123');
  await page.click('[data-testid="submit-key"]');
  
  // Select photo mode
  await page.click('[data-testid="photo-mode"]');
  
  // Capture photo
  await page.click('[data-testid="capture-button"]');
  
  // Verify photo was captured
  await expect(page.locator('[data-testid="photo-preview"]')).toBeVisible();
});
```

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: Use React.lazy for route-based splitting
- **Memoization**: Use React.memo and useMemo for expensive operations
- **Image Optimization**: Implement lazy loading and compression
- **Bundle Analysis**: Use webpack-bundle-analyzer to optimize bundle size

### Backend Optimization
- **Caching**: Implement Redis caching for frequently accessed data
- **Database Optimization**: Use proper indexing and query optimization
- **File Compression**: Compress images and videos before storage
- **CDN Integration**: Use CDN for static asset delivery

### Monitoring and Analytics
```typescript
// utils/analytics.ts
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  // Send analytics event
  console.log('Analytics Event:', event, properties);
};

export const trackError = (error: Error, context?: string) => {
  // Send error to monitoring service
  console.error('Error Tracking:', error, context);
};
```

## Security Best Practices

### Frontend Security
- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Use React's built-in XSS protection
- **CSRF Protection**: Implement CSRF tokens for state-changing requests
- **Content Security Policy**: Set appropriate CSP headers

### Backend Security
- **Input Sanitization**: Sanitize all inputs
- **SQL Injection Prevention**: Use prepared statements
- **File Upload Security**: Validate file types and sizes
- **Rate Limiting**: Implement rate limiting for API endpoints

### Authentication and Authorization
```typescript
// utils/auth.ts
export const validateKey = async (key: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/validate_key.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    
    const result = await response.json();
    return result.success && result.data.valid;
  } catch (error) {
    console.error('Key validation failed:', error);
    return false;
  }
};
```

## Deployment

### Development Deployment
```bash
# Start development servers
npm run dev          # React frontend
php -S localhost:8000 -t api/  # PHP backend
cd ../snapbooth-dslr-helper && npm start  # DSLR backend
```

### Production Deployment
```bash
# Build frontend
npm run build

# Deploy to production server
rsync -avz dist/ user@server:/var/www/photobooth/
rsync -avz api/ user@server:/var/www/photobooth/api/

# Restart services
ssh user@server "sudo systemctl restart photobooth-frontend"
ssh user@server "sudo systemctl restart photobooth-backend"
```

### Environment Configuration
```bash
# .env.production
REACT_APP_API_URL=https://api.geminiphotobooth.com
REACT_APP_DSLR_BACKEND_URL=https://dslr.geminiphotobooth.com
REACT_APP_ANALYTICS_ID=GA_TRACKING_ID
```

## Debugging and Troubleshooting

### Frontend Debugging
```typescript
// utils/debug.ts
export const debug = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data);
  }
};

export const debugError = (error: Error, context?: string) => {
  console.error(`[ERROR] ${context || 'Unknown'}:`, error);
  // Send to error tracking service
};
```

### Backend Debugging
```php
// utils/debug.php
function debug_log($message, $data = null) {
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'message' => $message,
        'data' => $data
    ];
    
    file_put_contents(
        __DIR__ . '/../logs/debug.log',
        json_encode($log_entry) . "\n",
        FILE_APPEND
    );
}
```

### Common Issues and Solutions

#### Camera Connection Issues
- **Problem**: Camera not detected
- **Solution**: Check USB connection, camera mode, and gphoto2 installation
- **Debug**: Use `gphoto2 --list-cameras` to test connection

#### Upload Failures
- **Problem**: File upload fails
- **Solution**: Check file size limits, permissions, and storage space
- **Debug**: Check PHP error logs and upload debug log

#### Performance Issues
- **Problem**: Slow response times
- **Solution**: Optimize database queries, implement caching, use CDN
- **Debug**: Use browser dev tools and server monitoring

## Contributing Guidelines

### Code Review Process
1. **Self Review**: Review your own code before submitting
2. **Peer Review**: Request review from team members
3. **Automated Checks**: Ensure all tests pass and linting is clean
4. **Documentation**: Update documentation for new features

### Documentation Standards
- **Code Comments**: Add comments for complex logic
- **API Documentation**: Document all API endpoints
- **Component Documentation**: Document component props and usage
- **README Updates**: Keep README current with setup instructions

### Testing Requirements
- **Unit Tests**: Write tests for all new functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Test performance impact of changes

---

*For questions or support, contact the development team or create an issue in the repository.* 