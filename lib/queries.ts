import { supabase } from "./supabase";
import type {
  Absence,
  AbsenceType,
  Assignment,
  Availability,
  Equipment,
  EquipmentUnavailable,
  Member,
  OvertimeCount,
  OvertimeMethod,
} from "@/types";

// ---------- Members ----------
export async function fetchMembers(includeInactive = false): Promise<Member[]> {
  let q = supabase.from("members").select("*").order("created_at", { ascending: true });
  if (!includeInactive) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createMember(name: string, color: string): Promise<Member> {
  const { data, error } = await supabase
    .from("members")
    .insert({ name, color })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMember(id: string, patch: Partial<Member>): Promise<void> {
  const { error } = await supabase.from("members").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Absences ----------
export async function fetchAbsences(start: string, end: string): Promise<Absence[]> {
  // 구간이 겹치는 부재: start_date <= end AND end_date >= start
  const { data, error } = await supabase
    .from("absences")
    .select("*")
    .lte("start_date", end)
    .gte("end_date", start);
  if (error) throw error;
  return data ?? [];
}

export interface AbsenceInput {
  member_id: string;
  start_date: string;
  end_date: string;
  type: AbsenceType;
  label?: string | null;
  memo?: string | null;
}

export async function createAbsence(input: AbsenceInput): Promise<Absence> {
  const { data, error } = await supabase.from("absences").insert(input).select().single();
  if (error) throw error;
  return data;
}

/** 여러 부재를 한 번에 등록 (연차 주말·공휴일 제외 분할 등록용) */
export async function createAbsences(rows: AbsenceInput[]): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await supabase.from("absences").insert(rows);
  if (error) throw error;
}

export async function updateAbsence(id: string, patch: Partial<Absence>): Promise<void> {
  const { error } = await supabase.from("absences").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteAbsence(id: string): Promise<void> {
  const { error } = await supabase.from("absences").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Overtime availability ----------
export async function fetchAvailability(start: string, end: string): Promise<Availability[]> {
  const { data, error } = await supabase
    .from("overtime_availability")
    .select("*")
    .gte("date", start)
    .lte("date", end);
  if (error) throw error;
  return data ?? [];
}

export async function addAvailability(member_id: string, date: string): Promise<void> {
  const { error } = await supabase
    .from("overtime_availability")
    .upsert({ member_id, date }, { onConflict: "member_id,date" });
  if (error) throw error;
}

export async function removeAvailability(member_id: string, date: string): Promise<void> {
  const { error } = await supabase
    .from("overtime_availability")
    .delete()
    .eq("member_id", member_id)
    .eq("date", date);
  if (error) throw error;
}

// ---------- Overtime assignments ----------
export async function fetchAssignments(start: string, end: string): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from("overtime_assignments")
    .select("*")
    .gte("date", start)
    .lte("date", end);
  if (error) throw error;
  return data ?? [];
}

export async function setAssignment(
  date: string,
  member_id: string,
  method: OvertimeMethod
): Promise<void> {
  // 복수 인원 허용: 같은 날 같은 사람만 중복 방지(upsert), 여러 명은 모두 등록된다.
  const { error } = await supabase
    .from("overtime_assignments")
    .upsert({ date, member_id, method }, { onConflict: "date,member_id" });
  if (error) throw error;
}

/** 특정 날짜의 한 명만 확정 해제 */
export async function removeAssignment(date: string, member_id: string): Promise<void> {
  const { error } = await supabase
    .from("overtime_assignments")
    .delete()
    .eq("date", date)
    .eq("member_id", member_id);
  if (error) throw error;
}

/** 특정 날짜의 모든 확정자 해제 */
export async function clearAssignment(date: string): Promise<void> {
  const { error } = await supabase.from("overtime_assignments").delete().eq("date", date);
  if (error) throw error;
}

// ---------- Counter view ----------
export async function fetchOvertimeCounts(): Promise<OvertimeCount[]> {
  const { data, error } = await supabase
    .from("overtime_counts")
    .select("*")
    .order("total", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ---------- Equipment ----------
export async function fetchEquipment(): Promise<Equipment[]> {
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createEquipment(name: string, category?: string): Promise<Equipment> {
  const { data, error } = await supabase
    .from("equipment")
    .insert({ name, category })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEquipment(id: string): Promise<void> {
  const { error } = await supabase.from("equipment").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchEquipmentUnavailable(): Promise<EquipmentUnavailable[]> {
  const { data, error } = await supabase
    .from("equipment_unavailable")
    .select("*")
    .order("start_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createEquipmentUnavailable(input: {
  equipment_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  reported_by?: string;
}): Promise<void> {
  const { error } = await supabase.from("equipment_unavailable").insert(input);
  if (error) throw error;
}

export async function deleteEquipmentUnavailable(id: string): Promise<void> {
  const { error } = await supabase.from("equipment_unavailable").delete().eq("id", id);
  if (error) throw error;
}
