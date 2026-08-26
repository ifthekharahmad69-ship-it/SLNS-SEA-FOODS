/**
 * uploadImage.js — Client-side Cloudinary upload utility with mobile gallery compression
 *
 * Uses an UNSIGNED upload preset (configured in Cloudinary dashboard).
 * Automatically resizes and compresses heavy mobile gallery/camera photos (up to 20MB)
 * down to crisp ~300KB JPEG/WebP files before uploading to Cloudinary.
 */

/**
 * Compress and scale down raw gallery image using HTML5 Canvas.
 * Converts heavy camera photos (15MB+, HEIC, PNG) to a lightweight JPEG blob.
 */
async function compressImageFile(file, maxDimension = 1600, quality = 0.85) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !file || typeof FileReader === 'undefined') {
      return resolve(file);
    }

    // Allow all image mime types or files
    if (file.type && !file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onerror = () => resolve(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const cleanName = (file.name || 'photo').replace(/\.[^/.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], cleanName, { type: 'image/jpeg' });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a product image file to Cloudinary with progress tracking.
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

  // Compress heavy gallery files automatically before upload
  onProgress?.(10);
  let uploadFile = file;
  try {
    uploadFile = await compressImageFile(file);
    onProgress?.(30);
  } catch (err) {
    console.warn('Client-side compression fallback:', err);
  }

  const formData = new FormData();
  formData.append('file', uploadFile);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'slns-sea-foods/products');

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const pct = Math.min(99, 30 + Math.round((event.loaded / event.total) * 70));
        onProgress?.(pct);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          onProgress?.(100);
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
