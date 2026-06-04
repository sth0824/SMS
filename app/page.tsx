"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import ViewToggle from "@/components/ViewToggle";
import Calendar from "@/components/calendar/Calendar";
import OvertimeCounter from "@/components/counter/OvertimeCounter";
import DateDetailModal from "@/components/modals/DateDetailModal";
import AbsenceModal from "@/components/modals/AbsenceModal";
import SetupBanner from "@/components/ui/SetupBanner";
import { useCalendarData, useOvertimeCounts } from "@/lib/hooks";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Absence, ViewMode } from "@/types";

export default function DashboardPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [viewMode, setViewMode] = useState<ViewMode>("both");

  const [detailDate, setDetailDate] = useState<string | null>(null);
  const [absenceModal, setAbsenceModal] = useState<{
    date: string;
    editing: Absence | null;
  } | null>(null);

  const { data, isLoading, error, mutate } = useCalendarData(year, month);
  const { data: counts } = useOvertimeCounts();

  const members = data?.members ?? [];
  const absences = data?.absences ?? [];
  const availability = data?.availability ?? [];
  const assignments = data?.assignments ?? [];

  const assignmentForDetail = useMemo(
    () => assignments.find((a) => a.date === detailDate),
    [assignments, detailDate]
  );

  function goPrev() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  }
  function goNext() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  }
  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  return (
    <>
      <Header
        center={<ViewToggle value={viewMode} onChange={setViewMode} />}
      />

      <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
        {!isSupabaseConfigured ? (
          <SetupBanner />
        ) : (
          <div className="animate-fade-up flex flex-col gap-5 lg:flex-row">
            <section className="min-w-0 flex-1">
              {error ? (
                <div className="rounded-lg bg-white p-6 text-sm text-danger shadow-card">
                  데이터를 불러오지 못했습니다: {String((error as any)?.message ?? error)}
                </div>
              ) : (
                <Calendar
                  year={year}
                  month={month}
                  viewMode={viewMode}
                  members={members}
                  absences={absences}
                  availability={availability}
                  assignments={assignments}
                  onPrev={goPrev}
                  onNext={goNext}
                  onToday={goToday}
                  onDateClick={setDetailDate}
                />
              )}
              {isLoading && (
                <p className="mt-3 text-center text-sm text-gray-400">불러오는 중…</p>
              )}
            </section>

            <aside className="w-full shrink-0 lg:w-80">
              <OvertimeCounter counts={counts ?? []} />
            </aside>
          </div>
        )}
      </main>

      {/* 날짜 상세 모달 */}
      {detailDate && (
        <DateDetailModal
          open={!!detailDate}
          date={detailDate}
          members={members}
          absences={absences}
          availability={availability.filter((a) => a.date === detailDate)}
          assignment={assignmentForDetail}
          onClose={() => setDetailDate(null)}
          onChanged={() => mutate()}
          onEditAbsence={(a) => setAbsenceModal({ date: detailDate, editing: a })}
          onAddAbsence={(d) => setAbsenceModal({ date: d, editing: null })}
        />
      )}

      {/* 부재 등록/수정 모달 */}
      {absenceModal && (
        <AbsenceModal
          open={!!absenceModal}
          members={members}
          defaultDate={absenceModal.date}
          editing={absenceModal.editing}
          onClose={() => setAbsenceModal(null)}
          onSaved={() => mutate()}
        />
      )}
    </>
  );
}
