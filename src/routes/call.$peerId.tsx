import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { linkLabel, useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/call/$peerId")({
  head: () => ({
    meta: [
      { title: "مكالمة مباشرة — اتصال" },
      { name: "description", content: "مكالمة صوتية أو مرئية مباشرة بين الأجهزة عبر Wi‑Fi Aware أو BLE دون إنترنت." },
      { property: "og:title", content: "مكالمة مباشرة — اتصال" },
      { property: "og:description", content: "جودة المكالمة تتكيّف تلقائياً مع نوع الرابط وقوة الإشارة." },
    ],
  }),
  component: CallPage,
});

function CallPage() {
  const { peerId } = Route.useParams();
  const { peers } = useMesh();
  const navigate = useNavigate();
  const peer = peers.find((p) => p.id === peerId);
  if (!peer) throw notFound();

  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [video, setVideo] = useState(peer.link === "wifi-aware");

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div
      dir="rtl"
      className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between bg-gradient-call px-6 pt-16 pb-12"
    >
      <div className="text-center">
        <div className="mx-auto grid size-28 place-items-center rounded-full border border-primary/40 bg-primary/10">
          <span className="font-display text-3xl text-primary">{peer.name.slice(0, 1)}</span>
        </div>
        <h1 className="mt-5 font-display text-2xl text-foreground">{peer.name}</h1>
        <p className="mt-1 font-mono text-sm text-primary">{mm}:{ss}</p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {linkLabel(peer.link)} · {peer.rssi} dBm ·{" "}
          {peer.link === "wifi-aware" ? "جودة عالية (صوت + فيديو)" : "وضع منخفض النطاق (صوت فقط)"}
        </p>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/60 p-5 text-center">
        <p className="text-[11px] text-muted-foreground">
          {video
            ? "تدفّق مرئي مشفّر عبر جلسة Wi‑Fi Aware مباشرة"
            : "الصوت فقط لضمان الاستقرار على الرابط الطويل المدى"}
        </p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label="كتم الصوت"
          className={`grid size-14 place-items-center rounded-full border transition-colors ${
            muted ? "border-border bg-muted text-muted-foreground" : "border-primary/40 bg-primary/15 text-primary"
          }`}
        >
          {muted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
        </button>
        <button
          onClick={() => navigate({ to: "/" })}
          aria-label="إنهاء المكالمة"
          className="grid size-16 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-alert transition-transform active:scale-95"
        >
          <PhoneOff className="size-7" />
        </button>
        <button
          onClick={() => setVideo((v) => !v)}
          disabled={peer.link !== "wifi-aware"}
          aria-label="الفيديو"
          className={`grid size-14 place-items-center rounded-full border transition-colors disabled:opacity-40 ${
            video ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-muted text-muted-foreground"
          }`}
        >
          {video ? <Video className="size-6" /> : <VideoOff className="size-6" />}
        </button>
      </div>

      <Link to="/chat/$peerId" params={{ peerId }} className="text-center text-xs text-muted-foreground">
        التبديل إلى المحادثة النصية
      </Link>
    </div>
  );
}
