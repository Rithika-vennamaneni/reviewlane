"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "reviewlane:reviewer_id";

type ReviewerSelectorProps = {
  onChange?: (value: string) => void;
};

export default function ReviewerSelector({ onChange }: ReviewerSelectorProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) ?? "";
    setValue(stored);
    onChange?.(stored);
  }, [onChange]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, value);
    onChange?.(value);
  }, [value, onChange]);

  return (
    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 12, opacity: 0.7 }}>Reviewer</span>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="reviewer_01"
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: "4px 8px",
          fontSize: 12,
          minWidth: 140,
        }}
      />
    </label>
  );
}
