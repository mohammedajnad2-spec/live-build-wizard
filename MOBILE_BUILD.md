# دليل بناء تطبيق أندرويد — "اتصال" (Etsal)

المشروع مهيّأ بالكامل للتحويل إلى تطبيق أندرويد أصلي (Hybrid) عبر Capacitor،
ومجلد `android/` مُهيَّأ مسبقاً داخل الحزمة (Gradle + AndroidManifest + gradlew).

## 1) المتطلبات

- Node.js 20+ و npm
- Android Studio (Ladybug أو أحدث) + Android SDK 34/35
- JDK 21 (المرفق مع Android Studio)

## 2) البناء السريع

```bash
npm install
npm run cap:build      # بناء الويب + توليد index.html + مزامنة أندرويد
npm run cap:open       # فتح المشروع في Android Studio
```

إذا لم يكن مجلد `android/` موجوداً (تم حذفه):

```bash
npm run cap:add        # npx cap add android
npm run cap:build
```

## 3) السكربتات المتاحة

| السكربت | الوظيفة |
| --- | --- |
| `npm run dev` | خادم التطوير (Vite) |
| `npm run build` | بناء المشروع (عميل + SSR) |
| `npm run mobile:build` | بناء + توليد `dist/client/index.html` لقشرة WebView |
| `npm run cap:build` | `mobile:build` + `cap sync android` |
| `npm run cap:add` | إضافة منصة أندرويد |
| `npm run cap:open` | فتح المشروع في Android Studio |
| `npm run cap:sync` | مزامنة كل المنصات |

> ملاحظة تقنية: هذا المشروع يعمل على TanStack Start، ومخرجات العميل تُبنى في
> `dist/client` (لذلك `webDir: "dist/client"`). ولأن البناء موجّه لـ SSR ولا يُخرج
> ملف `index.html` ثابتاً، يقوم `scripts/mobile-shell.mjs` بتوليد قشرة
> `index.html` تشير إلى نقطة دخول العميل والأنماط — وهي نقطة الدخول التي يحمّلها
> WebView. لا حاجة لأي خادم أثناء التشغيل: التطبيق يعمل بالكامل دون إنترنت.

## 4) إخراج APK / AAB

من Android Studio: `Build > Build Bundle(s)/APK(s)`، أو من سطر الأوامر:

```bash
cd android
./gradlew assembleDebug        # APK للتجربة
./gradlew assembleRelease      # APK للإنتاج (يتطلب توقيعاً)
./gradlew bundleRelease        # AAB لمتجر Google Play
```

على ويندوز استخدم `gradlew.bat` بدل `./gradlew`.

### التوقيع (Release)

أنشئ مفتاحاً ثم أضف `android/keystore.properties` (لا ترفعه إلى Git):

```properties
storeFile=../etsal-release.jks
storePassword=****
keyAlias=etsal
keyPassword=****
```

```bash
keytool -genkey -v -keystore etsal-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias etsal
```

## 5) الإعدادات الأصلية

`capacitor.config.ts`:

- `appId: "com.alamri.etsal"` · `appName: "اتصال"` · `webDir: "dist/client"`
- `server.androidScheme: "https"` و `cleartext: true` للتجربة المحلية
- `SplashScreen`: مدة ٢٠٠٠ مللي ثانية وخلفية `#0F172A`
- `StatusBar`: نمط داكن بخلفية `#0F172A`
- للتجربة الحية على جهاز حقيقي: أزل التعليق عن `server.url` وضع IP جهاز التطوير

## 6) الصلاحيات المُضافة مسبقاً في `AndroidManifest.xml`

- `BLUETOOTH_SCAN` · `BLUETOOTH_CONNECT` · `BLUETOOTH_ADVERTISE` (+ القديمة حتى SDK 30)
- `ACCESS_FINE_LOCATION` · `ACCESS_COARSE_LOCATION` (اكتشاف العقد عبر BLE)
- `NEARBY_WIFI_DEVICES` · `ACCESS_WIFI_STATE` · `CHANGE_WIFI_STATE` (Wi‑Fi Direct)
- `CAMERA` (اقتران QR) · `RECORD_AUDIO` + `MODIFY_AUDIO_SETTINGS` (المكالمات)
- `POST_NOTIFICATIONS` · `VIBRATE` · `FOREGROUND_SERVICE` · `WAKE_LOCK` (نداء الاستغاثة)

الصلاحيات الحساسة (بلوتوث، موقع، كاميرا، ميكروفون، إشعارات) تحتاج طلباً
في وقت التشغيل على أندرويد 12+ عند ربط الطبقة الأصلية.

## 7) الشاشات والمسارات

| المسار | الوصف |
| --- | --- |
| `/` | لوحة الشبكة: تشغيل/إيقاف الميش، الإحصاءات، العقد القريبة |
| `/nodes` | خريطة الطوبولوجيا حسب عدد القفزات |
| `/chat` · `/chat/$peerId` | محادثات مشفّرة، حالات الحزم (انتظار/مُرحّلة/وصلت/تأكيد)، ملاحظات صوتية |
| `/call` · `/call/$peerId` | مكالمات صوتية مع مؤشرات جودة الاتصال |
| `/devices` | الأجهزة الموثوقة: منح/سحب الثقة والتحقق من البصمة |
| `/pair` | اقتران عبر QR وتبادل الهوية |
| `/settings` | الملف الشخصي، خوارزمية التشفير، قوة الإرسال، TTL |
| `/sos` | بوابة استغاثة بالضغط المستمر ٣ ثوانٍ (المسار القديم `/alert` يحوّل إليها) |

الواجهة RTL أصلية مع تبديل سلس بين الوضع الداكن والفاتح، والتنقل عبر
`<Link to params>` فقط ليعمل داخل WebView بدون إعادة تحميل.
