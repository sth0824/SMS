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
    <div className="rounded-lg bg-white p-4 shadow-card">
      {/* 헤더: 월 네비게이션 */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {year}년 {month + 1}월
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            aria-label="이전 달"
            className="flex h-9 w-9 items-center justify-center rounded-card text-gray-700 hover:bg-gray-100"
          >
            ‹
          </button>
          <button
            onClick={onToday}
            className="rounded-card px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            오늘
          </button>
          <button
            onClick={onNext}
            aria-label="다음 달"
            className="flex h-9 w-9 items-center justify-center rounded-card text-gray-700 hover:bg-gray-100"
          >
            ›
          </button>
        </div>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7">
            {WEEKDAY_LABELS.map((w, i) => (
              <div
                key={w}
                className={`pb-2 text-center text-xs font-medium ${
                  i === 0 ? "text-danger" : i === 6 ? "text-samsung" : "text-gray-500"
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 overflow-hidden rounded-card border-l border-t border-gray-200">
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
