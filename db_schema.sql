-- 학생 정보를 저장하기 위한 테이블 생성 SQL
-- Neon Postgres 대시보드의 SQL Editor에서 실행하세요.

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade TEXT NOT NULL,
  class_num TEXT NOT NULL,
  number TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (검색 및 정렬 최적화)
CREATE INDEX IF NOT EXISTS idx_students_grade_class_number ON students (grade, class_num, number);

-- 공지사항 테이블 생성
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 최신순 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices (created_at DESC);
