"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import BatchSelector from "@/app/components/BatchSelector";
import ReviewerSelector from "@/app/components/ReviewerSelector";
import type { ItemRecord } from "@/lib/types";

export default function Home() {
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [batchId, setBatchId] = useState("batch_a");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!batchId) return;
    let active = true;
    setStatus("loading");
    fetch(`/api/items?batch_id=${batchId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load items.");
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setItems(data.items ?? []);
        setStatus("ready");
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [batchId]);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            ReviewLane
          </h1>
          <p style={{ marginTop: 8, maxWidth: 720 }}>
            Seed review queue for the internal knowledge assistant use-case. This
            prototype focuses on making human oversight legible and measurable.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <BatchSelector onChange={setBatchId} />
          <ReviewerSelector />
          <Link href={`/metrics?batch_id=${batchId}`} style={{ fontSize: 12 }}>
            Metrics
          </Link>
          <Link href="/compare" style={{ fontSize: 12 }}>
            Compare
          </Link>
        </div>
      </div>

      <h2 style={{ marginTop: 24, fontSize: 18, fontWeight: 600 }}>
        Review Queue ({items.length})
      </h2>

      {status === "loading" && (
        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
          Loading items for {batchId}…
        </div>
      )}
      {status === "error" && (
        <div style={{ marginTop: 12, fontSize: 13, color: "#c00" }}>
          {error || "Failed to load items."}
        </div>
      )}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {items.map((it) => (
          <div
            key={`${it.id}-${it.batch_id}`}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700 }}>{it.id}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div
                  style={{
                    padding: "2px 10px",
                    borderRadius: 999,
                    border: "1px solid #ddd",
                    fontSize: 12,
                  }}
                >
                  expected risk: {it.expected_risk}
                </div>
                <Link
                  href={`/review/${it.id}?batch_id=${batchId}`}
                  style={{
                    fontSize: 12,
                    border: "1px solid #111",
                    borderRadius: 999,
                    padding: "2px 10px",
                    textDecoration: "none",
                    color: "#111",
                  }}
                >
                  Review
                </Link>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Question</div>
              <div style={{ marginTop: 4 }}>{it.question}</div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Model answer</div>
              <div style={{ marginTop: 4 }}>{it.model_answer}</div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Issue tags</div>
              <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {it.expected_issue_tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 12,
                      border: "1px solid #ddd",
                      borderRadius: 999,
                      padding: "2px 10px",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
