import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { linkLabel, useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/call/")({
  head: () => ({
    meta: [
      { title: "المكالمات الشبكية — اتصال" },
      {
        name: "description",
        content: "ابدأ مكالمة صوتية منخفضة الكمون بين الأجهزة عبر Wi‑Fi Direct أو BLE دون شريحة أو إنترنت.",
      },
      { property: "og:title", content: "المكالمات الشبكية — اتصال" },
      { property: "og:description", content: "اختر عقدة قريبة وابدأ مكالمة P2P مشفّرة فوراً." },
    ],
  }),
  component: CallListPage,
});

function CallListPage() {
  const { peers } = useMesh();

  return (
    <AppShell title="المكالمات" subtitle="صوت مباشر بين الأجهزة، بلا شبكة عمومية">
      <ul className="space-y-3">
        {peers.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-card-foreground">{p.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {linkLabel(p.link)} · {p.rssi} dBm
              </p>
            </div>
            <Link
              to="/call/$peerId"
              params={{ peerId: p.id }}
              aria-label={`اتصال بـ ${p.name}`}
              className="rounded-full bg-primary p-3 text-primary-foreground"
            >
              <Phone className="size-4" />
            </Link>
          </li>
        ))}
        {peers.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            لا توجد عقد متاحة للاتصال حالياً.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
