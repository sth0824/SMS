/**
 * Samsung 워드마크. 공식 로고 폰트는 라이선스 자산이라,
 * Pretendard 기반으로 자간·굵기를 맞춘 워드마크로 표현한다.
 * 공식 SVG 자산이 있다면 이 컴포넌트만 교체하면 된다.
 */
export default function SamsungLogo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`samsung-wordmark select-none leading-none ${className}`}
      aria-label="Samsung"
    >
      SAMSUNG
    </span>
  );
}
