import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const questions = await sql`SELECT id, content, answer, created_at as "timestamp" FROM questions ORDER BY created_at DESC`;
    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    if (!content) return NextResponse.json({ error: "질문 내용을 입력해주세요." }, { status: 400 });
    const result = await sql`INSERT INTO questions (content) VALUES (${content}) RETURNING id, content, created_at as "timestamp"`;
    return NextResponse.json(result[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
