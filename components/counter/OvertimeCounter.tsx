"use client";

import { useState } from "react";
import type { OvertimeCount } from "@/types";

type Mode = "month" | "total";

export default function OvertimeCounter({ counts }: { counts: OvertimeCount[] }) {
  const [mode, setMode] = useState<Mode>("month");

  const rows = [...counts].sort((a, b) => valueOf(b, mode) - valueOf(a, mode));
  const max = Math.max(1, ...rows.map((r) => valueOf(r, mode)));
  const total = rows.reduce((s, r) => s + valueOf(r, mode), 0);

  return (
    <div className="rounded-xl border border-gray-200/60 bg-white/90 p-5 shadow-elevated backdrop-blur-sm lg:sticky lg:top-20">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">잔업 횟수</h2>
          <p className="text-xs text-gray-400">
            {mode === "month" ? "이번 달" : "누적"} 총 {total}회
          </p>
        </div>
        <div className="inline-flex rounded-full bg-gray-100 p-0.5 text-xs">
          {(["month", "total"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                mode === m ? "bg-white text-samsung shadow-xs" : "text-gray-400"
              }`}
            >
              {m === "month" ? "이번 달" : "누적"}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">데이터가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map((r, i) => {
            const v = valueOf(r, mode);
            const isMax = v === max && v > 0;
            const isZero = v === 0;
            return (
              <li
                key={r.member_id}
                className={`rounded-card px-3 py-2.5 transition ${
                  isMax ? "bg-samsung-pale/70 ring-1 ring-samsung/15" : "hover:bg-gray-50"
                } ${isZero ? "opacity-55" : ""}`}
              >
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold text-gray-900">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: r.color }}
                    >
                      {i + 1}
                    </span>
                    {r.name}
                    {isMax && (
                      <span className="rounded-full bg-samsung/10 px-1.5 py-0.5 text-[10px] font-bold text-samsung">
                        최다
                      </span>
                    )}
                  </span>
                  <span className="font-bold tabular-nums text-gray-700">{v}회</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(v / max) * 100}%`,
                      background: isMax
                        ? "linear-gradient(90deg, var(--samsung-blue), var(--samsung-blue-hover))"
                        : r.color,
                      minWidth: v > 0 ? "8px" : 0,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 flex gap-1.5 rounded-card bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-400">
        <span>💡</span>
        <span>
          횟수가 적은 흐린 인원에게 다음 잔업을 배정하면 공평합니다.
        </span>
      </p>
    </div>
  );
}

function valueOf(r: OvertimeCount, mode: Mode): number {
  return mode === "month" ? r.this_month : r.total;
}
