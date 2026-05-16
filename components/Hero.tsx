"use client";

import { useState, useEffect } from "react";

/* ===================================
   Hero 컴포넌트
   - 메인 환영 문구 + CTA 버튼
   - 최신 공지사항 및 가장 가까운 D-Day 노출
   =================================== */

interface Notice {
  id: string;
  title: string;
}

interface Dday {
  id: string;
  title: string;
  targetDate: string;
}

export default function Hero() {
  const [latestNotice, setLatestNotice] = useState<Notice | null>(null);
  const [nearestDday, setNearestDday] = useState<Dday | null>(null);

  useEffect(() => {
    // 최신 공지사항 가져오기
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

    // 가장 가까운 D-Day 가져오기
    const fetchNearestDday = async () => {
      try {
        const response = await fetch("/api/dday");
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // 날짜가 지나지 않은 것 중 가장 가까운 것 찾기
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const futureEvents = data.filter((ev: any) => new Date(ev.targetDate) >= now);
            if (futureEvents.length > 0) {
              setNearestDday(futureEvents[0]); // API가 이미 ASC 정렬해서 보냄
            }
          }
        }
      } catch (error) {
        console.error("D-Day fetch error:", error);
      }
    };

    fetchLatestNotice();
    fetchNearestDday();
  }, []);

  const getDdayCount = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "D-Day!";
    return `D-${diff}`;
  };

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

        {/* 뱃지 및 최신 정보 */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            </span>
            2026학년도 교실 운영 중
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center w-full max-w-3xl">
            {/* 최신 공지사항 프리뷰 */}
            {latestNotice && (
              <a
                href={`#notice-${latestNotice.id}`}
                className="flex-1 animate-pulse flex items-center gap-3 text-indigo-300 bg-indigo-500/10 px-6 py-4 rounded-2xl border border-indigo-500/20 shadow-xl shadow-indigo-500/10 transition-all hover:scale-[1.03] hover:bg-indigo-500/20 hover:border-indigo-500/40 cursor-pointer"
              >
                <span className="text-sm font-black bg-indigo-500 text-white px-2 py-1 rounded-lg animate-bounce">NOTICE</span>
                <div className="text-left overflow-hidden">
                  <p className="text-base font-bold tracking-tight truncate">
                    {latestNotice.title}
                  </p>
                  <p className="text-[10px] text-indigo-400/70 font-medium uppercase mt-0.5">Click to read more</p>
                </div>
              </a>
            )}

            {/* 가장 가까운 D-Day 프리뷰 */}
            {nearestDday && (
              <a
                href="#dday"
                className="flex-1 flex items-center gap-3 text-rose-300 bg-rose-500/10 px-6 py-4 rounded-2xl border border-rose-500/20 shadow-xl shadow-rose-500/10 transition-all hover:scale-[1.03] hover:bg-rose-500/20 hover:border-rose-500/40 cursor-pointer"
              >
                <span className="text-sm font-black bg-rose-500 text-white px-2 py-1 rounded-lg">D-DAY</span>
                <div className="text-left overflow-hidden">
                  <p className="text-base font-bold tracking-tight truncate">
                    {nearestDday.title}
                  </p>
                  <p className="text-lg font-black text-rose-400 leading-none mt-1">{getDdayCount(nearestDday.targetDate)}</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
