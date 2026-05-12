"use client";

import { useLocale } from "next-intl";
import { ArrowUpRight, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { GlowCard } from "@/components/fx/glow-card";
import { formatIsoDateForDisplay } from "@/lib/format-iso-date";
import { cn } from "@/lib/utils";

interface PostCardProps {
  title: string;
  description?: string;
  date: string;
  slug: string;
  categories: string[];
  /** Pre-computed reading time text (server-side). */
  readingTimeText: string;
  /** Visual rhythm for asymmetric grids. */
  variant?: "default" | "feature" | "compact";
  className?: string;
}

export function PostCard({
  title,
  description,
  date,
  slug,
  categories,
  readingTimeText,
  variant = "default",
  className,
}: PostCardProps) {
  const locale = useLocale();
  const formattedDate = formatIsoDateForDisplay(
    date,
    locale === "pt-BR" ? "pt-BR" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );

  const sizing = {
    default: "p-6",
    feature: "p-7 md:p-9",
    compact: "p-5",
  }[variant];

  const titleSize = {
    default: "text-[20px] md:text-[22px]",
    feature: "text-[28px] md:text-[34px]",
    compact: "text-[17px]",
  }[variant];

  return (
    <GlowCard
      as={Link as unknown as React.ElementType}
      // @ts-expect-error — Link prop forwarded
      href={`/blog/${slug}`}
      intensity={variant === "feature" ? "strong" : "subtle"}
      className={cn(
        "border-conic group block hover-lift",
        variant === "feature" && "md:row-span-2",
        sizing,
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/90"
            >
              {cat}
            </span>
          ))}
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
      </div>

      <h3
        className={cn(
          "font-display font-semibold leading-[1.15] tracking-[-0.025em] text-foreground transition-colors duration-300 group-hover:text-cyan-100",
          variant === "feature" ? "mt-6" : "mt-4",
          titleSize
        )}
      >
        {title}
      </h3>

      {description && variant !== "compact" && (
        <p
          className={cn(
            "mt-3 leading-[1.65] text-muted-foreground",
            variant === "feature" ? "text-[15.5px] line-clamp-3" : "text-[13.5px] line-clamp-2"
          )}
        >
          {description}
        </p>
      )}

      <div
        className={cn(
          "mt-6 flex items-center gap-4 border-t border-white/[0.06] pt-4 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground"
        )}
      >
        <time dateTime={date}>{formattedDate}</time>
        <span className="h-1 w-1 rounded-full bg-white/15" />
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {readingTimeText}
        </span>
      </div>
    </GlowCard>
  );
}
