import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const images = await sql`SELECT id, title, image_url as "imageUrl", created_at as "timestamp" FROM gallery ORDER BY created_at DESC`;
    return NextResponse.json(images);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, imageUrl } = await request.json();
    if (!title || !imageUrl) return NextResponse.json({ error: "제목과 이미지 URL을 입력해주세요." }, { status: 400 });
    const result = await sql`INSERT INTO gallery (title, image_url) VALUES (${title}, ${imageUrl}) RETURNING id, title, image_url as "imageUrl"`;
    return NextResponse.json(result[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
