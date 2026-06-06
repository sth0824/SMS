"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { formatKoreanDate } from "@/lib/date";
import {
  ABSENCE_COLORS,
  absenceLabel,
  type Absence,
  type Member,
} from "@/types";
import { deleteAbsence } from "@/lib/queries";

interface Props {
  open: boolean;
  start: string;
  end: string;
  members: Member[];
  absences: Absence[];
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
  onClose,
  onChanged,
  onRegister,
}: Props) {
  const [busy, setBusy] = useState(false);

  const memberMap = useMemo(() => {
    const m = new Map<string, Member>();
    members.forEach((x) => m.set(x.id, x));
    return m;
  }, [members]);

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
