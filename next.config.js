/** @type {import('next').NextConfig} */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  async redirects() {
    return [
      {
        source: '/coordinador/horario',
        destination: '/coordinador/asistencia/calendario',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/instalaciones/:path*',
        destination: `${API_BASE_URL}/instalaciones/:path*`,
      },
      {
        source: '/api/instalaciones',
        destination: `${API_BASE_URL}/instalaciones`,
      },
      {
        source: '/api/mantenimientos/:path*',
        destination: `${API_BASE_URL}/mantenimientos/:path*`,
      },
      {
        source: '/api/mantenimientos',
        destination: `${API_BASE_URL}/mantenimientos`,
      },
      {
        source: '/api/usuarios/:path*',
        destination: `${API_BASE_URL}/usuarios/:path*`,
      },
      {
        source: '/api/usuarios',
        destination: `${API_BASE_URL}/usuarios`,
      },
      {
        source: '/api/reservas/:path*',
        destination: `${API_BASE_URL}/reservas/:path*`,
      },
      {
        source: '/api/reservas',
        destination: `${API_BASE_URL}/reservas`,
      },
    ]
  },
}

module.exports = nextConfig // ✅ No ejecutamos como función, solo exportamos el objeto
