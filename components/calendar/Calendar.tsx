"use client";

import { useMemo } from "react";
import { buildMonthGrid, WEEKDAY_LABELS } from "@/lib/date";
import type {
  Absence,
  Assignment,
  Availability,
  Member,
  ViewMode,
} from "@/types";
import CalendarCell from "./CalendarCell";

interface Props {
  year: number;
  month: number; // 0-indexed
  viewMode: ViewMode;
  members: Member[];
  absences: Absence[];
  availability: Availability[];
  assignments: Assignment[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onDateClick: (iso: string) => void;
}

export default function Calendar({
  year,
  month,
  viewMode,
  members,
  absences,
  availability,
  assignments,
  onPrev,
  onNext,
  onToday,
  onDateClick,
}: Props) {
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const assignmentByDate = useMemo(() => {
    const m = new Map<string, Assignment>();
    assignments.forEach((a) => m.set(a.date, a));
    return m;
  }, [assignments]);

  return (
    <div className="rounded-xl border border-gray-200/60 bg-white/90 p-4 shadow-elevated backdrop-blur-sm sm:p-5">
      {/* 헤더: 월 네비게이션 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-baseline gap-1.5 text-xl font-bold text-gray-900">
          {year}
          <span className="text-gray-400">·</span>
          <span className="text-samsung">{month + 1}월</span>
        </h2>
        <div className="flex items-center gap-1 rounded-full border border-gray-200/80 bg-gray-50/80 p-1">
          <button
            onClick={onPrev}
            aria-label="이전 달"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-samsung hover:shadow-xs"
          >
            ‹
          </button>
          <button
            onClick={onToday}
            className="rounded-full px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-white hover:text-samsung hover:shadow-xs"
          >
            오늘
          </button>
          <button
            onClick={onNext}
            aria-label="다음 달"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-samsung hover:shadow-xs"
          >
            ›
          </button>
        </div>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* 요일 헤더 */}
          <div className="mb-1.5 grid grid-cols-7">
            {WEEKDAY_LABELS.map((w, i) => (
              <div
                key={w}
                className={`text-center text-xs font-semibold ${
                  i === 0 ? "text-danger" : i === 6 ? "text-samsung" : "text-gray-400"
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1.5">
            {grid.map((day) => (
              <CalendarCell
                key={day.iso}
                day={day}
                viewMode={viewMode}
                members={members}
                absences={absences}
                availability={availability}
                assignment={assignmentByDate.get(day.iso)}
                onClick={onDateClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
