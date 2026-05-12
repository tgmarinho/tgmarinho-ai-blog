"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import type FuseType from "fuse.js";
import { Search as SearchIcon, X } from "lucide-react";
import { PostCard } from "./post-card";
import type { PostMeta } from "@/lib/velite";

interface BlogSearchProps {
  posts: PostMeta[];
  categories: string[];
  searchPlaceholder?: string;
  emptyLabel?: string;
  allLabel?: string;
}

// Slim index — Fuse only needs the fields we score on; we resolve back to
// the full PostMeta via slug after a hit. Keeps the indexed JSON small.
interface SearchIndexItem {
  title: string;
  description: string;
  categories: string[];
  slug: string;
}

export function BlogSearch({
  posts,
  categories,
  searchPlaceholder = "Search posts, topics, ideas…",
  emptyLabel = "no posts match · try another query",
  allLabel = "all",
}: BlogSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const fuseRef = useRef<FuseType<SearchIndexItem> | null>(null);
  const [fuseReady, setFuseReady] = useState(false);

  const index = useMemo<SearchIndexItem[]>(
    () =>
      posts.map((p) => ({
        title: p.title,
        description: p.description ?? "",
        categories: p.categories,
        slug: p.slug,
      })),
    [posts]
  );

  const ensureFuse = useCallback(async () => {
    if (fuseRef.current) return;
    const { default: Fuse } = await import("fuse.js");
    fuseRef.current = new Fuse(index, {
      keys: [
        { name: "title", weight: 3 },
        { name: "description", weight: 2 },
        { name: "categories", weight: 1.5 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
    setFuseReady(true);
  }, [index]);

  const filteredPosts = useMemo(() => {
    let results = posts;

    if (query.trim() && fuseReady && fuseRef.current) {
      const hits = fuseRef.current.search(query);
      const order = new Map(hits.map((h, i) => [h.item.slug, i]));
      results = posts
        .filter((p) => order.has(p.slug))
        .sort((a, b) => (order.get(a.slug)! - order.get(b.slug)!));
    }

    if (selectedCategory) {
      results = results.filter((p) => p.categories.includes(selectedCategory));
    }

    if (!query.trim()) {
      results = [...results].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    return results;
  }, [query, selectedCategory, posts, fuseReady]);

  const [feature, ...rest] = filteredPosts;

  return (
    <div>
      {/* Search + filters */}
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="group relative">
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-300" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={query}
            onFocus={ensureFuse}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value) void ensureFuse();
            }}
            className="h-12 w-full rounded-full border border-white/[0.06] bg-white/[0.025] pl-11 pr-11 text-[14px] text-foreground placeholder:text-muted-foreground/70 backdrop-blur-md transition-all focus:border-cyan-300/40 focus:outline-none focus:ring-4 focus:ring-cyan-300/10"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground md:text-right">
          {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-12 flex flex-wrap gap-1.5">
          <CategoryPill
            label={allLabel}
            active={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={selectedCategory === cat}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
            />
          ))}
        </div>
      )}

      {/* Results — asymmetric grid */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-20 text-center">
          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
            {emptyLabel}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:[grid-auto-flow:dense] lg:grid-cols-3">
          {feature && (
            <PostCard
              {...feature}
              variant="feature"
              className="md:col-span-2 md:row-span-2 lg:col-span-2"
            />
          )}
          {rest.map((post, i) => (
            <PostCard
              key={post.slug}
              {...post}
              variant={i % 5 === 4 ? "compact" : "default"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group relative rounded-full px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-all " +
        (active
          ? "border border-cyan-300/40 bg-cyan-300/10 text-cyan-200"
          : "border border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:border-white/15 hover:text-foreground")
      }
    >
      {active && (
        <span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 18px -2px rgba(34,211,238,0.45)" }}
        />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}
