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
    <div className="inline-flex rounded-card bg-gray-100 p-1">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-samsung text-white shadow-sm"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
