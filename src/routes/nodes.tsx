import { createFileRoute, Link } from "@tanstack/react-router";
import { Bluetooth, Wifi, Radio, Activity } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { linkLabel, signalBars, useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/nodes")({
  head: () => ({
    meta: [
      { title: "خريطة العقد والحالة — اتصال" },
      {
        name: "description",
        content: "خريطة حيّة لطوبولوجيا الشبكة: العقد النشطة، قوة الإشارة، عدد القفزات، وصحة روابط BLE وWi‑Fi Direct.",
      },
      { property: "og:title", content: "خريطة العقد والحالة — اتصال" },
      { property: "og:description", content: "تتبّع صحة روابط BLE وWi‑Fi Direct وقوة إشارة كل عقدة لحظياً." },
    ],
  }),
  component: NodesPage,
});

function NodesPage() {
  const { peers, meshOn } = useMesh();
  const active = meshOn ? peers : [];
  const ble = active.filter((p) => p.link === "ble").length;
  const wifi = active.filter((p) => p.link === "wifi-aware").length;
  const avg = active.length
    ? Math.round(active.reduce((s, p) => s + p.rssi, 0) / active.length)
    : 0;

  return (
    <AppShell title="العقد" subtitle="طوبولوجيا حيّة لشبكة القفزات المتعددة">
      <section className="relative grid h-72 place-items-center overflow-hidden rounded-3xl border border-border/70 bg-gradient-mesh shadow-soft">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute size-24 rounded-full border border-primary/40 animate-ping-slow"
            style={{ animationDelay: `${i * 0.8}s` }}
          />
        ))}

        <div className="z-10 grid size-16 place-items-center rounded-full border border-primary/50 bg-primary/20 text-center">
          <Radio className="size-6 text-primary" />
        </div>

        {active.map((p, i) => {
          const angle = (i / Math.max(active.length, 1)) * Math.PI * 2 - Math.PI / 2;
          const radius = 62 + p.hops * 14;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <Link
              key={p.id}
              to="/chat/$peerId"
              params={{ peerId: p.id }}
              className="absolute z-10 flex w-20 flex-col items-center gap-1"
              style={{ transform: `translate(${x}px, ${y}px)` }}
            >
              <span
                className={`grid size-9 place-items-center rounded-full border text-[10px] font-semibold ${
                  p.link === "wifi-aware"
                    ? "border-primary/60 bg-primary/25 text-primary"
                    : "border-accent/60 bg-accent/20 text-accent"
                }`}
              >
                {p.hops}
              </span>
              <span className="truncate text-[9px] text-muted-foreground">{p.name}</span>
            </Link>
          );
        })}

        {!meshOn && (
          <p className="absolute bottom-4 text-[11px] text-muted-foreground">
            الشبكة متوقفة — لا يوجد استكشاف
          </p>
        )}
      </section>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        {[
          { icon: Bluetooth, k: "روابط BLE", v: ble },
          { icon: Wifi, k: "Wi‑Fi Direct", v: wifi },
          { icon: Activity, k: "متوسط dBm", v: active.length ? avg : "—" },
        ].map(({ icon: Icon, k, v }) => (
          <div key={k} className="rounded-2xl border border-border/60 bg-card p-3 text-center">
            <Icon className="mx-auto size-4 text-primary" />
            <dt className="mt-1 text-[10px] text-muted-foreground">{k}</dt>
            <dd className="font-mono text-sm text-card-foreground">{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-6 text-sm font-semibold text-foreground">صحة الروابط</h2>
      <ul className="mt-3 space-y-3">
        {active.map((p) => (
          <li key={p.id} className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-card-foreground">{p.name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {linkLabel(p.link)} · {p.hops} قفزة · {p.rssi} dBm
                </p>
              </div>
              <span className="flex items-end gap-0.5">
                {[1, 2, 3, 4].map((b) => (
                  <span
                    key={b}
                    className={`w-1 rounded-full ${b <= signalBars(p.rssi) ? "bg-primary" : "bg-muted"}`}
                    style={{ height: 4 + b * 3 }}
                  />
                ))}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.max(8, Math.min(100, (p.rssi + 100) * 1.6))}%` }}
              />
            </div>
          </li>
        ))}
        {active.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            شغّل الشبكة من الصفحة الرئيسية لبدء الاستكشاف الصامت.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
