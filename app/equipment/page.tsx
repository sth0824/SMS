"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import Header from "@/components/Header";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Select, TextInput } from "@/components/ui/Field";
import SetupBanner from "@/components/ui/SetupBanner";
import { isSupabaseConfigured } from "@/lib/supabase";
import { toISODate, formatKoreanDate } from "@/lib/date";
import {
  createEquipmentUnavailable,
  deleteEquipmentUnavailable,
  fetchEquipment,
  fetchEquipmentUnavailable,
  fetchMembers,
} from "@/lib/queries";

export default function EquipmentPage() {
  const todayIso = toISODate(new Date());
  const [modalOpen, setModalOpen] = useState(false);

  const { data, mutate } = useSWR(
    isSupabaseConfigured ? "equipment-board" : null,
    async () => {
      const [equipment, unavailable, members] = await Promise.all([
        fetchEquipment(),
        fetchEquipmentUnavailable(),
        fetchMembers(true),
      ]);
      return { equipment, unavailable, members };
    }
  );

  const equipment = data?.equipment ?? [];
  const unavailable = data?.unavailable ?? [];
  const members = data?.members ?? [];

  const equipMap = useMemo(() => {
    const m = new Map(equipment.map((e) => [e.id, e.name]));
    return m;
  }, [equipment]);
  const memberMap = useMemo(() => {
    const m = new Map(members.map((x) => [x.id, x.name]));
    return m;
  }, [members]);

  const current = unavailable.filter(
    (u) => u.start_date <= todayIso && todayIso <= u.end_date
  );
  const upcoming = unavailable.filter((u) => u.start_date > todayIso);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {!isSupabaseConfigured ? (
          <SetupBanner />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">사용 불가 설비 알림판</h1>
              <Button onClick={() => setModalOpen(true)}>+ 불가 등록</Button>
            </div>

            {/* 현재 사용 불가 */}
            <section className="mb-6 rounded-xl border border-gray-200/60 bg-white/90 p-5 shadow-elevated backdrop-blur-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
                <span className="text-danger">🔴</span> 현재 사용 불가 (오늘 기준)
              </h2>
              {current.length === 0 ? (
                <p className="text-sm text-gray-400">현재 사용 불가한 설비가 없습니다.</p>
              ) : (
                <Table
                  rows={current}
                  equipMap={equipMap}
                  memberMap={memberMap}
                  onDelete={async (id) => {
                    await deleteEquipmentUnavailable(id);
                    mutate();
                  }}
                  highlight
                />
              )}
            </section>

            {/* 예정된 불가 */}
            <section className="rounded-xl border border-gray-200/60 bg-white/90 p-5 shadow-elevated backdrop-blur-sm">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
                📅 예정된 불가
              </h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-400">예정된 불가 일정이 없습니다.</p>
              ) : (
                <Table
                  rows={upcoming}
                  equipMap={equipMap}
                  memberMap={memberMap}
                  onDelete={async (id) => {
                    await deleteEquipmentUnavailable(id);
                    mutate();
                  }}
                />
              )}
            </section>

            <p className="mt-4 text-xs text-gray-400">
              ※ 잔업자가 참고만 하는 용도이며 별도 알림은 발송되지 않습니다.
            </p>
          </>
        )}
      </main>

      <RegisterModal
        open={modalOpen}
        equipment={equipment}
        members={members}
        defaultDate={todayIso}
        onClose={() => setModalOpen(false)}
        onSaved={() => mutate()}
      />
    </>
  );
}

function Table({
  rows,
  equipMap,
  memberMap,
  onDelete,
  highlight,
}: {
  rows: import("@/types").EquipmentUnavailable[];
  equipMap: Map<string, string>;
  memberMap: Map<string, string>;
  onDelete: (id: string) => void;
  highlight?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
            <th className="py-2 pr-3 font-medium">설비명</th>
            <th className="py-2 pr-3 font-medium">기간</th>
            <th className="py-2 pr-3 font-medium">사유</th>
            <th className="py-2 pr-3 font-medium">등록자</th>
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-gray-100 last:border-0">
              <td className="py-2.5 pr-3 font-medium text-gray-900">
                {highlight && <span className="mr-1.5 text-danger">●</span>}
                {equipMap.get(r.equipment_id) ?? "?"}
              </td>
              <td className="py-2.5 pr-3 text-gray-700">
                {r.start_date === r.end_date
                  ? formatKoreanDate(r.start_date)
                  : `${r.start_date} ~ ${r.end_date}`}
              </td>
              <td className="py-2.5 pr-3 text-gray-700">{r.reason ?? "-"}</td>
              <td className="py-2.5 pr-3 text-gray-700">
                {r.reported_by ? memberMap.get(r.reported_by) ?? "-" : "-"}
              </td>
              <td className="py-2.5 text-right">
                <button
                  onClick={() => onDelete(r.id)}
                  className="text-xs text-gray-400 hover:text-danger"
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RegisterModal({
  open,
  equipment,
  members,
  defaultDate,
  onClose,
  onSaved,
}: {
  open: boolean;
  equipment: import("@/types").Equipment[];
  members: import("@/types").Member[];
  defaultDate: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [equipmentId, setEquipmentId] = useState("");
  const [start, setStart] = useState(defaultDate);
  const [end, setEnd] = useState(defaultDate);
  const [reason, setReason] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!equipmentId) {
      setError("설비를 선택하세요.");
      return;
    }
    if (end < start) {
      setError("종료일이 시작일보다 빠릅니다.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createEquipmentUnavailable({
        equipment_id: equipmentId,
        start_date: start,
        end_date: end,
        reason: reason || undefined,
        reported_by: reportedBy || undefined,
      });
      onSaved();
      onClose();
      setReason("");
    } catch (e: any) {
      setError(e?.message ?? "오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="설비 사용 불가 등록" maxWidth="max-w-md">
      <Field label="설비">
        <Select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)}>
          <option value="">선택…</option>
          {equipment.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name}
              {eq.category ? ` (${eq.category})` : ""}
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
      <Field label="사유">
        <TextInput
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="예: 점검중 / 고장"
        />
      </Field>
      <Field label="등록자 (선택)">
        <Select value={reportedBy} onChange={(e) => setReportedBy(e.target.value)}>
          <option value="">선택 안 함</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </Field>

      {error && <p className="mb-2 text-sm text-danger">{error}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          취소
        </Button>
        <Button onClick={save} disabled={busy}>
          등록
        </Button>
      </div>
    </Modal>
  );
}
