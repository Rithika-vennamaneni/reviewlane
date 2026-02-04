"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { getSeedItems } from "@/lib/seed";

type Decision = "APPROVE" | "EDIT_APPROVE" | "REJECT";
type Confidence = "low" | "medium" | "high";

type ReviewRecord = {
  item_id: string;
  decision: Decision;
  reason_tags: string[];
  confidence: Confidence;
  edited_text?: string;
  notes?: string;
  created_at: string;
};

const TAGS = [
  "grounded",
  "missing_citation",
  "ungrounded_claim",
  "overconfident_tone",
  "ambiguous_question",
  "policy_unclear",
  "policy_conflict",
  "potential_harm",
  "needs_escalation",
];

const STORAGE_KEY = "reviewlane:reviews";

function loadAllReviews(): Record<string, ReviewRecord> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, ReviewRecord>;
    }
  } catch {
    // Ignore malformed storage.
  }
  return {};
}

function saveAllReviews(next: Record<string, ReviewRecord>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export default function ItemDetailClient({ id }: { id: string }) {
  const item = useMemo(() => getSeedItems().find((it) => it.id === id), [id]);

  const [decision, setDecision] = useState<Decision | "">("");
  const [confidence, setConfidence] = useState<Confidence | "">("");
  const [reasonTags, setReasonTags] = useState<string[]>([]);
  const [editedText, setEditedText] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const all = loadAllReviews();
    const existing = all[id];
    if (existing) {
      setDecision(existing.decision);
      setConfidence(existing.confidence);
      setReasonTags(existing.reason_tags);
      setEditedText(existing.edited_text ?? "");
      setNotes(existing.notes ?? "");
    }
    setLoaded(true);
  }, [id]);

  function toggleTag(tag: string) {
    setReasonTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!decision || !confidence) {
      setStatus("error");
      return;
    }
    if (decision === "EDIT_APPROVE" && editedText.trim().length === 0) {
      setStatus("error");
      return;
    }

    const record: ReviewRecord = {
      item_id: id,
      decision,
      reason_tags: reasonTags,
      confidence,
      edited_text: decision === "EDIT_APPROVE" ? editedText.trim() : undefined,
      notes: notes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    const all = loadAllReviews();
    all[id] = record;
    saveAllReviews(all);
    setStatus("saved");
  }

  function handleClear() {
    const all = loadAllReviews();
    delete all[id];
    saveAllReviews(all);
    setDecision("");
    setConfidence("");
    setReasonTags([]);
    setEditedText("");
    setNotes("");
    setStatus("idle");
  }

  if (!item) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <Link href="/">← Back to queue</Link>
        <h1 style={{ marginTop: 16 }}>Item not found</h1>
        <p>We couldn’t find a seed item with id "{id}".</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <Link href="/">← Back to queue</Link>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Review {item.id}</h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            Expected risk: {item.expected_risk}
          </div>
        </div>
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 999,
            padding: "4px 12px",
            fontSize: 12,
          }}
        >
          {loaded ? "localStorage enabled" : "loading saved review"}
        </div>
      </div>

      <section style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Question</div>
        <div style={{ marginTop: 6, fontSize: 16 }}>{item.question}</div>
      </section>

      <section style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Context</div>
        <div
          style={{
            marginTop: 6,
            background: "#fafafa",
            border: "1px solid #eee",
            padding: 12,
            borderRadius: 10,
          }}
        >
          {item.context}
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Model output</div>
        <div
          style={{
            marginTop: 6,
            background: "#f7f7ff",
            border: "1px solid #e6e6ff",
            padding: 12,
            borderRadius: 10,
          }}
        >
          {item.model_answer}
        </div>
      </section>

      <form
        onSubmit={handleSave}
        style={{
          marginTop: 24,
          borderTop: "1px solid #eee",
          paddingTop: 20,
        }}
      >
        <h2 style={{ fontSize: 18, margin: 0 }}>Submit review</h2>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Decision</div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {(["APPROVE", "EDIT_APPROVE", "REJECT"] as Decision[]).map(
              (opt) => (
                <label
                  key={opt}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 999,
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={opt}
                    checked={decision === opt}
                    onChange={() => setDecision(opt)}
                    style={{ marginRight: 6 }}
                  />
                  {opt.replace("_", " ")}
                </label>
              )
            )}
          </div>
        </div>

        {decision === "EDIT_APPROVE" && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Edited answer</div>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
              placeholder="Provide the corrected answer..."
            />
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Reason tags</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 8,
            }}
          >
            {TAGS.map((tag) => (
              <label
                key={tag}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 999,
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={reasonTags.includes(tag)}
                  onChange={() => toggleTag(tag)}
                  style={{ marginRight: 6 }}
                />
                {tag}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Confidence</div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {(["low", "medium", "high"] as Confidence[]).map((opt) => (
              <label
                key={opt}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 999,
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="confidence"
                  value={opt}
                  checked={confidence === opt}
                  onChange={() => setConfidence(opt)}
                  style={{ marginRight: 6 }}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Notes (optional)</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              marginTop: 6,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
            placeholder="1–2 sentences max..."
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <button
            type="submit"
            style={{
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Save review
          </button>
          <button
            type="button"
            onClick={handleClear}
            style={{
              border: "1px solid #ddd",
              background: "#fff",
              padding: "8px 16px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Clear saved review
          </button>
          {status === "saved" && (
            <div style={{ alignSelf: "center", fontSize: 13 }}>
              Saved locally.
            </div>
          )}
          {status === "error" && (
            <div style={{ alignSelf: "center", fontSize: 13, color: "#c00" }}>
              Please select decision + confidence. Add edited answer if needed.
            </div>
          )}
        </div>
      </form>
    </main>
  );
}
