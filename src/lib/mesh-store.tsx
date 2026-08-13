import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LinkClass = "ble" | "wifi-aware" | "offline";
export type PayloadStatus = "queued" | "relayed" | "delivered" | "ack";
export type CryptoAlgo = "aes-256-gcm" | "chacha20" | "kyber768";

export type Peer = {
  id: string;
  name: string;
  fingerprint: string;
  hops: number;
  rssi: number;
  link: LinkClass;
  verified: boolean;
  revoked: boolean;
  lastSeen: string;
};

export type Message = {
  id: string;
  peerId: string;
  body: string;
  mine: boolean;
  ttl: number;
  at: string;
  kind: "text" | "voice";
  seconds?: number;
  status: PayloadStatus;
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
    revoked: false,
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
    revoked: false,
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
    revoked: false,
    lastSeen: "قبل ٩ د",
  },
];

const SEED_MESSAGES: Message[] = [
  {
    id: "m1",
    peerId: "p1",
    body: "أنا في نطاق التغطية، الشبكة تعمل.",
    mine: false,
    ttl: 8,
    at: "12:04",
    kind: "text",
    status: "delivered",
  },
  {
    id: "m2",
    peerId: "p1",
    body: "تم استلام الحزمة عبر قفزة واحدة.",
    mine: true,
    ttl: 8,
    at: "12:05",
    kind: "text",
    status: "ack",
  },
  {
    id: "m3",
    peerId: "p1",
    body: "ملاحظة صوتية",
    mine: false,
    ttl: 6,
    at: "12:07",
    kind: "voice",
    seconds: 9,
    status: "delivered",
  },
  {
    id: "m4",
    peerId: "p2",
    body: "أنتقل إلى المبنى الشرقي.",
    mine: false,
    ttl: 6,
    at: "11:47",
    kind: "text",
    status: "relayed",
  },
];

const NEXT_STATUS: Record<PayloadStatus, PayloadStatus | null> = {
  queued: "relayed",
  relayed: "delivered",
  delivered: "ack",
  ack: null,
};

function nowLabel() {
  return new Intl.DateTimeFormat("ar", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function randomFingerprint() {
  return Array.from({ length: 6 })
    .map(() =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0")
        .toUpperCase(),
    )
    .join(":");
}

type MeshState = {
  meshOn: boolean;
  toggleMesh: () => void;
  peers: Peer[];
  messages: Message[];
  alerts: AlertEvent[];
  sendMessage: (peerId: string, body: string) => void;
  sendVoiceNote: (peerId: string, seconds: number) => void;
  verifyPeer: (peerId: string) => void;
  revokePeer: (peerId: string) => void;
  authorizePeer: (peerId: string) => void;
  forgetPeer: (peerId: string) => void;
  addPeer: (name: string) => void;
  fireAlert: () => void;
  myFingerprint: string;
  profileName: string;
  setProfileName: (name: string) => void;
  cryptoAlgo: CryptoAlgo;
  setCryptoAlgo: (algo: CryptoAlgo) => void;
  radioPower: number;
  setRadioPower: (value: number) => void;
  ttl: number;
  setTtl: (value: number) => void;
};

const MeshContext = createContext<MeshState | null>(null);

export function MeshProvider({ children }: { children: ReactNode }) {
  const [meshOn, setMeshOn] = useState(true);
  const [peers, setPeers] = useState<Peer[]>(SEED_PEERS);
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [profileName, setProfileName] = useState("جهازي");
  const [cryptoAlgo, setCryptoAlgo] = useState<CryptoAlgo>("aes-256-gcm");
  const [radioPower, setRadioPower] = useState(70);
  const [ttl, setTtl] = useState(8);

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

  // ترقية حالة الحزم تدريجياً: في الانتظار ← مُرحّلة ← وصلت ← تأكيد
  useEffect(() => {
    if (!meshOn) return;
    const t = setInterval(() => {
      setMessages((prev) =>
        prev.map((m) => {
          if (!m.mine) return m;
          const next = NEXT_STATUS[m.status];
          return next ? { ...m, status: next } : m;
        }),
      );
    }, 1600);
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
      profileName,
      setProfileName,
      cryptoAlgo,
      setCryptoAlgo,
      radioPower,
      setRadioPower,
      ttl,
      setTtl,
      sendMessage: (peerId, body) =>
        setMessages((prev) => [
          ...prev,
          {
            id: `m${prev.length + 1}-${Date.now()}`,
            peerId,
            body,
            mine: true,
            ttl,
            at: nowLabel(),
            kind: "text",
            status: "queued",
          },
        ]),
      sendVoiceNote: (peerId, seconds) =>
        setMessages((prev) => [
          ...prev,
          {
            id: `v${prev.length + 1}-${Date.now()}`,
            peerId,
            body: "ملاحظة صوتية",
            mine: true,
            ttl,
            at: nowLabel(),
            kind: "voice",
            seconds,
            status: "queued",
          },
        ]),
      verifyPeer: (peerId) =>
        setPeers((prev) => prev.map((p) => (p.id === peerId ? { ...p, verified: true } : p))),
      revokePeer: (peerId) =>
        setPeers((prev) =>
          prev.map((p) => (p.id === peerId ? { ...p, revoked: true, verified: false } : p)),
        ),
      authorizePeer: (peerId) =>
        setPeers((prev) =>
          prev.map((p) => (p.id === peerId ? { ...p, revoked: false, verified: true } : p)),
        ),
      forgetPeer: (peerId) => setPeers((prev) => prev.filter((p) => p.id !== peerId)),
      addPeer: (name) =>
        setPeers((prev) => [
          ...prev,
          {
            id: `p${prev.length + 1}-${Date.now()}`,
            name,
            fingerprint: randomFingerprint(),
            hops: 1,
            rssi: -55,
            link: "ble",
            verified: true,
            revoked: false,
            lastSeen: "الآن",
          },
        ]),
      fireAlert: () =>
        setAlerts((prev) => [
          { id: `a${prev.length + 1}-${Date.now()}`, kind: "sent", from: "أنا", at: nowLabel() },
          ...prev,
        ]),
    }),
    [meshOn, peers, messages, alerts, profileName, cryptoAlgo, radioPower, ttl],
  );

  return <MeshContext.Provider value={value}>{children}</MeshContext.Provider>;
}

export function useMesh() {
  const ctx = useContext(MeshContext);
  if (!ctx) throw new Error("useMesh must be used inside MeshProvider");
  return ctx;
}

export function linkLabel(link: LinkClass) {
  if (link === "wifi-aware") return "Wi‑Fi Direct / Aware";
  if (link === "ble") return "BLE 5.4";
  return "غير متصل";
}

export function statusLabel(status: PayloadStatus) {
  if (status === "queued") return "في الانتظار";
  if (status === "relayed") return "أُرسلت عبر الشبكة";
  if (status === "delivered") return "وصلت";
  return "تم التأكيد";
}

export function algoLabel(algo: CryptoAlgo) {
  if (algo === "aes-256-gcm") return "AES‑256‑GCM";
  if (algo === "chacha20") return "ChaCha20‑Poly1305";
  return "Kyber768 (ما بعد الكم)";
}

export function signalBars(rssi: number) {
  if (rssi > -55) return 4;
  if (rssi > -70) return 3;
  if (rssi > -85) return 2;
  return 1;
}
