export const REASON_TAGS = [
  "grounded",
  "missing_citation",
  "ungrounded_claim",
  "overconfident_tone",
  "ambiguous_question",
  "policy_unclear",
  "policy_conflict",
  "potential_harm",
  "needs_escalation",
] as const;

export type ReasonTag = (typeof REASON_TAGS)[number];

export type Decision = "APPROVE" | "EDIT_APPROVE" | "REJECT";
export type Confidence = "low" | "medium" | "high";

export type ReviewRecord = {
  id: string;
  item_id: string;
  batch_id: string;
  reviewer_id: string;
  decision: Decision;
  confidence: Confidence;
  reason_tags: string[];
  edited_text?: string;
  notes?: string;
  created_at: string;
};

export type ReviewInput = Omit<ReviewRecord, "id" | "created_at">;

export type ItemRecord = {
  id: string;
  batch_id: string;
  question: string;
  context: string;
  model_answer: string;
  expected_risk: "low" | "medium" | "high";
  expected_issue_tags: string[];
};

export type IssueDistribution = {
  by_tag: Record<string, number>;
  by_primary: Record<string, number>;
};

export type DisagreementMetrics = {
  rate: number;
  total_items: number;
  disagreed_items: number;
  disagreement_by_tag: Record<string, number>;
};

export type ConfidenceCalibrationRow = {
  confidence: Confidence;
  rate: number;
  total_reviews: number;
  disagreed_reviews: number;
};

export type MetricsPayload = {
  issue_distribution: IssueDistribution;
  disagreement_rate: DisagreementMetrics;
  confidence_calibration: ConfidenceCalibrationRow[];
};
