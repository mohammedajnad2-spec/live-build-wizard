import { Link } from "@tanstack/react-router";
import { BadgeCheck, MessageSquare, Phone } from "lucide-react";
import { linkLabel, signalBars, type Peer } from "@/lib/mesh-store";

export function PeerCard({ peer }: { peer: Peer }) {
  const bars = signalBars(peer.rssi);
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-card-foreground">{peer.name}</p>
            {peer.verified ? <BadgeCheck className="size-4 shrink-0 text-primary" /> : null}
          </div>
          <p className="mt-1 font-mono text-[11px] tracking-wider text-muted-foreground">
            {peer.fingerprint}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {linkLabel(peer.link)} · {peer.hops} قفزة · {peer.rssi} dBm · {peer.lastSeen}
          </p>
        </div>
        <div className="flex items-end gap-0.5" aria-label={`قوة الإشارة ${bars} من 4`}>
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`w-1.5 rounded-sm ${n <= bars ? "bg-primary" : "bg-muted"}`}
              style={{ height: `${5 + n * 4}px` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          to="/call/$peerId"
          params={{ peerId: peer.id }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-transform active:scale-95"
        >
          <Phone className="size-4" />
          اتصال
        </Link>
        <Link
          to="/chat/$peerId"
          params={{ peerId: peer.id }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground transition-transform active:scale-95"
        >
          <MessageSquare className="size-4" />
          رسالة
        </Link>
      </div>
    </div>
  );
}
