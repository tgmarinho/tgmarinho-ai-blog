import { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { FaDiscord } from "react-icons/fa";
import { Users, MessageCircle, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "Community",
  description: "Join our developer community on Discord.",
};

const benefits = [
  {
    icon: Users,
    title: "Networking",
    description: "Connect with developers from around the world.",
  },
  {
    icon: MessageCircle,
    title: "Discussions",
    description: "Share knowledge, ask questions, and learn together.",
  },
  {
    icon: Rocket,
    title: "Growth",
    description: "Level up your career with tips and resources.",
  },
];

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#5865F2]/10 mb-4">
          <FaDiscord className="h-8 w-8 text-[#5865F2]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Join the Community
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          A space for developers to connect, learn, and grow together.
          Join our Discord server!
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="rounded-lg border border-border/50 bg-card/50 p-5 text-center"
          >
            <benefit.icon className="h-6 w-6 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">{benefit.title}</h3>
            <p className="text-sm text-muted-foreground">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button size="lg" asChild>
          <a
            href={siteConfig.links.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2"
          >
            <FaDiscord className="h-5 w-5" />
            Join Discord Server
          </a>
        </Button>
      </div>
    </div>
  );
}
