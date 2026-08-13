import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, MessageSquare, ShieldOff, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { linkLabel, useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/devices")({
  head: () => ({
    meta: [
      { title: "الأجهزة المسجّلة — اتصال" },
      {
        name: "description",
        content: "إدارة الأجهزة المقترنة: شارات التحقق بالمفتاح العام، حالة الجهاز، وأدوات السحب أو التصريح.",
      },
      { property: "og:title", content: "الأجهزة المسجّلة — اتصال" },
      { property: "og:description", content: "تحقّق من بصمات المفاتيح واسحب الثقة من أي عقدة بلمسة." },
    ],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const { peers, verifyPeer, forgetPeer, revokePeer, authorizePeer } = useMesh();

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
                  {p.revoked && <ShieldOff className="size-4 text-destructive" />}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{p.fingerprint}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {linkLabel(p.link)} · {p.lastSeen} ·{" "}
                  {p.revoked ? "مسحوبة الثقة" : p.verified ? "موثوقة" : "غير موثّقة"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-2">
                {p.revoked ? (
                  <button
                    onClick={() => authorizePeer(p.id)}
                    className="rounded-xl bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground"
                  >
                    تصريح
                  </button>
                ) : p.verified ? (
                  <button
                    onClick={() => revokePeer(p.id)}
                    className="rounded-xl border border-destructive/50 px-3 py-2 text-[11px] font-semibold text-destructive"
                  >
                    سحب الثقة
                  </button>
                ) : (
                  <button
                    onClick={() => verifyPeer(p.id)}
                    className="rounded-xl bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground"
                  >
                    توثيق
                  </button>
                )}
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to="/chat/$peerId"
                    params={{ peerId: p.id }}
                    aria-label="محادثة"
                    className="rounded-xl border border-border p-2 text-muted-foreground"
                  >
                    <MessageSquare className="size-4" />
                  </Link>
                  <button
                    onClick={() => forgetPeer(p.id)}
                    aria-label="إزالة الجهاز"
                    className="rounded-xl border border-border p-2 text-muted-foreground"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
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
