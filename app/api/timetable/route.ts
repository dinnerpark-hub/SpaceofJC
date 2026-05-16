import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql`SELECT id, day_of_week as "dayOfWeek", period, subject FROM timetable ORDER BY day_of_week, period`;
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { dayOfWeek, period, subject } = await request.json();
    const result = await sql`
      INSERT INTO timetable (day_of_week, period, subject) VALUES (${dayOfWeek}, ${period}, ${subject})
      ON CONFLICT (day_of_week, period) DO UPDATE SET subject = ${subject}
      RETURNING id, day_of_week as "dayOfWeek", period, subject
    `;
    return NextResponse.json(result[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
