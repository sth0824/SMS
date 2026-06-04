"use client";

import useSWR from "swr";
import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import { monthRange } from "./date";
import {
  fetchAbsences,
  fetchAssignments,
  fetchAvailability,
  fetchMembers,
  fetchOvertimeCounts,
} from "./queries";

/**
 * 한 달치 캘린더 데이터(팀원/부재/잔업가능/잔업확정)를 한 번에 로드한다.
 * overtime_availability / overtime_assignments / absences 변경을 Realtime 으로
 * 구독해 자동 갱신한다.
 */
export function useCalendarData(year: number, month: number) {
  const { start, end } = monthRange(year, month);
  const key = isSupabaseConfigured ? ["calendar", year, month] : null;

  const swr = useSWR(key, async () => {
    const [members, absences, availability, assignments] = await Promise.all([
      fetchMembers(),
      fetchAbsences(start, end),
      fetchAvailability(start, end),
      fetchAssignments(start, end),
    ]);
    return { members, absences, availability, assignments };
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel(`calendar-${year}-${month}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "absences" }, () =>
        swr.mutate()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "overtime_availability" },
        () => swr.mutate()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "overtime_assignments" },
        () => swr.mutate()
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, () =>
        swr.mutate()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  return swr;
}

/** 잔업 횟수 집계 뷰 + Realtime 구독 */
export function useOvertimeCounts() {
  const key = isSupabaseConfigured ? "overtime_counts" : null;
  const swr = useSWR(key, fetchOvertimeCounts);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel("overtime-counts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "overtime_assignments" },
        () => swr.mutate()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return swr;
}
