"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ===================================
   Header 컴포넌트 (플로팅 글래스 테마)
   =================================== */

const navLinks = [
  { href: "/", label: "홈", icon: "🏠" },
  { href: "#students", label: "학생목록", icon: "👨‍🎓" },
  { href: "#notices", label: "공지사항", icon: "📢" },
  { href: "#arcade", label: "오락실", icon: "🕹️" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 transition-all duration-300">
      <div
        className={`mx-auto max-w-6xl rounded-2xl transition-all duration-300 ${
          scrolled
            ? "glass shadow-2xl shadow-indigo-500/10 border-white/10 py-3 px-5 sm:px-7"
            : "bg-slate-900/40 backdrop-blur-md border border-white/5 py-4 px-5 sm:px-7"
        } flex items-center justify-between`}
      >
        {/* ── 로고 ── */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/30 text-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-500/30 shrink-0">
            <span className="animate-float">🚀</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight gradient-text sm:text-xl">
              정찬샘의 스페이스
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest hidden sm:block">
              Interactive Classroom Hub
            </span>
          </div>
        </Link>

        {/* ── 데스크톱 네비게이션 ── */}
        <nav className="hidden items-center gap-1.5 md:flex" aria-label="메인 메뉴">
          {navLinks.map((link) => {
            const isHash = link.href.startsWith("#");
            const Component = isHash ? "a" : Link;
            return (
              <Component
                key={link.label}
                href={link.href}
                className="group relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                <span className="text-xs transition-transform group-hover:scale-125 duration-200">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Component>
            );
          })}
        </nav>

        {/* ── 모바일 메뉴 토글 ── */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴 열기"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* ── 모바일 메뉴 (펼침) ── */}
      {mobileMenuOpen && (
        <div className="mx-auto max-w-6xl mt-2 rounded-2xl glass border border-white/10 p-4 md:hidden animate-fade-in-up">
          <nav className="flex flex-col gap-1.5" aria-label="모바일 메뉴">
            {navLinks.map((link) => {
              const isHash = link.href.startsWith("#");
              const Component = isHash ? "a" : Link;
              return (
                <Component
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-indigo-500/20 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </Component>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

