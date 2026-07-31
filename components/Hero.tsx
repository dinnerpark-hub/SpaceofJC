"use client";

import { useState, useEffect } from "react";

/* ===================================
   Hero 컴포넌트 (프리미엄 벤토 오로라 테마)
   - 메인 비주얼 + 헤드라인
   - 공지사항 & D-Day 실시간 글래스 위젯
   - Bento Grid 교실 기능 카운터/카드
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
    hash: "#arcade",
    icon: "🕹️",
    title: "오락실 (Arcade)",
    desc: "2048 & 카드 뒤집기 게임으로 머리를 식혀보세요!",
    badge: "POPULAR",
    gradient: "from-cyan-500/20 via-indigo-500/20 to-purple-600/20",
    glowColor: "group-hover:shadow-cyan-500/20",
    borderColor: "border-cyan-500/30",
    badgeBg: "bg-cyan-500 text-slate-950",
    gridClass: "col-span-1 md:col-span-2 lg:col-span-2 row-span-1",
  },
  {
    hash: "#dday",
    icon: "⏰",
    title: "D-Day 카운트다운",
    desc: "시험, 행사 등 중요한 일정까지 남은 시간을 확인하세요.",
    badge: "SCHEDULE",
    gradient: "from-rose-500/20 via-orange-500/20 to-amber-500/20",
    glowColor: "group-hover:shadow-rose-500/20",
    borderColor: "border-rose-500/30",
    badgeBg: "bg-rose-500 text-white",
    gridClass: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
  },
  {
    hash: "#questions",
    icon: "💬",
    title: "익명 질문함",
    desc: "선생님과 친구들에게 전하고 싶은 질문이나 고민을 자유롭게 솔직하게 남겨보세요.",
    badge: "ANONYMOUS",
    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    glowColor: "group-hover:shadow-emerald-500/20",
    borderColor: "border-emerald-500/30",
    badgeBg: "bg-emerald-500 text-slate-950",
    gridClass: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
  },
  {
    hash: "#gallery",
    icon: "📸",
    title: "학급 갤러리",
    desc: "우리 반만의 특별하고 소중한 추억 사진 모음집",
    badge: "PHOTOS",
    gradient: "from-purple-500/20 via-fuchsia-500/20 to-pink-500/20",
    glowColor: "group-hover:shadow-purple-500/20",
    borderColor: "border-purple-500/30",
    badgeBg: "bg-purple-500 text-white",
    gridClass: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
  },
  {
    hash: "#polls",
    icon: "🗳️",
    title: "투표 & 설문",
    desc: "학급 규칙, 이벤트 의견을 투표로 결정해요",
    badge: "VOTE",
    gradient: "from-amber-500/20 via-yellow-500/20 to-orange-500/20",
    glowColor: "group-hover:shadow-amber-500/20",
    borderColor: "border-amber-500/30",
    badgeBg: "bg-amber-500 text-slate-950",
    gridClass: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
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
    <section className="relative isolate min-h-screen flex flex-col items-center justify-center px-4 pt-32 pb-24 sm:px-6 lg:pt-40">
      {/* ── 오로라 글로우 입체 배경 ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="absolute -left-1/4 -top-24 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[130px] animate-pulse-glow" />
        <div className="absolute -right-1/4 top-1/3 h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[140px] animate-pulse-glow" />
        <div className="absolute left-1/3 -bottom-24 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[120px]" />
      </div>

      {/* ── 히어로 메인 문구 및 서브 ── */}
      <div className="mx-auto max-w-5xl text-center animate-fade-in-up flex flex-col items-center">
        {/* 상단 뱃지 */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300 backdrop-blur-md shadow-lg shadow-indigo-500/10 mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
          </span>
          2026학년도 정찬T 클래스룸 온에어 💫
        </div>

        {/* 대형 히어로 메인 타이틀 */}
        <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl leading-[1.1]">
          <span className="gradient-text">정찬T</span>와 함께 만드는
          <br />
          <span className="relative inline-block mt-1">
            즐거운 학교생활
            <svg className="absolute -bottom-2 left-0 w-full h-3 text-indigo-500/40" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 15 Q 50 0 100 15" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        {/* 부제 설명 */}
        <p className="mx-auto mt-8 max-w-2xl text-base sm:text-xl font-medium text-slate-300 leading-relaxed">
          우리 반 학생들을 위한 소통과 공지, 오락실과 갤러리가 모인
          <br className="hidden sm:inline" />
          스마트 인터랙티브 소통 공간입니다.
        </p>

        {/* CTA 버튼 그룹 */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none">
          <a
            href="#students"
            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-9 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 active:translate-y-0"
          >
            <span className="text-xl transition-transform group-hover:scale-125 duration-300">🎒</span>
            <span>우리 반 학생 목록</span>
          </a>

          <a
            href="#arcade"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md px-9 py-4 text-base font-bold text-slate-200 shadow-lg transition-all duration-300 hover:border-cyan-500/40 hover:bg-slate-800/80 hover:text-white hover:-translate-y-1 active:translate-y-0"
          >
            <span className="text-xl">🕹️</span>
            <span>오락실 가기</span>
          </a>
        </div>

        {/* ── 실시간 알림 글래스 위젯 (공지사항 & D-Day) ── */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
          {/* 최신 공지사항 위젯 */}
          {latestNotice ? (
            <a
              href={`#notice-${latestNotice.id}`}
              className="group relative flex items-center gap-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/30 p-5 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 hover:bg-indigo-900/40 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5 text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                📢
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-md">LATEST NOTICE</span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-100 truncate group-hover:text-indigo-200 transition-colors">
                  {latestNotice.title}
                </p>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-5 backdrop-blur-xl text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-400">
                📢
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500">NOTICE</span>
                <p className="text-sm font-medium text-slate-400">등록된 최신 공지사항이 없습니다.</p>
              </div>
            </div>
          )}

          {/* D-Day 위젯 */}
          {nearestDday ? (
            <a
              href="#dday"
              className="group relative flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-950/30 p-5 backdrop-blur-xl transition-all duration-300 hover:border-rose-500/50 hover:bg-rose-900/40 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-0.5 text-left"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 group-hover:scale-110 transition-transform">
                  ⏰
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-md">UPCOMING</span>
                  <p className="mt-1 text-sm font-bold text-slate-100 truncate group-hover:text-rose-200 transition-colors">
                    {nearestDday.title}
                  </p>
                </div>
              </div>
              <span className="text-xl font-black text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 shrink-0 ml-2">
                {getDdayCount(nearestDday.targetDate)}
              </span>
            </a>
          ) : (
            <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-5 backdrop-blur-xl text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-400">
                ⏰
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500">D-DAY</span>
                <p className="text-sm font-medium text-slate-400">다가오는 일정이 없습니다.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── 교실 기능 Bento Grid (주요 메뉴 타일) ── */}
        <div className="mt-24 w-full max-w-5xl">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              CLASSROOM FEATURES
            </span>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              원하는 서비스를 선택하세요 🏫
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              다채롭고 재미있는 기능을 이용하실 수 있습니다.
            </p>
          </div>

          {/* Bento Grid 타일 배치 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <a
                key={f.hash}
                href={f.hash}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border ${f.borderColor} bg-slate-900/60 bg-gradient-to-br ${f.gradient} p-7 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${f.glowColor} ${f.gridClass}`}
              >
                {/* 글로우 배경 필터 */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-all" />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 inline-block">
                      {f.icon}
                    </span>
                    <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full shadow-sm ${f.badgeBg}`}>
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300/80 leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                  <span>바로가기</span>
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

