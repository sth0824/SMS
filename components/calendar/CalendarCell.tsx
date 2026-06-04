"use client";

import { useMemo } from "react";
import type { GridDay } from "@/lib/date";
import type {
  Absence,
  Assignment,
  Availability,
  Member,
  ViewMode,
} from "@/types";
import AbsencePill from "./AbsencePill";

interface Props {
  day: GridDay;
  viewMode: ViewMode;
  members: Member[];
  absences: Absence[];
  availability: Availability[];
  assignment?: Assignment;
  onClick: (iso: string) => void;
}

export default function CalendarCell({
  day,
  viewMode,
  members,
  absences,
  availability,
  assignment,
  onClick,
}: Props) {
  const memberMap = useMemo(() => {
    const m = new Map<string, Member>();
    members.forEach((x) => m.set(x.id, x));
    return m;
  }, [members]);

  const dayAbsences = absences.filter(
    (a) => day.iso >= a.start_date && day.iso <= a.end_date
  );
  const dayAvail = availability.filter((a) => a.date === day.iso);

  const showAbsence = viewMode !== "overtime";
  const showOvertime = viewMode !== "attendance";

  const weekdayColor =
    day.weekday === 0
      ? "text-danger"
      : day.weekday === 6
      ? "text-samsung"
      : "text-gray-700";

  const MAX_PILLS = 3;
  const visiblePills = dayAbsences.slice(0, MAX_PILLS);
  const extra = dayAbsences.length - visiblePills.length;

  return (
    <button
      onClick={() => onClick(day.iso)}
      className={`group relative flex h-[124px] flex-col gap-0.5 rounded-card border p-1.5 text-left align-top transition hover:-translate-y-px hover:border-samsung/30 hover:shadow-card max-sm:h-[88px] ${
        day.isToday
          ? "border-samsung/40 bg-samsung-pale/40 ring-1 ring-samsung/20"
          : day.inMonth
          ? "border-gray-200/70 bg-white"
          : "border-transparent bg-gray-50/60"
      }`}
    >
      {/* 날짜 숫자 + 잔업가능 배지 */}
      <div className="flex items-start justify-between">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold transition ${
            day.isToday
              ? "bg-samsung text-white shadow-glow"
              : day.inMonth
              ? weekdayColor
              : "text-gray-300"
          }`}
        >
          {day.day}
        </span>

        {showOvertime && dayAvail.length > 0 && (
          <span
            className="flex items-center gap-1 rounded-full bg-samsung/10 px-1.5 py-0.5 text-[11px] font-bold text-samsung"
            title={`잔업 가능 ${dayAvail.length}명`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-samsung" />
            {dayAvail.length}
          </span>
        )}
      </div>

      {/* 부재 태그 */}
      {showAbsence && (
        <div className="flex flex-col gap-0.5 overflow-hidden">
          {/* 데스크탑: 알약, 모바일: 점 */}
          <div className="hidden flex-col gap-0.5 sm:flex">
            {visiblePills.map((a) => {
              const m = memberMap.get(a.member_id);
              return (
                <AbsencePill
                  key={a.id}
                  name={m?.name ?? "?"}
                  type={a.type}
                />
              );
            })}
            {extra > 0 && (
              <span className="px-1 text-[11px] font-medium text-gray-500">
                +{extra} 더보기
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 sm:hidden">
            {dayAbsences.map((a) => (
              <AbsencePill
                key={a.id}
                name={memberMap.get(a.member_id)?.name ?? "?"}
                type={a.type}
                dotOnly
              />
            ))}
          </div>
        </div>
      )}

      {/* 잔업 확정 */}
      {showOvertime && assignment && (
        <div className="mt-auto flex items-center gap-1 truncate rounded-md bg-gradient-to-r from-samsung to-samsung-hover px-1.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">
          <span className="opacity-70">잔업</span>
          <span className="truncate">
            {memberMap.get(assignment.member_id)?.name ?? "?"}
          </span>
        </div>
      )}
    </button>
  );
}
