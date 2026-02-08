"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import BatchSelector from "@/app/components/BatchSelector";
import ReviewerSelector from "@/app/components/ReviewerSelector";
import type { Confidence, Decision, ItemRecord, ReviewRecord } from "@/lib/types";
import { REASON_TAGS } from "@/lib/types";

export default function ItemDetailClient({
  id,
  batchId,
}: {
  id: string;
  batchId: string;
}) {
  const [item, setItem] = useState<ItemRecord | null>(null);
  const [itemStatus, setItemStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [itemError, setItemError] = useState("");

  const [decision, setDecision] = useState<Decision | "">("");
  const [confidence, setConfidence] = useState<Confidence | "">("");
  const [reasonTags, setReasonTags] = useState<string[]>([]);
  const [editedText, setEditedText] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [reviewerId, setReviewerId] = useState("");
  const [batchOverride, setBatchOverride] = useState(batchId);

  useEffect(() => {
    setBatchOverride(batchId);
  }, [batchId]);

  useEffect(() => {
    if (!batchOverride) return;
    let active = true;
    setItemStatus("loading");
    fetch(`/api/items?batch_id=${batchOverride}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load item.");
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        const found = (data.items ?? []).find((it: ItemRecord) => it.id === id);
        setItem(found ?? null);
        setItemStatus(found ? "ready" : "error");
        if (!found) setItemError("Item not found in this batch.");
      })
      .catch((err: Error) => {
        if (!active) return;
        setItemError(err.message);
        setItemStatus("error");
      });
    return () => {
      active = false;
    };
  }, [batchOverride, id]);

  useEffect(() => {
    if (!reviewerId || !batchOverride) return;
    let active = true;
    fetch(`/api/reviews?batch_id=${batchOverride}&item_id=${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load saved review.");
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        const reviews = (data.reviews ?? []) as ReviewRecord[];
        const existing = reviews.find((review) => review.reviewer_id === reviewerId);
        if (existing) {
          setDecision(existing.decision);
          setConfidence(existing.confidence);
          setReasonTags(existing.reason_tags ?? []);
          setEditedText(existing.edited_text ?? "");
          setNotes(existing.notes ?? "");
        } else {
          setDecision("");
          setConfidence("");
          setReasonTags([]);
          setEditedText("");
          setNotes("");
        }
        setStatus("idle");
        setStatusMessage("");
      })
      .catch((err: Error) => {
        if (!active) return;
        setStatus("error");
        setStatusMessage(err.message);
      });
    return () => {
      active = false;
    };
  }, [reviewerId, batchOverride, id]);

  function toggleTag(tag: string) {
    setReasonTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    if (!decision || !confidence) {
      setStatus("error");
      setStatusMessage("Select decision + confidence.");
      return;
    }
    if (decision === "EDIT_APPROVE" && editedText.trim().length === 0) {
      setStatus("error");
      setStatusMessage("Provide edited answer for EDIT APPROVE.");
      return;
    }
    if (!reviewerId) {
      setStatus("error");
      setStatusMessage("Set a reviewer id before saving.");
      return;
    }

    setStatus("saving");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: id,
          batch_id: batchOverride,
          reviewer_id: reviewerId,
          decision,
          reason_tags: reasonTags,
          confidence,
          edited_text: decision === "EDIT_APPROVE" ? editedText.trim() : undefined,
          notes: notes.trim() || undefined,
        }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error || "Failed to save review.");
      }
      setStatus("saved");
    } catch (err) {
      setStatus("error");
      setStatusMessage(err instanceof Error ? err.message : "Failed to save.");
    }
  }

  function handleClear() {
    setDecision("");
    setConfidence("");
    setReasonTags([]);
    setEditedText("");
    setNotes("");
    setStatus("idle");
    setStatusMessage("");
  }

  if (itemStatus === "error") {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <Link href="/">← Back to queue</Link>
        <h1 style={{ marginTop: 16 }}>Item not found</h1>
        <p>{itemError || `We couldn’t find a seed item with id "${id}".`}</p>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "system-ui",
        background: "var(--background)",
        color: "var(--foreground)",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link href="/">← Back to queue</Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <BatchSelector value={batchOverride} onChange={setBatchOverride} />
          <ReviewerSelector onChange={setReviewerId} />
          <Link href={`/metrics?batch_id=${batchOverride}`} style={{ fontSize: 12 }}>
            Metrics
          </Link>
          <Link href="/compare" style={{ fontSize: 12 }}>
            Compare
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginTop: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>Review {item?.id ?? id}</h1>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
            Expected risk: {item?.expected_risk}
          </div>
        </div>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 999,
            padding: "4px 12px",
            fontSize: 12,
          }}
        >
          {itemStatus === "loading" ? "loading item" : `batch: ${batchOverride}`}
        </div>
      </div>

      {itemStatus === "loading" && (
        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
          Loading item…
        </div>
      )}

      <section style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Question</div>
        <div style={{ marginTop: 6, fontSize: 16 }}>{item?.question}</div>
      </section>

      <section style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Context</div>
        <div
          style={{
            marginTop: 6,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            padding: 12,
            borderRadius: 10,
            color: "var(--foreground)",
          }}
        >
          {item?.context}
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Model output</div>
        <div
          style={{
            marginTop: 6,
            background: "var(--surface-muted)",
            border: "1px solid var(--border)",
            padding: 12,
            borderRadius: 10,
            color: "var(--foreground)",
          }}
        >
          {item?.model_answer}
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
                    border: "1px solid var(--border)",
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
                border: "1px solid var(--border)",
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
            {REASON_TAGS.map((tag) => (
              <label
                key={tag}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 999,
                  padding: "6px 12px",
                  cursor: "pointer",
                  background: "var(--surface)",
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
                  border: "1px solid var(--border)",
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
              border: "1px solid var(--border)",
            }}
            placeholder="1–2 sentences max..."
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <button
            type="submit"
            style={{
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "var(--accent-foreground)",
              padding: "8px 16px",
              borderRadius: 10,
              cursor: "pointer",
            }}
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving..." : "Save review"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            style={{
              border: "1px solid var(--border)",
              background: "var(--background)",
              padding: "8px 16px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Clear saved review
          </button>
          {status === "saved" && (
            <div style={{ alignSelf: "center", fontSize: 13 }}>
              Saved to backend.
            </div>
          )}
          {status === "error" && (
            <div style={{ alignSelf: "center", fontSize: 13, color: "#c00" }}>
              {statusMessage ||
                "Please select decision + confidence. Add edited answer if needed."}
            </div>
          )}
        </div>
      </form>
    </main>
  );
}
