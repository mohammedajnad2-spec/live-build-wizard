import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — اتصال" },
      { name: "description", content: "اضبط الخصوصية، عمر الحزمة، تمويه الهوية، وسلوك الترحيل في شبكة اتصال." },
      { property: "og:title", content: "الإعدادات — اتصال" },
      { property: "og:description", content: "تحكّم كامل في الخصوصية وسلوك الترحيل وعمر الحزم." },
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

function SettingsPage() {
  const { myFingerprint } = useMesh();
  const [on, setOn] = useState<Record<string, boolean>>({
    relay: true,
    rotate: true,
    pq: true,
    wipe: true,
  });
  const [ttl, setTtl] = useState(8);

  return (
    <AppShell title="الإعدادات" subtitle="الخصوصية أولاً، بشكل افتراضي">
      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
        <p className="text-xs text-muted-foreground">بصمة هويتي</p>
        <p className="mt-1 font-mono text-sm tracking-widest text-card-foreground">{myFingerprint}</p>
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
        />
        <p className="mt-2 text-[11px] text-muted-foreground">
          قيمة أعلى = مدى أوسع، لكن استهلاك بطارية أكبر على العقد المجاورة.
        </p>
      </section>
    </AppShell>
  );
}
