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
        destination: 'https://deporsm-apiwith-1035693188565.us-central1.run.app/api/instalaciones/:path*',
      },
      {
        source: '/api/instalaciones',
        destination: 'https://deporsm-apiwith-1035693188565.us-central1.run.app/api/instalaciones',
      },
      {
        source: '/api/mantenimientos/:path*',
        destination: 'https://deporsm-apiwith-1035693188565.us-central1.run.app/api/mantenimientos/:path*',
      },      {
        source: '/api/mantenimientos',
        destination: 'https://deporsm-apiwith-1035693188565.us-central1.run.app/api/mantenimientos',
      },
      {
        source: '/api/usuarios/:path*',
        destination: 'https://deporsm-apiwith-1035693188565.us-central1.run.app/api/usuarios/:path*',
      },
      {
        source: '/api/usuarios',
        destination: 'https://deporsm-apiwith-1035693188565.us-central1.run.app/api/usuarios',
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
