import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import readingTime from "reading-time";

interface PostCardProps {
  title: string;
  description?: string;
  date: string;
  slug: string;
  categories: string[];
  body: string;
}

export function PostCard({
  title,
  description,
  date,
  slug,
  categories,
  body,
}: PostCardProps) {
  const stats = readingTime(body);

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block rounded-lg border border-border/50 bg-card/50 p-5 transition-all hover:border-border hover:bg-card"
    >
      <div className="flex flex-wrap gap-2 mb-3">
        {categories.map((cat) => (
          <Badge key={cat} variant="secondary" className="text-xs">
            {cat}
          </Badge>
        ))}
      </div>

      <h3 className="text-lg font-semibold tracking-tight group-hover:text-blue-500 transition-colors mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {stats.text}
        </span>
      </div>
    </Link>
  );
}
