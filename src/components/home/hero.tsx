import { siteConfig } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, FileText, Briefcase } from "lucide-react";

interface HeroProps {
  postCount: number;
}

export function Hero({ postCount }: HeroProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="flex flex-col items-center text-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 p-0.5">
            <div className="h-full w-full rounded-full bg-background flex items-center justify-center text-4xl font-bold text-blue-500">
              TM
            </div>
          </div>
        </div>

        {/* Name and role */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            {siteConfig.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            {siteConfig.role} &bull; {siteConfig.location}
          </p>
        </div>

        {/* Bio */}
        <p className="max-w-lg text-muted-foreground leading-relaxed">
          {siteConfig.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-8 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4 text-blue-500" />
            <span>
              <strong className="text-foreground">{postCount}</strong> posts
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-4 w-4 text-blue-500" />
            <span>
              <strong className="text-foreground">
                {siteConfig.yearsOfExperience}+
              </strong>{" "}
              years exp
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/blog">
              Read Blog <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/about">About Me</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
