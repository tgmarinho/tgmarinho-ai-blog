"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { navLinks } from "@/lib/constants";
import { MobileNav } from "./mobile-nav";
import { LocaleSwitcher } from "./locale-switcher";

export function Header() {
  const pathname = usePathname();
  const t = useTranslations("nav");
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
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-white/[0.06] bg-background/65 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          aria-label="Thiago Marinho, home"
          className="group flex items-center gap-2.5"
        >
          <span className="relative grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-md transition-colors group-hover:border-cyan-300/40">
            <span className="absolute -inset-px rounded-lg bg-gradient-to-br from-cyan-300/20 via-transparent to-fuchsia-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="font-display text-[11px] font-bold tracking-[0.18em] text-foreground/90">
              TG
            </span>
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_2px_rgba(34,211,238,0.7)] animate-pulse-soft" />
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:inline">
            tgmarinho<span className="text-cyan-300">/</span>ai
          </span>
        </Link>

        <nav className="hidden md:flex">
          <ul className="relative flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.025] px-1.5 py-1 backdrop-blur-xl">
            {navLinks.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative block rounded-full px-3.5 py-1.5 text-[13px] tracking-wide transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {active && (
                      <span
                        className="absolute inset-0 -z-10 rounded-full bg-white/[0.06]"
                        style={{
                          boxShadow:
                            "inset 0 0 0 1px rgba(34,211,238,0.25), 0 0 24px -8px rgba(34,211,238,0.55)",
                        }}
                      />
                    )}
                    {t(link.key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <span className="hidden items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            agent · online
          </span>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
