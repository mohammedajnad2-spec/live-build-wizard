import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Radio, ShieldCheck, Timer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PeerCard } from "@/components/PeerCard";
import { useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "اتصال — شبكة تواصل لاسلكية بدون شريحة" },
      {
        name: "description",
        content:
          "اتصال: تواصل مشفر بين الأجهزة القريبة عبر BLE وWi‑Fi Aware بدون شريحة أو إنترنت، مع نداء استغاثة فوري.",
      },
      { property: "og:title", content: "اتصال — شبكة تواصل لاسلكية بدون شريحة" },
      {
        property: "og:description",
        content: "شبكة متعددة القفزات مشفّرة من طرف إلى طرف تعمل بدون شريحة اتصال أو إنترنت.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { meshOn, toggleMesh, peers, alerts } = useMesh();

  return (
    <AppShell title="اتصال" subtitle="شبكة لاسلكية متعددة القفزات — بدون شريحة أو إنترنت">
      <section className="rounded-3xl border border-border/70 bg-gradient-mesh p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">حالة الشبكة</p>
            <p className="mt-1 font-display text-xl text-foreground">
              {meshOn ? "نشطة ومموّهة" : "متوقفة"}
            </p>
          </div>
          <button
            onClick={toggleMesh}
            className={`relative h-9 w-16 rounded-full border transition-colors ${
              meshOn ? "border-primary/50 bg-primary/25" : "border-border bg-muted"
            }`}
            aria-label="تشغيل أو إيقاف الشبكة"
          >
            <span
              className={`absolute top-1 size-7 rounded-full transition-all ${
                meshOn ? "right-1 bg-primary" : "right-8 bg-muted-foreground"
              }`}
            />
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-3">
          {[
            { icon: Radio, k: "العقد", v: meshOn ? peers.length : 0 },
            { icon: Timer, k: "TTL", v: "٦٠ ث" },
            { icon: Activity, k: "القفزات", v: meshOn ? Math.max(...peers.map((p) => p.hops), 0) : 0 },
          ].map(({ icon: Icon, k, v }) => (
            <div key={k} className="rounded-2xl border border-border/60 bg-card/70 p-3 text-center">
              <Icon className="mx-auto size-4 text-primary" />
              <dt className="mt-1 text-[10px] text-muted-foreground">{k}</dt>
              <dd className="font-mono text-sm text-card-foreground">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          تشفير مزدوج المفتاح (X25519 + Kyber768) ولا يُحفظ أي محتوى على القرص.
        </p>
      </section>

      {alerts.length > 0 && (
        <div className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
          <p className="text-xs font-semibold text-destructive">
            تم بث {alerts.length} نداء استغاثة عبر الشبكة
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">آخر نداء: {alerts[0]?.at}</p>
        </div>
      )}

      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">الأجهزة في النطاق</h2>
        <Link to="/devices" className="text-[11px] text-primary">
          عرض الكل
        </Link>
      </div>

      <div className="mt-3 space-y-3">
        {meshOn ? (
          peers.map((p) => <PeerCard key={p.id} peer={p} />)
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            الشبكة متوقفة. شغّل الشبكة لبدء الاستكشاف الصامت.
          </p>
        )}
      </div>
    </AppShell>
  );
}
