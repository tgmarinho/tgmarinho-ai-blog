"use client";

import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/lib/constants";
import { useState } from "react";

type MobileNavProps = {
  navLinks: readonly NavLink[];
};

export function MobileNav({ navLinks }: MobileNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <button
          type="button"
          aria-label="Toggle menu"
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-foreground/80 backdrop-blur-md transition-colors hover:border-cyan-300/30 hover:text-foreground"
        >
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] border-l border-white/[0.06] bg-background/95 backdrop-blur-2xl"
      >
        <SheetTitle className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
          ━ navigation
        </SheetTitle>
        <nav className="mt-10 flex flex-col gap-1.5">
          {navLinks.map((link, i) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center justify-between rounded-xl border px-4 py-3 transition-all",
                  active
                    ? "border-cyan-300/30 bg-cyan-300/[0.05] text-foreground"
                    : "border-white/[0.04] bg-white/[0.015] text-muted-foreground hover:border-white/10 hover:text-foreground"
                )}
              >
                <span className="font-display text-[16px] tracking-tight">
                  {t(link.key)}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  0{i + 1}
                </span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
