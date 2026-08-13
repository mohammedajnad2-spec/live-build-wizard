import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin, ShieldAlert, Signal } from "lucide-react";
import { useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/sos")({
  head: () => ({
    meta: [
      { title: "نداء استغاثة — اتصال" },
      {
        name: "description",
        content: "بوابة بث استغاثة عالية الأولوية مع تأكيد بالضغط المستمر ومؤشرات موقع تقديرية وبث لكل عقد النطاق.",
      },
      { property: "og:title", content: "نداء استغاثة — اتصال" },
      { property: "og:description", content: "استمر بالضغط ثلاث ثوانٍ لبث نداء موقّع رقمياً إلى كل العقد القريبة." },
    ],
  }),
  component: SosPage,
});

const HOLD_MS = 3000;

function SosPage() {
  const { fireAlert, alerts, peers, meshOn } = useMesh();
  const [progress, setProgress] = useState(0);
  const [sent, setSent] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setProgress(0);
  };

  useEffect(() => () => stop(), []);

  const start = () => {
    if (timer.current) return;
    const startedAt = Date.now();
    timer.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - startedAt) / HOLD_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        stop();
        fireAlert();
        setSent(true);
      }
    }, 50);
  };

  return (
    <div
      dir="rtl"
      className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-6 pt-6 pb-12"
    >
      <Link to="/" className="text-muted-foreground" aria-label="رجوع">
        <ArrowRight className="size-5" />
      </Link>

      <div className="mt-8 flex flex-1 flex-col items-center text-center">
        <button
          onPointerDown={start}
          onPointerUp={stop}
          onPointerLeave={stop}
          onPointerCancel={stop}
          className="relative grid size-52 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-alert transition-transform active:scale-95"
        >
          <span
            className="absolute inset-0 rounded-full border-4 border-destructive-foreground/70 transition-all"
            style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}
          />
          <span className="flex flex-col items-center gap-2">
            <ShieldAlert className="size-12" />
            <span className="font-display text-lg">استمر بالضغط</span>
            <span className="font-mono text-xs opacity-80">{Math.round(progress)}%</span>
          </span>
        </button>

        <p className="mt-8 text-sm text-foreground">
          سيصل النداء إلى {meshOn ? peers.length : 0} عقدة خلال ثوانٍ عبر قفزات متعددة.
        </p>

        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border/70 bg-card p-3 text-right">
            <MapPin className="size-4 text-primary" />
            <p className="mt-1 text-[11px] text-muted-foreground">موقع تقديري</p>
            <p className="font-mono text-xs text-card-foreground">±120 م (شدة إشارة)</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-3 text-right">
            <Signal className="size-4 text-primary" />
            <p className="mt-1 text-[11px] text-muted-foreground">مدى البث</p>
            <p className="font-mono text-xs text-card-foreground">
              {meshOn ? Math.max(...peers.map((p) => p.hops), 0) : 0} قفزات
            </p>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground">
          النداء موقّع رقمياً ويتجاوز الوضع الصامت على الأجهزة الموثوقة فقط.
        </p>

        {sent && (
          <div className="mt-6 w-full rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-right">
            <p className="text-xs font-semibold text-destructive">تم البث بنجاح</p>
            <ul className="mt-2 space-y-1">
              {alerts.map((a) => (
                <li key={a.id} className="text-[11px] text-muted-foreground">
                  نداء من {a.from} · {a.at}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
