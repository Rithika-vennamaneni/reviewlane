import json
from collections import Counter
from pathlib import Path

SEED_PATH = Path(__file__).parent / "seed_items.json"

def main():
    if not SEED_PATH.exists():
        raise FileNotFoundError(f"Could not find seed file at: {SEED_PATH}")

    items = json.loads(SEED_PATH.read_text(encoding="utf-8"))

    risk_counts = Counter()
    tag_counts = Counter()

    for item in items:
        risk = item.get("expected_risk", "missing")
        risk_counts[risk] += 1

        tags = item.get("expected_issue_tags", [])
        if not isinstance(tags, list):
            tags = [str(tags)]
        for t in tags:
            tag_counts[t] += 1

    total = len(items)

    print("\n=== Seed Dataset Summary ===")
    print(f"Total items: {total}")

    print("\n--- Counts by expected_risk ---")
    for k, v in risk_counts.most_common():
        print(f"{k:>8}: {v}")

    print("\n--- Counts by expected_issue_tags ---")
    for k, v in tag_counts.most_common():
        print(f"{k:>18}: {v}")

    # Quick sanity checks
    print("\n--- Sanity checks ---")
    if total == 0:
        print("⚠️ No items found.")
    else:
        if risk_counts.get("high", 0) == 0:
            print("⚠️ No HIGH risk items — you may not be testing the review queue enough.")
        if risk_counts.get("low", 0) == 0:
            print("⚠️ No LOW risk items — you may not be testing auto-approval behavior.")
        print("✅ Script ran successfully.")

if __name__ == "__main__":
    main()
