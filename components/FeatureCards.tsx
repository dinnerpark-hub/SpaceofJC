"use client";

/* ===================================
   FeatureCards 컴포넌트
   - 공지사항 아래에 기능 카드들을 그리드로 표시
   - 클릭 시 각 기능의 팝업(모달)이 열림
   =================================== */

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
    hash: "#timetable",
    icon: "📅",
    title: "시간표",
    desc: "요일별 수업 일정 확인",
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderHover: "hover:border-blue-500/30",
    iconBg: "bg-blue-500/20",
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

export default function FeatureCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">교실 기능 🏫</h2>
        <p className="mt-2 text-sm text-slate-400">카드를 눌러서 각 기능을 이용해 보세요.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {features.map((f) => (
          <a
            key={f.hash}
            href={f.hash}
            className={`group relative flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-gradient-to-br ${f.gradient} p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${f.borderHover}`}
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${f.iconBg} text-2xl transition-transform duration-300 group-hover:scale-110`}>
              {f.icon}
            </div>
            <h3 className="text-sm font-bold text-white">{f.title}</h3>
            <p className="text-[11px] text-slate-400 leading-tight">{f.desc}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
