"use client";

import type { ViewMode } from "@/types";

const OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "attendance", label: "근태" },
  { value: "overtime", label: "잔업" },
  { value: "both", label: "통합" },
];

export default function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-gray-200/80 bg-white/80 p-1 shadow-xs backdrop-blur">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              active
                ? "bg-samsung text-white shadow-glow"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
