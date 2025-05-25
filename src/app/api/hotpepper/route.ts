import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export interface Photo {
  pc?: {
    l?: string;
    m?: string;
    s?: string;
  };
  mobile?: {
    l?: string;
    s?: string;
  };
}

// API返却・アプリ全体で共通利用する「お店データ型」
export interface HotPepperShop {
  id: string;
  hotpepper_id: string;
  name: string;
  image_url: string | null;
  genre: string | { name: string; code: string } | null;
  genre_code: string | { name: string; code: string } | null;
  address: string | null;
  station: string | null;
  budget: string | { name: string; code: string } | null;
  budget_name: string | { name: string; code: string } | null;
  budget_code: string | { name: string; code: string } | null;
  middle_area: string | { name: string } | null;
  latitude: string | null;
  longitude: string | null;
  lat?: string | null;
  lng?: string | null;
  station_name?: string | null;
  photo?: Photo;
  logo_image?: string;
}

export async function POST(req: Request) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "ログインしてください" },
      { status: 401 },
    );
  }

  let ids: string[] = [];
  let keyword = "";
  let genre = "";
  let small_area = "";
  let id = "";

  try {
    const body = await req.json();
    ids = body.ids || [];
    keyword = body.keyword || "";
    genre = body.genre || "";
    small_area = body.small_area || "";
    id = body.id || "";
  } catch (error) {
    console.error("🔥 リクエストボディの解析に失敗しました:", error);
  }

  const apiKey =
    process.env.HOTPEPPER_API_KEY || process.env.NEXT_PUBLIC_HOTPEPPER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが見つかりません" },
      { status: 500 },
    );
  }

  // 複数IDでまとめて取得するロジック
  if (Array.isArray(ids) && ids.length > 0) {
    const results: Record<string, HotPepperShop> = {};
    for (const hotpepperId of ids) {
      const url = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}&id=${hotpepperId}&format=json`;
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        const shop = data.results?.shop?.[0];
        if (!shop) continue;

        const imageUrl =
          [
            shop.photo?.pc?.l,
            shop.photo?.pc?.m,
            shop.photo?.mobile?.l,
            shop.photo?.mobile?.s,
            shop.logo_image,
          ].find(
            (url: string) => typeof url === "string" && url.includes("hotp.jp"),
          ) || null;

        const latitude = shop.lat ? parseFloat(shop.lat) : null;
        const longitude = shop.lng ? parseFloat(shop.lng) : null;

        // Supabase upsert: hotpepper_id がキー
        await supabase.from("shared_shops").upsert(
          {
            hotpepper_id: shop.id,
            name: shop.name,
            latitude,
            longitude,
            genre: shop.genre?.name ?? null,
            genre_code: shop.genre?.code ?? null,
            budget: shop.budget?.average ?? null,
            budget_name: shop.budget?.name ?? null,
            budget_code: shop.budget?.code ?? null,
          },
          { onConflict: "hotpepper_id" },
        );

        results[hotpepperId] = {
          hotpepper_id: shop.id,
          id: shop.id,
          name: shop.name,
          image_url: imageUrl,
          genre: shop.genre?.name,
          genre_code: shop.genre?.code,
          address: shop.address,
          station: shop.station_name,
          budget: shop.budget?.average,
          budget_name: shop.budget?.name,
          budget_code: shop.budget?.code,
          middle_area: shop.middle_area?.name,
          latitude: shop.lat ?? null,
          longitude: shop.lng ?? null,
        };
      } catch (e) {
        console.warn("🔥 ID単体取得エラー:", hotpepperId, e);
        continue;
      }
    }
    return NextResponse.json(results, { status: 200 });
  }

  // （従来通りの単体検索: id, keyword, genre, small_area）
  const url =
    `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${apiKey}` +
    (id ? `&id=${id}` : "") +
    (keyword ? `&keyword=${encodeURIComponent(keyword)}` : "") +
    (genre ? `&genre=${genre}` : "") +
    (small_area ? `&small_area=${small_area}` : "") +
    `&count=30&format=json`;

  let res;

  try {
    res = await fetch(url);
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

    return NextResponse.json(
      { error: "APIリクエストに失敗しました", details: errorData },
      { status: res.status },
    );
  }

  const data = await res.json();
  const shops = data.results?.shop || [];
  const filtered = shops;

  try {
    const minimalShops = await Promise.all(
      filtered.map(async (shop: HotPepperShop) => {
        const imageUrl =
          [
            shop.photo?.pc?.l,
            shop.photo?.pc?.m,
            shop.photo?.mobile?.l,
            shop.photo?.mobile?.s,
            shop.logo_image,
          ].find(
            (url: string | undefined) =>
              typeof url === "string" && url.includes("hotp.jp"),
          ) || null;

        const latitude = shop.lat ? parseFloat(shop.lat) : null;
        const longitude = shop.lng ? parseFloat(shop.lng) : null;

        await supabase.from("shared_shops").upsert(
          {
            hotpepper_id: shop.id,
            name: shop.name,
            latitude,
            longitude,
            genre:
              typeof shop.genre === "object" && shop.genre !== null
                ? shop.genre.name
                : (shop.genre ?? null),
            genre_code:
              typeof shop.genre === "object" && shop.genre !== null
                ? shop.genre.code
                : null,
            budget:
              typeof shop.budget === "object" && shop.budget !== null
                ? shop.budget.name
                : (shop.budget ?? null),
            budget_name:
              typeof shop.budget === "object" && shop.budget !== null
                ? shop.budget.name
                : null,
            budget_code:
              typeof shop.budget === "object" && shop.budget !== null
                ? shop.budget.code
                : null,
          },
          { onConflict: "hotpepper_id" },
        );

        return {
          id: shop.id,
          name: shop.name,
          image_url: imageUrl,
          genre:
            typeof shop.genre === "object" && shop.genre !== null
              ? shop.genre.name
              : (shop.genre ?? null),
          genre_code:
            typeof shop.genre === "object" && shop.genre !== null
              ? shop.genre.code
              : null,
          address: shop.address,
          station: shop.station_name,
          budget:
            typeof shop.budget === "object" && shop.budget !== null
              ? shop.budget.name
              : (shop.budget ?? null),
          budget_name:
            typeof shop.budget === "object" && shop.budget !== null
              ? shop.budget.name
              : (shop.budget ?? null),
          budget_code:
            typeof shop.budget === "object" && shop.budget !== null
              ? shop.budget.code
              : null,
          middle_area:
            typeof shop.middle_area === "object" && shop.middle_area !== null
              ? shop.middle_area.name
              : (shop.middle_area ?? null),
          latitude,
          longitude,
        };
      }),
    );

    return NextResponse.json(minimalShops, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "データ返却エラー", details: String(error) },
      { status: 500 },
    );
  }
}
