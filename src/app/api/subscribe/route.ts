import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Valid email is required" },
      { status: 400 }
    );
  }

  // Buttondown API
  const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;
  if (!BUTTONDOWN_API_KEY) {
    return NextResponse.json(
      { error: "Newsletter service not configured" },
      { status: 500 }
    );
  }

  const response = await fetch("https://api.buttondown.email/v1/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Token ${BUTTONDOWN_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    return NextResponse.json({ success: true });
  }

  const data = await response.json();
  if (response.status === 409) {
    return NextResponse.json({ success: true, message: "Already subscribed" });
  }

  return NextResponse.json(
    { error: data.detail || "Failed to subscribe" },
    { status: response.status }
  );
}
