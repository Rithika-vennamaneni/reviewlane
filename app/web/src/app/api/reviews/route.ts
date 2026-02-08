import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import type { Confidence, Decision } from "@/lib/types";

const VALID_DECISIONS: Decision[] = ["APPROVE", "EDIT_APPROVE", "REJECT"];
const VALID_CONFIDENCE: Confidence[] = ["low", "medium", "high"];

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batch_id = searchParams.get("batch_id");
  const item_id = searchParams.get("item_id");

  if (!batch_id) {
    return NextResponse.json(
      { error: "batch_id query param is required." },
      { status: 400 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: {
      batch_id,
      ...(item_id ? { item_id } : {}),
    },
    orderBy: { created_at: "desc" },
  });

  const payload = reviews.map((review) => ({
    id: review.id,
    item_id: review.item_id,
    batch_id: review.batch_id,
    reviewer_id: review.reviewer_id,
    decision: review.decision,
    confidence: review.confidence,
    reason_tags: Array.isArray(review.reason_tags) ? review.reason_tags : [],
    edited_text: review.edited_text ?? undefined,
    notes: review.notes ?? undefined,
    created_at: review.created_at.toISOString(),
  }));

  return NextResponse.json({ reviews: payload });
}

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const bodyObj =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};

  const {
    item_id,
    batch_id,
    reviewer_id,
    decision,
    confidence,
    reason_tags,
    edited_text,
    notes,
  } = bodyObj;

  const reviewerId =
    typeof reviewer_id === "string" ? reviewer_id.trim() : "";

  if (!item_id || !batch_id || !reviewerId) {
    return NextResponse.json(
      { error: "item_id, batch_id, and reviewer_id are required." },
      { status: 400 }
    );
  }

  if (!VALID_DECISIONS.includes(decision as Decision)) {
    return NextResponse.json(
      { error: "decision must be APPROVE, EDIT_APPROVE, or REJECT." },
      { status: 400 }
    );
  }

  if (!VALID_CONFIDENCE.includes(confidence as Confidence)) {
    return NextResponse.json(
      { error: "confidence must be low, medium, or high." },
      { status: 400 }
    );
  }

  if (!isStringArray(reason_tags)) {
    return NextResponse.json(
      { error: "reason_tags must be an array of strings." },
      { status: 400 }
    );
  }

  if (decision === "EDIT_APPROVE" && (!edited_text || !edited_text.trim())) {
    return NextResponse.json(
      { error: "edited_text is required for EDIT_APPROVE." },
      { status: 400 }
    );
  }

  const item = await prisma.item.findUnique({
    where: { id_batch_id: { id: item_id, batch_id } },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }

  const review = await prisma.review.upsert({
    where: {
      item_id_batch_id_reviewer_id: {
        item_id,
        batch_id,
        reviewer_id: reviewerId,
      },
    },
    create: {
      item_id,
      batch_id,
      reviewer_id: reviewerId,
      decision,
      confidence,
      reason_tags,
      edited_text: edited_text?.trim() || null,
      notes: notes?.trim() || null,
    },
    update: {
      decision,
      confidence,
      reason_tags,
      edited_text: edited_text?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json({
    review: {
      id: review.id,
      item_id: review.item_id,
      batch_id: review.batch_id,
      reviewer_id: review.reviewer_id,
      decision: review.decision,
      confidence: review.confidence,
      reason_tags: Array.isArray(review.reason_tags) ? review.reason_tags : [],
      edited_text: review.edited_text ?? undefined,
      notes: review.notes ?? undefined,
      created_at: review.created_at.toISOString(),
    },
  });
}
