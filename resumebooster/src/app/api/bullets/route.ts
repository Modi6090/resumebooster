// src/app/api/ai/bullets/route.ts
// POST /api/ai/bullets
// Streams Gemini bullet point generation back to the client.
// Protected by auth + per-user rate limiting.

import { getServerSession }    from "next-auth";
import { authOptions }         from "@/lib/auth";
import { prisma }              from "@/lib/prisma";
import { getBulletModel }      from "@/lib/gemini";
import { checkRateLimit }      from "@/lib/rateLimiter";
import { buildBulletPrompt }   from "@/lib/prompts/bulletPrompt";
import { NextResponse }        from "next/server";

export const runtime    = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  // ── 1. Auth guard ──────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Fetch fresh user plan from DB (don't trust session alone) ───────────
  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { plan: true },
  });
  const plan = user?.plan ?? "FREE";

  // ── 3. Rate limit check ────────────────────────────────────────────────────
  const rl = await checkRateLimit(session.user.id, plan);
  if (!rl.allowed) {
    const resetIn = Math.ceil((rl.resetAt - Date.now()) / 1000 / 60); // minutes
    return NextResponse.json(
      {
        error:   "rate_limited",
        message: `You've used all 5 free AI credits. Resets in ${resetIn} minutes.`,
        resetAt: rl.resetAt,
        plan,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset":     String(rl.resetAt),
        },
      }
    );
  }

  // ── 4. Parse and validate request body ────────────────────────────────────
  let body: { role?: string; company?: string; description?: string; count?: number; existing?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const count = Math.min(Math.max(Number(body.count) || 3, 1), 5); // clamp 1–5
  const prompt = buildBulletPrompt({
    role:        body.role        ?? "",
    company:     body.company     ?? "",
    description: body.description ?? "",
    count,
    existing:    body.existing    ?? [],
  });

  // ── 5. Stream Gemini response ──────────────────────────────────────────────
  const model = getBulletModel();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(prompt);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }

        // Send rate limit headers as a final SSE-style metadata chunk
        const meta = JSON.stringify({
          __meta: true,
          remaining: rl.remaining,
          plan,
        });
        controller.enqueue(encoder.encode(`\n__META__${meta}`));
        controller.close();
      } catch (err: any) {
        console.error("Gemini error:", err);
        controller.enqueue(
          encoder.encode(`\n__ERROR__${err?.message ?? "AI generation failed"}`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":           "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-RateLimit-Remaining":  String(rl.remaining),
      "X-RateLimit-Reset":      String(rl.resetAt),
      "Cache-Control":          "no-cache",
    },
  });
}