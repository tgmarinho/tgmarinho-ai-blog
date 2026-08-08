"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Stats = {
  ok: boolean;
  followers: number | null;
  publicRepos: number | null;
  lastPush: { repo: string; at: string } | null;
};

type Status = "loading" | "live" | "offline";

type Tone = "cyan" | "magenta" | "emerald";

const DOT: Record<Tone, string> = {
  cyan: "bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]",
  magenta: "bg-fuchsia-400 shadow-[0_0_10px_2px_rgba(217,70,239,0.7)]",
  emerald: "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]",
};

function relativeTime(iso: string, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diffMs = Date.parse(iso) - Date.now();
  const mins = Math.round(diffMs / 60_000);
  const abs = Math.abs(mins);
  if (abs < 60) return rtf.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  return rtf.format(days, "day");
}

function Badge({
  label,
  value,
  tone,
  className,
  style,
}: {
  label: string;
  value: string;
  tone: Tone;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/45 px-3 py-1.5 backdrop-blur-xl ${className ?? ""}`}
      style={style}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[tone]}`} />
      <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-[11px] text-foreground/90">{value}</span>
    </div>
  );
}

export function LiveHud() {
  const t = useTranslations("home.hero.hud");
  const locale = useLocale();
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: Stats) => {
        if (cancelled) return;
        setStats(data);
        setStatus(data.ok ? "live" : "offline");
      })
      .catch(() => {
        if (!cancelled) setStatus("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const placeholder = status === "loading" ? "···" : "—";
  const repos =
    stats?.publicRepos != null ? String(stats.publicRepos) : placeholder;
  const followers =
    stats?.followers != null ? String(stats.followers) : placeholder;
  const lastPush = stats?.lastPush
    ? relativeTime(stats.lastPush.at, locale)
    : placeholder;

  return (
    <>
      <Badge
        label={t("reposLabel")}
        value={repos}
        tone="cyan"
        className="absolute -left-6 top-8 hidden md:flex animate-float-slow"
      />
      <Badge
        label={t("followersLabel")}
        value={followers}
        tone="magenta"
        className="absolute -right-2 top-1/3 hidden md:flex animate-float-slow"
        style={{ animationDelay: "0.6s" }}
      />
      <Badge
        label={t("pushLabel")}
        value={lastPush}
        tone="emerald"
        className="absolute -right-6 bottom-10 hidden md:flex animate-float-slow"
        style={{ animationDelay: "1.2s" }}
      />
      {/* Live / cached indicator, bottom-left of the portrait. */}
      <div className="absolute -left-2 bottom-2 hidden items-center gap-1.5 rounded-full border border-white/[0.06] bg-black/50 px-2.5 py-1 backdrop-blur-xl md:flex">
        <span className="relative flex h-1.5 w-1.5">
          {status === "live" && (
            <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
          )}
          <span
            className={`relative inline-block h-1.5 w-1.5 rounded-full ${
              status === "live" ? "bg-emerald-400" : "bg-muted-foreground"
            }`}
          />
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          {status === "live" ? t("liveLabel") : t("offlineLabel")}
        </span>
      </div>
    </>
  );
}
