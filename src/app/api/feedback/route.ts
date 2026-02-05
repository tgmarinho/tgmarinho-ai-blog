import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with Upstash Redis when configured
const feedbacks: Array<{ slug: string; type: string; message?: string; date: string }> = [];

export async function POST(request: NextRequest) {
  const { slug, type, message } = await request.json();

  if (!slug || !type) {
    return NextResponse.json(
      { error: "Slug and type are required" },
      { status: 400 }
    );
  }

  feedbacks.push({ slug, type, message, date: new Date().toISOString() });

  return NextResponse.json({ success: true });
}
