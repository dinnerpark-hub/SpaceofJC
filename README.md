# 정찬샘의 스페이스 🚀

학생들을 위한 교육 플랫폼 — Next.js + Tailwind CSS로 제작

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 기술 스택

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: TypeScript
- **Deploy**: [Vercel](https://vercel.com/)

## 폴더 구조

```
├── app/
│   ├── globals.css      # 글로벌 스타일 & Tailwind 임포트
│   ├── layout.tsx       # 루트 레이아웃 (모든 페이지 공통)
│   └── page.tsx         # 메인 홈 페이지
├── components/
│   ├── Header.tsx       # 헤더 & 네비게이션
│   ├── Hero.tsx         # 히어로 섹션
│   └── Footer.tsx       # 푸터
├── public/              # 정적 파일 (이미지, 아이콘 등)
├── next.config.ts       # Next.js 설정
├── postcss.config.mjs   # PostCSS 설정 (Tailwind 연동)
├── tsconfig.json        # TypeScript 설정
└── package.json         # 프로젝트 매니페스트
```

## 배포

GitHub에 푸시한 뒤 [Vercel](https://vercel.com/new)에서 리포지토리를 연결하면 자동 배포됩니다.
