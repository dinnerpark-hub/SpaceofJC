/* ===================================
   Footer 컴포넌트
   - 카피라이트 + 추가 링크 공간
   =================================== */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        {/* 카피라이트 */}
        <p className="text-sm text-slate-500">
          © {currentYear} 정찬샘의 스페이스. All rights reserved.
        </p>

        {/* 푸터 링크 (여기에 개인정보처리방침, 이용약관 등을 추가하세요) */}
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            이용안내
          </a>
          <a
            href="#"
            className="text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            문의하기
          </a>
          {/* 여기에 새로운 푸터 링크를 추가하세요 */}
        </div>
      </div>
    </footer>
  );
}
