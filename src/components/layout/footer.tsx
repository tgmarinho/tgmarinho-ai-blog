import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { FaGithub, FaTwitter, FaLinkedin, FaDiscord, FaYoutube } from "react-icons/fa";

const socialLinks = [
  { href: siteConfig.links.github, icon: FaGithub, label: "GitHub" },
  { href: siteConfig.links.twitter, icon: FaTwitter, label: "Twitter" },
  { href: siteConfig.links.linkedin, icon: FaLinkedin, label: "LinkedIn" },
  { href: siteConfig.links.discord, icon: FaDiscord, label: "Discord" },
  { href: siteConfig.links.youtube, icon: FaYoutube, label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            <Link href="/" className="hover:text-foreground transition-colors">
              {siteConfig.name}
            </Link>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={link.label}
              >
                <link.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
