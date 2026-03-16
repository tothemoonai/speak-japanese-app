import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.speakjapanese.app',
  appName: 'IT日语',
  webDir: 'public',  // 使用 public 目录（很小）
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,
    // 连接到已部署的 Vercel 应用
    url: 'https://speak-japanese-app.vercel.app',
    // 配置导航
    androidNavigationStyle: 'push',
    // 允许导航到任何域名
    allowNavigation: [
      'https://speak-japanese-app.vercel.app',
      'https://*.vercel.app',
      'https://*.supabase.co'
    ]
  },
  android: {
    // 录音权限说明
    permissions: [
      'INTERNET',
      'RECORD_AUDIO',
      'MODIFY_AUDIO_SETTINGS'
    ]
  },
  plugins: {
    // No custom plugins
  }
};

export default config;
