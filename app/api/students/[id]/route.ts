import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/* ===================================
   학생 정보 삭제 API Route (DELETE)
   =================================== */

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await sql`DELETE FROM students WHERE id = ${id}`;
    return NextResponse.json({ message: "삭제되었습니다." });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }
}
