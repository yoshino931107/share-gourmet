/**
 * @fileoverview
 * 検索ページ（/search）のクライアントコンポーネント。
 * - 入力欄でキーワード検索し、APIから店舗一覧を取得・表示
 * - おすすめのお店も初回マウント時に取得・表示
 * - 画像プレースホルダー対応、ジャンル・エリア変換マップあり
 */
"use client";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/ui/Header";
import Tab from "@/components/ui/Tab";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

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

/**
 * HotPepper店舗URLからID（strJ*********）を抽出するユーティリティ関数
 */
function extractHotpepperIdFromUrl(url: string): string | null {
  const match = url.match(/\/str(J\d{9})\//);
  return match ? match[1] : null;
}

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [recommendedShops, setRecommendedShops] = useState<HotPepperShop[]>([]);
  const [searchWord, setSearchWord] = useState("");

  /**
   * 店舗オブジェクトから安全な画像URLを取得
   */
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

  useEffect(() => {
    /**
     * 初回マウント時におすすめの店舗リストをAPIから取得
     */
    const fetchRecommendedShops = async () => {
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

      const data = await res.json();
      const shops = Array.isArray(data) ? data : [];
      setRecommendedShops(shops.slice(0, 36));
    };

    fetchRecommendedShops();
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

  /**
   * キーワードからAPIに渡すbodyオブジェクトを構築
   */
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
    return body;
  };

  /**
   * 検索ワードでAPIを叩いて店舗一覧を取得＆state更新
   */
  const fetchData = async (keyword: string) => {
    if (!keyword.trim()) return;

    // URLの場合は個別店舗ページへ遷移
    const id = extractHotpepperIdFromUrl(keyword.trim());
    if (id) {
      router.push(`/shop/${id}`);
      return;
    }

    const searchBody = {
      ...buildSearchBody(keyword),
      count: 30,
    };

    const res = await fetch("/api/hotpepper", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchBody),
    });

    const data = await res.json();
    const shops: HotPepperShop[] = Array.isArray(data) ? data : [];
    setRecommendedShops(shops.slice(0, 36));
  };

  useEffect(() => {
    if (searchParams.get("status") === "already_logged_in") {
      alert("ログイン済みです");
    }
  }, [searchParams]);

  // ---- UI描画部 ----
  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />
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
            <div className="mb-20 grid grid-cols-3 gap-px bg-gray-300">
              {recommendedShops.map((shop) => {
                return (
                  <Link href={`/detail/${shop.id}`} key={shop.id}>
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
