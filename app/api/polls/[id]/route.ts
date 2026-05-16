import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { optionIndex } = await request.json();
    const rows = await sql`SELECT options FROM polls WHERE id = ${id} AND is_active = true`;
    if (rows.length === 0) return NextResponse.json({ error: "투표를 찾을 수 없습니다." }, { status: 404 });
    const options = rows[0].options;
    options[optionIndex].votes += 1;
    await sql`UPDATE polls SET options = ${JSON.stringify(options)}::jsonb WHERE id = ${id}`;
    return NextResponse.json({ options });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM polls WHERE id = ${id}`;
    return NextResponse.json({ message: "삭제됨" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
