/**
 * يولّد ملف dist/client/index.html (قشرة SPA) بعد بناء Vite،
 * لأن TanStack Start يبني SSR بدون index.html ثابت، وCapacitor يحتاجه
 * كنقطة دخول لتطبيق WebView.
 *
 * الاستخدام: node scripts/mobile-shell.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CLIENT_DIR = join(process.cwd(), "dist", "client");
const SERVER_DIR = join(process.cwd(), "dist", "server");

if (!existsSync(CLIENT_DIR)) {
  console.error("[mobile-shell] لم يتم العثور على dist/client — نفّذ vite build أولاً.");
  process.exit(1);
}

// 1) نقطة دخول العميل من مانيفست TanStack Start
const manifestFile = readdirSync(SERVER_DIR).find((f) =>
  f.startsWith("_tanstack-start-manifest_v"),
);
let entry = null;
if (manifestFile) {
  const src = readFileSync(join(SERVER_DIR, manifestFile), "utf8");
  entry = src.match(/src:\s*"(\/assets\/[^"]+\.js)"/)?.[1] ?? null;
}
if (!entry) {
  // احتياطي: أول ملف index-*.js في مجلد الأصول
  const fallback = readdirSync(join(CLIENT_DIR, "assets")).find(
    (f) => f.startsWith("index-") && f.endsWith(".js"),
  );
  entry = fallback ? `/assets/${fallback}` : null;
}
if (!entry) {
  console.error("[mobile-shell] تعذّر تحديد نقطة دخول العميل.");
  process.exit(1);
}

// 2) ملفات الأنماط
const css = readdirSync(join(CLIENT_DIR, "assets"))
  .filter((f) => f.endsWith(".css"))
  .map((f) => `    <link rel="stylesheet" href="/assets/${f}" />`)
  .join("\n");

const html = `<!doctype html>
<html lang="ar" dir="rtl" class="dark" style="color-scheme: dark">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1"
    />
    <meta name="theme-color" content="#0F172A" />
    <title>اتصال — شبكة تواصل بلا إنترنت</title>
    <meta
      name="description"
      content="تطبيق اتصال: مراسلة ومكالمات مشفّرة بين الأجهزة عبر BLE وWi‑Fi Direct دون إنترنت أو شريحة."
    />
    <link rel="icon" href="/favicon.ico" />
${css}
  </head>
  <body style="background-color: #0f172a; margin: 0">
    <div id="root"></div>
    <script type="module" src="${entry}"></script>
  </body>
</html>
`;

writeFileSync(join(CLIENT_DIR, "index.html"), html, "utf8");
console.log(`[mobile-shell] تم إنشاء dist/client/index.html (entry: ${entry})`);
