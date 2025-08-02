// services/dslrService.ts

export interface CameraStatus {
  connected: boolean;
  model?: string;
  port?: string;
  camera?: string;
  battery?: number;
  storage?: {
    free: string;
    total: string;
  };
}

export interface CaptureResult {
  success: boolean;
  filename?: string;
  error?: string;
}

class DSLRService {
  private baseUrl: string;
  private token: string;

  constructor() {
    // Use (import.meta as any).env to avoid linter/type errors
    this.baseUrl = (import.meta as any).env.VITE_DSLR_BACKEND_URL || 'http://localhost:3000';
    this.token = (import.meta as any).env.VITE_DSLR_API_TOKEN || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-DSLR-Token': this.token,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      throw new Error(`DSLR API error: ${response.status}`);
    }
    return response.json();
  }

  async getStatus(): Promise<CameraStatus> {
    return this.request('/api/status');
  }

  async capturePhoto(): Promise<CaptureResult> {
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

  async downloadImage(number: number, name: string) {
    const url = `${this.baseUrl}/api/download?number=${number}&name=${encodeURIComponent(name)}`;
    const response = await fetch(url, {
      headers: { 'X-DSLR-Token': this.token },
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