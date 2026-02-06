import { Metadata } from "next";
import { ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Projects",
  description: "A showcase of my projects and open source contributions.",
};

const projects = [
  {
    title: "Unicrow",
    description:
      "Web3 escrow platform on Ethereum. Contributed to SDK development, blockchain indexer, and smart contracts. Production-grade TypeScript SDK for escrow payments integration.",
    tags: ["TypeScript", "Ethereum", "Web3", "Smart Contracts", "Node.js", "GraphQL"],
    github: "https://github.com/unicrowio",
  },
  {
    title: "Meetapp",
    description:
      "Full-stack meetup organizer application (Backend, Frontend, Mobile). Final challenge project from Rocketseat Bootcamp. Built with React, React Native, Node.js, and Redux.",
    tags: ["React", "React Native", "Node.js", "Redux", "JavaScript", "Full-Stack"],
    github: "https://github.com/tgmarinho/meetapp",
  },
  {
    title: "Be the Hero",
    description:
      "Full-stack application connecting NGOs with donors. Built during Rocketseat Bootcamp to help organizations raise funds for their causes.",
    tags: ["React", "React Native", "Node.js", "JavaScript", "Full-Stack"],
    github: "https://github.com/tgmarinho/be-the-hero",
  },
  {
    title: "Members",
    description:
      "Open source project for managing members and communities.",
    tags: ["Open Source", "TypeScript", "React"],
    github: "https://github.com/tgmarinho/members",
  },
];

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
      <p className="text-muted-foreground mb-8">
        A collection of projects I&apos;ve worked on.
      </p>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.title}
            className="rounded-lg border border-border/50 bg-card/50 p-5 transition-all hover:border-border hover:bg-card"
          >
            <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-4 w-4" />
                  Source
                </a>
              )}
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
