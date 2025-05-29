import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  console.log('[API] /api/posts/tags/[slug] 진입:', params.slug);
  return NextResponse.json({ message: `API 진입: ${params.slug}` });
} 