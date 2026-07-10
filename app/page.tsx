import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StudentModals from "@/components/StudentModals";
import NoticeModals from "@/components/NoticeModals";
import DdayModal from "@/components/DdayModal";
import QuestionModal from "@/components/QuestionModal";
import GalleryModal from "@/components/GalleryModal";
import PollModal from "@/components/PollModal";
import ArcadeModal from "@/components/ArcadeModal";
import Footer from "@/components/Footer";

/* ===================================
   메인 페이지 (Home)
   - Hero → FeatureCards → Footer
   - 각 모달은 전역적으로 해시 변경을 감지합니다.
   =================================== */

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <Hero />
      </main>

      {/* 전역 모달들 (해시 기반 팝업) */}
      <StudentModals />
      <NoticeModals />
      <DdayModal />
      <QuestionModal />
      <GalleryModal />
      <PollModal />
      <ArcadeModal />

      <Footer />
    </>
  );
}
