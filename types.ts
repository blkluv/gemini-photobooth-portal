export interface Sticker {
  id: string;
  src: string; // data URL or path to image
  alt: string;
  width: number; // intrinsic width for scaling purposes
  height: number; // intrinsic height
  x?: number; // position on canvas, relative to top-left of photo
  y?: number;
  currentX?: number; // for dragging
  currentY?: number;
  zIndex?: number;
  scale?: number;
  rotation?: number;
}

export interface Filter {
  id: string;
  name: string;
  style: string; // CSS filter string e.g. "grayscale(100%)" or "" for none
}

export interface Point {
  x: number;
  y: number;
}

export type ViewState = 
  | 'LANDING' 
  | 'MENU' 
  | 'CAMERA' 
  | 'EDITOR' 
  | 'PRINTING' 
  | 'BOOMERANG_CAPTURE'
  | 'BOOMERANG_PREVIEW'
  | 'VIDEO_CAPTURE'
  | 'VIDEO_PREVIEW'
  | 'SLOWMO_CAPTURE'
  | 'SLOWMO_PREVIEW';

export interface ModalContent {
  type: 'loading' | 'qr' | 'message' | 'error';
  message: string;
  qrData?: string; // For QR code data URL
  itemType?: 'photo' | 'boomerang' | 'video' | 'slowmo'; // To customize messages for QR or errors
  duration?: number; // Optional duration for auto-closing message modals
}