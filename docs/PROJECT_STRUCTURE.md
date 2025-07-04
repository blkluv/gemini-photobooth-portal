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
- `public/`: Static assets served by the frontend.
- `photobooth/`: Contains uploads and possibly other photobooth-related files.
- `dist/`: Build output directory.
- `node_modules/`: Installed Node.js dependencies.

## Backend (PHP)
- `uploadvideo_and_qr.php`, `view_media.php`, `upload_debug_functions.php`: PHP scripts for media upload, viewing, and debugging.
- `test_upload.html`: HTML page for testing uploads.
- `upload_debug.log`: Log file for upload debugging. 