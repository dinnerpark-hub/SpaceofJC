import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await sql`SELECT id, title, target_date as "targetDate", created_at as "timestamp" FROM dday_events ORDER BY target_date ASC`;
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, targetDate } = await request.json();
    if (!title || !targetDate) return NextResponse.json({ error: "제목과 날짜를 입력해주세요." }, { status: 400 });
    const result = await sql`INSERT INTO dday_events (title, target_date) VALUES (${title}, ${targetDate}) RETURNING id, title, target_date as "targetDate"`;
    return NextResponse.json(result[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
