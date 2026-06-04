"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Field, Select, TextInput, Textarea } from "@/components/ui/Field";
import {
  ABSENCE_LABELS,
  type Absence,
  type AbsenceType,
  type Member,
} from "@/types";
import { createAbsence, deleteAbsence, updateAbsence } from "@/lib/queries";

interface Props {
  open: boolean;
  members: Member[];
  defaultDate: string;
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
  editing,
  onClose,
  onSaved,
}: Props) {
  const [memberId, setMemberId] = useState("");
  const [start, setStart] = useState(defaultDate);
  const [end, setEnd] = useState(defaultDate);
  const [type, setType] = useState<AbsenceType>("annual");
  const [memo, setMemo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setMemberId(editing.member_id);
      setStart(editing.start_date);
      setEnd(editing.end_date);
      setType(editing.type);
      setMemo(editing.memo ?? "");
    } else {
      setMemberId(members[0]?.id ?? "");
      setStart(defaultDate);
      setEnd(defaultDate);
      setType("annual");
      setMemo("");
    }
    setError(null);
  }, [open, editing, defaultDate, members]);

  async function handleSave() {
    if (!memberId) {
      setError("팀원을 선택하세요.");
      return;
    }
    if (end < start) {
      setError("종료일이 시작일보다 빠릅니다.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (editing) {
        await updateAbsence(editing.id, {
          member_id: memberId,
          start_date: start,
          end_date: end,
          type,
          memo: memo || null,
        });
      } else {
        await createAbsence({
          member_id: memberId,
          start_date: start,
          end_date: end,
          type,
          memo: memo || undefined,
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
