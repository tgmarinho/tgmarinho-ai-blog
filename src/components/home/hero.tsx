"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { siteConfig } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import { ParticleField } from "@/components/fx/particle-field";
import { HeroPortrait } from "@/components/fx/hero-portrait";
import { RocketLaunch } from "@/components/fx/rocket-launch";
import { BlackHole } from "@/components/fx/black-hole";
import { VolumetricLight } from "@/components/fx/volumetric-light";
import { LiveHud } from "@/components/home/live-hud";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface HeroProps {
  postCount: number;
}

export function Hero({ postCount }: HeroProps) {
  const t = useTranslations("home.hero");
  const firstName = siteConfig.name.split(" ")[0];
  const container = useRef<HTMLElement>(null);

  // Keep ScrollTrigger in sync with Lenis' virtual scroll position.
  useLenis(() => ScrollTrigger.update());

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrance — cinematic reveal on load.
        const intro = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        // Portrait rises into place behind the copy.
        intro.from(
          "[data-hero-portrait]",
          { autoAlpha: 0, scale: 1.08, yPercent: 4, duration: 1.2 },
          0
        );

        // Headline reveals line by line: rise out of a soft blur.
        intro.fromTo(
          "[data-hero-line]",
          { yPercent: 108, opacity: 0, filter: "blur(12px)" },
          {
            yPercent: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.14,
          },
          0.15
        );

        // Supporting copy staggers in just behind the headline.
        intro.from(
          "[data-hero-item]",
          { y: 22, autoAlpha: 0, duration: 0.7, stagger: 0.09 },
          "-=0.7"
        );

        // Scroll choreography — layered parallax as the hero scrolls away.
        const scroll = gsap.timeline({
          scrollTrigger: {
            trigger: container.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
        scroll
          .to(
            "[data-hero-copy]",
            { yPercent: -22, opacity: 0.35, ease: "none" },
            0
          )
          .to(
            "[data-hero-portrait]",
            { yPercent: -12, scale: 0.9, ease: "none" },
            0
          )
          .to("[data-hero-atmosphere]", { yPercent: 22, ease: "none" }, 0);
      });

      return () => mm.revert();
    },
    { scope: container }
  );

  return (
    <section ref={container} className="relative overflow-hidden">
      {/* Atmosphere */}
      <div
        data-hero-atmosphere
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <ParticleField density={70} />
        <VolumetricLight />
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
        <div data-hero-copy className="relative z-10 max-w-xl">
          <span
            data-hero-item
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.04] px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-200/90 backdrop-blur-md"
          >
            <Sparkles className="h-3 w-3" />
            {t("badge")}
          </span>

          <h1 className="mt-6 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-[56px] md:text-[64px]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="block">
                {t("headlineLine1")}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="block text-gradient-cm">
                {t("headlineAccent")}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="block">
                {t("headlineLine3")}
              </span>
            </span>
          </h1>

          <p
            data-hero-item
            className="mt-6 max-w-md text-[15.5px] leading-[1.7] text-muted-foreground"
          >
            {t("intro", { firstName })}
          </p>

          {/* Terminal status */}
          <div
            data-hero-item
            className="mt-7 inline-flex items-center gap-2 rounded-md border border-white/[0.06] bg-black/40 px-3 py-2 font-mono text-[12px] tracking-tight text-muted-foreground"
          >
            <span className="text-cyan-300">$</span>
            <span className="text-foreground/80">
              agent.run(<span className="text-fuchsia-300">&quot;ship_value&quot;</span>)
            </span>
            <span className="text-emerald-400">→ ok</span>
            <span className="ml-1 inline-block h-3 w-[7px] bg-cyan-300 animate-blink" />
          </div>

          {/* CTAs */}
          <div data-hero-item className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/blog"
              onClick={() =>
                trackEvent("cta_click", {
                  location: "hero_primary",
                  destination: "/blog",
                })
              }
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-cyan-300 px-5 py-2.5 text-[13px] font-medium tracking-wide text-[#05060a] transition-transform hover:scale-[1.02]"
              style={{
                boxShadow:
                  "0 10px 32px -8px rgba(34,211,238,0.7), inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              {t("ctaPrimary")}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            <Link
              href="/about"
              onClick={() =>
                trackEvent("cta_click", {
                  location: "hero_secondary",
                  destination: "/about",
                })
              }
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-5 py-2.5 text-[13px] tracking-wide text-foreground/90 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              {t("ctaSecondary")}
              <span className="text-muted-foreground transition-colors group-hover:text-cyan-300">
                ↗
              </span>
            </Link>
          </div>

          {/* Stats strip */}
          <dl
            data-hero-item
            className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/[0.06] pt-6"
          >
            <Stat label={t("stats.yearsLabel")} value={`${siteConfig.yearsOfExperience}+`} />
            <Stat label={t("stats.articlesLabel")} value={`${postCount}`} />
            <Stat label={t("stats.stackLabel")} value="AI · TS · RN" mono />
          </dl>
        </div>

        {/* Right — morphing portrait */}
        <div className="relative flex items-center justify-center md:justify-end">
          <div data-hero-portrait className="relative w-full max-w-[640px]">
            <HeroPortrait size={640} />
            {/* Live telemetry HUD — real GitHub stats with graceful fallback */}
            <LiveHud />
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
