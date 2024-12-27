import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.bsky.app',
      },
      {
        protocol: 'https',
        hostname: 'video.bsky.app',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',                            // Frontend API routes
        destination: 'http://127.0.0.1:3001/api/:path*',  // Backend API routes
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/timeline',
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
            key: "Access-Control-Allow-Methods",
            value: "GET",
          }
        ],
      },
    ];
  },
};

export default nextConfig;
