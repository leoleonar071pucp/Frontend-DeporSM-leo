/** @type {import('next').NextConfig} */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000/';


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
      // Instalaciones
      {
        source: '/api/instalaciones/:path*',
        destination: `${API_BASE_URL}/instalaciones/:path*`,
      },
      {
        source: '/api/instalaciones',
        destination: `${API_BASE_URL}/instalaciones`,
      },
      // Mantenimientos
      {
        source: '/api/mantenimientos/:path*',
        destination: `${API_BASE_URL}/mantenimientos/:path*`,
      },
      {
        source: '/api/mantenimientos',
        destination: `${API_BASE_URL}/mantenimientos`,
      },
      // Usuarios
      {
        source: '/api/usuarios/:path*',
        destination: `${API_BASE_URL}/usuarios/:path*`,
      },
      {
        source: '/api/usuarios',
        destination: `${API_BASE_URL}/usuarios`,
      },
      // Reservas
      {
        source: '/api/reservas/:path*',
        destination: `${API_BASE_URL}/reservas/:path*`,
      },
      {
        source: '/api/reservas',
        destination: `${API_BASE_URL}/reservas`,
      },
      // Autenticación
      {
        source: '/api/auth/:path*',
        destination: `${API_BASE_URL}/auth/:path*`,
      },
      {
        source: '/api/auth',
        destination: `${API_BASE_URL}/auth`,
      },
      // Reportes
      {
        source: '/api/reportes/:path*',
        destination: `${API_BASE_URL}/reportes/:path*`,
      },
      {
        source: '/api/reportes',
        destination: `${API_BASE_URL}/reportes`,
      },
      // Admin Dashboard
      {
        source: '/api/admin/:path*',
        destination: `${API_BASE_URL}/admin/:path*`,
      },
      {
        source: '/api/admin',
        destination: `${API_BASE_URL}/admin`,
      },
    ]
  },
}

module.exports = nextConfig // ✅ No ejecutamos como función, solo exportamos el objeto
