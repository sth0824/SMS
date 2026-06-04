import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "근태·잔업 통합 관리",
  description: "팀 근태와 잔업을 한 화면에서 관리하는 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
