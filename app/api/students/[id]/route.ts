import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/* ===================================
   학생 정보 삭제 API Route (DELETE)
   =================================== */

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM students WHERE id = ${id}`;
    return NextResponse.json({ message: "삭제되었습니다." });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }
}
