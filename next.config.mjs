/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xuwihgelelgpnoafwjva.supabase.co',
      },
    ],
  },
  
  // Disable x-powered-by header for security
  poweredByHeader: false,
  
  // Increase API body size limit for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
