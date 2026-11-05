import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.bik.daman',
  appName: 'Game Daman',
  webDir: '.',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#8B7355',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#8B7355',
      showSpinner: false
    }
  }
};

export default config;
