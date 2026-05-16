import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const polls = await sql`SELECT id, title, options, is_active as "isActive", created_at as "timestamp" FROM polls ORDER BY created_at DESC`;
    return NextResponse.json(polls);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, options } = await request.json();
    if (!title || !options || options.length < 2) return NextResponse.json({ error: "제목과 2개 이상의 선택지를 입력해주세요." }, { status: 400 });
    const optionsJson = JSON.stringify(options.map((text: string) => ({ text, votes: 0 })));
    const result = await sql`INSERT INTO polls (title, options) VALUES (${title}, ${optionsJson}::jsonb) RETURNING id, title, options, is_active as "isActive"`;
    return NextResponse.json(result[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
