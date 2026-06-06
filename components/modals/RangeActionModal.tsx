"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Field";
import { daysBetween, formatKoreanDate } from "@/lib/date";
import { workingDaysBetween } from "@/lib/holidays";
import {
  ABSENCE_COLORS,
  absenceLabel,
  type Absence,
  type Availability,
  type Member,
} from "@/types";
import { addAvailability, deleteAbsence, removeAvailability } from "@/lib/queries";

interface Props {
  open: boolean;
  start: string;
  end: string;
  members: Member[];
  absences: Absence[];
  availability: Availability[];
  onClose: () => void;
  onChanged: () => void;
  /** "부재 등록" 선택 시 (start <= end) */
  onRegister: (start: string, end: string) => void;
}

export default function RangeActionModal({
  open,
  start,
  end,
  members,
  absences,
  availability,
  onClose,
  onChanged,
  onRegister,
}: Props) {
  const [busy, setBusy] = useState(false);

  // 잔업 가능 일괄 추가
  const [availIds, setAvailIds] = useState<Set<string>>(new Set());
  const [includeNonWork, setIncludeNonWork] = useState(true);

  // 잔업 가능 일괄 삭제
  const [removeIds, setRemoveIds] = useState<Set<string>>(new Set());

  const memberMap = useMemo(() => {
    const m = new Map<string, Member>();
    members.forEach((x) => m.set(x.id, x));
    return m;
  }, [members]);

  function toggleAvail(id: string) {
    setAvailIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function applyAvailability() {
    if (availIds.size === 0) return;
    const dates = includeNonWork
      ? daysBetween(start, end)
      : workingDaysBetween(start, end);
    if (dates.length === 0) {
      alert("선택한 기간에 근무일이 없습니다. (전부 주말·공휴일)");
      return;
    }
    setBusy(true);
    try {
      const ids = Array.from(availIds);
      await Promise.all(
        ids.flatMap((mid) => dates.map((d) => addAvailability(mid, d)))
      );
      onChanged();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  // 이 기간에 잔업 가능 등록된 멤버 (중복 제거)
  const membersWithAvail = useMemo(() => {
    const ids = new Set(availability.map((a) => a.member_id));
    return members.filter((m) => ids.has(m.id));
  }, [availability, members]);

  function toggleRemove(id: string) {
    setRemoveIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function applyRemove() {
    if (removeIds.size === 0) return;
    const dates = daysBetween(start, end);
    setBusy(true);
    try {
      const ids = Array.from(removeIds);
      await Promise.all(
        ids.flatMap((mid) => dates.map((d) => removeAvailability(mid, d)))
      );
      onChanged();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  // 선택 기간과 겹치는 부재
  const inRange = useMemo(
    () => absences.filter((a) => a.start_date <= end && a.end_date >= start),
    [absences, start, end]
  );

  async function deleteOne(id: string) {
    setBusy(true);
    try {
      await deleteAbsence(id);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function deleteAll() {
    if (inRange.length === 0) return;
    if (!confirm(`이 기간의 부재 ${inRange.length}건을 모두 삭제할까요?`)) return;
    setBusy(true);
    try {
      await Promise.all(inRange.map((a) => deleteAbsence(a.id)));
      onChanged();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${formatKoreanDate(start)} ~ ${formatKoreanDate(end)}`}
      maxWidth="max-w-md"
    >
      <Button
        variant="primary"
        className="w-full"
        onClick={() => onRegister(start, end)}
        disabled={busy}
      >
        📝 이 기간에 부재 등록
      </Button>

      <hr className="my-4 border-gray-200" />

      {/* 잔업 가능 일괄 추가 */}
      <section className="mb-1">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          🔵 이 기간에 잔업 가능 추가
          <span className="ml-2 text-xs font-normal text-gray-400">
            인원을 눌러 선택
          </span>
        </h3>
        <div className="mb-3 flex flex-wrap gap-2">
          {members.map((m) => {
            const on = availIds.has(m.id);
            return (
              <button
                key={m.id}
                type="button"
                disabled={busy}
                onClick={() => toggleAvail(m.id)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                  on
                    ? "border-samsung bg-samsung text-white"
                    : "border-gray-300 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {m.name}
              </button>
            );
          })}
        </div>
        <div className="mb-3">
          <Checkbox
            checked={includeNonWork}
            onChange={setIncludeNonWork}
            label="주말·공휴일도 포함"
          />
        </div>
        <Button
          variant="primary"
          className="w-full"
          onClick={applyAvailability}
          disabled={availIds.size === 0 || busy}
        >
          이 기간에 잔업 가능 추가 ({availIds.size}명)
        </Button>
      </section>

      {/* 잔업 가능 일괄 삭제 */}
      {membersWithAvail.length > 0 && (
        <>
          <hr className="my-4 border-gray-200" />
          <section className="mb-1">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              ⭕ 이 기간에 잔업 가능 삭제
              <span className="ml-2 text-xs font-normal text-gray-400">
                인원을 눌러 선택
              </span>
            </h3>
            <div className="mb-3 flex flex-wrap gap-2">
              {membersWithAvail.map((m) => {
                const on = removeIds.has(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={busy}
                    onClick={() => toggleRemove(m.id)}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition ${
                      on
                        ? "border-danger bg-danger text-white"
                        : "border-gray-300 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
            <Button
              variant="danger"
              className="w-full"
              onClick={applyRemove}
              disabled={removeIds.size === 0 || busy}
            >
              이 기간에 잔업 가능 삭제 ({removeIds.size}명)
            </Button>
          </section>
        </>
      )}

      <hr className="my-4 border-gray-200" />

      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          이 기간의 부재 ({inRange.length}건)
        </h3>
        {inRange.length > 0 && (
          <Button size="sm" variant="danger" onClick={deleteAll} disabled={busy}>
            전체 삭제
          </Button>
        )}
      </div>

      {inRange.length === 0 ? (
        <p className="text-sm text-gray-400">이 기간에 등록된 부재가 없습니다.</p>
      ) : (
        <ul className="flex max-h-60 flex-col gap-1 overflow-y-auto">
          {inRange.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-card px-2 py-1.5 text-sm hover:bg-gray-100"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: ABSENCE_COLORS[a.type] }}
                />
                <span className="font-medium text-gray-900">
                  {memberMap.get(a.member_id)?.name ?? "?"}
                </span>
                <span className="text-gray-500">— {absenceLabel(a)}</span>
                <span className="text-xs text-gray-400">
                  {a.start_date === a.end_date
                    ? a.start_date.slice(5)
                    : `${a.start_date.slice(5)}~${a.end_date.slice(5)}`}
                </span>
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteOne(a.id)}
                disabled={busy}
              >
                삭제
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
