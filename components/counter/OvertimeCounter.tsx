"use client";

import { useState } from "react";
import type { OvertimeCount } from "@/types";

type Mode = "month" | "total";

export default function OvertimeCounter({ counts }: { counts: OvertimeCount[] }) {
  const [mode, setMode] = useState<Mode>("month");

  const rows = [...counts].sort(
    (a, b) => valueOf(b, mode) - valueOf(a, mode)
  );
  const max = Math.max(1, ...rows.map((r) => valueOf(r, mode)));

  return (
    <div className="rounded-lg bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">잔업 횟수</h2>
        <div className="inline-flex rounded-card bg-gray-100 p-0.5 text-xs">
          {(["month", "total"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                mode === m ? "bg-white text-samsung shadow-sm" : "text-gray-500"
              }`}
            >
              {m === "month" ? "이번 달" : "누적"}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">데이터가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {rows.map((r) => {
            const v = valueOf(r, mode);
            const isMax = v === max && v > 0;
            const isZero = v === 0;
            return (
              <li
                key={r.member_id}
                className={`rounded-card px-2.5 py-2 ${
                  isMax ? "border-l-4 border-samsung bg-samsung-pale" : ""
                } ${isZero ? "opacity-60" : ""}`}
              >
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-gray-900">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                    {r.name}
                  </span>
                  <span className="font-semibold text-gray-700">{v}회</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(v / max) * 100}%`,
                      backgroundColor: isMax ? "var(--samsung-blue)" : r.color,
                      minWidth: v > 0 ? "6px" : 0,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
        횟수가 가장 많은 사람은 파란 막대로, 0회인 사람은 흐리게 표시됩니다.
        다음 잔업은 횟수가 적은 사람에게 배정하면 공평합니다.
      </p>
    </div>
  );
}

function valueOf(r: OvertimeCount, mode: Mode): number {
  return mode === "month" ? r.this_month : r.total;
}
