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
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* MathJax 3 수식 자바스크립트 엔진 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.MathJax = {
                tex: {
                  inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                  displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                  processEscapes: true
                },
                options: {
                  ignoreHtmlClass: 'tex2jax_ignore',
                  processHtmlClass: 'tex2jax_process'
                }
              };
            `,
          }}
        />
        <script
          type="text/javascript"
          id="MathJax-script"
          async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        {children}
      </body>
    </html>
  );
}
