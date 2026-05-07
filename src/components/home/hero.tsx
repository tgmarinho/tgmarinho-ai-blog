"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { ParticleField } from "@/components/fx/particle-field";
import { HeroPortrait } from "@/components/fx/hero-portrait";
import { RocketLaunch } from "@/components/fx/rocket-launch";
import { BlackHole } from "@/components/fx/black-hole";

interface HeroProps {
  postCount: number;
}

export function Hero({ postCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <ParticleField density={70} />
        <div
          className="absolute -top-40 left-1/2 h-[520px] w-[1000px] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle at 30% 50%, rgba(34,211,238,0.30), transparent 60%), radial-gradient(circle at 70% 50%, rgba(217,70,239,0.22), transparent 60%)",
          }}
        />
        {/* Cosmic black hole — anchored to the top-left of the hero, near
            the "B" of the headline. Decorative only. */}
        <BlackHole
          size={200}
          tiltDeg={22}
          className="left-[1%] top-0 md:-top-1 hidden md:block opacity-80"
        />
      </div>

      {/* Rocket — rises through the entire viewport, bottom to top, every 30s (desktop only). */}
      <RocketLaunch />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-20 md:grid-cols-[1fr_1.25fr] md:gap-12 md:px-8 md:py-32">
        {/* Left — copy */}
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.04] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-200/90 backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            agentic systems · 2026
          </span>

          <h1 className="mt-6 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-[56px] md:text-[64px]">
            Building the
            <br />
            <span className="text-gradient-cm">agentic layer</span>
            <br />
            of software.
          </h1>

          <p className="mt-6 max-w-md text-[15.5px] leading-[1.7] text-muted-foreground">
            I&apos;m {siteConfig.name.split(" ")[0]} — an AI Product Engineer
            designing autonomous agents, RAG pipelines and spec-driven products
            that ship fast and learn faster.
          </p>

          {/* Terminal status */}
          <div className="mt-7 inline-flex items-center gap-2 rounded-md border border-white/[0.06] bg-black/40 px-3 py-2 font-mono text-[12px] tracking-tight text-muted-foreground">
            <span className="text-cyan-300">$</span>
            <span className="text-foreground/80">
              agent.run(<span className="text-fuchsia-300">&quot;ship_value&quot;</span>)
            </span>
            <span className="text-emerald-400">→ ok</span>
            <span className="ml-1 inline-block h-3 w-[7px] bg-cyan-300 animate-blink" />
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/blog"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-cyan-300 px-5 py-2.5 text-[13px] font-medium tracking-wide text-[#05060a] transition-transform hover:scale-[1.02]"
              style={{
                boxShadow:
                  "0 10px 32px -8px rgba(34,211,238,0.7), inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              Read the blog
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-5 py-2.5 text-[13px] tracking-wide text-foreground/90 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              About me
              <span className="text-muted-foreground transition-colors group-hover:text-cyan-300">
                ↗
              </span>
            </Link>
          </div>

          {/* Stats strip */}
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/[0.06] pt-6">
            <Stat label="Years shipping" value={`${siteConfig.yearsOfExperience}+`} />
            <Stat label="Articles" value={`${postCount}`} />
            <Stat label="Stack" value="AI · TS · RN" mono />
          </dl>
        </div>

        {/* Right — morphing portrait */}
        <div className="relative flex items-center justify-center md:justify-end">
          <div className="relative w-full max-w-[640px]">
            <HeroPortrait size={640} />
            {/* Floating telemetry badges */}
            <FloatingBadge
              label="ROUTING"
              value="agent.delegate"
              className="absolute -left-6 top-8 hidden md:flex animate-float-slow"
            />
            <FloatingBadge
              label="LATENCY"
              value="38ms"
              tone="magenta"
              className="absolute -right-2 top-1/3 hidden md:flex animate-float-slow"
              style={{ animationDelay: "0.6s" }}
            />
            <FloatingBadge
              label="STATE"
              value="streaming"
              tone="emerald"
              className="absolute -right-6 bottom-10 hidden md:flex animate-float-slow"
              style={{ animationDelay: "1.2s" }}
            />
          </div>
        </div>
      </div>

      {/* Bottom mesh divider */}
      <div className="mesh-divider mx-auto max-w-6xl" />
    </section>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dd
        className={`text-[22px] font-semibold tracking-tight text-foreground ${
          mono ? "font-mono text-[18px]" : "font-display"
        }`}
      >
        {value}
      </dd>
      <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </dt>
    </div>
  );
}

function FloatingBadge({
  label,
  value,
  tone = "cyan",
  className,
  style,
}: {
  label: string;
  value: string;
  tone?: "cyan" | "magenta" | "emerald";
  className?: string;
  style?: React.CSSProperties;
}) {
  const dotColor = {
    cyan: "bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]",
    magenta: "bg-fuchsia-400 shadow-[0_0_10px_2px_rgba(217,70,239,0.7)]",
    emerald: "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]",
  }[tone];

  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/45 px-3 py-1.5 backdrop-blur-xl ${className ?? ""}`}
      style={style}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-[11px] text-foreground/90">{value}</span>
    </div>
  );
}
