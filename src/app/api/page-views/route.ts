import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with Upstash Redis when configured
// import { Redis } from "@upstash/redis";
// const redis = Redis.fromEnv();

// In-memory store for development
const views = new Map<string, number>();

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const count = views.get(slug) ?? 0;
  return NextResponse.json({ views: count });
}

export async function POST(request: NextRequest) {
  const { slug } = await request.json();
  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const current = views.get(slug) ?? 0;
  views.set(slug, current + 1);
  return NextResponse.json({ views: current + 1 });
}
