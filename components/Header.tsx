"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const NAV = [
  { href: "/", label: "대시보드" },
  { href: "/equipment", label: "설비판" },
  { href: "/admin", label: "관리" },
];

export default function Header({ center }: { center?: ReactNode }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-card bg-samsung text-sm font-bold text-white">
          근
        </span>
        <h1 className="hidden text-base font-bold text-gray-900 sm:block">
          근태·잔업 관리
        </h1>
      </div>

      <div className="flex-1 px-3">
        <div className="flex justify-center">{center}</div>
      </div>

      <nav className="flex items-center gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-card px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-samsung-pale text-samsung-deep"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
