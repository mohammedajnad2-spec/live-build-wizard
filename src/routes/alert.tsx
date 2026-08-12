import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/alert")({
  head: () => ({
    meta: [
      { title: "نداء استغاثة — اتصال" },
      { name: "description", content: "بث نداء استغاثة موثّق إلى كل العقد في النطاق، حتى الأجهزة الصامتة." },
      { property: "og:title", content: "نداء استغاثة — اتصال" },
      { property: "og:description", content: "بث حرج بلمسة واحدة يتجاوز الوضع الصامت على الأجهزة القريبة." },
    ],
  }),
  component: AlertPage,
});

function AlertPage() {
  const { fireAlert, alerts, peers } = useMesh();
  const [sent, setSent] = useState(false);

  return (
    <div dir="rtl" className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background px-6 pt-6 pb-12">
      <Link to="/" className="text-muted-foreground">
        <ArrowRight className="size-5" />
      </Link>

      <div className="mt-10 flex flex-1 flex-col items-center text-center">
        <button
          onClick={() => {
            fireAlert();
            setSent(true);
          }}
          className="grid size-48 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-alert transition-transform active:scale-95"
        >
          <span className="flex flex-col items-center gap-2">
            <ShieldAlert className="size-12" />
            <span className="font-display text-lg">بث النداء</span>
          </span>
        </button>

        <p className="mt-8 text-sm text-foreground">
          سيصل النداء إلى {peers.length} عقدة خلال ثوانٍ عبر قفزات متعددة.
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          النداء موقّع رقمياً ويتجاوز الوضع الصامت على الأجهزة الموثوقة فقط.
        </p>

        {sent && (
          <div className="mt-8 w-full rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-right">
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
