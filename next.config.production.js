/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de produção
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  
  // Configurações de imagens otimizadas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: '*.runpod.io',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Configurações de segurança
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
        {
          key: 'Pragma',
          value: 'no-cache',
        },
        {
          key: 'Expires',
          value: '0',
        },
      ],
    },
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],

  // Configurações de redirecionamento
  redirects: async () => [
    {
      source: '/admin',
      destination: '/admin/monitoring',
      permanent: false,
    },
  ],

  // Configurações de rewrites
  rewrites: async () => [
    {
      source: '/healthz',
      destination: '/api/health',
    },
    {
      source: '/status',
      destination: '/api/health',
    },
  ],

  // Configurações de experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    serverComponentsExternalPackages: ['sharp'],
  },

  // Configurações de webpack
  webpack: (config, { dev, isServer }) => {
    // Otimizações para produção
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.minimize = true;
    }

    // Configuração para Sharp (processamento de imagens)
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push('sharp');
    }

    return config;
  },

  // Configurações de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configurações de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Configurações de ambiente
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Configurações de trailing slash
  trailingSlash: false,

  // Configurações de base path (se necessário)
  // basePath: '',

  // Configurações de asset prefix (se necessário)
  // assetPrefix: '',

  // Configurações de distDir
  distDir: '.next',

  // Configurações de generateEtags
  generateEtags: true,

  // Configurações de onDemandEntries
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Configurações de pageExtensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Configurações de reactStrictMode
  reactStrictMode: true,

  // Configurações de swcMinify
  swcMinify: true,

  // Configurações de compiler
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },

  // Configurações de i18n (se necessário)
  // i18n: {
  //   locales: ['pt-BR', 'en'],
  //   defaultLocale: 'pt-BR',
  // },

  // Configurações de sass (se necessário)
  // sassOptions: {
  //   includePaths: ['./src/styles'],
  // },

  // Configurações de transpilePackages
  transpilePackages: ['@radix-ui/react-icons', 'lucide-react'],

  // Configurações de modularizeImports
  modularizeImports: {
    '@radix-ui/react-icons': {
      transform: '@radix-ui/react-icons/{{member}}',
    },
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
};

module.exports = nextConfig;
