import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  eslint: {
    // Ignorar erros de ESLint durante build em produção
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros de TypeScript durante build em produção
    ignoreBuildErrors: true,
  },
}

export default nextConfig
