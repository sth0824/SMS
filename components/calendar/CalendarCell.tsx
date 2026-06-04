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
      className={`relative flex h-[120px] flex-col gap-0.5 border border-gray-200 p-1.5 text-left align-top transition hover:bg-samsung-pale/40 sm:h-[120px] max-sm:h-20 ${
        day.inMonth ? "bg-white" : "bg-gray-100/60"
      }`}
    >
      {/* 날짜 숫자 + 잔업가능 배지 */}
      <div className="flex items-start justify-between">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-medium ${
            day.isToday
              ? "bg-samsung text-white"
              : day.inMonth
              ? weekdayColor
              : "text-gray-400"
          }`}
        >
          {day.day}
        </span>

        {showOvertime && dayAvail.length > 0 && (
          <span
            className="flex items-center gap-0.5 rounded-full bg-samsung-pale px-1.5 py-0.5 text-[11px] font-semibold text-samsung"
            title={`잔업 가능 ${dayAvail.length}명`}
          >
            <span className="text-samsung">●</span>
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
        <div className="mt-auto truncate text-[11px] font-semibold text-samsung underline decoration-samsung/40 underline-offset-2">
          잔업: {memberMap.get(assignment.member_id)?.name ?? "?"}
        </div>
      )}
    </button>
  );
}
