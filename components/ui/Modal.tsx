"use client";

import { ReactNode, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** tailwind max-width 클래스 (예: max-w-md) */
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm max-sm:items-end max-sm:p-0"
      onClick={onClose}
    >
      <div
        className={`animate-pop w-full ${maxWidth} max-w-[92vw] overflow-hidden rounded-xl border border-white/60 bg-white shadow-pop max-sm:flex max-sm:max-h-[92vh] max-sm:max-w-none max-sm:flex-col max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:border-0`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title !== undefined && (
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        )}
        <div className="px-5 py-4 max-sm:overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
