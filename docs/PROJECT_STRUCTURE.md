# Project Structure

This document provides an overview of the main directories and files in the project.

## Root Directory
- `App.tsx`, `index.tsx`, `index.html`, `index.css`: Main entry points for the React frontend.
- `package.json`, `package-lock.json`: Node.js project configuration and dependencies.
- `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`: Build, TypeScript, and styling configurations.
- `README.md`: Basic setup instructions.
- `.gitignore`: Git version control ignore rules.
- `constants.ts`, `types.ts`, `metadata.json`: Project constants, TypeScript types, and metadata.

## Directories
- `components/`: React components for UI and views.
- `utils/`: Utility scripts for media processing and helpers.
- `services/`: API and business logic services.
- `public/`: Static assets served by the frontend, including `landing.html` (marketing/landing page).
- `api/`: PHP backend scripts for uploads, key validation, trial requests, etc.
- `photobooth/`: Contains uploads and possibly other photobooth-related files.
- `dist/`: Build output directory.
- `node_modules/`: Installed Node.js dependencies.

## Backend (PHP)
- `uploadvideo_and_qr.php`, `view_media.php`, `upload_debug_functions.php`: PHP scripts for media upload, viewing, and debugging.
- `validate_key.php`, `request_trial.php`: PHP APIs for event/trial key validation and trial key email delivery.
- `test_upload.html`: HTML page for testing uploads.
- `upload_debug.log`: Log file for upload debugging.

## Deployment Structure
- `public/landing.html`: Marketing/landing page at the root.
- `index.html`: React app entry point (can be in a subdirectory for separation).
- `api/`: All backend PHP endpoints.
- `photobooth/uploads/`: Uploaded media storage.
- Clear separation between landing, app, and backend for maintainability and scalability. 