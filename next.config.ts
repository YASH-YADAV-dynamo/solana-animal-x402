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
  serverExternalPackages: ['viem'],
  turbopack: {},
  experimental: {
    optimizePackageImports: ['x402-next'],
  },
}

// Bundle analyzer - enabled by default when using --webpack flag
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
