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

  // ESLint构建时忽略错误
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack 配置
  webpack: (config, { isServer }) => {
    // 排除 sherpa-onnx 的 Node.js 特定模块
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      // 在客户端构建中忽略整个 sherpa-onnx 包和相关hooks
      // 注意：不要排除 @/plugins/local-asr，因为 Capacitor 需要它
      config.resolve.alias = {
        ...config.resolve.alias,
        'sherpa-onnx': false,
        '@/hooks/useLocalASR': false,
        '@/hooks/useLocalASRAndroid': false,
        '@/services/asr/sherpa.service': false,
      };
    }

    // 外部化 sherpa-onnx-nodejs 模块（只在服务器端使用）
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('sherpa-onnx/sherpa-onnx-wasm-nodejs');
    }

    return config;
  },
};

module.exports = nextConfig;
