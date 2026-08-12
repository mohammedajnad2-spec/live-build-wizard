import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QrCode, ScanLine } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/pair")({
  head: () => ({
    meta: [
      { title: "اقتران الأجهزة — اتصال" },
      { name: "description", content: "اقترن مع جهاز قريب عبر رمز QR لتبادل حزمة الهوية المشفّرة دون إنترنت." },
      { property: "og:title", content: "اقتران الأجهزة — اتصال" },
      { property: "og:description", content: "تبادل حزم الهوية عبر رمز QR وأنشئ جلسة مشفّرة فورية." },
    ],
  }),
  component: PairPage,
});

function PairPage() {
  const { myFingerprint, addPeer } = useMesh();
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"show" | "scan">("show");

  return (
    <AppShell title="الاقتران" subtitle="تبادل الهوية وجهاً لوجه، بلا سيرفر">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/70 bg-secondary p-1">
        {(
          [
            ["show", "رمزي", QrCode],
            ["scan", "مسح رمز", ScanLine],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-colors ${
              mode === key ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {mode === "show" ? (
        <section className="mt-5 rounded-3xl border border-border/70 bg-card p-6 text-center shadow-soft">
          <div className="mx-auto grid size-44 grid-cols-8 gap-1 rounded-2xl bg-foreground/95 p-3">
            {Array.from({ length: 64 }).map((_, i) => (
              <span
                key={i}
                className={`rounded-[2px] ${
                  (i * 7 + (i % 5) * 3) % 3 === 0 ? "bg-primary" : "bg-transparent"
                }`}
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">بصمة مفتاحي</p>
          <p className="mt-1 font-mono text-sm tracking-widest text-card-foreground">{myFingerprint}</p>
          <p className="mt-3 text-[11px] text-muted-foreground">
            اطلب من الطرف الآخر مطابقة البصمة قبل تأكيد الاقتران.
          </p>
        </section>
      ) : (
        <section className="mt-5 rounded-3xl border border-border/70 bg-card p-6 shadow-soft">
          <div className="relative mx-auto grid h-44 w-full place-items-center overflow-hidden rounded-2xl border border-primary/40 bg-muted">
            <span className="absolute inset-x-6 h-px animate-scan bg-primary" />
            <ScanLine className="size-10 text-muted-foreground" />
          </div>
          <label className="mt-5 block text-xs text-muted-foreground" htmlFor="peer-name">
            اسم الجهاز الممسوح
          </label>
          <input
            id="peer-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: جهاز سارة"
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <button
            disabled={!name.trim()}
            onClick={() => {
              addPeer(name.trim());
              setName("");
              setMode("show");
            }}
            className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            تأكيد الاقتران
          </button>
        </section>
      )}
    </AppShell>
  );
}
