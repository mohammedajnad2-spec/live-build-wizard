import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { linkLabel, signalBars, useMesh } from "@/lib/mesh-store";

export const Route = createFileRoute("/call/$peerId")({
  head: () => ({
    meta: [
      { title: "مكالمة مباشرة — اتصال" },
      {
        name: "description",
        content: "مكالمة صوتية P2P منخفضة الكمون عبر Wi‑Fi Direct أو BLE مع مؤشرات جودة حيّة وكتم سريع.",
      },
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

  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (!peer) throw notFound();

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const bars = signalBars(peer.rssi);
  const latency = 28 + peer.hops * 22;
  const quality = bars >= 4 ? "ممتازة" : bars === 3 ? "جيدة" : bars === 2 ? "متوسطة" : "ضعيفة";

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
        <p className="mt-1 font-mono text-sm text-primary">
          {mm}:{ss}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {linkLabel(peer.link)} · {peer.rssi} dBm · جودة {quality}
        </p>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/70 p-6">
        <div className="flex h-24 items-center justify-center gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className={`w-1 rounded-full ${muted ? "bg-muted-foreground/40" : "bg-primary"} ${
                muted ? "" : "animate-wave"
              }`}
              style={{ height: `${20 + ((i * 37) % 70)}%`, animationDelay: `${(i % 9) * 0.07}s` }}
            />
          ))}
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            { k: "الكمون", v: `${latency} ms` },
            { k: "القفزات", v: peer.hops },
            { k: "معدل البِت", v: peer.link === "wifi-aware" ? "32 kbps" : "8 kbps" },
          ].map(({ k, v }) => (
            <div key={k} className="rounded-2xl border border-border/60 bg-background/50 p-2">
              <dt className="text-[10px] text-muted-foreground">{k}</dt>
              <dd className="font-mono text-xs text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label="كتم الصوت"
          className={`grid size-14 place-items-center rounded-full border transition-colors ${
            muted
              ? "border-border bg-muted text-muted-foreground"
              : "border-primary/40 bg-primary/15 text-primary"
          }`}
        >
          {muted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
        </button>
        <button
          onClick={() => navigate({ to: "/call" })}
          aria-label="إنهاء المكالمة"
          className="grid size-16 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-alert transition-transform active:scale-95"
        >
          <PhoneOff className="size-7" />
        </button>
        <button
          onClick={() => setSpeaker((s) => !s)}
          aria-label="مكبر الصوت"
          className={`grid size-14 place-items-center rounded-full border transition-colors ${
            speaker
              ? "border-primary/40 bg-primary/15 text-primary"
              : "border-border bg-muted text-muted-foreground"
          }`}
        >
          {speaker ? <Volume2 className="size-6" /> : <VolumeX className="size-6" />}
        </button>
      </div>
    </div>
  );
}
