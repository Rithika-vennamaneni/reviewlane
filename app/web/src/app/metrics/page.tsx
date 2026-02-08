"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import BatchSelector from "@/app/components/BatchSelector";
import ReviewerSelector from "@/app/components/ReviewerSelector";
import type { MetricsPayload } from "@/lib/types";

export default function MetricsPage() {
  const searchParams = useSearchParams();
  const initialBatch = searchParams.get("batch_id") ?? "batch_a";
  const [batchId, setBatchId] = useState(initialBatch);
  const [metrics, setMetrics] = useState<MetricsPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!batchId) return;
    let active = true;
    setStatus("loading");
    fetch(`/api/metrics?batch_id=${batchId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load metrics.");
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setMetrics(data.metrics ?? null);
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

  const topTags = useMemo(() => {
    if (!metrics) return [];
    return Object.entries(metrics.issue_distribution.by_tag)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [metrics]);

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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/">← Back to queue</Link>
          <h1 style={{ margin: 0, fontSize: 22 }}>Metrics</h1>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <BatchSelector value={batchId} onChange={setBatchId} />
          <ReviewerSelector />
          <Link href="/compare" style={{ fontSize: 12 }}>
            Compare
          </Link>
        </div>
      </div>

      {status === "loading" && (
        <div style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
          Loading metrics for {batchId}…
        </div>
      )}
      {status === "error" && (
        <div style={{ marginTop: 16, fontSize: 13, color: "#c00" }}>
          {error || "Failed to load metrics."}
        </div>
      )}

      {status === "ready" && metrics && (
        <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
          <section
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 16,
              background: "var(--surface)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16 }}>Disagreement rate</h2>
            <p style={{ marginTop: 8, fontSize: 14 }}>
              {Math.round(metrics.disagreement_rate.rate * 100)}% (
              {metrics.disagreement_rate.disagreed_items} /{" "}
              {metrics.disagreement_rate.total_items} items with 2+ reviews)
            </p>
          </section>

          <section
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 16,
              background: "var(--surface)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16 }}>Top issue tags</h2>
            {topTags.length === 0 ? (
              <p style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
                No tag data yet.
              </p>
            ) : (
              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {topTags.map(([tag, count]) => (
                  <li key={tag} style={{ fontSize: 14 }}>
                    {tag}: {count}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 16,
              background: "var(--surface)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16 }}>
              Confidence calibration
            </h2>
            <table
              style={{
                marginTop: 8,
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left", paddingBottom: 6 }}>
                    Confidence
                  </th>
                  <th style={{ textAlign: "left", paddingBottom: 6 }}>
                    Disagreement rate
                  </th>
                  <th style={{ textAlign: "left", paddingBottom: 6 }}>
                    Reviews
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.confidence_calibration.map((row) => (
                  <tr key={row.confidence}>
                    <td style={{ padding: "6px 0" }}>{row.confidence}</td>
                    <td style={{ padding: "6px 0" }}>
                      {Math.round(row.rate * 100)}%
                    </td>
                    <td style={{ padding: "6px 0" }}>
                      {row.disagreed_reviews} / {row.total_reviews}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </main>
  );
}
