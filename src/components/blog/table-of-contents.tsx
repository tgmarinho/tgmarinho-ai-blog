"use client";

import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/toc";

interface TableOfContentsProps {
  items: TocItem[];
  label: string;
}

export function TableOfContents({ items, label }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const lenis = useLenis();

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (headings.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }

        if (visible.size > 0) {
          let bestId: string | null = null;
          let bestIndex = Infinity;
          for (const id of visible.keys()) {
            const idx = items.findIndex((it) => it.id === id);
            if (idx !== -1 && idx < bestIndex) {
              bestIndex = idx;
              bestId = id;
            }
          }
          if (bestId) setActiveId(bestId);
        }
      },
      {
        rootMargin: "0px 0px -70% 0px",
        threshold: [0, 1],
      }
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: -96 });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className="relative">
      <p className="mb-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/80">
        {label}
      </p>
      <ul className="space-y-3.5 border-l border-white/[0.06]">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li
              key={item.id}
              className={cn(item.level === 3 && "pl-3")}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={cn(
                  "block -ml-px border-l border-transparent pl-4 text-[13.5px] leading-snug transition-colors",
                  isActive
                    ? "border-cyan-300/80 font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground/90"
                )}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
