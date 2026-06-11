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
import { holidayName, isFamilyDay } from "@/lib/holidays";
import BalloonIcon from "@/components/ui/BalloonIcon";
import AbsencePill from "./AbsencePill";

interface Props {
  day: GridDay;
  viewMode: ViewMode;
  members: Member[];
  absences: Absence[];
  availability: Availability[];
  assignments: Assignment[];
  selecting?: boolean;
  onPointerDown: (iso: string) => void;
  onPointerEnter: (iso: string) => void;
}

export default function CalendarCell({
  day,
  viewMode,
  members,
  absences,
  availability,
  assignments,
  selecting = false,
  onPointerDown,
  onPointerEnter,
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
  const holiday = holidayName(day.iso);
  const familyDay = isFamilyDay(day.iso);

  const showAbsence = viewMode !== "overtime";
  const showOvertime = viewMode !== "attendance";

  const weekdayColor =
    holiday || day.weekday === 0
      ? "text-danger"
      : day.weekday === 6
      ? "text-samsung"
      : "text-gray-700";

  const MAX_PILLS = 3;
  const visiblePills = dayAbsences.slice(0, MAX_PILLS);
  const extra = dayAbsences.length - visiblePills.length;

  const assignNames = assignments
    .map((a) => memberMap.get(a.member_id)?.name ?? "?")
    .join(", ");

  return (
    <button
      onPointerDown={() => onPointerDown(day.iso)}
      onPointerEnter={() => onPointerEnter(day.iso)}
      className={`group relative flex h-[124px] flex-col gap-0.5 rounded-card border p-1.5 text-left align-top transition hover:-translate-y-px hover:border-samsung/30 hover:shadow-card max-sm:h-[88px] ${
        selecting
          ? "border-samsung bg-samsung-pale ring-2 ring-samsung/40"
          : day.isToday
          ? "border-samsung/40 bg-samsung-pale/40 ring-1 ring-samsung/20"
          : day.inMonth
          ? "border-gray-200/70 bg-white"
          : "border-transparent bg-gray-50/60"
      }`}
    >
      {/* 날짜 숫자 + 공휴일명 + 잔업가능 배지 */}
      <div className="flex items-start gap-1">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition ${
            day.isToday
              ? "bg-samsung text-white shadow-glow"
              : day.inMonth
              ? weekdayColor
              : "text-gray-300"
          }`}
        >
          {day.day}
        </span>

        {holiday && (
          <span
            className={`mt-0.5 truncate text-[11px] font-semibold leading-tight ${
              day.inMonth ? "text-danger" : "text-danger/40"
            }`}
            title={holiday}
          >
            {holiday}
          </span>
        )}

        {familyDay && !holiday && (
          <span
            className="mt-0.5 flex items-center gap-0.5 truncate rounded-full px-1.5 text-[11px] font-semibold leading-tight"
            style={{
              backgroundColor: day.inMonth ? "#E843931F" : "#E8439310",
              color: day.inMonth ? "#E84393" : "#E8439366",
            }}
            title="패밀리데이 (전 사원 휴무)"
          >
            <BalloonIcon className="h-3 w-3 shrink-0" />
            <span className="truncate">패밀리데이</span>
          </span>
        )}

        {showOvertime && dayAvail.length > 0 && (
          <span
            className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-samsung/10 px-1.5 py-0.5 text-[11px] font-bold text-samsung"
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
                  label={a.label}
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
                label={a.label}
                dotOnly
              />
            ))}
          </div>
        </div>
      )}

      {/* 잔업 확정 (복수 인원) */}
      {showOvertime && assignments.length > 0 && (
        <div
          className="mt-auto flex items-center gap-1 truncate rounded-md bg-gradient-to-r from-samsung to-samsung-hover px-1.5 py-0.5 text-[11px] font-semibold text-white shadow-xs"
          title={`잔업: ${assignNames}`}
        >
          <span className="opacity-70">잔업</span>
          <span className="truncate">{assignNames}</span>
        </div>
      )}
    </button>
  );
}
