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
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        {/* 브랜드 */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <SamsungLogo className="text-[17px] sm:text-[19px]" />
          <span className="hidden h-4 w-px bg-gray-300 sm:block" />
          <span className="hidden text-sm font-semibold text-gray-700 sm:block">
            근태·잔업 관리
          </span>
        </Link>

        {/* 가운데 슬롯 (뷰 토글 등) */}
        <div className="flex flex-1 justify-center">{center}</div>

        {/* 내비게이션 */}
        <nav className="flex items-center gap-0.5 rounded-full bg-gray-100/80 p-1 shrink-0">
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
    </header>
  );
}
