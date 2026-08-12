import { Link, useRouterState } from "@tanstack/react-router";
import { Radio, Users, QrCode, Settings, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useMesh } from "@/lib/mesh-store";

const NAV = [
  { to: "/", label: "الشبكة", icon: Radio },
  { to: "/devices", label: "الأجهزة", icon: Users },
  { to: "/pair", label: "الاقتران", icon: QrCode },
  { to: "/settings", label: "الإعدادات", icon: Settings },
] as const;

export function AppShell({
  title,
  children,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { meshOn, peers } = useMesh();
  const online = meshOn ? peers.length : 0;

  return (
    <div dir="rtl" className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 px-5 pt-6 pb-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl leading-tight text-foreground">{title}</h1>
            {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium ${
              meshOn
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-muted text-muted-foreground"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${meshOn ? "animate-pulse bg-primary" : "bg-muted-foreground"}`}
            />
            {meshOn ? `${online} عقدة` : "متوقفة"}
          </span>
        </div>
      </header>

      <main className="flex-1 px-5 pt-5 pb-32">{children}</main>

      <Link
        to="/alert"
        className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-destructive px-6 py-3 text-sm font-semibold text-destructive-foreground shadow-alert transition-transform active:scale-95"
      >
        <ShieldAlert className="size-4" />
        نداء استغاثة
      </Link>

      <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-border/60 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <ul className="grid grid-cols-4">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-1 py-3 text-[11px] transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
