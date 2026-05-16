import { neon } from '@neondatabase/serverless';

/* ===================================
   Neon Postgres 데이터베이스 설정
   - Vercel 환경 변수 DATABASE_URL을 사용합니다.
   - 서버사이드 환경(API Routes, Server Components)에서 사용하세요.
   =================================== */

if (!process.env.DATABASE_URL) {
  console.warn('경고: DATABASE_URL 환경 변수가 설정되지 않았습니다.');
}

export const sql = neon(process.env.DATABASE_URL!);
