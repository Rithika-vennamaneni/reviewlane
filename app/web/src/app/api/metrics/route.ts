import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { computeMetrics } from "@/lib/metrics";

function normalizeTags(value: unknown): string[] {
  return Array.isArray(value) && value.every((tag) => typeof tag === "string")
    ? value
    : [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batch_id = searchParams.get("batch_id");

  if (!batch_id) {
    return NextResponse.json(
      { error: "batch_id query param is required." },
      { status: 400 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: { batch_id },
    orderBy: { created_at: "desc" },
  });

  const shaped = reviews.map((review) => ({
    item_id: review.item_id,
    decision: review.decision,
    confidence: review.confidence,
    reason_tags: normalizeTags(review.reason_tags),
  }));

  const metrics = computeMetrics(shaped);

  return NextResponse.json({ batch_id, metrics });
}
