"use client";

import { useState } from "react";
import Link from "next/link";

/* ===================================
   Header 컴포넌트
   - 서비스 로고 + 네비게이션 바
   - 모바일 햄버거 메뉴 포함
   =================================== */

// 네비게이션 링크 목록 (새 메뉴를 추가하려면 여기에 항목을 추가하세요)
const navLinks = [
  { href: "/", label: "홈" },
  { href: "#student-list", label: "학생목록" },
  { href: "#", label: "공지사항" },
  { href: "#", label: "학습자료" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* ── 로고 ── */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* 로고 아이콘 (이모지 → 나중에 이미지로 교체 가능) */}
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-xl transition-transform duration-300 group-hover:scale-110">
            🚀
          </span>
          <span className="text-lg font-bold tracking-tight gradient-text sm:text-xl">
            정찬샘의 스페이스
          </span>
        </Link>

        {/* ── 데스크톱 네비게이션 ── */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="메인 메뉴">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {/* 여기에 데스크톱 전용 버튼(로그인 등)을 추가하세요 */}
        </nav>

        {/* ── 모바일 메뉴 토글 ── */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴 열기"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            /* X 아이콘 */
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* 햄버거 아이콘 */
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* ── 모바일 메뉴 (펼침) ── */}
      {mobileMenuOpen && (
        <nav className="border-t border-white/5 px-4 pb-4 md:hidden" aria-label="모바일 메뉴">
          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {/* 여기에 모바일 전용 메뉴 항목을 추가하세요 */}
          </div>
        </nav>
      )}
    </header>
  );
}
