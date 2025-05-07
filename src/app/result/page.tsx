"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/ui/header";
import ResultPhoto from "@/components/ui/ResultPhoto";
import HorizontalLine from "@/components/ui/horizontalLine";
import Tab from "@/components/ui/tab";

const Result = () => {
  const [mounted, setMounted] = useState(false);
  const [shops, setShops] = useState([]);
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!keyword) return;

    const fetchResults = async () => {
      const res = await fetch("/api/hotpepper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword }),
      });

      const result = await res.json();
      const data = Array.isArray(result.results?.shop)
        ? result.results.shop
        : [];

      console.log("👀 結果のJSON:", result);
      console.log("👀 result.results:", result.results);
      console.log("👀 result.results.shop:", result.results?.shop);

      const filtered = data.filter((shop: any) => {
        const lowerKeyword = keyword.toLowerCase();
        const nameAndAddress =
          `${shop.name} ${shop.genre?.name} ${shop.address} ${shop.small_area?.name}`.toLowerCase();
        return nameAndAddress.includes(lowerKeyword);
      });

      setShops(filtered || []);
    };

    fetchResults();
  }, [keyword]);

  if (!mounted) return null;

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />
      <main className="overflow-y-auto bg-gray-50">
        {shops.map((shop, index) => (
          <div key={index}>
            <div className="flex items-start p-4">
              <ResultPhoto
                src={shop.photo?.pc?.l || "https://placehold.jp/150x150.png"}
                alt={shop.name}
              />
              <div className="ml-4 flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {shop.name}
                </h2>
                <div className="flex items-center">
                  <span className="mt-0.5 mr-2 text-base text-rose-500">
                    ★★★★☆ 4.0
                  </span>
                </div>
                <div className="mt-0.5 flex text-sm text-gray-700">
                  <span className="mr-2">{shop.station_name}</span>
                  <span className="mr-2">/</span>
                  <span>{shop.genre?.name}</span>
                </div>
                <span className="mt-1 text-sm text-gray-700">
                  ☀️{shop.lunch || "昼予算不明"}
                </span>
                <br />
                <span className="text-sm text-gray-700">
                  🌙{shop.budget?.name || "夜予算不明"}
                </span>
              </div>
            </div>
            <HorizontalLine />
          </div>
        ))}
      </main>
      <Tab />
    </div>
  );
};

export default Result;
