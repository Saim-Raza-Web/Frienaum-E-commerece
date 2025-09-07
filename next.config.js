/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Configure images
  images: {
    domains: [], // Add any external image domains here
  },
  
  // Enable static exports for static site generation
  output: 'standalone',
  
  // Enable webpack optimizations
  webpack: (config, { isServer }) => {
    // Add any webpack configurations here if needed
    return config;
  },
  
  // Configure headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Handle trailing slashes
  trailingSlash: false,
  
  // Enable production source maps
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;