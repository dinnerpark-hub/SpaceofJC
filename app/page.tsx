import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StudentModals from "@/components/StudentModals";
import Footer from "@/components/Footer";

/* ===================================
   메인 페이지 (Home)
   - 각 섹션은 별도 컴포넌트로 분리되어 있습니다.
   - 새로운 섹션을 추가하려면 컴포넌트를 만들고 아래에 배치하세요.
   =================================== */

export default function Home() {
  return (
    <>
      {/* 상단 헤더 & 네비게이션 */}
      <Header />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1">
        {/* 히어로 섹션 */}
        <Hero />

        {/* ────────────────────────────────────────
            여기에 새로운 섹션 컴포넌트를 추가하세요
            예시:
            <Features />
            <Schedule />
            <Gallery />
            <Contact />
           ──────────────────────────────────────── */}
      </main>

      {/* 학생 등록 및 목록 모달 (팝업) */}
      <StudentModals />

      {/* 하단 푸터 */}
      <Footer />
    </>
  );
}
