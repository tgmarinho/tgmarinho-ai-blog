import { Metadata } from "next";
import {
  Mail,
  ArrowUpRight,
  Coffee,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { FaGithub, FaXTwitter, FaLinkedin } from "react-icons/fa6";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch — projects, agentic systems, or just say hi.",
};

const channels = [
  {
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
    label: "Email",
    handle: siteConfig.email,
    badge: "best",
    note: "Best for project briefs and serious inquiries.",
  },
  {
    href: siteConfig.links.linkedin,
    icon: FaLinkedin,
    label: "LinkedIn",
    handle: "in/tgmarinho",
    note: "Professional network — DMs are open.",
  },
  {
    href: siteConfig.links.twitter,
    icon: FaXTwitter,
    label: "X / Twitter",
    handle: "@tgmarinho",
    note: "Hot takes, quick replies, public conversations.",
  },
  {
    href: siteConfig.links.github,
    icon: FaGithub,
    label: "GitHub",
    handle: "tgmarinho",
    note: "Issues, PRs, code-level discussions.",
  },
];

const inquiryHints = [
  { icon: Calendar, title: "Project briefs", text: "Agentic automation, AI consulting, custom AI products. Send scope + timeline." },
  { icon: MessageCircle, title: "Talks & podcasts", text: "Happy to talk about agentic engineering, RAG, and shipping AI in production." },
  { icon: Coffee, title: "Quick chats", text: "Curious about something I wrote? Drop a line — I read every email." },
];

export default function ContactPage() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(700px 380px at 30% 0%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(600px 320px at 80% 0%, rgba(217,70,239,0.08), transparent 65%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        {/* ── Header ── */}
        <header className="mb-14 max-w-3xl">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
            ━ contact · channel open
          </span>
          <h1 className="mt-3 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.035em] text-foreground md:text-[60px]">
            Let&apos;s <span className="text-gradient-cm">build</span> something.
          </h1>
          <p className="mt-5 max-w-xl text-[15.5px] leading-[1.7] text-muted-foreground">
            Project, podcast, or just a curious question — I read every
            message. The best path is email; the fastest one is X.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            inbox · open · usually answers within 24h
          </div>
        </header>

        <section className="max-w-3xl">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cyan-300/80">
            ━ channels
          </span>
          <h2 className="mt-3 font-display text-[26px] font-bold leading-[1.15] tracking-[-0.025em] text-foreground md:text-[30px]">
            Pick your medium.
          </h2>

          <ul className="mt-7 space-y-3">
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  target={c.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={
                    c.href.startsWith("mailto")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="group flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-cyan-300/25"
                >
                  <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-foreground/85 transition-colors group-hover:border-cyan-300/30 group-hover:text-cyan-300">
                    <c.icon className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14.5px] font-medium tracking-tight text-foreground">
                        {c.label}
                      </p>
                      {c.badge && (
                        <span className="inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-300/[0.06] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-200">
                          {c.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                      {c.handle}
                    </p>
                    <p className="mt-2 text-[13px] leading-[1.55] text-muted-foreground">
                      {c.note}
                    </p>
                  </div>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                </a>
              </li>
            ))}
          </ul>

          {/* Inquiry hints */}
          <div className="mt-10">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fuchsia-300/80">
              ━ what to write about
            </span>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {inquiryHints.map((h) => (
                <div
                  key={h.title}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 backdrop-blur-md"
                >
                  <h.icon className="h-4 w-4 text-cyan-300/85" />
                  <p className="mt-3 text-[13px] font-medium tracking-tight text-foreground">
                    {h.title}
                  </p>
                  <p className="mt-1 text-[12px] leading-[1.55] text-muted-foreground">
                    {h.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
