import seed from "@/seed_items.json";

export type SeedItem = {
  id: string;
  question: string;
  context: string;
  model_answer: string;
  expected_risk: "low" | "medium" | "high";
  expected_issue_tags: string[];
};

export function getSeedItems(): SeedItem[] {
  // Basic runtime sanity: ensure array
  if (!Array.isArray(seed)) return [];
  return seed as SeedItem[];
}
