import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batch_id = searchParams.get("batch_id");

  if (!batch_id) {
    return NextResponse.json(
      { error: "batch_id query param is required." },
      { status: 400 }
    );
  }

  const items = await prisma.item.findMany({
    where: { batch_id },
    orderBy: { id: "asc" },
  });

  const payload = items.map((item) => ({
    id: item.id,
    batch_id: item.batch_id,
    question: item.question,
    context: item.context,
    model_answer: item.model_answer,
    expected_risk: item.expected_risk,
    expected_issue_tags: Array.isArray(item.expected_issue_tags)
      ? item.expected_issue_tags
      : [],
  }));

  return NextResponse.json({ items: payload });
}
