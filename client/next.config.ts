import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  
  images: {
    domains: ['images.unsplash.com', 'picsum.photos', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60,
  },
  
  // Production optimizations
  reactStrictMode: true,
  
  // Optimize bundle
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Redirects
  async redirects() {
    return [];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com; connect-src 'self' http://localhost:3001 ws://localhost:3001 https://smartcaf.tech wss://smartcaf.tech https://cloudflareinsights.com; img-src 'self' data: https://api.dicebear.com blob: https://images.unsplash.com https://*.googleusercontent.com https://*.backblazeb2.com; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';"
          },
        ],
      },
    ];
  },
};

export default nextConfig;
