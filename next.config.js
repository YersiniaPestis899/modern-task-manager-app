/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app']
    }
  },
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development'
  },
  eslint: {
    dirs: ['src']
  },
  typescript: {
    tsconfigPath: './tsconfig.json'
  }
}

module.exports = nextConfig