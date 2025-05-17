let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

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
  },  async redirects() {
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
        destination: 'http://localhost:8080/api/instalaciones/:path*',
      },
      {
        source: '/api/instalaciones',
        destination: 'http://localhost:8080/api/instalaciones',
      },
      {
        source: '/api/mantenimientos/:path*',
        destination: 'http://localhost:8080/api/mantenimientos/:path*',
      },      {
        source: '/api/mantenimientos',
        destination: 'http://localhost:8080/api/mantenimientos',
      },
      {
        source: '/api/usuarios/:path*',
        destination: 'http://localhost:8080/api/usuarios/:path*',
      },
      {
        source: '/api/usuarios',
        destination: 'http://localhost:8080/api/usuarios',
      },
    ]
  },
}

if (userConfig) {
  // ESM imports will have a "default" property
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
