"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "reviewlane:batch_id";
const DEFAULT_BATCH = "batch_a";

type BatchSelectorProps = {
  onChange?: (value: string) => void;
  options?: string[];
  value?: string;
};

export default function BatchSelector({
  onChange,
  value: valueProp,
  options = ["batch_a", "batch_b"],
}: BatchSelectorProps) {
  const [valueState, setValueState] = useState(DEFAULT_BATCH);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (valueProp !== undefined) return;
    const stored = window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_BATCH;
    setValueState(stored);
    onChange?.(stored);
  }, [onChange, valueProp]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const next = valueProp ?? valueState;
    window.localStorage.setItem(STORAGE_KEY, next);
    onChange?.(next);
  }, [valueProp, valueState, onChange]);

  const selected = valueProp ?? valueState;

  return (
    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 12, opacity: 0.7 }}>Batch</span>
      <select
        value={selected}
        onChange={(event) => {
          const next = event.target.value;
          if (valueProp === undefined) {
            setValueState(next);
          }
          if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, next);
          }
          onChange?.(next);
        }}
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: "4px 8px",
          fontSize: 12,
        }}
      >
        {options.map((batch) => (
          <option key={batch} value={batch}>
            {batch}
          </option>
        ))}
      </select>
    </label>
  );
}
