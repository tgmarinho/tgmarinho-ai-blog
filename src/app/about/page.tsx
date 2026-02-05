import { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { FaGithub, FaTwitter, FaLinkedin, FaDiscord, FaYoutube } from "react-icons/fa";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.name} - ${siteConfig.role}`,
};

const skills = [
  "React", "Next.js", "TypeScript", "Node.js", "React Native",
  "GraphQL", "PostgreSQL", "MongoDB", "Docker", "AWS",
  "Solidity", "Ethereum", "Web3", "Tailwind CSS", "Git",
];

const socialLinks = [
  { href: siteConfig.links.github, icon: FaGithub, label: "GitHub" },
  { href: siteConfig.links.twitter, icon: FaTwitter, label: "Twitter" },
  { href: siteConfig.links.linkedin, icon: FaLinkedin, label: "LinkedIn" },
  { href: siteConfig.links.discord, icon: FaDiscord, label: "Discord" },
  { href: siteConfig.links.youtube, icon: FaYoutube, label: "YouTube" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">About Me</h1>
      <p className="text-muted-foreground mb-8">Get to know me a bit more.</p>

      {/* Bio */}
      <section className="mb-10">
        <div className="flex items-start gap-6 mb-6">
          <div className="h-20 w-20 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 p-0.5">
            <div className="h-full w-full rounded-full bg-background flex items-center justify-center text-2xl font-bold text-blue-500">
              TM
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1">{siteConfig.name}</h2>
            <p className="text-muted-foreground">{siteConfig.role}</p>
          </div>
        </div>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Hi! I&apos;m Thiago Marinho, a Software Engineer from Brazil with {siteConfig.yearsOfExperience}+ years
            of experience building web and mobile applications. I specialize in React, Node.js,
            and the JavaScript/TypeScript ecosystem.
          </p>
          <p>
            I&apos;m passionate about blockchain technology, open source, and helping other developers
            grow through content creation and community building. I write about web development,
            career growth, and emerging technologies.
          </p>
          <p>
            When I&apos;m not coding, you can find me contributing to open source projects,
            creating content for my YouTube channel, or engaging with the developer community
            on Discord.
          </p>
        </div>
      </section>

      {/* Skills */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Skills & Technologies</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-sm">
              {skill}
            </Badge>
          ))}
        </div>
      </section>

      {/* Social links */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Connect</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-border hover:bg-card"
            >
              <link.icon className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">{link.label}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
