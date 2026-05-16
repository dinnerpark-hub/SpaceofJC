import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/* ===================================
   공지사항 API Route (GET / POST)
   =================================== */

// 1. 공지사항 목록 조회 (최신순)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latest = searchParams.get("latest");

  try {
    if (latest === "true") {
      const notice = await sql`
        SELECT id, title, content, created_at as "timestamp"
        FROM notices
        ORDER BY created_at DESC
        LIMIT 1
      `;
      return NextResponse.json(notice[0] || null);
    }

    const notices = await sql`
      SELECT id, title, content, created_at as "timestamp"
      FROM notices
      ORDER BY created_at DESC
    `;
    return NextResponse.json(notices);
  } catch (error: any) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: error.message || "데이터를 불러오는데 실패했습니다." }, { status: 500 });
  }
}

// 2. 공지사항 등록
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "제목과 내용을 모두 입력해주세요." }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO notices (title, content)
      VALUES (${title}, ${content})
      RETURNING id, title, content, created_at as "timestamp"
    `;

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: error.message || "공지사항 저장에 실패했습니다." }, { status: 500 });
  }
}
