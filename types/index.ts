export type AbsenceType = "vacation" | "annual" | "training" | "out" | "etc";

export const ABSENCE_LABELS: Record<AbsenceType, string> = {
  vacation: "휴가",
  annual: "연차",
  training: "연차교육",
  out: "외출",
  etc: "기타",
};

export const ABSENCE_COLORS: Record<AbsenceType, string> = {
  vacation: "#FF6B4A",
  annual: "#16A085",
  training: "#8E44AD",
  out: "#F39C12",
  etc: "#717171",
};

export type OvertimeMethod = "agree" | "random";

export interface Member {
  id: string;
  name: string;
  color: string;
  active: boolean;
  created_at?: string;
}

export interface Absence {
  id: string;
  member_id: string;
  start_date: string;
  end_date: string;
  type: AbsenceType;
  /** 직접 입력한 유형 이름. 있으면 캘린더에 이 글자가 표시된다. */
  label?: string | null;
  memo?: string | null;
  created_at?: string;
}

/** 캘린더/목록에 표시할 부재 유형 텍스트 (커스텀 라벨 우선) */
export function absenceLabel(a: Pick<Absence, "type" | "label">): string {
  return a.label?.trim() ? a.label.trim() : ABSENCE_LABELS[a.type];
}

export interface Availability {
  id: string;
  member_id: string;
  date: string;
  created_at?: string;
}

export interface Assignment {
  id: string;
  member_id: string;
  date: string;
  method: OvertimeMethod;
  created_at?: string;
}

export interface OvertimeCount {
  member_id: string;
  name: string;
  color: string;
  this_month: number;
  total: number;
}

export interface Equipment {
  id: string;
  name: string;
  category?: string | null;
  created_at?: string;
}

export interface EquipmentUnavailable {
  id: string;
  equipment_id: string;
  start_date: string;
  end_date: string;
  reason?: string | null;
  reported_by?: string | null;
  created_at?: string;
}

export type ViewMode = "attendance" | "overtime" | "both";
