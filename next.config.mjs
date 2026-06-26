/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for better Amplify compatibility
  output: 'standalone',
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xuwihgelelgpnoafwjva.supabase.co',
      },
    ],
  },
  
  // Increase body size limit for file uploads
  bodySizeLimit: 10 * 1024 * 1024, // 10MB
  
  // Disable x-powered-by header for security
  poweredByHeader: false,
};

export default nextConfig;
