"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "./post-card";
import { Search as SearchIcon } from "lucide-react";

interface Post {
  title: string;
  description?: string;
  date: string;
  slug: string;
  categories: string[];
  body: string;
  published: boolean;
}

interface BlogSearchProps {
  posts: Post[];
  categories: string[];
}

export function BlogSearch({ posts, categories }: BlogSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ["title", "description", "categories"],
        threshold: 0.3,
        includeScore: true,
      }),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    let results = posts;

    if (query.trim()) {
      results = fuse.search(query).map((r) => r.item);
    }

    if (selectedCategory) {
      results = results.filter((p) => p.categories.includes(selectedCategory));
    }

    // Garantir que os resultados estejam ordenados por data (mais recentes primeiro)
    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [query, selectedCategory, posts, fuse]);

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-card/50 border-border"
        />
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge
            variant={selectedCategory === null ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
            >
              {cat}
            </Badge>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard
              key={post.slug}
              title={post.title}
              description={post.description}
              date={post.date}
              slug={post.slug}
              categories={post.categories}
              body={post.body}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-12">
            No posts found. Try a different search term.
          </p>
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-6">
        {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} found
      </p>
    </div>
  );
}
