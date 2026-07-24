/**
 * cloudinary.js — Server-side Cloudinary utilities (Node.js / Next.js API Routes ONLY)
 * Never import this file from client-side components.
 *
 * Uses the Cloudinary REST API directly (no SDK needed) for:
 *  - Signed uploads (secure, authenticated)
 *  - Image deletion by public_id
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const FOLDER = 'slns-sea-foods/products';

/**
 * Generate a SHA-1 signature for Cloudinary signed requests.
 * Uses the Web Crypto API (available in Next.js Edge/Node runtime).
 */
async function sha1(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Upload a file Buffer to Cloudinary using signed upload.
 * @param {Buffer|Uint8Array} fileBuffer - Raw file bytes
 * @param {string} mimeType - e.g. 'image/jpeg'
 * @param {string} fileName - Original file name
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export async function cloudinaryUpload(fileBuffer, mimeType, fileName) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error('Cloudinary server credentials not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `folder=${FOLDER}&timestamp=${timestamp}`;
  const signature = await sha1(`${paramsToSign}${API_SECRET}`);

  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: mimeType });
  formData.append('file', blob, fileName);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', FOLDER);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Cloudinary upload failed: ${res.status}`);
  }

  return {
    url: data.secure_url,
    public_id: data.public_id,
  };
}

/**
 * Delete an image from Cloudinary by its public_id.
 * Safe to call even if public_id is undefined/null (no-op).
 * @param {string} public_id - Cloudinary public_id of the image to delete
 * @returns {Promise<void>}
 */
export async function cloudinaryDelete(public_id) {
  if (!public_id) return; // No image to delete — safe no-op

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    console.warn('[cloudinary] Delete skipped — server credentials not configured');
    return;
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `public_id=${public_id}&timestamp=${timestamp}`;
    const signature = await sha1(`${paramsToSign}${API_SECRET}`);

    const formData = new FormData();
    formData.append('public_id', public_id);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      { method: 'POST', body: formData }
    );

    const data = await res.json();
    if (data.result !== 'ok' && data.result !== 'not found') {
      console.warn('[cloudinary] Delete returned unexpected result:', data);
    }
  } catch (err) {
    // Don't throw — image deletion failure should never block product operations
    console.error('[cloudinary] Delete error (non-fatal):', err.message);
  }
}

/**
 * Extract Cloudinary public_id from a Cloudinary URL.
 * Example: https://res.cloudinary.com/cloud/image/upload/v123/folder/name.jpg
 *          → folder/name
 */
export function extractPublicId(url) {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    // Remove version segment (v1234567890) and extension
    const withoutVersion = parts[1].replace(/^v\d+\//, '');
    return withoutVersion.replace(/\.[^.]+$/, '');
  } catch {
    return null;
  }
}
