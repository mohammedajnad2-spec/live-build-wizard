import { Link, useRouterState } from "@tanstack/react-router";
import { Radio, Users, QrCode, Settings, MessageSquare, Moon, Sun, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useMesh } from "@/lib/mesh-store";
import { useTheme } from "@/lib/theme";

const NAV = [
  { to: "/", label: "الرئيسية", icon: Radio },
  { to: "/nodes", label: "العقد", icon: Radio },
  { to: "/chat", label: "المحادثات", icon: MessageSquare },
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
  const { theme, toggleTheme } = useTheme();
  const online = meshOn ? peers.length : 0;

  return (
    <div dir="rtl" className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 px-5 pt-6 pb-4 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl leading-tight text-foreground">{title}</h1>
            {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="تبديل الوضع الليلي"
              className="rounded-full border border-border bg-card p-2 text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
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
              {online} عقدة
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-5 pb-32">{children}</main>

      <Link
        to="/sos"
        className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-3 text-sm font-semibold text-destructive-foreground shadow-alert"
      >
        <ShieldAlert className="size-4" />
        نداء استغاثة
      </Link>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-md items-center justify-between gap-1 border-t border-border/60 bg-background/95 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
