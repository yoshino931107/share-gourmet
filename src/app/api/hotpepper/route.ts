// app/api/hotpepper/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id } = await req.json();

  const res = await fetch(
    `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${process.env.NEXT_PUBLIC_HOTPEPPER_API_KEY}&id=${id}&format=json`,
  );

  const data = await res.json();
  return NextResponse.json(data.results.shop?.[0] || null);
}
