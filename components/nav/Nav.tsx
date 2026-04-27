"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSharedBackendHealth } from "@/components/shared/BackendHealthProvider";

const links = [
  { href: "/", label: "Aperçu", num: "01" },
  { href: "/architecture", label: "Architecture", num: "02" },
  { href: "/demo", label: "Démo", num: "03" },
  { href: "/analytics", label: "Analytics", num: "04" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { status } = useSharedBackendHealth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled || mobileOpen
            ? "bg-ink-0/90 backdrop-blur-xl border-b border-hairline"
            : "bg-transparent"
        )}
      >
        <nav className="container-custom flex items-center justify-between h-16">
          <Link href="/" className="group flex items-center gap-3 z-10">
            <LogoMark />
            <div className="flex flex-col leading-none">
              <span className="font-display italic text-lg text-ink-900 group-hover:text-lumina transition-colors">
                Lumina
              </span>
              <span className="font-mono text-[0.6rem] text-ink-500 tracking-widest uppercase">
                Integration · POC
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden lg:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              const isDemo = l.href === "/demo";
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "group relative px-3 py-2 flex items-center gap-2 text-sm transition-colors",
                      active ? "text-ink-900" : "text-ink-500 hover:text-ink-900"
                    )}
                  >
                    <span className="font-mono text-[0.65rem] text-ink-400 group-hover:text-lumina transition-colors">
                      {l.num}
                    </span>
                    <span>{l.label}</span>
                    {isDemo && <DemoStatusDot status={status} />}
                    {active && (
                      <span className="absolute -bottom-px left-3 right-3 h-px bg-lumina" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop status badge */}
          <div className="hidden lg:flex items-center gap-4">
            <BackendStatusBadge status={status} />
          </div>

          {/* Mobile: compact status dot + hamburger */}
          <div className="flex lg:hidden items-center gap-3 z-10">
            <CompactStatusDot status={status} />
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
              className="w-10 h-10 flex items-center justify-center border border-hairline-strong hover:border-lumina text-ink-900 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-300",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-ink-0/95 backdrop-blur-xl"
          onClick={() => setMobileOpen(false)}
        />

        {/* Menu content */}
        <div className="relative h-full flex flex-col pt-24 pb-10 px-6">
          <ul className="flex flex-col gap-2">
            {links.map((l, i) => {
              const active = pathname === l.href;
              const isDemo = l.href === "/demo";
              return (
                <li
                  key={l.href}
                  className={cn(
                    "border-b border-hairline transition-all duration-300",
                    mobileOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  )}
                  style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms" }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-4 py-5",
                      active ? "text-ink-900" : "text-ink-700"
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-xs tracking-widest",
                        active ? "text-lumina" : "text-ink-500"
                      )}
                    >
                      {l.num}
                    </span>
                    <span className="text-2xl font-display flex-1">{l.label}</span>
                    {isDemo && <DemoStatusDot status={status} />}
                    {active && (
                      <span className="font-mono text-[0.65rem] tracking-widest uppercase text-lumina">
                        en cours
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Status full-width at bottom */}
          <div className="mt-auto pt-8 border-t border-hairline">
            <BackendStatusBadge status={status} />
          </div>
        </div>
      </div>
    </>
  );
}

function DemoStatusDot({ status }: { status: "checking" | "healthy" | "unavailable" }) {
  if (status === "checking") {
    return <span className="w-1.5 h-1.5 rounded-full bg-ink-500 animate-pulse" title="Vérification du backend…" />;
  }
  if (status === "healthy") {
    return <span className="w-1.5 h-1.5 rounded-full bg-signal" title="Backend Azure en ligne" />;
  }
  return <span className="w-1.5 h-1.5 rounded-full bg-ember" title="Backend Azure en pause" />;
}

/** Compact pulsating dot only — used in mobile header where space is tight */
function CompactStatusDot({ status }: { status: "checking" | "healthy" | "unavailable" }) {
  const color =
    status === "healthy" ? "bg-signal"
    : status === "unavailable" ? "bg-ember"
    : "bg-ink-500";
  const label =
    status === "healthy" ? "Backend Azure en ligne"
    : status === "unavailable" ? "Backend Azure en pause"
    : "Vérification du backend";
  return (
    <span
      className={cn("w-2 h-2 rounded-full", color, status !== "unavailable" && "animate-pulse")}
      title={label}
      aria-label={label}
    />
  );
}

function BackendStatusBadge({ status }: { status: "checking" | "healthy" | "unavailable" }) {
  if (status === "checking") {
    return (
      <span className="font-mono text-[0.65rem] text-ink-500 tracking-widest uppercase flex items-center">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-ink-500 mr-2 animate-pulse" />
        Vérification…
      </span>
    );
  }
  if (status === "healthy") {
    return (
      <span className="font-mono text-[0.65rem] text-signal tracking-widest uppercase flex items-center">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-signal mr-2 animate-pulse" />
        Backend en ligne
      </span>
    );
  }
  return (
    <span className="font-mono text-[0.65rem] text-ember tracking-widest uppercase flex items-center">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-ember mr-2" />
      Backend en pause
    </span>
  );
}

function LogoMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-lumina"
    >
      <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="14" cy="14" r="7" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
      <line x1="14" y1="0" x2="14" y2="6" stroke="currentColor" strokeWidth="0.75" />
      <line x1="14" y1="22" x2="14" y2="28" stroke="currentColor" strokeWidth="0.75" />
      <line x1="0" y1="14" x2="6" y2="14" stroke="currentColor" strokeWidth="0.75" />
      <line x1="22" y1="14" x2="28" y2="14" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}
