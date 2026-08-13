import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { algoLabel, useMesh, type CryptoAlgo } from "@/lib/mesh-store";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات والبروتوكول — اتصال" },
      {
        name: "description",
        content: "اضبط الملف الشخصي، خوارزمية التشفير، قوة الراديو، عمر الحزمة، وسلوك الترحيل في شبكة اتصال.",
      },
      { property: "og:title", content: "الإعدادات والبروتوكول — اتصال" },
      { property: "og:description", content: "تحكّم كامل في التشفير وقوة الراديو وسلوك الترحيل." },
    ],
  }),
  component: SettingsPage,
});

const TOGGLES = [
  { key: "relay", label: "العمل كعقدة ترحيل", hint: "تمرير حزم الآخرين دون قراءتها" },
  { key: "rotate", label: "تدوير الهوية كل ١٥ دقيقة", hint: "يمنع التتبع السلبي" },
  { key: "pq", label: "طبقة ما بعد الكم (Kyber768)", hint: "حماية من فك التشفير المستقبلي" },
  { key: "wipe", label: "مسح فوري عند إغلاق التطبيق", hint: "لا يبقى أي أثر في الذاكرة" },
] as const;

const ALGOS: CryptoAlgo[] = ["aes-256-gcm", "chacha20", "kyber768"];

function SettingsPage() {
  const {
    myFingerprint,
    profileName,
    setProfileName,
    cryptoAlgo,
    setCryptoAlgo,
    radioPower,
    setRadioPower,
    ttl,
    setTtl,
  } = useMesh();
  const { theme, toggleTheme } = useTheme();
  const [on, setOn] = useState<Record<string, boolean>>({
    relay: true,
    rotate: true,
    pq: true,
    wipe: true,
  });

  return (
    <AppShell title="الإعدادات" subtitle="الخصوصية أولاً، بشكل افتراضي">
      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
        <label htmlFor="profile-name" className="text-xs text-muted-foreground">
          اسم جهازي المعروض
        </label>
        <input
          id="profile-name"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
        />
        <p className="mt-3 text-xs text-muted-foreground">بصمة هويتي</p>
        <p className="mt-1 font-mono text-sm tracking-widest text-card-foreground">{myFingerprint}</p>
      </section>

      <section className="mt-4 rounded-2xl border border-border/70 bg-card p-4">
        <p className="text-sm font-medium text-card-foreground">خوارزمية التشفير</p>
        <div className="mt-3 space-y-2">
          {ALGOS.map((a) => (
            <button
              key={a}
              onClick={() => setCryptoAlgo(a)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-xs transition-colors ${
                cryptoAlgo === a
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              <span>{algoLabel(a)}</span>
              <span className="size-2 rounded-full bg-current" />
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-card-foreground">قوة إرسال الراديو</p>
          <span className="font-mono text-sm text-primary">{radioPower}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          step={5}
          value={radioPower}
          onChange={(e) => setRadioPower(Number(e.target.value))}
          className="mt-3 w-full accent-primary"
          aria-label="قوة إرسال الراديو"
        />
        <p className="mt-2 text-[11px] text-muted-foreground">
          قوة أعلى = مدى أوسع، مع استهلاك بطارية وبصمة كشف أكبر.
        </p>
      </section>

      <section className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4">
        <div>
          <p className="text-sm font-medium text-card-foreground">
            {theme === "dark" ? "الوضع الليلي" : "الوضع النهاري"}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            الوضع الليلي يقلّل توهج الشاشة في الميدان
          </p>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="تبديل الوضع"
          className="rounded-full border border-primary/40 bg-primary/10 p-2.5 text-primary"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </section>

      <ul className="mt-4 space-y-3">
        {TOGGLES.map((t) => (
          <li
            key={t.key}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4"
          >
            <div>
              <p className="text-sm font-medium text-card-foreground">{t.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{t.hint}</p>
            </div>
            <button
              onClick={() => setOn((s) => ({ ...s, [t.key]: !s[t.key] }))}
              aria-label={t.label}
              className={`relative h-8 w-14 shrink-0 rounded-full border transition-colors ${
                on[t.key] ? "border-primary/50 bg-primary/25" : "border-border bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 size-6 rounded-full transition-all ${
                  on[t.key] ? "right-1 bg-primary" : "right-7 bg-muted-foreground"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>

      <section className="mt-4 rounded-2xl border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-card-foreground">أقصى عدد قفزات (TTL)</p>
          <span className="font-mono text-sm text-primary">{ttl}</span>
        </div>
        <input
          type="range"
          min={2}
          max={12}
          value={ttl}
          onChange={(e) => setTtl(Number(e.target.value))}
          className="mt-3 w-full accent-primary"
          aria-label="أقصى عدد قفزات"
        />
        <p className="mt-2 text-[11px] text-muted-foreground">
          قيمة أعلى = مدى أوسع، لكن استهلاك بطارية أكبر على العقد المجاورة.
        </p>
      </section>
    </AppShell>
  );
}
