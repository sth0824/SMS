"use client";

import { useEffect, useMemo, useState } from "react";
import { buildMonthGrid, toISODate, WEEKDAY_LABELS } from "@/lib/date";
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
  /** 날짜를 드래그로 범위 선택했을 때 (start <= end) */
  onRangeSelect: (start: string, end: string) => void;
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
  onRangeSelect,
}: Props) {
  // "오늘"은 빌드/SSR 시점이 아니라 클라이언트 마운트 후에만 계산한다.
  // (정적 생성 시 빌드 날짜가 '오늘'로 굳어버리는 버그 방지)
  const [todayIso, setTodayIso] = useState<string | null>(null);
  useEffect(() => {
    setTodayIso(toISODate(new Date()));
  }, []);

  const grid = useMemo(
    () => buildMonthGrid(year, month, todayIso),
    [year, month, todayIso]
  );
  const assignmentsByDate = useMemo(() => {
    const m = new Map<string, Assignment[]>();
    assignments.forEach((a) => {
      const arr = m.get(a.date);
      if (arr) arr.push(a);
      else m.set(a.date, [a]);
    });
    return m;
  }, [assignments]);

  // ---- 드래그 범위 선택 ----
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);

  const selectedRange = useMemo(() => {
    if (!dragStart || !dragEnd) return null;
    return dragStart <= dragEnd
      ? { lo: dragStart, hi: dragEnd }
      : { lo: dragEnd, hi: dragStart };
  }, [dragStart, dragEnd]);

  useEffect(() => {
    if (!dragStart) return;
    function onUp() {
      const s = dragStart!;
      const e = dragEnd ?? dragStart!;
      const lo = s <= e ? s : e;
      const hi = s <= e ? e : s;
      // 같은 칸이면 단일 클릭(상세), 여러 칸이면 범위 선택(부재 등록)
      if (lo === hi) onDateClick(lo);
      else onRangeSelect(lo, hi);
      setDragStart(null);
      setDragEnd(null);
    }
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragStart, dragEnd]);

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

      <p className="mb-2 text-xs text-gray-400">
        날짜를 드래그하면 여러 날을 한 번에 등록할 수 있어요.
      </p>

      <div className="min-w-0 overflow-x-auto">
        <div className="min-w-0 sm:min-w-[640px]">
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
          <div className="grid select-none grid-cols-7 gap-1 sm:gap-1.5">
            {grid.map((day) => (
              <CalendarCell
                key={day.iso}
                day={day}
                viewMode={viewMode}
                members={members}
                absences={absences}
                availability={availability}
                assignments={assignmentsByDate.get(day.iso) ?? []}
                selecting={
                  !!selectedRange &&
                  day.iso >= selectedRange.lo &&
                  day.iso <= selectedRange.hi
                }
                onPointerDown={(iso) => {
                  setDragStart(iso);
                  setDragEnd(iso);
                }}
                onPointerEnter={(iso) => {
                  if (dragStart) setDragEnd(iso);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
