# بناء تطبيق أندرويد (Capacitor)

التطبيق جاهز للتحويل إلى تطبيق أندرويد أصلي (Hybrid) عبر Capacitor.

## الخطوات

```bash
npm install
npm run cap:add:android      # بناء + إضافة منصة أندرويد + مزامنة
npm run cap:open:android     # فتح المشروع في Android Studio
```

بعد أي تعديل على الواجهة:

```bash
npm run cap:sync             # vite build + npx cap sync
```

سكربتات متاحة: `cap:add:android`, `cap:sync`, `cap:copy`, `cap:open:android`, `android:build`.

## الإعدادات

- `capacitor.config.ts` يحتوي الإعدادات الكاملة: `appId`, `appName`,
  `webDir: "dist/client"`, إعدادات أندرويد وiOS، ومخططات الخدمة (`androidScheme: https`).
- لتجربة حية على جهاز حقيقي، أزل التعليق عن `server.url` وضع عنوان IP لجهاز التطوير.

## المسارات والأصول

- جميع الأصول تُصدَّر إلى جذر `dist/client` ويُقدّمها WebView من الجذر نفسه،
  لذلك لا تنكسر المسارات داخل Android Studio.
- التنقل يعتمد على TanStack Router مع روابط `<Link to params>` فقط (لا روابط `<a href>` مركّبة)،
  ويعمل داخل WebView دون إعادة تحميل الصفحة.
- الصلاحيات المطلوبة (BLE، Wi‑Fi Aware، إشعارات حرجة) تُضاف في
  `android/app/src/main/AndroidManifest.xml` بعد إضافة المنصة — راجع ملف
  `AndroidManifest.xml` المرفق في مواصفات المشروع.
