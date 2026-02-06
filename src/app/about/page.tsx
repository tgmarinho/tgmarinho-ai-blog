import { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { FaGithub, FaTwitter, FaLinkedin, FaDiscord, FaYoutube } from "react-icons/fa";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.name} - ${siteConfig.role}`,
};

const skills = [
  "TypeScript", "JavaScript", "React", "Next.js", "Node.js", "React Native",
  "GraphQL", "PostgreSQL", "MongoDB", "Redis", "Docker",
  "Ethereum", "WAX", "Web3", "Smart Contracts", "Tailwind CSS",
  "AI", "LLMs", "RAG", "AI Agents", "Intelligent Automation",
  "AWS", "Vercel", "Firebase", "Git", "Turborepo", "Prisma",
];

const socialLinks = [
  { href: siteConfig.links.github, icon: FaGithub, label: "GitHub" },
  { href: siteConfig.links.twitter, icon: FaTwitter, label: "Twitter" },
  { href: siteConfig.links.linkedin, icon: FaLinkedin, label: "LinkedIn" },
  { href: siteConfig.links.discord, icon: FaDiscord, label: "Discord" },
  { href: siteConfig.links.youtube, icon: FaYoutube, label: "YouTube" },
];

const experiences = [
  {
    title: "Software Engineer",
    company: "Popstand",
    period: "May 2021 - Jan 2026 · 4 yrs 9 mos",
    location: "Los Angeles, CA · Remote",
    highlights: [
      "Built complete healthcare platform (API, Frontend, Mobile) serving thousands of patients",
      "Reduced mobile user drop-off by 25% through Branch.io deep linking optimization",
      "Developed NFT Marketplace on WAX blockchain with complex minting forms",
      "Established CI/CD pipelines reducing deployment time from hours to minutes",
    ]
  },
  {
    title: "Full Stack Developer",
    company: "Unicrow",
    period: "Sep 2021 - Feb 2023 · 1 yr 6 mos",
    location: "Zurich, Switzerland · Remote",
    highlights: [
      "Built TypeScript SDK for Web3 escrow payments, reducing onboarding time by 60%",
      "Created real-time blockchain indexer processing thousands of Ethereum transactions",
      "Architected data pipeline: Smart Contract → Indexer → PostgreSQL → GraphQL → Frontend",
    ]
  },
  {
    title: "Dev & Tech Writer",
    company: "Rocketseat",
    period: "Jun 2020 - Apr 2021 · 11 mos",
    location: "Brazil",
    highlights: [
      "Created technical content reaching 50,000+ developers in Brazilian JavaScript community",
      "Published articles on React, Node.js, and TypeScript best practices",
      "Mentored 100+ early-career developers through written guides",
    ]
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">About Me</h1>
          <p className="text-muted-foreground">Get to know me a bit more.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/cv">
            <FileText className="h-4 w-4 mr-2" />
            View Full CV
          </Link>
        </Button>
      </div>

      {/* Bio */}
      <section className="mb-10">
        <div className="flex items-start gap-6 mb-6">
          <div className="h-20 w-20 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 p-0.5">
            <img
              src="https://avatars.githubusercontent.com/u/380327?v=4"
              alt={siteConfig.name}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1">{siteConfig.name}</h2>
            <p className="text-muted-foreground">{siteConfig.role}</p>
          </div>
        </div>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Hi! I&apos;m Thiago Marinho, an <strong>AI Product Engineer</strong> and <strong>PassionateSoftware Engineer</strong> from Brazil with <strong>10+ years</strong> of experience
            building scalable web, mobile, and backend systems. I specialize in <strong>Full-Stack Development</strong>, <strong>Web3/NFT platforms</strong>,
            and <strong>AI-powered product engineering</strong>.
          </p>
          <p>
            My expertise includes building <strong>intelligent automations</strong>, <strong>AI Agents</strong>, and <strong>RAG systems</strong>.
            I have a proven track record shipping production systems from zero to deployment across industries such as <strong>healthcare</strong>,
            <strong>Web3</strong>, <strong>NFT marketplaces</strong>, <strong>government systems</strong>, and <strong>event platforms</strong>.
          </p>
          <p>
            I&apos;m passionate about <strong>technology</strong> that solve real problems. Built an event management and ticketing platform that processed R$6M in revenue, using T3 Stack, TypeScript, Next.js, Vercel, MongoDB Atlas (QuaveCloud), integrated with Woovi (PIX), Asaas (credit cards), Evolution API, and Inngest.
          </p>
        </div>
      </section>

      {/* Key Achievements */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Key Achievements</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-1">📈</span>
            <span>40% improvement in nurse onboarding experience and user retention</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-1">📱</span>
            <span>25% reduction in mobile drop-off through UI optimization</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-1">⛓️</span>
            <span>60% faster SDK integration with developer-friendly TypeScript SDK</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-1">🎯</span>
            <span>99.9% indexer accuracy processing thousands of blockchain transactions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-1">👥</span>
            <span>50,000+ developers reached through technical content creation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-1">⭐</span>
            <span>1,100+ GitHub followers through relevant content</span>
          </li>
        </ul>
      </section>

      {/* Experience Highlights */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Experience Highlights</h2>
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div key={index} className="border-l-2 border-blue-500 pl-4">
              <h3 className="font-semibold text-lg">{exp.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {exp.company} · {exp.period}
              </p>
              <p className="text-xs text-muted-foreground mb-3">{exp.location}</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {exp.highlights.map((highlight, hIndex) => (
                  <li key={hIndex} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/cv">
              View complete work history →
            </Link>
          </Button>
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
