"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/ui/header";
import Tab from "@/components/ui/tab";

const ResultPage = () => {
  const [shops, setShops] = useState<any[]>([]);

  // 画像 URL を安全に取得するユーティリティ
  const getSafeLogoImage = (shop: any) => {
    const photoUrl =
      shop.photo?.pc?.l ||
      shop.photo?.pc?.m ||
      shop.photo?.pc?.s ||
      shop.logo_image;

    if (!photoUrl || photoUrl.includes("noimage.jpg")) {
      return "https://placehold.jp/150x150.png";
    }

    return photoUrl.replace("http://", "https://");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("keyword") || "";
    fetchResults(keyword);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResults = async (keyword: string) => {
    const res = await fetch("/api/hotpepper", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword }),
    });

    const result = await res.json();
    console.log("📦 result:", result);

    const data = Array.isArray(result) ? result : [];

    console.log("👀 結果のJSON:", result);

    const keywordParts = keyword.toLowerCase().split(/\s+/); // スペースで分割

    let filtered = data.filter((shop: any) => {
      const targetText = (
        `${shop.name} ${shop.genre ?? ""} ${shop.address} ${shop.station ?? ""} ` +
        `${shop.catch ?? ""} ${shop.small_area ?? ""}`
      ).toLowerCase();

      // AND 条件（キーワードすべてを含む）
      return keywordParts.every((kw) => targetText.includes(kw));
    });

    // AND 条件で 3 件未満なら OR 条件で候補を追加
    if (filtered.length < 3) {
      filtered = data.filter((shop: any) => {
        const targetText = (
          `${shop.name} ${shop.genre ?? ""} ${shop.address} ${shop.station ?? ""} ` +
          `${shop.catch ?? ""} ${shop.small_area ?? ""}`
        ).toLowerCase();
        return keywordParts.some((kw) => targetText.includes(kw));
      });
    }

    setShops(filtered || []);
    // filtered.forEach((shop: any) => {
    //   console.log("🖼️ 画像URL:", shop.logo_image);
    // });
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />

      {/* --- scrollable content area --- */}
      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="mb-4 text-xl font-bold">検索結果</h1>
        {shops.length === 0 ? (
          <p>該当するお店が見つかりませんでした。</p>
        ) : (
          <div>
            <main className="grid grid-cols-1 gap-4">
              {shops.map((shop) => {
                console.log("🖼️ logo_image:", shop.logo_image);
                // console.log("🖼️ photo?.pc?.l:", shop.photo?.pc?.l);
                // console.log("🖼️ 画像URL:", getSafeLogoImage(shop));
                return (
                  <Link
                    key={shop.id}
                    href={`/detail/${shop.id}`}
                    className="block rounded-md border bg-white p-4 shadow-sm hover:bg-gray-50"
                  >
                    <div className="flex">
                      <Image
                        src={
                          shop.image
                            ? shop.image.replace("http://", "https://")
                            : "https://placehold.jp/150x150.png"
                        }
                        alt={shop.name}
                        width={96}
                        height={96}
                        unoptimized
                        className="mr-4 h-24 w-24 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold">{shop.name}</h2>
                        <p className="text-sm text-gray-600">
                          ⭐ {shop.rating || "4.0"}（食べログ評価）
                        </p>
                        <p className="text-sm text-gray-600">
                          {shop.station || "駅"} /{" "}
                          {shop.genre || "ジャンル不明"}
                        </p>
                        <p className="text-sm text-gray-600">
                          ¥{shop.budget?.average || "0,000"}〜¥
                          {shop.budget?.average || "0,000"}円
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </main>
          </div>
        )}
      </div>

      {/* --- bottom navigation tab fixed --- */}
      <Tab />
    </div>
  );
};

export default ResultPage;
