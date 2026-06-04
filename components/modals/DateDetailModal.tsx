"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import RandomPicker from "./RandomPicker";
import { formatKoreanDate } from "@/lib/date";
import {
  ABSENCE_COLORS,
  ABSENCE_LABELS,
  type Absence,
  type Assignment,
  type Availability,
  type Member,
} from "@/types";
import {
  addAvailability,
  clearAssignment,
  removeAvailability,
  setAssignment,
} from "@/lib/queries";

interface Props {
  open: boolean;
  date: string;
  members: Member[];
  absences: Absence[];
  availability: Availability[];
  assignment?: Assignment;
  onClose: () => void;
  onChanged: () => void;
  onEditAbsence: (a: Absence) => void;
  onAddAbsence: (date: string) => void;
}

export default function DateDetailModal({
  open,
  date,
  members,
  absences,
  availability,
  assignment,
  onClose,
  onChanged,
  onEditAbsence,
  onAddAbsence,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [agreeId, setAgreeId] = useState("");
  const [busy, setBusy] = useState(false);

  const memberMap = useMemo(() => {
    const m = new Map<string, Member>();
    members.forEach((x) => m.set(x.id, x));
    return m;
  }, [members]);

  const dayAbsences = absences.filter((a) => date >= a.start_date && date <= a.end_date);
  const availableIds = new Set(availability.map((a) => a.member_id));
  const availableMembers = members.filter((m) => availableIds.has(m.id));

  async function toggleAvailability(m: Member) {
    setBusy(true);
    try {
      if (availableIds.has(m.id)) {
        await removeAvailability(m.id, date);
      } else {
        await addAvailability(m.id, date);
      }
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function confirmAgree() {
    if (!agreeId) return;
    setBusy(true);
    try {
      await setAssignment(date, agreeId, "agree");
      setAgreeId("");
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleRandomConfirm(m: Member) {
    setBusy(true);
    try {
      await setAssignment(date, m.id, "random");
      setPickerOpen(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    setBusy(true);
    try {
      await clearAssignment(date);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={formatKoreanDate(date)} maxWidth="max-w-lg">
        {/* 부재 섹션 */}
        <section className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">📋 부재</h3>
            <Button size="sm" variant="ghost" onClick={() => onAddAbsence(date)}>
              + 부재 등록
            </Button>
          </div>
          {dayAbsences.length === 0 ? (
            <p className="text-sm text-gray-400">등록된 부재가 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {dayAbsences.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => onEditAbsence(a)}
                    className="flex w-full items-center justify-between rounded-card px-2 py-1.5 text-sm hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: ABSENCE_COLORS[a.type] }}
                      />
                      <span className="font-medium text-gray-900">
                        {memberMap.get(a.member_id)?.name ?? "?"}
                      </span>
                      <span className="text-gray-500">— {ABSENCE_LABELS[a.type]}</span>
                      {a.memo && <span className="text-xs text-gray-400">· {a.memo}</span>}
                    </span>
                    <span className="text-xs text-gray-400">수정 ›</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <hr className="my-4 border-gray-200" />

        {/* 잔업 가능 섹션 */}
        <section className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            🔵 잔업 가능 ({availableMembers.length}명)
            <span className="ml-2 text-xs font-normal text-gray-400">
              이름을 눌러 가능/불가 토글
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const on = availableIds.has(m.id);
              return (
                <button
                  key={m.id}
                  disabled={busy}
                  onClick={() => toggleAvailability(m)}
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
        </section>

        <hr className="my-4 border-gray-200" />

        {/* 잔업 확정 섹션 */}
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">잔업 확정자</h3>
          {assignment ? (
            <div className="flex items-center justify-between rounded-card bg-samsung-pale px-3 py-2">
              <span className="text-sm">
                <span className="font-bold text-samsung-deep">
                  {memberMap.get(assignment.member_id)?.name ?? "?"}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  ({assignment.method === "random" ? "랜덤 추첨" : "합의 지정"})
                </span>
              </span>
              <Button size="sm" variant="ghost" onClick={clear} disabled={busy}>
                해제
              </Button>
            </div>
          ) : (
            <p className="mb-2 text-sm text-gray-400">아직 확정되지 않았습니다. (미정)</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex flex-1 items-center gap-2">
              <Select
                value={agreeId}
                onChange={(e) => setAgreeId(e.target.value)}
                disabled={availableMembers.length === 0}
                className="flex-1"
              >
                <option value="">합의로 지정…</option>
                {availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
              <Button
                size="md"
                variant="secondary"
                onClick={confirmAgree}
                disabled={!agreeId || busy}
              >
                지정
              </Button>
            </div>
            <Button
              variant="primary"
              onClick={() => setPickerOpen(true)}
              disabled={availableMembers.length === 0 || busy}
            >
              🎲 랜덤 추첨
            </Button>
          </div>
          {availableMembers.length === 0 && (
            <p className="mt-2 text-xs text-gray-400">
              먼저 위에서 잔업 가능 인원을 선택하세요.
            </p>
          )}
        </section>
      </Modal>

      <RandomPicker
        open={pickerOpen}
        candidates={availableMembers}
        onConfirm={handleRandomConfirm}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}
