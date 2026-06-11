/** 열기구 아이콘 (패밀리데이 표시용). currentColor 를 따라간다. */
export default function BalloonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* 기구(풍선) */}
      <path
        d="M12 2C7.6 2 4 5.4 4 9.7c0 3.1 2 5.8 4.6 7.3h6.8C18 15.5 20 12.8 20 9.7 20 5.4 16.4 2 12 2Z"
        fill="currentColor"
      />
      {/* 줄 */}
      <path
        d="M9.3 16.8 8.7 18.4M14.7 16.8l.6 1.6"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* 바구니 */}
      <rect x="9.6" y="18.2" width="4.8" height="3.4" rx="0.9" fill="currentColor" />
    </svg>
  );
}
