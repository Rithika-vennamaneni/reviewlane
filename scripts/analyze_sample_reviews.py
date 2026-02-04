import json
from collections import Counter, defaultdict
from pathlib import Path

REVIEWS_PATH = Path(__file__).parent / "sample_reviews.json"

def main():
    reviews = json.loads(REVIEWS_PATH.read_text(encoding="utf-8"))

    # Group reviews by item_id
    by_item = defaultdict(list)
    for r in reviews:
        by_item[r["item_id"]].append(r)

    # Compute agreement
    total_pairs = 0
    agree_pairs = 0

    # Track what tags show up in disagreements
    disagreement_tag_counter = Counter()

    # Confidence vs disagreement
    disagreement_confidence_counter = Counter()

    for item_id, rs in by_item.items():
        if len(rs) != 2:
            continue  # only analyzing 2-reviewer items for this step

        r1, r2 = rs[0], rs[1]
        total_pairs += 1

        if r1["decision"] == r2["decision"]:
            agree_pairs += 1
        else:
            # Count union of tags involved when disagreement happens
            tags = set(r1.get("reason_tags", [])) | set(r2.get("reason_tags", []))
            for t in tags:
                disagreement_tag_counter[t] += 1

            # Track confidence pairs (low/med/high)
            cpair = f'{r1.get("confidence","?")}/{r2.get("confidence","?")}'
            disagreement_confidence_counter[cpair] += 1

    agreement_rate = (agree_pairs / total_pairs) if total_pairs else 0.0

    print("\n=== Sample Review Analysis ===")
    print(f"Items with 2 reviews: {total_pairs}")
    print(f"Decision agreement: {agree_pairs}/{total_pairs} ({agreement_rate:.0%})")

    print("\n--- Disagreement by tag (union of tags on disagreeing items) ---")
    if disagreement_tag_counter:
        for k, v in disagreement_tag_counter.most_common():
            print(f"{k:>18}: {v}")
    else:
        print("No disagreements found.")

    print("\n--- Disagreement confidence pairs ---")
    if disagreement_confidence_counter:
        for k, v in disagreement_confidence_counter.most_common():
            print(f"{k:>12}: {v}")
    else:
        print("No disagreements found.")

    print("\n✅ Done.")

if __name__ == "__main__":
    main()

