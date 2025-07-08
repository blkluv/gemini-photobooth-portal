export async function validateKey(key) {
  // Use absolute URL for development, relative for production
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseUrl = isDevelopment ? 'https://snapbooth.eeelab.xyz' : '';
  const res = await fetch(`${baseUrl}/api/validate_key.php?key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error('Network error');
  return await res.json();
} 