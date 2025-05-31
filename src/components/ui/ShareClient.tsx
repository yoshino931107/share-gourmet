"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import Header from "@/components/ui/Header";
import Tab from "@/components/ui/Tab";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSearchParams } from "next/navigation";

interface HotPepperShop {
  id: string;
  hotpepper_id: string;
  name: string;
  address?: string;
  genre?: string;
  budget?: string;
  image_url?: string;
  group_id: string;
  middle_area?: string;
  photo?: {
    pc?: { l?: string; m?: string; s?: string };
    mobile?: { l?: string; s?: string };
  };
  group?: { name: string };
  urls?: { pc?: string; mobile?: string };
  groupLabel?: string;
}

interface Group {
  id: string;
  name: string;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1555992336-c47a0c5141a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

/**
 * シェアされたお店をグループごとに表示するクライアントコンポーネント
 */
export default function ShareClient() {
  /**
   * @description ローディング状態
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * @description Supabaseクライアント（useMemoで初期化）
   */
  const supabase = useMemo(() => createClientComponentClient(), []);

  /**
   * @description クエリパラメータからグループIDを取得
   */
  const searchParams = useSearchParams();
  const groupIdFromQuery = searchParams.get("group");

  /**
   * @description 選択中のグループID
   */
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    undefined,
  );

  /**
   * @description 共有されたお店一覧（重複なし）
   */
  const [sharedShops, setSharedShops] = useState<HotPepperShop[]>([]);

  /**
   * @description ユーザーが所属するグループ一覧
   */
  const [groups, setGroups] = useState<Group[]>([]);

  /**
   * @description グループ一覧取得後に選択中グループをセット
   */
  useEffect(() => {
    if (groups.length > 0) {
      const newSelectedGroupId = groupIdFromQuery ?? groups[0].id;
      setSelectedGroupId(newSelectedGroupId);
    }
  }, [groups, groupIdFromQuery]);

  /**
   * @description ユーザーに紐づくグループ一覧をSupabaseから取得
   */
  useEffect(() => {
    const fetchGroups = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { data } = await supabase
        .from("groups")
        .select("id, name, user_id")
        .eq("user_id", user.id);

      if (data) {
        setGroups(data);
      }
    };

    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * @description HotPepper APIで取得したお店情報をキャッシュするためのstate
   * key: hotpepper_id, value: お店情報
   */
  const [apiShopInfo, setApiShopInfo] = useState<{
    [id: string]: HotPepperShop;
  }>({});

  /**
   * @description 共有ショップ一覧が更新された時、HotPepper APIから店舗詳細データをまとめて取得
   */
  useEffect(() => {
    if (sharedShops.length === 0) return;

    const hotpepperIds = sharedShops
      .map((s) => s.hotpepper_id)
      .filter((id) => !apiShopInfo[id]);
    if (hotpepperIds.length === 0) return;

    const fetchBulkDetails = async () => {
      try {
        const res = await fetch("/api/hotpepper", {
          method: "POST",
          body: JSON.stringify({ ids: hotpepperIds }),
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          return;
        }

        const result = await res.json();

        if (!result || typeof result !== "object") return;

        setApiShopInfo((prev) => ({ ...prev, ...result }));
      } catch {}
    };

    fetchBulkDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedShops]);

  /**
   * @description Supabaseからシェアされたお店情報（重複なし）を取得しstateにセット
   */
  useEffect(() => {
    const fetchSharedShops = async () => {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data } = await supabase
        .from("shared_shops")
        .select(
          "id, hotpepper_id, name, genre, image_url, group_id, group:groups(name)",
        )
        .not("hotpepper_id", "is", null)
        .order("id", { ascending: false });

      const uniqueShopsMap: { [key: string]: boolean } = {};
      const uniqueShops: HotPepperShop[] = [];
      if (data) {
        data.forEach((shop) => {
          if (!uniqueShopsMap[shop.hotpepper_id]) {
            uniqueShopsMap[shop.hotpepper_id] = true;
            uniqueShops.push({
              ...shop,
              group: Array.isArray(shop.group) ? shop.group[0] : shop.group,
            });
          }
        });
        setSharedShops(uniqueShops);
      } else {
        setSharedShops([]);
      }
    };
    fetchSharedShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * @description 共有ショップ一覧が更新されたらローディング終了
   */
  useEffect(() => {
    setIsLoading(false);
  }, [sharedShops]);

  /**
   * @description 統合後の店舗情報
   */
  const [shops, setShops] = useState<HotPepperShop[]>([]);

  /**
   * @description 共有ショップとAPIショップ情報をマージし、グループ名も補完
   */
  useEffect(() => {
    if (sharedShops.length === 0) {
      setShops([]);
      return;
    }
    // shopごとにapiShopInfoからデータを補完
    const mergedShops = sharedShops.map((shop) => {
      const apiData = apiShopInfo[shop.hotpepper_id] || {};
      return {
        ...shop,
        ...apiData,
        groupLabel:
          groups.find((g) => g.id === shop.group_id)?.name ??
          shop.group?.name ??
          "未分類",
      };
    });
    setShops(mergedShops);
  }, [sharedShops, apiShopInfo, groups]);

  /**
   * @description 選択中のグループで絞り込んだ店舗情報
   */
  const filteredShops = shops.filter(
    (shop) => shop.group_id === selectedGroupId,
  );

  // --- 描画部分 ---
  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />
      {/* グループ選択タブ＆ローディング表示 */}
      {!selectedGroupId ? (
        <div className="flex flex-1 items-center justify-center text-gray-400">
          loading...
        </div>
      ) : (
        <>
          {/* グループタブ 横スクロール対応 */}
          <div
            className="flex w-full flex-nowrap overflow-x-auto border-t border-b bg-white px-2 py-2 whitespace-nowrap"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {groups.map(({ id, name }) => (
              <button
                key={id}
                onClick={() => setSelectedGroupId(id)}
                className={`mx-1 inline-block min-w-[80px] flex-shrink-0 text-base font-semibold transition ${
                  selectedGroupId === id
                    ? "border-b-2 border-orange-400 text-orange-400"
                    : "text-gray-500 hover:text-orange-400"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          {/* お店リスト表示部分 */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-2">
            {isLoading ? (
              <p className="mt-70 p-4 text-center text-sm text-gray-400">
                Loading...✍️
              </p>
            ) : filteredShops.length === 0 ? (
              <p className="mt-70 p-4 text-center text-sm text-gray-400">
                Loading...✍️
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-px bg-gray-50 pb-20">
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
                          {shop.genre || "ジャンル不明"}
                          <br />
                          {shop.middle_area || "エリア不明"}
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
      <Tab />
    </div>
  );
}
