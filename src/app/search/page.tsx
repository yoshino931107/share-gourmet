"use client";
import Link from "next/link";
import Image from "next/image";
import Tab from "@/components/ui/Tab";
import { useRouter } from "next/navigation";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

interface HotPepperShop {
  id: string;
  hotpepper_id: string;
  name: string;
  address: string;
  genre?: string;
  budget?: string;
  image_url?: string;
  image: string;
  logo_image?: string;
  keyword?: string;
  photo?: {
    pc?: { l?: string; m?: string; s?: string };
    mobile?: { l?: string; s?: string };
  };
}
import { useEffect, useState } from "react";

function extractHotpepperIdFromUrl(url: string): string | null {
  const match = url.match(/\/str(J\d{9})\//);
  return match ? match[1] : null;
}

export default function SearchPage() {
  // const [searchWord, setSearchWord] = useState("");

  // const [hotpepperResults, setHotpepperResults] = useState([]);

  const router = useRouter();

  const [recommendedShops, setRecommendedShops] = useState<HotPepperShop[]>([]);

  const [searchWord, setSearchWord] = useState("");

  // HotPepper 画像URLを安全に取得
  const getSafeLogoImage = (shop: HotPepperShop) => {
    const photoUrl =
      shop.image_url ||
      shop.image ||
      shop?.photo?.pc?.l ||
      shop?.photo?.pc?.m ||
      shop?.photo?.pc?.s ||
      shop?.logo_image;

    if (!photoUrl || photoUrl.includes("noimage.jpg")) {
      return "https://placehold.jp/150x150.png";
    }
    return photoUrl.startsWith("http")
      ? photoUrl.replace("http://", "https://")
      : photoUrl;
  };

  // const router = useRouter();
  // const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchRecommendedShops = async () => {
      console.log(recommendedShops);
      const res = await fetch("/api/hotpepper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: "カフェ", // デフォルトで「カフェ」を指定
          genre: "G014", // カフェ・スイーツ
          count: 30,
        }),
      });

      if (!res.ok) {
        console.error("🔥 おすすめ店舗取得失敗:", res.status);
        return;
      }

      const data = await res.json();
      const shops = Array.isArray(data) ? data : [];
      setRecommendedShops(shops.slice(0, 12));
    };

    fetchRecommendedShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ジャンル名→ジャンルコード変換マップ
  const genreMap: { [key: string]: string } = {
    カフェ: "G014",
    居酒屋: "G001",
    和食: "G004",
    洋食: "G005",
    中華: "G006",
    焼肉: "G008",
    韓国料理: "G017",
    イタリアン: "G006",
    フレンチ: "G007",
    バー: "G002",
    ベーカリー: "G016",
    ヘルシー: "G012",
  };

  // エリア名 → small_area コード変換マップ
  const areaMap: { [key: string]: string } = {
    渋谷: "Z011",
    新宿: "Z002",
    池袋: "Z003",
    表参道: "Z014",
    吉祥寺: "Z006",
    原宿: "Z012",
    恵比寿: "Z010",
    中目黒: "Z013",
  };

  const buildSearchBody = (search: string) => {
    const parts = search.trim().split(/\s+/);
    const genreKey = parts[0];
    const locationKey = parts[1] || "";

    const genreCode = genreMap[genreKey];
    const areaCode = areaMap[locationKey];

    const keywordParts: string[] = [];
    if (!genreCode) keywordParts.push(genreKey);
    if (!areaCode) keywordParts.push(locationKey);

    const body: HotPepperShop = {
      id: "",
      hotpepper_id: "",
      name: "",
      address: "",
      keyword: keywordParts.join(" "),
      image: "",
    };

    if (genreCode) {
      body.genre = genreCode;
    }

    // small_area（駅コード）は送らず、フロント側の AND フィルターで判定

    return body;
  };

  const fetchData = async (keyword: string) => {
    if (!keyword.trim()) return;

    // URLの場合は個別店舗ページへ遷移
    const id = extractHotpepperIdFromUrl(keyword.trim());
    if (id) {
      router.push(`/shop/${id}`);
      return;
    }

    // 🔍 入力されたキーワードを解析して body を作成
    const searchBody = {
      ...buildSearchBody(keyword),
      count: 30, // 最大30件取得
    };

    const res = await fetch("/api/hotpepper", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchBody),
    });

    if (!res.ok) {
      console.error("🔥 API error:", res.status);
      return;
    }

    const data = await res.json();
    const shops: HotPepperShop[] = Array.isArray(data) ? data : [];

    setRecommendedShops(shops.slice(0, 12));
  };

  // 検索ワードによるおすすめ店舗の再取得を防ぐため、searchWordを依存配列から除外
  // useEffect(() => {
  //   if (searchWord.trim() === "") return;
  //   fetchData(searchWord);
  // }, [searchWord]);

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <main className="flex-1 overflow-y-auto bg-gray-50 p-2">
        <div className="mt-2 mr-1.5 mb-5 ml-1.5 flex items-center rounded-xl border border-gray-300 bg-white px-1 py-1">
          <MagnifyingGlassIcon className="mr-2 h-7 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="お店を検索"
            className="w-full text-sm focus:outline-none"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchWord(e.currentTarget.value);
              }
            }}
          />
          <button
            onClick={() => {
              fetchData(searchWord);
              router.push(`/result?keyword=${encodeURIComponent(searchWord)}`);
            }}
            className="w-17 items-center rounded-lg bg-gray-500 px-2 py-2 text-sm font-semibold text-white active:bg-gray-600"
          >
            検索
          </button>
        </div>
        {recommendedShops.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 px-2 text-sm font-semibold text-gray-700">
              おすすめのお店
            </h2>
            <div className="grid grid-cols-3 gap-px bg-gray-300">
              {recommendedShops.map((shop) => {
                return (
                  <Link
                    href={`/detail/${shop.id}`}
                    key={shop.id}
                    onClick={() => console.log("▶︎ 遷移前 id:", shop.id)}
                  >
                    <div className="bg-white p-2">
                      <Image
                        src={getSafeLogoImage(shop)}
                        alt={shop.name || "お店"}
                        width={96}
                        height={96}
                        unoptimized
                        className="aspect-square w-full object-cover"
                      />
                      <div className="mt-1 truncate text-sm font-bold">
                        {shop.name || "名前不明"}
                      </div>
                      <div className="truncate text-xs text-gray-500">
                        {shop.genre || "ジャンル不明"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Tab />
    </div>
  );
}
