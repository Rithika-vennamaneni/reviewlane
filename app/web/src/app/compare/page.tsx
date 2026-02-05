"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import ReviewerSelector from "@/app/components/ReviewerSelector";

type ComparePayload = {
  batch_a: string;
  batch_b: string;
  issue_distribution: {
    batch_a: { by_tag: Record<string, number>; by_primary: Record<string, number> };
    batch_b: { by_tag: Record<string, number>; by_primary: Record<string, number> };
    drift: { delta_by_tag: Record<string, number>; delta_by_primary: Record<string, number> };
  };
};

const BATCH_OPTIONS = ["batch_a", "batch_b"];

export default function ComparePage() {
  const [batchA, setBatchA] = useState("batch_a");
  const [batchB, setBatchB] = useState("batch_b");
  const [data, setData] = useState<ComparePayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!batchA || !batchB) return;
    let active = true;
    setStatus("loading");
    fetch(`/api/metrics/compare?batch_a=${batchA}&batch_b=${batchB}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load drift comparison.");
        }
        return res.json();
      })
      .then((payload) => {
        if (!active) return;
        setData(payload);
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
  }, [batchA, batchB]);

  const tagRows = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.issue_distribution.drift.delta_by_tag).sort(
      (a, b) => Math.abs(b[1]) - Math.abs(a[1])
    );
  }, [data]);

  const primaryRows = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.issue_distribution.drift.delta_by_primary).sort(
      (a, b) => Math.abs(b[1]) - Math.abs(a[1])
    );
  }, [data]);

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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/">← Back to queue</Link>
          <h1 style={{ margin: 0, fontSize: 22 }}>Compare batches</h1>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <ReviewerSelector />
          <Link href={`/metrics?batch_id=${batchA}`} style={{ fontSize: 12 }}>
            Metrics
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Batch A</span>
          <select
            value={batchA}
            onChange={(event) => setBatchA(event.target.value)}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: "4px 8px" }}
          >
            {BATCH_OPTIONS.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Batch B</span>
          <select
            value={batchB}
            onChange={(event) => setBatchB(event.target.value)}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: "4px 8px" }}
          >
            {BATCH_OPTIONS.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </label>
      </div>

      {status === "loading" && (
        <div style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
          Loading drift comparison…
        </div>
      )}
      {status === "error" && (
        <div style={{ marginTop: 16, fontSize: 13, color: "#c00" }}>
          {error || "Failed to load comparison."}
        </div>
      )}

      {status === "ready" && data && (
        <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
          <section
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16 }}>
              Drift by primary label
            </h2>
            {primaryRows.length === 0 ? (
              <p style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
                No primary label data yet.
              </p>
            ) : (
              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {primaryRows.map(([tag, delta]) => (
                  <li key={tag} style={{ fontSize: 14 }}>
                    {tag}: {delta >= 0 ? "+" : ""}
                    {delta}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16 }}>Drift by tag</h2>
            {tagRows.length === 0 ? (
              <p style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
                No tag data yet.
              </p>
            ) : (
              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {tagRows.map(([tag, delta]) => (
                  <li key={tag} style={{ fontSize: 14 }}>
                    {tag}: {delta >= 0 ? "+" : ""}
                    {delta}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
