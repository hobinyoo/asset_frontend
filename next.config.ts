import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://15.164.221.121:8080/api/:path*',
      },
    ]
  },
}

export default nextConfig
