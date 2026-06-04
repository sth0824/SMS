"use client";

import { useState } from "react";
import useSWR from "swr";
import Header from "@/components/Header";
import Button from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import SetupBanner from "@/components/ui/SetupBanner";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  createEquipment,
  createMember,
  deleteEquipment,
  deleteMember,
  fetchEquipment,
  fetchMembers,
  updateMember,
} from "@/lib/queries";

const PRESET_COLORS = [
  "#1428A0",
  "#FF6B4A",
  "#16A085",
  "#8E44AD",
  "#F39C12",
  "#E74C3C",
  "#2E86C1",
  "#717171",
];

export default function AdminPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {!isSupabaseConfigured ? (
          <SetupBanner />
        ) : (
          <>
            <h1 className="mb-5 text-2xl font-bold text-gray-900">관리</h1>
            <div className="grid gap-6 md:grid-cols-2">
              <MemberSection />
              <EquipmentSection />
            </div>
          </>
        )}
      </main>
    </>
  );
}

function MemberSection() {
  const { data: members, mutate } = useSWR("admin-members", () => fetchMembers(true));
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await createMember(name.trim(), color);
      setName("");
      mutate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200/60 bg-white/90 p-5 shadow-elevated backdrop-blur-sm">
      <h2 className="mb-3 text-base font-semibold text-gray-900">팀원</h2>

      <ul className="mb-4 flex flex-col gap-1">
        {(members ?? []).map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded-card px-2 py-1.5 hover:bg-gray-100"
          >
            <span className="flex items-center gap-2 text-sm">
              <input
                type="color"
                value={m.color}
                onChange={async (e) => {
                  await updateMember(m.id, { color: e.target.value });
                  mutate();
                }}
                className="h-5 w-5 cursor-pointer rounded border border-gray-300 p-0"
                title="색상 변경"
              />
              <span
                className={`font-medium ${
                  m.active ? "text-gray-900" : "text-gray-400 line-through"
                }`}
              >
                {m.name}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await updateMember(m.id, { active: !m.active });
                  mutate();
                }}
                className="text-xs text-gray-400 hover:text-samsung"
              >
                {m.active ? "비활성" : "활성"}
              </button>
              <button
                onClick={async () => {
                  if (!confirm(`${m.name} 님을 삭제할까요? 관련 기록도 함께 삭제됩니다.`))
                    return;
                  await deleteMember(m.id);
                  mutate();
                }}
                className="text-xs text-gray-400 hover:text-danger"
              >
                삭제
              </button>
            </span>
          </li>
        ))}
        {members && members.length === 0 && (
          <li className="px-2 py-1.5 text-sm text-gray-400">등록된 팀원이 없습니다.</li>
        )}
      </ul>

      <div className="rounded-card border border-gray-200 p-3">
        <Field label="이름">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="새 팀원 이름"
          />
        </Field>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full border-2 ${
                color === c ? "border-gray-900" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
        <Button onClick={add} disabled={busy} className="w-full">
          + 팀원 추가
        </Button>
      </div>
    </section>
  );
}

function EquipmentSection() {
  const { data: equipment, mutate } = useSWR("admin-equipment", fetchEquipment);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await createEquipment(name.trim(), category.trim() || undefined);
      setName("");
      setCategory("");
      mutate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200/60 bg-white/90 p-5 shadow-elevated backdrop-blur-sm">
      <h2 className="mb-3 text-base font-semibold text-gray-900">설비 목록</h2>

      <ul className="mb-4 flex flex-col gap-1">
        {(equipment ?? []).map((e) => (
          <li
            key={e.id}
            className="flex items-center justify-between rounded-card px-2 py-1.5 hover:bg-gray-100"
          >
            <span className="text-sm font-medium text-gray-900">
              {e.name}
              {e.category && (
                <span className="ml-2 text-xs font-normal text-gray-400">{e.category}</span>
              )}
            </span>
            <button
              onClick={async () => {
                if (!confirm(`${e.name} 설비를 삭제할까요?`)) return;
                await deleteEquipment(e.id);
                mutate();
              }}
              className="text-xs text-gray-400 hover:text-danger"
            >
              삭제
            </button>
          </li>
        ))}
        {equipment && equipment.length === 0 && (
          <li className="px-2 py-1.5 text-sm text-gray-400">등록된 설비가 없습니다.</li>
        )}
      </ul>

      <div className="rounded-card border border-gray-200 p-3">
        <Field label="설비명">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 설비D"
          />
        </Field>
        <Field label="분류 (선택)">
          <TextInput
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="예: 가공 / 검사"
          />
        </Field>
        <Button onClick={add} disabled={busy} className="w-full">
          + 설비 추가
        </Button>
      </div>
    </section>
  );
}
