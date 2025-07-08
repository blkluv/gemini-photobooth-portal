# Utils Overview

This document describes the utility scripts in the `utils/` directory and their functions.
 
- `boomerangToGif.ts`: Converts boomerang video sequences to GIF format using GIF.js and canvas frame capture.
- `boomerangToWebm.ts`: Converts boomerang video sequences to WebM format.
- `whammy.js`: Helper for video encoding or processing (minified or bundled).
- `imageUtils.ts`: Provides image processing utilities (e.g., resizing, filtering, canvas frame extraction for GIF/slowmo).
- **Canvas Frame Capture**: Used in video/boomerang/slowmo components to reliably extract frames for GIF creation, especially on mobile browsers.
- **GIF.js Integration**: Used for client-side GIF encoding from captured frames. 