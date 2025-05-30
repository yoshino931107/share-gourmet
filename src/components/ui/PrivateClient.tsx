"use client";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import Header from "@/components/ui/Header";
import Tab from "@/components/ui/Tab";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

/**
 * 保存したお店（PrivateShop）の型定義
 */
interface PrivateShop {
  id: string;
  hotpepper_id: string;
  name: string;
  address?: string;
  genre?: string;
  budget?: string;
  image_url?: string;
  middle_area?: string;
  photo?: {
    pc?: { l?: string; m?: string; s?: string };
    mobile?: { l?: string; s?: string };
  };
  urls?: { pc?: string; mobile?: string };
}

/**
 * 画像が存在しない場合のデフォルト画像URL
 */
const fallbackImage =
  "https://images.unsplash.com/photo-1555992336-c47a0c5141a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

/**
 * 保存したお店（private_shops）を一覧表示するコンポーネント
 */
export default function PrivateClient() {
  /**
   * データ取得中かどうかの状態
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 保存したお店リスト
   */
  const [shops, setShops] = useState<PrivateShop[]>([]);

  /**
   * Supabaseクライアントをメモ化して生成
   */
  const supabase = useMemo(() => createClientComponentClient(), []);

  /**
   * ページ遷移用のrouter取得
   */
  const router = useRouter();

  /**
   * ユーザーの保存したお店情報をSupabaseから取得
   * ユーザー未ログイン時は空配列
   */
  useEffect(() => {
    const fetchPrivateShops = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setShops([]);
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("private_shops")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      setShops(data ?? []);
      setIsLoading(false);
    };

    fetchPrivateShops();
  }, [supabase]);

  /**
   * レンダリング
   */
  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto bg-neutral-400 p-4">
        <h1 className="mb-4 text-lg font-bold text-white">保存したお店</h1>
        {/* データ取得中 */}
        {isLoading ? (
          <p className="mt-24 text-center text-white">Loading...</p>
        ) : shops.length === 0 ? (
          // 保存データが0件の場合
          <p className="mt-24 text-center text-white">
            まだ保存したお店はありません
          </p>
        ) : (
          // お店一覧をグリッド表示
          <div className="grid grid-cols-3 gap-2">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="cursor-pointer rounded bg-neutral-200 p-1 shadow transition hover:bg-neutral-200"
                // お店クリック時、share-detailページへ遷移
                onClick={() =>
                  router.push(`/share-detail/${shop.hotpepper_id}?type=private`)
                }
              >
                <Image
                  src={shop.image_url || fallbackImage}
                  alt={shop.name ?? "no image"}
                  width={300}
                  height={300}
                  className="aspect-square w-full object-cover"
                  unoptimized
                />
                <p className="mt-1 truncate text-sm font-bold">{shop.name}</p>
                <p className="truncate text-xs text-gray-600">
                  {shop.genre || "ジャンル不明"}
                </p>
                <p className="truncate text-xs text-gray-600">
                  {shop.middle_area || "エリア不明"}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Tab />
    </div>
  );
}
