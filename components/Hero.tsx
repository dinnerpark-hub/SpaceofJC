"use client";

import { useState, useEffect } from "react";

/* ===================================
   Hero 컴포넌트
   - 메인 환영 문구 + CTA 버튼
   - 최신 공지사항 및 가장 가까운 D-Day 노출
   - 교실 기능 카드 (FeatureCards) 통합형
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

const features = [
  {
    hash: "#dday",
    icon: "⏰",
    title: "D-Day",
    desc: "중요한 날까지 남은 시간",
    gradient: "from-rose-500/20 to-orange-500/20",
    borderHover: "hover:border-rose-500/30",
    iconBg: "bg-rose-500/20",
  },
  {
    hash: "#questions",
    icon: "💬",
    title: "익명 질문함",
    desc: "궁금한 것을 자유롭게",
    gradient: "from-emerald-500/20 to-teal-500/20",
    borderHover: "hover:border-emerald-500/30",
    iconBg: "bg-emerald-500/20",
  },
  {
    hash: "#gallery",
    icon: "📸",
    title: "학급 갤러리",
    desc: "우리 반 추억 모음",
    gradient: "from-purple-500/20 to-pink-500/20",
    borderHover: "hover:border-purple-500/30",
    iconBg: "bg-purple-500/20",
  },
  {
    hash: "#polls",
    icon: "🗳️",
    title: "투표 / 설문",
    desc: "의견을 모아봐요",
    gradient: "from-amber-500/20 to-yellow-500/20",
    borderHover: "hover:border-amber-500/30",
    iconBg: "bg-amber-500/20",
  },
];

export default function Hero() {
  const [latestNotice, setLatestNotice] = useState<Notice | null>(null);
  const [nearestDday, setNearestDday] = useState<Dday | null>(null);

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

    const fetchNearestDday = async () => {
      try {
        const response = await fetch("/api/dday");
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const futureEvents = data.filter((ev: any) => new Date(ev.targetDate) >= now);
            if (futureEvents.length > 0) {
              setNearestDday(futureEvents[0]);
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
    <section className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-visible px-4 pt-32 pb-24 sm:px-6 lg:pt-48">
      {/* ── 배경 장식 (글로우 효과) ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[100px] sm:h-[800px] sm:w-[800px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/15 blur-[100px] sm:h-[800px] sm:w-[800px]" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-[120px]" />
      </div>

      {/* ── 메인 콘텐츠 ── */}
      <div className="mx-auto max-w-4xl text-center animate-fade-in-up flex flex-col items-center">
        {/* 메인 타이틀 */}
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl lg:text-8xl">
          <span className="gradient-text">정찬T</span>와 함께하는
          <br />
          학교생활
        </h1>

        {/* 설명 (부제) */}
        <p className="mx-auto mt-6 max-w-xl text-base font-medium tracking-wide text-indigo-300/90 sm:text-lg uppercase">
          정찬쌤과 함께하는 학생들을 위한 소통 공간입니다
        </p>

        {/* CTA 버튼 그룹 */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#register"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-indigo-500 px-10 py-5 text-base font-bold text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:bg-indigo-400 hover:shadow-indigo-500/50 hover:-translate-y-1 active:translate-y-0"
          >
            <span className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            🎒 시작하기
          </a>

          <a
            href="#notices"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-10 py-5 text-base font-bold text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white hover:-translate-y-1 active:translate-y-0"
          >
            📋 공지사항 보기
          </a>
        </div>

        {/* 뱃지 및 최신 정보 카드 */}
        <div className="mt-16 flex flex-col items-center gap-8 w-full max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
            </span>
            2026학년도 교실 운영 중
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center w-full">
            {/* 최신 공지사항 프리뷰 */}
            {latestNotice && (
              <a
                href={`#notice-${latestNotice.id}`}
                className="flex-1 animate-pulse flex items-center gap-4 text-indigo-300 bg-indigo-500/10 px-8 py-6 rounded-3xl border border-indigo-500/20 shadow-2xl shadow-indigo-500/20 transition-all hover:scale-[1.03] hover:bg-indigo-500/20 hover:border-indigo-500/40 cursor-pointer"
              >
                <span className="text-sm font-black bg-indigo-500 text-white px-2.5 py-1 rounded-xl animate-bounce">NOTICE</span>
                <div className="text-left overflow-hidden">
                  <p className="text-lg font-bold tracking-tight truncate">
                    {latestNotice.title}
                  </p>
                  <p className="text-xs text-indigo-400/70 font-medium uppercase mt-1">Click to read more</p>
                </div>
              </a>
            )}

            {/* 가장 가까운 D-Day 프리뷰 */}
            {nearestDday && (
              <a
                href="#dday"
                className="flex-1 flex items-center gap-4 text-rose-300 bg-rose-500/10 px-8 py-6 rounded-3xl border border-rose-500/20 shadow-2xl shadow-rose-500/20 transition-all hover:scale-[1.03] hover:bg-rose-500/20 hover:border-rose-500/40 cursor-pointer"
              >
                <span className="text-sm font-black bg-rose-500 text-white px-2.5 py-1 rounded-xl">D-DAY</span>
                <div className="text-left overflow-hidden">
                  <p className="text-lg font-bold tracking-tight truncate">
                    {nearestDday.title}
                  </p>
                  <p className="text-2xl font-black text-rose-400 leading-none mt-1">{getDdayCount(nearestDday.targetDate)}</p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* ── 교실 기능 카드 (Feature Cards) ── */}
        <div className="mt-24 w-full">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">교실 기능 🏫</h2>
            <p className="mt-2 text-sm text-slate-400">필요한 기능을 선택해 보세요.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {features.map((f) => (
              <a
                key={f.hash}
                href={f.hash}
                className={`group relative flex w-full flex-col items-center gap-3 rounded-2xl border border-white/5 bg-gradient-to-br ${f.gradient} p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${f.borderHover} sm:w-48`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${f.iconBg} text-2xl transition-transform duration-300 group-hover:scale-110`}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-white">{f.title}</h3>
                <p className="text-[11px] text-slate-400 leading-tight">{f.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
