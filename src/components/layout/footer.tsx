import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/constants";
import { TrackedExternalLink } from "@/components/analytics-link";
import {
  FaGithub,
  FaXTwitter,
  FaLinkedin,
  FaDiscord,
  FaYoutube,
} from "react-icons/fa6";

const socialLinks = [
  { href: siteConfig.links.github, icon: FaGithub, label: "GitHub" },
  { href: siteConfig.links.twitter, icon: FaXTwitter, label: "X / Twitter" },
  { href: siteConfig.links.linkedin, icon: FaLinkedin, label: "LinkedIn" },
  { href: siteConfig.links.discord, icon: FaDiscord, label: "Discord" },
  { href: siteConfig.links.youtube, icon: FaYoutube, label: "YouTube" },
];

const navColumns = [
  {
    titleKey: "exploreTitle",
    links: [
      { href: "/blog", key: "blog" },
      { href: "/projects", key: "projects" },
      { href: "/cv", key: "cv" },
    ],
  },
  {
    titleKey: "networkTitle",
    links: [
      { href: "/about", key: "about" },
      { href: "/community", key: "community" },
      { href: "/contact", key: "contact" },
    ],
  },
] as const;

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/[0.06]">
      <div
        className="pointer-events-none absolute inset-x-0 -top-32 h-64 opacity-60 blur-3xl"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(600px 200px at 30% 50%, rgba(34,211,238,0.18), transparent 60%), radial-gradient(500px 200px at 75% 50%, rgba(217,70,239,0.14), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.03]">
                <span className="font-display text-[12px] font-bold tracking-[0.18em] text-foreground/90">
                  TG
                </span>
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_2px_rgba(34,211,238,0.7)] animate-pulse-soft" />
              </span>
              <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[13.5px] leading-[1.65] text-muted-foreground">
              {t("tagline")}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {t("systemOperational")}
            </div>
          </div>

          {navColumns.map((col) => (
            <div key={col.titleKey}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/80">
                {t(col.titleKey)}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {tNav(l.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/80">
              {t("signalsTitle")}
            </h3>
            <p className="mt-4 text-[13px] text-muted-foreground">
              {t("signalsDescription")}
            </p>
            <TrackedExternalLink
              href={siteConfig.newsletter.url}
              target="_blank"
              rel="noopener noreferrer"
              event="newsletter_subscribe_click"
              eventParams={{ location: "footer" }}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-[12.5px] tracking-wide text-foreground/90 backdrop-blur-md transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
            >
              {t("subscribe")}
              <span className="text-muted-foreground">↗</span>
            </TrackedExternalLink>
            <div className="mt-6 flex items-center gap-1">
              {socialLinks.map((link) => (
                <TrackedExternalLink
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  event="social_click"
                  eventParams={{ network: link.label, location: "footer" }}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-transparent text-muted-foreground transition-all hover:border-white/10 hover:bg-white/[0.04] hover:text-foreground"
                >
                  <link.icon className="h-4 w-4" />
                </TrackedExternalLink>
              ))}
            </div>
          </div>
        </div>

        <a
          href="/api/mcp"
          className="group mt-10 inline-flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 font-mono text-[11.5px] text-muted-foreground transition-colors hover:border-cyan-300/30 hover:text-foreground"
          title="This site is agent-readable. Try it in your terminal, or explore the MCP server."
        >
          <span className="select-none text-cyan-300/70 group-hover:text-cyan-300">
            $
          </span>
          <span className="tracking-tight">
            curl {siteConfig.url.replace("https://", "")}
          </span>
          <span className="ml-1 hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 sm:inline">
            · agent-ready · mcp ↗
          </span>
        </a>

        <div className="mesh-divider mt-8" />

        <div className="mt-6 flex flex-col items-start gap-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p>
            {t.rich("craftedIn", {
              location: (chunks) => (
                <span className="text-foreground/80">{chunks}</span>
              ),
              loc: siteConfig.location,
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
