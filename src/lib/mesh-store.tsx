import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LinkClass = "ble" | "wifi-aware" | "offline";

export type Peer = {
  id: string;
  name: string;
  fingerprint: string;
  hops: number;
  rssi: number;
  link: LinkClass;
  verified: boolean;
  lastSeen: string;
};

export type Message = {
  id: string;
  peerId: string;
  body: string;
  mine: boolean;
  ttl: number;
  at: string;
};

export type AlertEvent = {
  id: string;
  kind: "sent" | "received";
  from: string;
  at: string;
};

const SEED_PEERS: Peer[] = [
  {
    id: "p1",
    name: "جهاز ليلى",
    fingerprint: "7F:2A:C4:91:0D:E5",
    hops: 1,
    rssi: -48,
    link: "wifi-aware",
    verified: true,
    lastSeen: "الآن",
  },
  {
    id: "p2",
    name: "جهاز كريم",
    fingerprint: "12:9B:AA:30:71:4C",
    hops: 2,
    rssi: -73,
    link: "ble",
    verified: true,
    lastSeen: "قبل ٢ د",
  },
  {
    id: "p3",
    name: "عقدة مجهولة",
    fingerprint: "E0:55:1F:C8:AB:22",
    hops: 4,
    rssi: -91,
    link: "ble",
    verified: false,
    lastSeen: "قبل ٩ د",
  },
];

const SEED_MESSAGES: Message[] = [
  { id: "m1", peerId: "p1", body: "أنا في نطاق التغطية، الشبكة تعمل.", mine: false, ttl: 8, at: "12:04" },
  { id: "m2", peerId: "p1", body: "تم استلام الحزمة عبر قفزة واحدة.", mine: true, ttl: 8, at: "12:05" },
  { id: "m3", peerId: "p2", body: "أنتقل إلى المبنى الشرقي.", mine: false, ttl: 6, at: "11:47" },
];

type MeshState = {
  meshOn: boolean;
  toggleMesh: () => void;
  peers: Peer[];
  messages: Message[];
  alerts: AlertEvent[];
  sendMessage: (peerId: string, body: string) => void;
  verifyPeer: (peerId: string) => void;
  forgetPeer: (peerId: string) => void;
  addPeer: (name: string) => void;
  fireAlert: () => void;
  myFingerprint: string;
};

const MeshContext = createContext<MeshState | null>(null);

export function MeshProvider({ children }: { children: ReactNode }) {
  const [meshOn, setMeshOn] = useState(true);
  const [peers, setPeers] = useState<Peer[]>(SEED_PEERS);
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);

  // نبض الشبكة: تحديث قوة الإشارة بشكل حيوي أثناء تشغيل الشبكة
  useEffect(() => {
    if (!meshOn) return;
    const t = setInterval(() => {
      setPeers((prev) =>
        prev.map((p) => ({
          ...p,
          rssi: Math.max(-98, Math.min(-40, p.rssi + Math.round((Math.random() - 0.5) * 6))),
        })),
      );
    }, 2500);
    return () => clearInterval(t);
  }, [meshOn]);

  const value = useMemo<MeshState>(
    () => ({
      meshOn,
      toggleMesh: () => setMeshOn((v) => !v),
      peers: meshOn ? peers : peers.map((p) => ({ ...p, link: "offline" as LinkClass })),
      messages,
      alerts,
      myFingerprint: "A3:14:D9:6B:8E:70",
      sendMessage: (peerId, body) =>
        setMessages((prev) => [
          ...prev,
          {
            id: `m${prev.length + 1}-${Date.now()}`,
            peerId,
            body,
            mine: true,
            ttl: 8,
            at: new Intl.DateTimeFormat("ar", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
          },
        ]),
      verifyPeer: (peerId) =>
        setPeers((prev) => prev.map((p) => (p.id === peerId ? { ...p, verified: true } : p))),
      forgetPeer: (peerId) => setPeers((prev) => prev.filter((p) => p.id !== peerId)),
      addPeer: (name) =>
        setPeers((prev) => [
          ...prev,
          {
            id: `p${prev.length + 1}-${Date.now()}`,
            name,
            fingerprint: Array.from({ length: 6 })
              .map(() =>
                Math.floor(Math.random() * 256)
                  .toString(16)
                  .padStart(2, "0")
                  .toUpperCase(),
              )
              .join(":"),
            hops: 1,
            rssi: -55,
            link: "ble",
            verified: true,
            lastSeen: "الآن",
          },
        ]),
      fireAlert: () =>
        setAlerts((prev) => [
          {
            id: `a${prev.length + 1}-${Date.now()}`,
            kind: "sent",
            from: "أنا",
            at: new Intl.DateTimeFormat("ar", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
          },
          ...prev,
        ]),
    }),
    [meshOn, peers, messages, alerts],
  );

  return <MeshContext.Provider value={value}>{children}</MeshContext.Provider>;
}

export function useMesh() {
  const ctx = useContext(MeshContext);
  if (!ctx) throw new Error("useMesh must be used inside MeshProvider");
  return ctx;
}

export function linkLabel(link: LinkClass) {
  if (link === "wifi-aware") return "Wi‑Fi Aware";
  if (link === "ble") return "BLE 5.4";
  return "غير متصل";
}

export function signalBars(rssi: number) {
  if (rssi > -55) return 4;
  if (rssi > -70) return 3;
  if (rssi > -85) return 2;
  return 1;
}
