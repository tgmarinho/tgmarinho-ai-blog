import { NextRequest, NextResponse } from "next/server";
import { answerPublicQuestion } from "@/lib/ask/answer";
import { routing, type Locale } from "@/i18n/routing";
import { featureFlags } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const maxDuration = 30;

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    routing.locales.includes(value as (typeof routing.locales)[number])
  );
}

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip || request.headers.get("x-real-ip") || "anonymous";
}

function rateLimit(request: NextRequest): boolean {
  const key = clientKey(request);
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;

  current.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  if (!featureFlags.ask) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (!rateLimit(request)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again soon." },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const body = payload as { question?: unknown; locale?: unknown };
  const question =
    typeof body.question === "string" ? body.question.trim() : "";
  const locale = isLocale(body.locale) ? body.locale : routing.defaultLocale;

  if (question.length < 4) {
    return NextResponse.json(
      { error: "Question must be at least 4 characters." },
      { status: 400 }
    );
  }

  if (question.length > 600) {
    return NextResponse.json(
      { error: "Question must be 600 characters or less." },
      { status: 400 }
    );
  }

  const result = await answerPublicQuestion(question, locale);
  return NextResponse.json(result);
}
