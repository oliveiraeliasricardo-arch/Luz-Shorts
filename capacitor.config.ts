// Configuração do Capacitor para empacotar o Luz Shorts como aplicativo nativo Android / iOS
export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  server?: {
    androidScheme?: string;
    url?: string;
    cleartext?: boolean;
  };
  plugins?: Record<string, unknown>;
}

const config: CapacitorConfig = {
  appId: 'com.luzshorts.app',
  appName: 'Luz Shorts',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: '#0369a1',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
