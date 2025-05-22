// Supabase service‑role client for server‑side inserts / upserts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ←必ず service_role
  );

  async function main() {
    // latitude が null の行だけ取得 → 全件取得に変更
    const { data: rows, error } = await supabase
      .from("shared_shops")
      .select("id, hotpepper_id, latitude, longitude");

    if (error) throw error;
    console.log(`Total rows: ${rows.length}`);

    for (const row of rows) {
      // ▽ Hotpepper API へ「id=hotpepper_id」で再リクエスト
      const res = await fetch(
        `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${process.env.HOTPEPPER_API_KEY}&id=${row.hotpepper_id}&format=json`,
      );
      const json = await res.json();
      const shop = json.results.shop?.[0];
      if (!shop) continue;

      const lat = Number.isFinite(+shop.lat) ? parseFloat(shop.lat) : null;
      const lng = Number.isFinite(+shop.lng) ? parseFloat(shop.lng) : null;

      console.log("🌸 shop:", shop);

      await supabase.from("shared_shops").upsert(
        {
          hotpepper_id: shop.id,
          name: shop.name,
          latitude: lat,
          longitude: lng,
          genre: shop.genre?.name ?? null, // ジャンル名
          genre_code: shop.genre?.code ?? null, // ジャンルコード
          budget: shop.budget?.average ?? null, // 平均予算（ディナー中心）
          budget_name: shop.budget?.name ?? null, // 予算名
          budget_code: shop.budget?.code ?? null, // 予算コード
        },
        { onConflict: "hotpepper_id" },
      );

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        await supabase
          .from("shared_shops")
          .update({ latitude: lat, longitude: lng })
          .eq("id", row.id);
        console.log(`✅ updated ${row.hotpepper_id}`);
      }
    }

    console.log("done");
  }

  main().catch(console.error);
  await main();

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
    } catch {
      errorData = { message: "レスポンスJSONパース失敗" };
    }

    console.error("🔥 Hotpepper fetch failed:", res.status, errorData);
    return NextResponse.json(
      { error: "APIリクエストに失敗しました", details: errorData },
      { status: res.status },
    );
  }

  const data = await res.json();
  // Removed unused variable 'keywordLower'
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
    const minimalShops = await Promise.all(
      filtered.map(async (shop: any) => {
        const imageUrl =
          [
            shop.photo?.pc?.l,
            shop.photo?.pc?.m,
            shop.photo?.mobile?.l,
            shop.photo?.mobile?.s,
            shop.logo_image,
          ].find((url) => typeof url === "string" && url.includes("hotp.jp")) ||
          null;

        const latRaw = shop.lat ?? shop.latitude ?? "";
        const lngRaw = shop.lng ?? shop.longitude ?? "";

        const latitude = shop.lat ? parseFloat(shop.lat) : null;
        const longitude = shop.lng ? parseFloat(shop.lng) : null;

        console.log("hotpepper lat/lng", shop.lat, shop.lng);

        // center 決定
        const first = shops.find(
          (s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude),
        );
        const center = first
          ? { lat: first.latitude, lng: first.longitude }
          : { lat: 35.681236, lng: 139.767125 }; // ←東京駅などデフォルト

        // === Supabase upsert: hotpepper_id がキー ===
        await supabase.from("shared_shops").upsert(
          {
            hotpepper_id: shop.id,
            name: shop.name,
            latitude,
            longitude,
            genre: shop.genre?.name ?? null, // ジャンル名
            genre_code: shop.genre?.code ?? null, // ジャンルコード
            budget: shop.budget?.average ?? null, // 平均予算（ディナー中心）
            budget_name: shop.budget?.name ?? null, // 予算名
            budget_code: shop.budget?.code ?? null, // 予算コード
          },
          { onConflict: "hotpepper_id" },
        );

        return {
          id: shop.id,
          name: shop.name,
          image_url: imageUrl,
          genre: shop.genre?.name, // ← ジャンル名（従来通り）
          genre_code: shop.genre?.code, // ← ジャンルコードも必要なら
          address: shop.address,
          station: shop.station_name,
          // ▼ ここから追加（予算系）
          budget: shop.budget?.average, // ← 平均予算（ディナー中心）
          budget_name: shop.budget?.name, // ← 予算ジャンル名
          budget_code: shop.budget?.code, // ← 予算コード
          lunch: shop.lunch?.average, // ← ランチ予算（ここ重要！）
          middle_area: shop.middle_area?.name,
          latitude,
          longitude,
        };
      }),
    );

    return NextResponse.json(minimalShops, { status: 200 });
  } catch (error) {
    console.error("🔥 最小データ返却時にエラーが発生しました:", error);
    return NextResponse.json(
      { error: "データ返却エラー", details: String(error) },
      { status: 500 },
    );
  }
}
