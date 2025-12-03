import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.giphy.com',
      },
    ],
  },
  // Externalize viem to reduce middleware bundle size
  serverExternalPackages: ['viem'],
  // Turbopack config (Next.js 16+)
  turbopack: {},
}

export default nextConfig
