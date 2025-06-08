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
    // ビルド時のESLintエラーを無視（警告のみ表示）
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScriptの厳格チェックを緩和
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
