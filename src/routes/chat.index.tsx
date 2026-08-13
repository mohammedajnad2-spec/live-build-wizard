import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Mic, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { statusLabel, useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [
      { title: "المحادثات المشفّرة — اتصال" },
      {
        name: "description",
        content: "كل محادثاتك المشفّرة من طرف إلى طرف مع حالة كل حزمة: في الانتظار، مُرحّلة، وصلت، وتم التأكيد.",
      },
      { property: "og:title", content: "المحادثات المشفّرة — اتصال" },
      { property: "og:description", content: "نصوص وملاحظات صوتية تُنقل عبر قفزات الشبكة بدون إنترنت." },
    ],
  }),
  component: ChatListPage,
});

function ChatListPage() {
  const { peers, messages } = useMesh();

  return (
    <AppShell title="المحادثات" subtitle="مشفّرة من طرف إلى طرف، بلا سيرفر">
      <ul className="space-y-3">
        {peers.map((p) => {
          const thread = messages.filter((m) => m.peerId === p.id);
          const last = thread[thread.length - 1];
          return (
            <li key={p.id}>
              <Link
                to="/chat/$peerId"
                params={{ peerId: p.id }}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 font-display text-lg text-primary">
                  {p.name.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-card-foreground">
                    {p.name}
                    {p.verified && <ShieldCheck className="size-3.5 text-primary" />}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                    {last?.kind === "voice" && <Mic className="size-3" />}
                    {last ? last.body : "لا رسائل بعد"}
                  </span>
                  {last && (
                    <span className="mt-0.5 block text-[10px] text-primary">
                      {last.at} · {statusLabel(last.status)}
                    </span>
                  )}
                </span>
                <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
        {peers.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            لا توجد عقد موثوقة بعد. ابدأ من صفحة الاقتران.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
