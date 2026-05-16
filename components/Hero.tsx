"use client";

import { useState, useEffect } from "react";

/* ===================================
   Hero 컴포넌트
   - 메인 환영 문구 + CTA 버튼
   - 최신 공지사항 실시간 노출 (반짝임 효과)
   =================================== */

interface Notice {
  title: string;
}

export default function Hero() {
  const [latestNotice, setLatestNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const fetchLatestNotice = async () => {
      try {
        const response = await fetch("/api/notices?latest=true");
        if (response.ok) {
          const data = await response.json();
          setLatestNotice(data);
        }
      } catch (error) {
        console.error("Notice fetch error:", error);
      }
    };
    fetchLatestNotice();
  }, []);

  return (
    <section className="relative isolate flex min-h-[70vh] items-start justify-center overflow-visible px-4 pt-20 pb-24 sm:px-6 sm:pt-32 sm:pb-32 lg:pt-40 lg:pb-40">
      {/* ── 배경 장식 (글로우 효과) ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[100px] sm:h-[800px] sm:w-[800px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/15 blur-[100px] sm:h-[800px] sm:w-[800px]" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-[120px]" />
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="mx-auto max-w-4xl text-center animate-fade-in-up">
        {/* 메인 타이틀 */}
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          <span className="gradient-text">정찬T</span>와 함께하는
          <br />
          학교생활
        </h1>

        {/* 설명 (부제) */}
        <p className="mx-auto mt-4 max-w-xl text-sm font-medium tracking-wide text-indigo-300/90 sm:text-base uppercase">
          정찬쌤과 함께하는 학생들을 위한 소통 공간입니다
        </p>

        {/* 상세 설명 */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          필요한 모든 것을 한 곳에서 만나보세요.
        </p>

        {/* CTA 버튼 그룹 */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#register"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-indigo-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:bg-indigo-400 hover:shadow-indigo-500/40 hover:-translate-y-1 active:translate-y-0"
          >
            <span className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            🎒 시작하기
          </a>

          <a
            href="#notices"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white hover:-translate-y-1 active:translate-y-0"
          >
            📋 공지사항 보기
          </a>
        </div>

        {/* 뱃지 및 최신 공지사항 */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            </span>
            2026학년도 교실 운영 중
          </div>

          {/* 최신 공지사항 프리뷰 (반짝임 효과) */}
          {latestNotice && (
            <div className="animate-pulse flex items-center gap-2 text-indigo-300 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <span className="text-xs font-bold bg-indigo-500 text-white px-1.5 py-0.5 rounded animate-bounce">NEW</span>
              <p className="text-sm font-bold tracking-tight truncate max-w-[250px] sm:max-w-md">
                {latestNotice.title}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
