"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Aperçu", num: "01" },
  { href: "/architecture", label: "Architecture", num: "02" },
  { href: "/demo", label: "Démo live", num: "03" },
  { href: "/cost", label: "Coût", num: "04" },
  { href: "/code", label: "Code", num: "05" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-ink-0/85 backdrop-blur-xl border-b border-hairline"
          : "bg-transparent"
      )}
    >
      <nav className="container-custom flex items-center justify-between h-16">
        <Link href="/" className="group flex items-center gap-3">
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

        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
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
                  {active && (
                    <span className="absolute -bottom-px left-3 right-3 h-px bg-lumina" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <span className="font-mono text-[0.65rem] text-ink-500 tracking-widest uppercase">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-lumina mr-2 animate-pulse" />
            Build · 2026.04
          </span>
        </div>
      </nav>
    </header>
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
