import type { Metadata } from "next";
import "./globals.css";

/* ===================================
   루트 레이아웃 (Root Layout)
   - 모든 페이지에 공통으로 적용됩니다.
   - <html>, <body> 태그는 여기서만 정의합니다.
   =================================== */

export const metadata: Metadata = {
  title: "정찬샘의 스페이스 | 함께하는 학교생활",
  description:
    "정찬T와 함께하는 학교생활 - 학생들을 위한 교육 플랫폼",
  keywords: ["교육", "학교", "학교생활", "정찬샘"],
  // 여기에 Open Graph, Twitter Card 등 SEO 메타데이터를 추가하세요
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard 웹폰트 */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 여기에 추가 <head> 요소를 넣으세요 (파비콘, 외부 스크립트 등) */}
      </head>
      <body className="flex min-h-dvh flex-col">
        {children}
      </body>
    </html>
  );
}
