import Holidays from "date-holidays";
import { addDays, parseISO, startOfWeek } from "date-fns";
import { toISODate } from "./date";

// date-holidays 인스턴스는 비싸므로 1회 생성 후 재사용한다.
// KR: 신정/삼일절/어린이날/현충일/광복절/개천절/한글날 + 설날·추석(음력)·
//     부처님오신날 + 대체공휴일까지 매년 자동 계산된다.
let _hd: Holidays | null = null;
function hd(): Holidays {
  if (!_hd) _hd = new Holidays("KR");
  return _hd;
}

/** 해당 ISO 날짜가 공휴일이면 이름을, 아니면 null 을 반환 */
export function holidayName(iso: string): string | null {
  const res = hd().isHoliday(parseISO(iso));
  if (!res || res.length === 0) return null;
  const pub = res.find((r) => r.type === "public") ?? res[0];
  return pub?.name ?? null;
}

/**
 * 해당 연/월의 패밀리데이 ISO 날짜.
 * 규칙: 월급날(21일)이 포함된 주(월~일)의 금요일.
 *  - 21일이 평일이면 그 주 금요일, 주말이면 같은 주의 (앞쪽) 금요일에 쉰다.
 *  - 금요일은 항상 19~25일 사이라 21일과 같은 달에 들어간다.
 *  - 그 금요일이 공휴일이면 전 주 금요일로 앞당긴다. (예: 2026-12-25 기독탄신일 → 12-18)
 * @param month 0-indexed (0 = 1월)
 */
export function familyDayOf(year: number, month: number): string {
  const payday = new Date(year, month, 21);
  const monday = startOfWeek(payday, { weekStartsOn: 1 });
  let friday = addDays(monday, 4); // 월요일 + 4 = 금요일

  // 공휴일이면 전 주 금요일로 이월. 연휴가 여러 주 걸치는 경우까지 대비해 최대 3주 소급하며,
  // 기준 금요일이 19~25일이라 3주를 당겨도 1~4일 → 항상 같은 달 안에 머문다.
  for (let i = 0; i < 3 && holidayName(toISODate(friday)) !== null; i++) {
    friday = addDays(friday, -7);
  }
  return toISODate(friday);
}

/** 해당 ISO 날짜가 그 달의 패밀리데이인지 */
export function isFamilyDay(iso: string): boolean {
  const d = parseISO(iso);
  return familyDayOf(d.getFullYear(), d.getMonth()) === iso;
}

export function isWeekend(iso: string): boolean {
  const w = parseISO(iso).getDay();
  return w === 0 || w === 6;
}

/** 주말이거나 공휴일이면 true (= 연차에서 제외 대상) */
export function isNonWorkingDay(iso: string): boolean {
  return isWeekend(iso) || holidayName(iso) !== null;
}

/**
 * [start, end] 구간(양끝 포함)에서 주말·공휴일을 제외한 근무일 ISO 목록.
 */
export function workingDaysBetween(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = parseISO(start);
  const last = parseISO(end);
  while (cur <= last) {
    const iso = toISODate(cur);
    if (!isNonWorkingDay(iso)) out.push(iso);
    cur = addDays(cur, 1);
  }
  return out;
}
