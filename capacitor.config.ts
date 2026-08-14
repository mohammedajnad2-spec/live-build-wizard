import type { CapacitorConfig } from "@capacitor/cli";

/**
 * إعدادات Capacitor الكاملة لتطبيق "اتصال".
 * webDir يشير إلى مخرجات بناء العميل (dist/client) وجميع المسارات نسبية
 * ليعمل التطبيق داخل WebView بدون أخطاء مسارات.
 */
const config: CapacitorConfig = {
  appId: "com.alamri.etsal",
  appName: "اتصال",
  // مخرجات بناء العميل في TanStack Start هي dist/client (وليس dist)
  webDir: "dist/client",
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: "#0b0f10",
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#0b0f10",
  },
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
    cleartext: true,
    // لتجربة التطوير الحية على الجهاز، أزل التعليق وضع عنوان جهازك:
    // url: "http://192.168.1.10:8080",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0F172A",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0F172A",
      overlaysWebView: false,
    },
    Camera: {},
    Haptics: {},
  },
};

export default config;
