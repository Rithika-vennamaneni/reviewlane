import type {
  Confidence,
  IssueDistribution,
  MetricsPayload,
  ReviewRecord,
} from "./types";

type ReviewForMetrics = Pick<
  ReviewRecord,
  "item_id" | "decision" | "confidence" | "reason_tags"
>;

function countTags(tags: string[], target: Record<string, number>) {
  tags.forEach((tag) => {
    target[tag] = (target[tag] ?? 0) + 1;
  });
}

export function computeIssueDistribution(
  reviews: ReviewForMetrics[]
): IssueDistribution {
  const by_tag: Record<string, number> = {};
  const by_primary: Record<string, number> = {};

  for (const review of reviews) {
    const tags = review.reason_tags ?? [];
    countTags(tags, by_tag);
    if (tags.length > 0) {
      const primary = tags[0];
      by_primary[primary] = (by_primary[primary] ?? 0) + 1;
    }
  }

  return { by_tag, by_primary };
}

export function computeDisagreementRate(reviews: ReviewForMetrics[]) {
  const byItem = new Map<string, ReviewForMetrics[]>();
  reviews.forEach((review) => {
    const existing = byItem.get(review.item_id) ?? [];
    existing.push(review);
    byItem.set(review.item_id, existing);
  });

  const disagreement_by_tag: Record<string, number> = {};
  let eligibleItems = 0;
  let disagreedItems = 0;

  for (const itemReviews of byItem.values()) {
    if (itemReviews.length < 2) continue;
    eligibleItems += 1;
    const decisions = new Set(itemReviews.map((r) => r.decision));
    if (decisions.size > 1) {
      disagreedItems += 1;
      itemReviews.forEach((review) => countTags(review.reason_tags ?? [], disagreement_by_tag));
    }
  }

  return {
    rate: eligibleItems > 0 ? disagreedItems / eligibleItems : 0,
    total_items: eligibleItems,
    disagreed_items: disagreedItems,
    disagreement_by_tag,
  };
}

export function computeConfidenceCalibration(reviews: ReviewForMetrics[]) {
  const byItem = new Map<string, ReviewForMetrics[]>();
  reviews.forEach((review) => {
    const existing = byItem.get(review.item_id) ?? [];
    existing.push(review);
    byItem.set(review.item_id, existing);
  });

  const levels: Confidence[] = ["low", "medium", "high"];
  const totals: Record<Confidence, number> = {
    low: 0,
    medium: 0,
    high: 0,
  };
  const disagreed: Record<Confidence, number> = {
    low: 0,
    medium: 0,
    high: 0,
  };

  for (const itemReviews of byItem.values()) {
    if (itemReviews.length < 2) continue;
    const decisions = new Set(itemReviews.map((r) => r.decision));
    const isDisagreed = decisions.size > 1;
    itemReviews.forEach((review) => {
      totals[review.confidence] += 1;
      if (isDisagreed) {
        disagreed[review.confidence] += 1;
      }
    });
  }

  return levels.map((confidence) => {
    const total_reviews = totals[confidence];
    const disagreed_reviews = disagreed[confidence];
    return {
      confidence,
      rate: total_reviews > 0 ? disagreed_reviews / total_reviews : 0,
      total_reviews,
      disagreed_reviews,
    };
  });
}

export function computeMetrics(reviews: ReviewForMetrics[]): MetricsPayload {
  return {
    issue_distribution: computeIssueDistribution(reviews),
    disagreement_rate: computeDisagreementRate(reviews),
    confidence_calibration: computeConfidenceCalibration(reviews),
  };
}

export function computeDrift(
  batchA: IssueDistribution,
  batchB: IssueDistribution
) {
  const allTags = new Set([
    ...Object.keys(batchA.by_tag),
    ...Object.keys(batchB.by_tag),
  ]);
  const allPrimary = new Set([
    ...Object.keys(batchA.by_primary),
    ...Object.keys(batchB.by_primary),
  ]);

  const delta_by_tag: Record<string, number> = {};
  const delta_by_primary: Record<string, number> = {};

  allTags.forEach((tag) => {
    delta_by_tag[tag] = (batchB.by_tag[tag] ?? 0) - (batchA.by_tag[tag] ?? 0);
  });

  allPrimary.forEach((tag) => {
    delta_by_primary[tag] =
      (batchB.by_primary[tag] ?? 0) - (batchA.by_primary[tag] ?? 0);
  });

  return {
    delta_by_tag,
    delta_by_primary,
  };
}
