import { Metadata } from "next";
import { ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Projects",
  description: "A showcase of my projects and open source contributions.",
};

const projects = [
  {
    title: "tgmarinho.com",
    description:
      "My personal blog and portfolio built with Next.js 15, Velite, and Tailwind CSS v4.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "MDX"],
    github: "https://github.com/tgmarinho/tgmarinho-ai-website",
    live: "https://tgmarinho.com",
  },
  {
    title: "Open Source Contributions",
    description:
      "Active contributor to various open source projects in the React and Node.js ecosystem.",
    tags: ["React", "Node.js", "Open Source"],
    github: "https://github.com/tgmarinho",
  },
  {
    title: "Discord Community",
    description:
      "A community of developers learning and growing together. Join us to discuss tech, share projects, and network.",
    tags: ["Community", "Discord", "Networking"],
    live: "https://discord.gg/kznGvgV7aA",
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
