/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — product images uploaded by admin
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Google user profile photos (Google Sign-in)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Firebase Storage (if used)
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
    // Quality preset for product images
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
