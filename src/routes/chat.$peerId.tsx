import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Send, ShieldCheck } from "lucide-react";
import { useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/chat/$peerId")({
  head: () => ({
    meta: [
      { title: "محادثة مشفّرة — اتصال" },
      { name: "description", content: "رسائل نصية مشفّرة من طرف إلى طرف تُنقل عبر قفزات الشبكة اللاسلكية." },
      { property: "og:title", content: "محادثة مشفّرة — اتصال" },
      { property: "og:description", content: "رسائل تُمسح تلقائياً بانتهاء عمر الحزمة، بدون أي أثر على القرص." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { peerId } = Route.useParams();
  const { peers, messages, sendMessage } = useMesh();
  const [draft, setDraft] = useState("");
  const peer = peers.find((p) => p.id === peerId);
  if (!peer) throw notFound();

  const thread = messages.filter((m) => m.peerId === peerId);

  return (
    <div dir="rtl" className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/60 bg-background/90 px-4 py-4 backdrop-blur-xl">
        <Link to="/" className="text-muted-foreground">
          <ArrowRight className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{peer.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{peer.fingerprint}</p>
        </div>
        <ShieldCheck className="size-4 text-primary" />
      </header>

      <div className="flex-1 space-y-3 px-4 py-5">
        {thread.map((m) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                m.mine
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-card-foreground"
              }`}
            >
              <p>{m.body}</p>
              <p className="mt-1 text-[10px] opacity-70">
                {m.at} · TTL {m.ttl}
              </p>
            </div>
          </div>
        ))}
        {thread.length === 0 && (
          <p className="pt-10 text-center text-xs text-muted-foreground">
            لا رسائل بعد. كل رسالة تُشفَّر بمفتاح لمرة واحدة.
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          sendMessage(peerId, draft.trim());
          setDraft("");
        }}
        className="sticky bottom-0 flex items-center gap-2 border-t border-border/60 bg-card/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="اكتب رسالة مشفّرة…"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
        />
        <button
          type="submit"
          aria-label="إرسال"
          className="rounded-xl bg-primary p-2.5 text-primary-foreground transition-transform active:scale-95"
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  );
}
