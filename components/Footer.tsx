/* ===================================
   Footer 컴포넌트
   =================================== */

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-slate-950/40 backdrop-blur-md relative z-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        {/* 카피라이트 & 로고 */}
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-base border border-indigo-500/30">
            🚀
          </span>
          <p className="text-sm font-medium text-slate-400">
            © {currentYear} <span className="text-slate-200 font-bold">정찬샘의 스페이스</span>. All rights reserved.
          </p>
        </div>

        {/* 푸터 링크 */}
        <div className="flex items-center gap-6 text-sm font-semibold text-slate-400">
          <Link
            href="/"
            className="transition-colors hover:text-indigo-400"
          >
            홈
          </Link>
          <a
            href="#students"
            className="transition-colors hover:text-indigo-400"
          >
            학생목록
          </a>
          <a
            href="#notices"
            className="transition-colors hover:text-indigo-400"
          >
            공지사항
          </a>
          <a
            href="#arcade"
            className="transition-colors hover:text-indigo-400"
          >
            오락실
          </a>
        </div>
      </div>
    </footer>
  );
}

