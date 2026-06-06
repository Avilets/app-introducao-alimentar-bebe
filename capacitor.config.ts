import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rotinaalimentarbebe.app',
  appName: 'Baby Grow',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
