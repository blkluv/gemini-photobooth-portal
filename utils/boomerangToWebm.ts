// Boomerang to WebM utility using Whammy
// Usage: await boomerangFramesToWebM(frames, fps)
import Whammy from 'whammy';

export async function boomerangFramesToWebM(frames: string[], fps = 15): Promise<Blob> {
  // frames: array of base64 image data URLs
  // fps: frames per second
  return new Promise((resolve, reject) => {
    try {
      const encoder = new Whammy.Video(fps);
      // Forward
      frames.forEach(frame => encoder.add(frame));
      // Backward (skip last and first to avoid duplicate frames)
      for (let i = frames.length - 2; i > 0; i--) {
        encoder.add(frames[i]);
      }
      const output = encoder.compile();
      resolve(output);
    } catch (err) {
      reject(err);
    }
  });
}
