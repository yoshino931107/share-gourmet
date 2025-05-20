import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let keyword = "";
  let genre = "";
  let small_area = "";
  let id = "";

  try {
    const body = await req.json();
    keyword = body.keyword || "";
    genre = body.genre || "";
    small_area = body.small_area || "";
    id = body.id || "";
  } catch (error) {
    console.error("🔥 リクエストボディの解析に失敗しました:", error);
  }

  console.log("🛑 API HIT!");
  console.log("📦 受け取ったパラメータ:", { keyword, genre, small_area });

  const apiKey =
    process.env.HOTPEPPER_API_KEY || process.env.NEXT_PUBLIC_HOTPEPPER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが見つかりません" },
      { status: 500 },
    );
  }

  const url =
    `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}` +
    (id ? `&id=${id}` : "") + // ←追加！
    (keyword ? `&keyword=${encodeURIComponent(keyword)}` : "") +
    (genre ? `&genre=${genre}` : "") +
    (small_area ? `&small_area=${small_area}` : "") +
    `&count=30&format=json`;

  let res;

  try {
    res = await fetch(url);
    console.log("📦 受け取ったパラメータ:", { keyword, genre, small_area });
  } catch (error) {
    console.error("🔥 Fetch処理中にエラーが発生しました:", error);
    return NextResponse.json(
      { error: "データ取得中にエラーが発生しました" },
      { status: 500 },
    );
  }

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (err) {
      errorData = { message: "レスポンスJSONパース失敗" };
    }

    console.error("🔥 Hotpepper fetch failed:", res.status, errorData);
    return NextResponse.json(
      { error: "APIリクエストに失敗しました", details: errorData },
      { status: res.status },
    );
  }

  const data = await res.json();
  const keywordLower = typeof keyword === "string" ? keyword.toLowerCase() : "";
  const shops = data.results?.shop || [];

  // let filtered = [];
  // try {
  //   filtered = shops.filter((shop: any) => {
  //     const combined =
  //       `${shop?.name || ""} ${shop?.genre?.name || ""} ${shop?.address || ""} ${shop?.station_name || ""} ${shop?.catch || ""}`.toLowerCase();
  //     return keywordLower.split(/\s+/).some((kw) => combined.includes(kw));
  //   });

  //   console.log("📦 Filtered results count:", filtered.length);
  // } catch (err) {
  //   console.error("🔥 フィルター処理中にエラーが発生しました:", err);
  //   return NextResponse.json(
  //     { error: "フィルター処理中にエラーが発生しました" },
  //     { status: 500 },
  //   );
  // }

  const filtered = shops; // フィルター処理をスキップ
  console.log("📦 全件返却:", filtered.length);

  try {
    const minimalShops = filtered.map((shop: any) => {
      const imageUrl =
        [
          shop.photo?.pc?.l,
          shop.photo?.pc?.m,
          shop.photo?.mobile?.l,
          shop.photo?.mobile?.s,
          shop.logo_image,
        ].find((url) => typeof url === "string" && url.includes("hotp.jp")) ||
        null;
      ("https://placehold.jp/150x150.png");
      console.log("🖼️ imageUrl:", imageUrl);

      return {
        id: shop.id,
        name: shop.name,
        image_url: imageUrl,
        genre: shop.genre?.name,
        address: shop.address,
        station: shop.station_name,
        budget: shop.budget?.average,
        middle_area: shop.middle_area?.name,
      };
    });

    return NextResponse.json(minimalShops, { status: 200 });
  } catch (error) {
    console.error("🔥 最小データ返却時にエラーが発生しました:", error);
    return NextResponse.json(
      { error: "データ返却エラー", details: String(error) },
      { status: 500 },
    );
  }
}
