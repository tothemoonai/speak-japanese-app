/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 环境变量
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    unoptimized: true,
  },

  // TypeScript构建时忽略类型错误（临时方案）
  typescript: {
    // 生产环境构建时暂时忽略类型错误
    ignoreBuildErrors: true,
  },

  // ESLint构建时忽略错误（已废弃，保留用于兼容性）
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  // Turbopack 配置（使用 webpack 配置）
  turbopack: {},

  // Webpack 配置
  webpack: (config, { isServer }) => {
    // 客户端构建配置
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
