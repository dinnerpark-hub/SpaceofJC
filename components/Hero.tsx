/* ===================================
   Hero 컴포넌트
   - 메인 환영 문구 + CTA 버튼
   - 배경 그라디언트 & 장식 효과 포함
   =================================== */

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
      {/* ── 배경 장식 (글로우 효과) ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* 상단 좌측 글로우 */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl sm:h-96 sm:w-96" />
        {/* 하단 우측 글로우 */}
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl sm:h-96 sm:w-96" />
        {/* 중앙 은은한 글로우 */}
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
        {/* 뱃지 */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400"></span>
          </span>
          2026학년도 교실 운영 중
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          <span className="gradient-text">정찬T</span>와 함께하는
          <br />
          학교생활
        </h1>

        {/* 설명 */}
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
          우리 반 학생들을 위한 소통 공간입니다.
          공지사항 확인, 학습 자료 다운로드, 추억 공유까지 —
          필요한 모든 것을 한 곳에서 만나보세요.
        </p>

        {/* CTA 버튼 그룹 */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* 주요 CTA 버튼 */}
          <button
            type="button"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-indigo-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:bg-indigo-400 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            {/* 버튼 반짝임 효과 */}
            <span className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            🎒 시작하기
          </button>

          {/* 보조 버튼 (여기에 새로운 CTA를 추가하세요) */}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 active:translate-y-0"
          >
            📋 공지사항 보기
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────
          여기에 히어로 섹션 하단에 추가 요소를 배치하세요
          예시: 카드 그리드, 통계, 이미지 등
         ──────────────────────────────────────── */}
    </section>
  );
}
