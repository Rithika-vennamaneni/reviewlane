import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { computeDrift, computeIssueDistribution } from "@/lib/metrics";

function normalizeTags(value: unknown): string[] {
  return Array.isArray(value) && value.every((tag) => typeof tag === "string")
    ? value
    : [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batch_a = searchParams.get("batch_a");
  const batch_b = searchParams.get("batch_b");

  if (!batch_a || !batch_b) {
    return NextResponse.json(
      { error: "batch_a and batch_b query params are required." },
      { status: 400 }
    );
  }

  const [reviewsA, reviewsB] = await Promise.all([
    prisma.review.findMany({ where: { batch_id: batch_a } }),
    prisma.review.findMany({ where: { batch_id: batch_b } }),
  ]);

  const shapedA = reviewsA.map((review) => ({
    item_id: review.item_id,
    decision: review.decision,
    confidence: review.confidence,
    reason_tags: normalizeTags(review.reason_tags),
  }));

  const shapedB = reviewsB.map((review) => ({
    item_id: review.item_id,
    decision: review.decision,
    confidence: review.confidence,
    reason_tags: normalizeTags(review.reason_tags),
  }));

  const issueA = computeIssueDistribution(shapedA);
  const issueB = computeIssueDistribution(shapedB);
  const drift = computeDrift(issueA, issueB);

  return NextResponse.json({
    batch_a,
    batch_b,
    issue_distribution: {
      batch_a: issueA,
      batch_b: issueB,
      drift,
    },
  });
}
