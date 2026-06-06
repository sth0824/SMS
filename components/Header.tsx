"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import SamsungLogo from "@/components/ui/SamsungLogo";

const NAV = [
  { href: "/", label: "대시보드" },
  { href: "/equipment", label: "설비판" },
  { href: "/admin", label: "관리" },
];

export default function Header({ center }: { center?: ReactNode }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        {/* 메인 바: 데스크탑은 한 줄, 모바일은 [로고 | 네비] */}
        <div className="flex h-16 items-center gap-3">
          {/* 브랜드 */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <SamsungLogo className="text-[17px] sm:text-[19px]" />
            <span className="hidden h-4 w-px bg-gray-300 sm:block" />
            <span className="hidden text-sm font-semibold text-gray-700 sm:block">
              근태·잔업 관리
            </span>
          </Link>

          {/* 가운데 슬롯 (뷰 토글 등) — 데스크탑 전용 */}
          <div className="hidden flex-1 justify-center sm:flex">{center}</div>

          {/* 내비게이션 */}
          <nav className="ml-auto flex items-center gap-0.5 rounded-full bg-gray-100/80 p-1 shrink-0 sm:ml-0">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-white text-samsung-deep shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 가운데 슬롯 — 모바일 전용 (메인 바 아래 별도 행) */}
        {center && (
          <div className="flex justify-center pb-2.5 sm:hidden">{center}</div>
        )}
      </div>
    </header>
  );
}
