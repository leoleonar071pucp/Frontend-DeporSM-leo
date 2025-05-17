import 'dotenv/config'

let userConfig = undefined

try {
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

/** @type {import('next').NextConfig} */
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
    ];
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
    ]
  },
}

if (userConfig) {
  const config = userConfig.default || userConfig
  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
