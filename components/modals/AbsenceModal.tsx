"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Checkbox, Field, Select, TextInput, Textarea } from "@/components/ui/Field";
import {
  ABSENCE_LABELS,
  type Absence,
  type AbsenceType,
  type Member,
} from "@/types";
import {
  createAbsence,
  createAbsences,
  deleteAbsence,
  updateAbsence,
} from "@/lib/queries";
import { workingDaysBetween } from "@/lib/holidays";

interface Props {
  open: boolean;
  members: Member[];
  defaultDate: string;
  /** 드래그 범위 선택 시 종료일 (없으면 시작일과 동일) */
  defaultEndDate?: string;
  /** 수정 모드일 때 기존 부재 */
  editing?: Absence | null;
  onClose: () => void;
  onSaved: () => void;
}

const TYPES = Object.keys(ABSENCE_LABELS) as AbsenceType[];

export default function AbsenceModal({
  open,
  members,
  defaultDate,
  defaultEndDate,
  editing,
  onClose,
  onSaved,
}: Props) {
  const [memberId, setMemberId] = useState("");
  const [start, setStart] = useState(defaultDate);
  const [end, setEnd] = useState(defaultDate);
  const [type, setType] = useState<AbsenceType>("annual");
  const [label, setLabel] = useState("");
  const [memo, setMemo] = useState("");
  const [skipNonWork, setSkipNonWork] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setMemberId(editing.member_id);
      setStart(editing.start_date);
      setEnd(editing.end_date);
      setType(editing.type);
      setLabel(editing.label ?? "");
      setMemo(editing.memo ?? "");
    } else {
      setMemberId(members[0]?.id ?? "");
      setStart(defaultDate);
      setEnd(defaultEndDate ?? defaultDate);
      setType("annual");
      setLabel("");
      setMemo("");
    }
    setSkipNonWork(true);
    setError(null);
  }, [open, editing, defaultDate, defaultEndDate, members]);

  const isRange = end > start;

  async function handleSave() {
    if (!memberId) {
      setError("팀원을 선택하세요.");
      return;
    }
    if (end < start) {
      setError("종료일이 시작일보다 빠릅니다.");
      return;
    }
    const labelVal = label.trim() || null;
    setBusy(true);
    setError(null);
    try {
      if (editing) {
        await updateAbsence(editing.id, {
          member_id: memberId,
          start_date: start,
          end_date: end,
          type,
          label: labelVal,
          memo: memo || null,
        });
      } else if (isRange && skipNonWork) {
        // 주말·공휴일을 제외한 근무일만 하루씩 분할 등록
        const days = workingDaysBetween(start, end);
        if (days.length === 0) {
          setError("선택한 기간에 근무일이 없습니다. (전부 주말·공휴일)");
          setBusy(false);
          return;
        }
        await createAbsences(
          days.map((d) => ({
            member_id: memberId,
            start_date: d,
            end_date: d,
            type,
            label: labelVal,
            memo: memo || null,
          }))
        );
      } else {
        await createAbsence({
          member_id: memberId,
          start_date: start,
          end_date: end,
          type,
          label: labelVal,
          memo: memo || null,
        });
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    if (!confirm("이 부재 기록을 삭제할까요?")) return;
    setBusy(true);
    try {
      await deleteAbsence(editing.id);
      onSaved();
      onClose();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "부재 수정" : "부재 등록"}
      maxWidth="max-w-md"
    >
      <Field label="팀원">
        <Select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="시작일">
          <TextInput type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="종료일">
          <TextInput type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
      </div>

      {isRange && !editing && (
        <Field label="기간 옵션">
          <Checkbox
            checked={skipNonWork}
            onChange={setSkipNonWork}
            label="주말·공휴일은 제외하고 등록"
          />
        </Field>
      )}

      <Field label="유형">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-card border px-3 py-1.5 text-sm font-medium transition ${
                type === t
                  ? "border-samsung bg-samsung-pale text-samsung-deep"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {ABSENCE_LABELS[t]}
            </button>
          ))}
        </div>
      </Field>

      <Field label="유형 직접 입력 (선택)">
        <TextInput
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="비워두면 위 유형이 표시됩니다 · 예: 재택, 교육출장"
          maxLength={10}
        />
      </Field>

      <Field label="메모 (선택)">
        <Textarea
          rows={2}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 오전 반차"
        />
      </Field>

      {error && <p className="mb-2 text-sm text-danger">{error}</p>}

      <div className="mt-2 flex items-center justify-between gap-2">
        {editing ? (
          <Button variant="danger" onClick={handleDelete} disabled={busy}>
            삭제
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={busy}>
            {editing ? "저장" : "등록"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function errMsg(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as any).message);
  return "오류가 발생했습니다.";
}
