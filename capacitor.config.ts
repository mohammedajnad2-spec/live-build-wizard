import type { CapacitorConfig } from "@capacitor/cli";

/**
 * إعدادات Capacitor الكاملة لتطبيق "اتصال".
 * webDir يشير إلى مخرجات بناء العميل (dist/client) وجميع المسارات نسبية
 * ليعمل التطبيق داخل WebView بدون أخطاء مسارات.
 */
const config: CapacitorConfig = {
  appId: "app.lovable.etisal.mesh",
  appName: "اتصال",
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
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0b0f10",
      overlaysWebView: false,
    },
    Haptics: {},
  },
};

export default config;
