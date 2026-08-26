/**
 * uploadImage.js — Lightweight client-side image compression + server-signed upload utility
 */

/**
 * Compress heavy gallery/camera photo using HTML5 Canvas.
 * Generates lightweight ~180KB JPEG blobs to ensure fast server upload.
 */
async function compressImageFile(file, maxDimension = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !file || typeof FileReader === 'undefined') {
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
 * Upload product image to Cloudinary via server-signed endpoint (/api/upload).
 * @param {File} file           - File object from <input type="file">
 * @param {Function} onProgress - Optional progress callback(percent)
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export async function uploadProductImage(file, onProgress) {
  onProgress?.(10);
  let uploadFile = file;

  // Step 1: Client-side compression
  try {
    uploadFile = await compressImageFile(file);
    onProgress?.(40);
  } catch (err) {
    console.warn('Canvas compression fallback:', err);
  }

  // Step 2: Server API Route /api/upload (Signed SHA-1 Upload)
  const formData = new FormData();
  formData.append('file', uploadFile);

  onProgress?.(60);
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (response.ok && data.url) {
    onProgress?.(100);
    return {
      url: data.url,
      public_id: data.public_id || null,
    };
  }

  throw new Error(data.error || `Upload failed with status ${response.status}`);
}
