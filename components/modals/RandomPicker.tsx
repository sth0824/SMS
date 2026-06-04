"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { Member } from "@/types";

interface Props {
  open: boolean;
  candidates: Member[];
  onConfirm: (member: Member) => void;
  onClose: () => void;
}

export default function RandomPicker({ open, candidates, onConfirm, onClose }: Props) {
  const [current, setCurrent] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Member | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 모달 열릴 때 자동으로 한 번 추첨
  useEffect(() => {
    if (open && candidates.length > 0) {
      spin();
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function spin() {
    if (candidates.length === 0) return;
    setWinner(null);
    setSpinning(true);
    let speed = 50;
    let elapsed = 0;
    let idx = Math.floor(Math.random() * candidates.length);

    const tick = () => {
      idx = (idx + 1) % candidates.length;
      setCurrent(idx);
      elapsed += speed;
      if (elapsed > 1500) speed += 40; // 점점 느려짐
      if (elapsed < 2500) {
        timer.current = setTimeout(tick, speed);
      } else {
        setSpinning(false);
        setWinner(candidates[idx]);
      }
    };
    tick();
  }

  const displayed = candidates[current];

  return (
    <Modal open={open} onClose={onClose} title="🎲 잔업 랜덤 추첨" maxWidth="max-w-sm">
      <div className="flex flex-col items-center gap-5 py-4">
        <p className="text-xs text-gray-500">
          가능 인원 {candidates.length}명 중 랜덤으로 1명을 뽑습니다.
        </p>

        <div className="flex h-28 w-full items-center justify-center rounded-lg bg-gray-100">
          <span
            className={`text-4xl font-bold text-samsung transition-all duration-100 ${
              spinning ? "scale-95 blur-[1px] opacity-80" : "scale-110"
            }`}
          >
            {displayed?.name ?? "—"}
          </span>
        </div>

        {winner && !spinning && (
          <p className="text-sm font-medium text-gray-700">
            🎉 <span className="font-bold text-samsung-deep">{winner.name}</span> 님이
            당첨되었습니다!
          </p>
        )}

        <div className="flex w-full gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={spinning}
          >
            취소
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={spin}
            disabled={spinning}
          >
            재추첨
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            disabled={spinning || !winner}
            onClick={() => winner && onConfirm(winner)}
          >
            확정
          </Button>
        </div>
      </div>
    </Modal>
  );
}
