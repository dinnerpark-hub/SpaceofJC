import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/* ===================================
   학생 정보 API Route (GET / POST)
   =================================== */

// 1. 학생 목록 조회 (정렬 포함)
export async function GET() {
  try {
    const students = await sql`
      SELECT id, grade, class_num as "classNum", number, name, created_at as "timestamp"
      FROM students
      ORDER BY grade ASC, class_num ASC, number ASC
    `;
    return NextResponse.json(students);
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "데이터를 불러오는데 실패했습니다." }, { status: 500 });
  }
}

// 2. 학생 등록
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { grade, classNum, number, name } = body;

    if (!grade || !classNum || !number || !name) {
      return NextResponse.json({ error: "모든 필드를 입력해주세요." }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO students (grade, class_num, number, name)
      VALUES (${grade}, ${classNum}, ${number}, ${name})
      RETURNING id, grade, class_num as "classNum", number, name, created_at as "timestamp"
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "저장에 실패했습니다." }, { status: 500 });
  }
}
