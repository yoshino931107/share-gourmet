// resultページではグループ関係なく全てのお店を表示する
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

type Shop = {
  id: string;
  name: string;
  image_url: string | null;
  genre: string | null;
  url: string | null;
  address: string | null;
};

type ResultClientProps = {
  className?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getAllShops() {
  const { data, error } = await supabase.from("shared_shops").select("*");

  if (error) {
    throw error;
  }

  return data || [];
}

const ResultClient: React.FC<ResultClientProps> = ({ className }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    getAllShops()
      .then((data) => {
        setShops(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleShopClick = (shopId: string) => {
    router.push(`/shop/${shopId}`);
  };

  function getImageUrl(url?: string | null): string {
    if (url && !url.includes("noimage.jpg")) {
      return url.replace("http://", "https://");
    }
    return "https://placehold.jp/150x150.png";
  }

  return (
    <div className={className}>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="text-lg text-gray-500">Loading...</span>
          </div>
        ) : (
          <ul className="space-y-4">
            {shops.map((shop) => {
              return (
                <li
                  key={shop.id}
                  className="flex cursor-pointer rounded-lg bg-white p-4 shadow-md transition hover:bg-gray-50"
                  onClick={() => handleShopClick(shop.id)}
                >
                  <Image
                    src={getImageUrl(shop.image_url)}
                    alt={shop.name}
                    width={96}
                    height={96}
                    className="mr-4 h-24 w-24 flex-shrink-0 rounded-md object-cover"
                    unoptimized
                  />
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{shop.name}</h3>
                      {shop.genre && (
                        <span className="text-sm text-gray-500">
                          {shop.genre}
                        </span>
                      )}
                    </div>
                    {shop.address && (
                      <div className="mt-2 text-xs text-gray-400">
                        {shop.address}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
            {!loading && shops.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                お店が見つかりませんでした
              </div>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ResultClient;
