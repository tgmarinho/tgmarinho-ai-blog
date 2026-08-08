import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/constants";

export const runtime = "nodejs";
// Re-fetch from GitHub at most once an hour; the public API allows 60 req/h
// unauthenticated, and this keeps us far below that.
export const revalidate = 3600;

const GH_USER = siteConfig.username;
const GH_HEADERS = {
  accept: "application/vnd.github+json",
  "user-agent": `${GH_USER}-portfolio`,
} as const;

type StatsPayload = {
  ok: boolean;
  followers: number | null;
  publicRepos: number | null;
  lastPush: { repo: string; at: string } | null;
  fetchedAt: string;
};

async function ghJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: GH_HEADERS,
      next: { revalidate },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function firstPushEvent(
  events: unknown
): { repo: string; at: string } | null {
  if (!Array.isArray(events)) return null;
  for (const event of events) {
    if (
      event &&
      typeof event === "object" &&
      (event as { type?: string }).type === "PushEvent"
    ) {
      const repo = (event as { repo?: { name?: string } }).repo?.name;
      const at = (event as { created_at?: string }).created_at;
      if (repo && at) return { repo, at };
    }
  }
  return null;
}

export async function GET() {
  const [user, events] = await Promise.all([
    ghJson(`https://api.github.com/users/${GH_USER}`),
    ghJson(`https://api.github.com/users/${GH_USER}/events/public?per_page=30`),
  ]);

  const u = (user ?? {}) as { followers?: number; public_repos?: number };

  const payload: StatsPayload = {
    ok: user !== null,
    followers: typeof u.followers === "number" ? u.followers : null,
    publicRepos: typeof u.public_repos === "number" ? u.public_repos : null,
    lastPush: firstPushEvent(events),
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    headers: {
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
