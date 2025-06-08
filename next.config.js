/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  experimental: {
    typedRoutes: true,
  },
  eslint: {
    // Build時のESLintエラーを警告に変更（一時的）
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Build時のTypeScriptエラーを一時的に警告に変更
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
