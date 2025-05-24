"use client";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/ui/Header";
import Tab from "@/components/ui/Tab"; // Tabのパスはプロジェクトに合わせて調整してください

interface Shop {
  id: string;
  hotpepper_id: string;
  name: string;
  image_url?: string;
}

interface ApiShopInfo {
  [hotpepper_id: string]: {
    genre?: string;
    middle_area?: string;
  };
}

interface Group {
  id: string;
  name: string;
}

interface ClientProps {
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string) => void;
  groups: Group[];
  filteredShops: Shop[];
  apiShopInfo: ApiShopInfo;
  fallbackImage: string;
}

export default function PrivateClient({
  selectedGroupId,
  setSelectedGroupId,
  groups,
  filteredShops,
  apiShopInfo,
  fallbackImage,
}: ClientProps) {
  // useSearchParams() など他のクライアントフックもここで使える

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="mx-auto flex h-screen max-w-md flex-col">
        <Header />
        {!selectedGroupId ? (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            loading...
          </div>
        ) : (
          <>
            {/* Group filter tabs */}
            <div className="flex justify-around border-t border-b bg-white px-4 py-2">
              {groups.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => setSelectedGroupId(id)}
                  className={`text-base font-semibold transition ${
                    selectedGroupId === id
                      ? "border-b-2 border-orange-400 text-orange-400"
                      : "text-gray-500 hover:text-orange-400"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* ---- スクロールエリア（リストのみ） ---- */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-2">
              {filteredShops.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-400">
                  まだシェアされたお店はありません
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-px bg-gray-50">
                  {filteredShops.map((shop) => {
                    return (
                      <Link
                        href={`/share-detail/${shop.id}`}
                        key={shop.hotpepper_id}
                      >
                        <div className="cursor-pointer border border-gray-300 bg-white p-1 transition hover:opacity-80">
                          <Image
                            src={shop?.image_url || fallbackImage}
                            alt={shop?.name ?? "no image"}
                            width={300}
                            height={300}
                            className="aspect-square w-full object-cover"
                            unoptimized
                          />
                          <p className="mt-1 truncate text-sm font-bold">
                            {shop.name}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {apiShopInfo[shop.hotpepper_id]?.genre ||
                              "ジャンル不明"}
                            <br />
                            {apiShopInfo[shop.hotpepper_id]?.middle_area ||
                              "エリア不明"}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </main>
          </>
        )}
        {/* ---- フッタータブ ---- */}
        <Tab />
      </div>
    </Suspense>
  );
}
