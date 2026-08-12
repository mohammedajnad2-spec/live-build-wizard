import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { linkLabel, useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "الأجهزة المسجّلة — اتصال" },
      { name: "description", content: "إدارة الأجهزة المقترنة، التحقق من البصمات، وإزالة العقد غير الموثوقة." },
      { property: "og:title", content: "الأجهزة المسجّلة — اتصال" },
      { property: "og:description", content: "إدارة الأجهزة المقترنة والتحقق من بصماتها داخل شبكة اتصال." },
    ],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const { peers, verifyPeer, forgetPeer } = useMesh();

  return (
    <AppShell title="الأجهزة" subtitle="كل عقدة موثوقة تحمل بصمة مفتاح فريدة">
      <ul className="space-y-3">
        {peers.map((p) => (
          <li key={p.id} className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
                  {p.name}
                  {p.verified && <BadgeCheck className="size-4 text-primary" />}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{p.fingerprint}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {linkLabel(p.link)} · {p.lastSeen}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!p.verified && (
                  <button
                    onClick={() => verifyPeer(p.id)}
                    className="rounded-xl bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground"
                  >
                    توثيق
                  </button>
                )}
                <button
                  onClick={() => forgetPeer(p.id)}
                  aria-label="إزالة الجهاز"
                  className="rounded-xl border border-border p-2 text-muted-foreground"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
        {peers.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            لا توجد أجهزة مسجّلة بعد. ابدأ من صفحة الاقتران.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
