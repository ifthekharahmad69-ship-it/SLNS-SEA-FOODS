/**
 * uploadImage.js — Client-side Cloudinary upload utility
 *
 * Uses an UNSIGNED upload preset (configured in Cloudinary dashboard).
 * This runs entirely in the browser — no server round-trip for the upload itself.
 *
 * Returns both the secure URL and the public_id so the server can delete
 * the image from Cloudinary when a product is deleted or its image replaced.
 *
 * Setup (one-time, 2 minutes):
 * 1. Sign up free at https://cloudinary.com
 * 2. Go to Settings → Upload → Upload presets → Add upload preset
 *    - Set "Signing mode" to UNSIGNED
 *    - Set folder to "slns-sea-foods/products"
 *    - Save. Copy the preset name (e.g. "sea_foods")
 * 3. Copy your Cloud Name from the Dashboard top-left
 * 4. Add to .env.local:
 *    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sea_foods
 */

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
const MAX_FILE_SIZE_MB = 5;

/**
 * Upload a product image file to Cloudinary.
 * @param {File} file           - The File object from an <input type="file">
 * @param {Function} onProgress - Optional callback(percent 0-100)
 * @returns {Promise<{ url: string, public_id: string }>} - Resolves to image URL + public_id
 */
export async function uploadProductImage(file, onProgress) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env.local file.'
    );
  }

  // Validate file type
  const ext = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported file type ".${ext}". Please use JPG, PNG, WebP, or AVIF.`);
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image must be under ${MAX_FILE_SIZE_MB} MB.`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'slns-sea-foods/products');

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const pct = Math.round((event.loaded / event.total) * 100);
        onProgress?.(pct);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.secure_url,           // Full HTTPS URL for display
            public_id: data.public_id,      // e.g. "slns-sea-foods/products/abc123"
          });
        } catch {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
}
