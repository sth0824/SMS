"use client";

import { ABSENCE_COLORS, ABSENCE_LABELS, type AbsenceType } from "@/types";

/** 부재 알약: 유형 색 12% 배경 + 진한 텍스트. dotOnly 면 점만 표시(모바일). */
export default function AbsencePill({
  name,
  type,
  label,
  dotOnly = false,
}: {
  name: string;
  type: AbsenceType;
  /** 직접 입력한 유형 이름 (있으면 우선 표시) */
  label?: string | null;
  dotOnly?: boolean;
}) {
  const color = ABSENCE_COLORS[type];
  const typeText = label?.trim() ? label.trim() : ABSENCE_LABELS[type];

  if (dotOnly) {
    return (
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
        title={`${name} · ${typeText}`}
      />
    );
  }

  return (
    <span
      className="flex w-full items-center gap-1 truncate rounded-full px-1.5 py-0.5 text-[11px] font-medium leading-tight"
      style={{ backgroundColor: `${color}1F`, color }}
      title={`${name} · ${typeText}`}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="truncate">
        {name} · {typeText}
      </span>
    </span>
  );
}
