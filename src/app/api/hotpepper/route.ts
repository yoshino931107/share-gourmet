import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { keyword } = await req.json();
  const apiKey = process.env.HOTPEPPER_API_KEY;

  const url = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&keyword=${encodeURIComponent(keyword)}&format=json`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error("🔥 Hotpepper fetch failed:", res.status);
      return NextResponse.json([], { status: res.status });
    }

    const data = await res.json();

    console.log("📦 Hotpepper response data:", data);

    return NextResponse.json({ shops: data.results.shop || [] });
  } catch (error) {
    console.error("🔥 Error fetching Hotpepper API:", error);
    return NextResponse.json([], { status: 500 });
  }
}
