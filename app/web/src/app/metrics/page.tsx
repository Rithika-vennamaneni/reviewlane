import { Suspense } from "react";

import MetricsClient from "./MetricsClient";

export default function MetricsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
          Loading metrics…
        </div>
      }
    >
      <MetricsClient />
    </Suspense>
  );
}
