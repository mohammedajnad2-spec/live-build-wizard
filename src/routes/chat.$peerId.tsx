import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Mic, Phone, Play, Send, ShieldCheck, Square } from "lucide-react";
import { statusLabel, useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/chat/$peerId")({
  head: () => ({
    meta: [
      { title: "محادثة مشفّرة — اتصال" },
      { name: "description", content: "رسائل نصية وملاحظات صوتية مشفّرة من طرف إلى طرف تُنقل عبر قفزات الشبكة اللاسلكية." },
      { property: "og:title", content: "محادثة مشفّرة — اتصال" },
      { property: "og:description", content: "حالة كل حزمة ظاهرة: في الانتظار، مُرحّلة، وصلت، تم التأكيد." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { peerId } = Route.useParams();
  const { peers, messages, sendMessage, sendVoiceNote } = useMesh();
  const [draft, setDraft] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const peer = peers.find((p) => p.id === peerId);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  if (!peer) throw notFound();

  const thread = messages.filter((m) => m.peerId === peerId);

  return (
    <div dir="rtl" className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/60 bg-background/90 px-4 py-4 backdrop-blur-xl">
        <Link to="/chat" className="text-muted-foreground" aria-label="رجوع">
          <ArrowRight className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{peer.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{peer.fingerprint}</p>
        </div>
        <Link
          to="/call/$peerId"
          params={{ peerId }}
          aria-label="مكالمة"
          className="rounded-full border border-primary/40 bg-primary/10 p-2 text-primary"
        >
          <Phone className="size-4" />
        </Link>
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
              {m.kind === "voice" ? (
                <span className="flex items-center gap-2">
                  <Play className="size-4" />
                  <span className="flex items-end gap-0.5">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-0.5 rounded-full bg-current opacity-70"
                        style={{ height: 4 + ((i * 5) % 14) }}
                      />
                    ))}
                  </span>
                  <span className="font-mono text-[11px]">{m.seconds}s</span>
                </span>
              ) : (
                <p>{m.body}</p>
              )}
              <p className="mt-1 text-[10px] opacity-70">
                {m.at} · TTL {m.ttl}
                {m.mine ? ` · ${statusLabel(m.status)}` : ""}
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
        {recording ? (
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 px-3 py-2.5">
            <span className="size-2 animate-pulse rounded-full bg-destructive" />
            <span className="font-mono text-xs text-destructive">جارٍ التسجيل {elapsed}s</span>
            <span className="ms-auto flex items-end gap-0.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className="w-0.5 h-4 origin-bottom rounded-full bg-destructive animate-wave"
                  style={{ animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </span>
          </div>
        ) : (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="اكتب رسالة مشفّرة…"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
        )}

        <button
          type="button"
          aria-label={recording ? "إيقاف وإرسال الملاحظة الصوتية" : "تسجيل ملاحظة صوتية"}
          onClick={() => {
            if (recording) {
              sendVoiceNote(peerId, Math.max(1, elapsed));
              setElapsed(0);
              setRecording(false);
            } else {
              setElapsed(0);
              setRecording(true);
            }
          }}
          className={`rounded-xl p-2.5 transition-transform active:scale-95 ${
            recording
              ? "bg-destructive text-destructive-foreground"
              : "border border-border text-muted-foreground"
          }`}
        >
          {recording ? <Square className="size-5" /> : <Mic className="size-5" />}
        </button>

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
