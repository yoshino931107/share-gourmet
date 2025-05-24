"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Tab from "@/components/ui/Tab";
import { supabase } from "@/utils/supabase/supabase";
import { useRouter } from "next/navigation";

interface HotPepperShop {
  id: string;
  hotpepper_id: string;
  name: string;
  address: string;
  genre?: string;
  budget?: string;
  image_url?: string;
  photo?: {
    pc?: { l?: string; m?: string; s?: string };
    mobile?: { l?: string; s?: string };
    logo_image?: string;
  };
  logo_image?: string;
  station?: string;
  catch?: string;
  small_area?: string;
}

const ResultPage = () => {
  // ★ 仮のグループ ID（後でドロップダウンで選択した値などに置き換える）
  const dummyGroupId = "11111111-1111-1111-1111-111111111111";
  const [shops, setShops] = useState<HotPepperShop[]>([]);
  const router = useRouter(); // ←追加

  // 画像 URL を安全に取得するユーティリティ
  const getSafeLogoImage = (shop: HotPepperShop) => {
    const photoUrl =
      shop.photo?.pc?.l ||
      shop.photo?.pc?.m ||
      shop.photo?.pc?.s ||
      shop.logo_image ||
      shop.image_url; // ← ここでsupabaseに保存されているものも考慮

    if (!photoUrl || photoUrl.includes("noimage.jpg")) {
      return "https://placehold.jp/150x150.png";
    }
    return photoUrl.replace("http://", "https://");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("keyword") || "";
    fetchResults(keyword);
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

    let filtered = data.filter((shop: HotPepperShop) => {
      const targetText = (
        `${shop.name} ${shop.genre ?? ""} ${shop.address} ${shop.station ?? ""} ` +
        `${shop.catch ?? ""} ${shop.small_area ?? ""}`
      ).toLowerCase();

      // AND 条件（キーワードすべてを含む）
      return keywordParts.every((kw) => targetText.includes(kw));
    });

    // AND 条件で 3 件未満なら OR 条件で候補を追加
    if (filtered.length < 3) {
      filtered = data.filter((shop: HotPepperShop) => {
        const targetText = (
          `${shop.name} ${shop.genre ?? ""} ${shop.address} ${shop.station ?? ""} ` +
          `${shop.catch ?? ""} ${shop.small_area ?? ""}`
        ).toLowerCase();
        return keywordParts.some((kw) => targetText.includes(kw));
      });
    }

    setShops(filtered || []);
    // filtered.forEach((shop: HotPepperShop) => {
    //   console.log("🖼️ 画像URL:", shop.logo_image);
    // });
  };

  const [isNavigating, setIsNavigating] = useState(false);

  const handleClickAndNavigate = async (shop: HotPepperShop) => {
    if (isNavigating) return; // ← すでに遷移中なら無視！
    setIsNavigating(true); // ← 遷移開始！

    // TODO: dummyGroupId を実際に選択されたグループ ID に置き換える
    try {
      const { error } = await supabase.from("shared_shops").upsert(
        {
          hotpepper_id: shop.id,
          group_id: dummyGroupId, // ← 複合 UNIQUE に含まれる列も同時に保存
          name: shop.name,
          address: shop.address,
          image_url: getSafeLogoImage(shop),
        },
        { onConflict: "hotpepper_id,group_id" }, // ← 複合 UNIQUE キーを文字列で指定
      );

      if (error) {
        console.error("🔥 upsert error:", error);
      } else {
        console.log("✅ 保存成功:", shop.id);
      }
    } catch (e) {
      console.error("🚨 upsert exception:", e);
    }

    router.push(`/detail/${shop.id}`);
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      {/* --- scrollable content area --- */}
      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="mb-4 text-xl font-bold">検索結果</h1>
        {shops.length === 0 ? (
          <p>該当するお店が見つかりませんでした。</p>
        ) : (
          <div>
            <main className="grid grid-cols-1 gap-4">
              {shops.map((shop, index) => {
                console.log(`🔍 shop[${index}]:`, shop);
                console.log("🖼️ logo_image:", shop.logo_image);
                // console.log("🖼️ photo?.pc?.l:", shop.photo?.pc?.l);
                // console.log("🖼️ 画像URL:", getSafeLogoImage(shop));
                return (
                  <div
                    key={shop.id}
                    onClick={() => handleClickAndNavigate(shop)}
                    className="block cursor-pointer rounded-md border bg-white p-4 shadow-sm hover:bg-gray-50"
                  >
                    <div className="flex">
                      <Image
                        src={getSafeLogoImage(shop)}
                        alt={shop.name}
                        width={96}
                        height={96}
                        unoptimized
                        className="mr-4 h-24 w-24 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold">{shop.name}</h2>
                        <p className="text-sm text-gray-600">
                          {shop.station || "駅"} /{" "}
                          {shop.genre || "ジャンル不明"}
                        </p>
                      </div>
                    </div>
                  </div>
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
