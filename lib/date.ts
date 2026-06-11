import {
  addDays,
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

/** 'yyyy-MM-dd' 포맷 (DB date 컬럼과 동일) */
export function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function fromISODate(s: string): Date {
  return parseISO(s);
}

/**
 * 주어진 연/월의 캘린더 그리드(일요일 시작, 6주 = 42칸)를 생성한다.
 * 이전/다음 달 날짜도 채워서 항상 7열 정렬이 맞도록 한다.
 */
export interface GridDay {
  date: Date;
  iso: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  weekday: number; // 0=일 ~ 6=토
}

export function buildMonthGrid(
  year: number,
  month: number,
  todayIso?: string | null
): GridDay[] {
  // month: 0-indexed (0 = 1월)
  // todayIso 는 호출부(클라이언트)에서 주입한다. SSR/정적 빌드 시점의 날짜가
  // HTML 에 구워지는 것을 막기 위해, 값이 없으면 어떤 날도 '오늘'로 표시하지 않는다.
  const first = startOfMonth(new Date(year, month, 1));
  const gridStart = startOfWeek(first, { weekStartsOn: 0 });

  const days: GridDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    const iso = toISODate(date);
    days.push({
      date,
      iso,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: todayIso != null && iso === todayIso,
      weekday: date.getDay(),
    });
  }
  return days;
}

/** 월 범위의 시작/끝 ISO 날짜 (쿼리 필터용) */
export function monthRange(year: number, month: number): { start: string; end: string } {
  const first = startOfMonth(new Date(year, month, 1));
  const last = endOfMonth(first);
  // 그리드가 이전/다음 달을 포함하므로 넉넉히 ±7일
  return {
    start: toISODate(addDays(first, -7)),
    end: toISODate(addDays(last, 7)),
  };
}

/** [start, end] 구간(양끝 포함)의 모든 날짜 ISO 목록 */
export function daysBetween(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = parseISO(start);
  const last = parseISO(end);
  while (cur <= last) {
    out.push(toISODate(cur));
    cur = addDays(cur, 1);
  }
  return out;
}

/** 특정 ISO 날짜가 [start, end] 구간(둘 다 포함)에 들어가는지 */
export function dateInRange(iso: string, start: string, end: string): boolean {
  return isWithinInterval(parseISO(iso), {
    start: parseISO(start),
    end: parseISO(end),
  });
}

const WEEKDAY_KR = ["일", "월", "화", "수", "목", "금", "토"];

export function formatKoreanDate(iso: string): string {
  const d = parseISO(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY_KR[d.getDay()]})`;
}

export const WEEKDAY_LABELS = WEEKDAY_KR;
