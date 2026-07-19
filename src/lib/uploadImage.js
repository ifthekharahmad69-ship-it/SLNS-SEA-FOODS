// uploadImage.js — upload a product image to Cloudinary (FREE — no Firebase Storage needed)
//
// Setup (one-time, 2 minutes):
// 1. Sign up free at https://cloudinary.com
// 2. Go to Settings → Upload → Upload presets → Add upload preset
//    - Set "Signing mode" to UNSIGNED
//    - Set folder to "amma-sea-foods/products"
//    - Save. Copy the preset name (e.g. "amma_products_preset")
// 3. Copy your Cloud Name from the Dashboard top-left
// 4. Add to .env.local:
//    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
//    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name

/**
 * Upload a product image file to Cloudinary.
 * @param {File} file           - The File object from an <input type="file">
 * @param {Function} onProgress - Optional callback(percent 0-100)
 * @returns {Promise<string>}   - Resolves to the public image URL
 */
export async function uploadProductImage(file, onProgress) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env.local file.'
    );
  }

  // Validate file
  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
  if (!allowed.includes(ext)) {
    throw new Error('Unsupported file type. Please use JPG, PNG or WebP.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be under 5 MB.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'amma-sea-foods/products');

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

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
          // Return the secure HTTPS URL
          resolve(data.secure_url);
        } catch {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

    xhr.open('POST', url);
    xhr.send(formData);
  });
}
