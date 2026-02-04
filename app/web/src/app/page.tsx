import { getSeedItems } from "@/lib/seed";

export default function Home() {
  const items = getSeedItems();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>ReviewLane</h1>
      <p style={{ marginTop: 8, maxWidth: 720 }}>
        Seed review queue for the internal knowledge assistant use-case. This
        prototype focuses on making human oversight legible and measurable.
      </p>

      <h2 style={{ marginTop: 24, fontSize: 18, fontWeight: 600 }}>
        Review Queue ({items.length})
      </h2>

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700 }}>{it.id}</div>
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
