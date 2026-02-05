import { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { Mail, MessageSquare } from "lucide-react";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { PixPayment } from "@/components/pix/pix-payment";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with me or support my work.",
};

const contactLinks = [
  {
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
    label: "Email",
    value: siteConfig.email,
  },
  {
    href: siteConfig.links.twitter,
    icon: FaTwitter,
    label: "Twitter",
    value: "@tgmarinho",
  },
  {
    href: siteConfig.links.linkedin,
    icon: FaLinkedin,
    label: "LinkedIn",
    value: "tgmarinho",
  },
  {
    href: siteConfig.links.github,
    icon: FaGithub,
    label: "GitHub",
    value: "tgmarinho",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Contact</h1>
      <p className="text-muted-foreground mb-8">
        Get in touch or support my work.
      </p>

      {/* Contact links */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Reach Out
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-border hover:bg-card"
            >
              <link.icon className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.value}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Sponsor / Pix */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Support My Work</h2>
        <p className="text-sm text-muted-foreground mb-6">
          If you enjoy my content and want to support my work, you can send a
          Pix donation. Every contribution helps me create more content and
          maintain open source projects.
        </p>
        <PixPayment />
      </section>
    </div>
  );
}
