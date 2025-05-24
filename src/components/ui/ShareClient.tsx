"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
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

export default function ShareClient() {
  const supabase = createClientComponentClient();

  const searchParams = useSearchParams();
  const groupIdFromQuery = searchParams.get("group");

  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    undefined,
  );

  const [sharedShops, setSharedShops] = useState<HotPepperShop[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // グループ取得後に初期値を決める
  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroupId(groupIdFromQuery ?? groups[0].id);
    }
  }, [groups, groupIdFromQuery]);

  useEffect(() => {
    const fetchGroups = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("shared_shops")
        .select(
          "id, hotpepper_id, name, genre, address, image_url, group_id, group:groups(name)",
        )
        .or(`created_by.eq.${user.id}`);

      if (data) setGroups(data);
    };

    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [apiShopInfo, setApiShopInfo] = useState<{
    [id: string]: HotPepperShop;
  }>({});

  // ---------------------------------------------------------------------------
  // Hotpepper API へ詳細情報を取りに行く
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (sharedShops.length === 0) return;

    const targets = sharedShops.filter(
      (s) => apiShopInfo[s.hotpepper_id] === undefined,
    );
    if (targets.length === 0) return;

    const fetchDetails = async () => {
      const updates: { [id: string]: HotPepperShop } = {};

      for (const shop of targets) {
        try {
          const res = await fetch("/api/hotpepper", {
            method: "POST",
            body: JSON.stringify({ id: shop.hotpepper_id }),
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            console.warn(
              "⚠️ Hotpepper API 失敗:",
              shop.hotpepper_id,
              res.status,
            );
            continue;
          }

          const raw = await res.text();
          if (!raw) {
            console.warn("⚠️ 空レスポンス:", shop.hotpepper_id);
            continue;
          }

          const [apiData] = JSON.parse(raw);
          if (!apiData) {
            console.warn("⚠️ パース結果が空:", shop.hotpepper_id);
            continue;
          }

          updates[shop.hotpepper_id] = apiData;
        } catch (e) {
          console.error("❌ fetch 例外:", shop.hotpepper_id, e);
        }
      }

      if (Object.keys(updates).length > 0) {
        setApiShopInfo((prev) => ({ ...prev, ...updates }));
      }
    };

    fetchDetails();
  }, [sharedShops, apiShopInfo]);

  useEffect(() => {
    console.log("🧩 sharedShops が変化:", sharedShops);
  }, [sharedShops]);

  useEffect(() => {
    const fetchSharedShops = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      console.log(user.id);

      const { data } = await supabase
        .from("shared_shops")
        .select(
          "id, hotpepper_id, name, genre, image_url, group_id, group:groups(name)",
        )
        .not("hotpepper_id", "is", null)
        .order("id", { ascending: false });

      console.log("取得データ", data);

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

  const [shops, setShops] = useState<HotPepperShop[]>([]);

  const cacheRef = useRef<Map<string, HotPepperShop>>(new Map());

  useEffect(() => {
    if (sharedShops.length === 0) return;

    const targets = sharedShops.filter(
      (s) => !cacheRef.current.has(s.hotpepper_id),
    );

    if (targets.length === 0) {
      setShops(Array.from(cacheRef.current.values()));
      return;
    }

    (async () => {
      const fetched: HotPepperShop[] = [];

      for (const t of targets) {
        try {
          const res = await fetch("/api/hotpepper", {
            method: "POST",
            body: JSON.stringify({ id: t.hotpepper_id }),
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            console.warn("⚠️ fetch 失敗:", res.statusText);
            continue;
          }

          const json: HotPepperShop = await res.json();
          if (!json) continue;

          const apiData = Array.isArray(json) ? json[0] : json;
          setApiShopInfo((prev) => ({
            ...prev,
            [t.hotpepper_id]: apiData,
          }));

          console.log("🔍 json.name:", json.name);
          console.log("🔍 t.name (from Supabase):", t.name);
          console.log("🔍 hotpepper APIレスポンス:", json);

          if (!json || (Array.isArray(json) && json.length === 0)) {
            console.warn(
              "⚠️ Hotpepper API でお店データが取得できませんでした。",
              t.hotpepper_id,
            );
            continue;
          }

          const label =
            groups.find((g) => g.id === t.group_id)?.name ??
            t.group?.name ??
            "未分類";

          fetched.push({
            id: t.id,
            hotpepper_id: t.hotpepper_id,
            name: t.name ?? apiData.name ?? "名称不明",
            genre: apiData.genre,
            address: apiData.address,
            photo: apiData.photo,
            image_url:
              t.image_url ?? apiData.image_url ?? apiData.photo?.pc?.l ?? null,
            urls: apiData.urls,
            group_id: t.group_id,
            groupLabel: label,
          });
        } catch (err) {
          console.error("❌ fetch エラー:", err);
        }
      }

      fetched.forEach((f) => cacheRef.current.set(f.hotpepper_id, f));
      setShops(Array.from(cacheRef.current.values()));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedShops]);

  const filteredShops = shops.filter(
    (shop) => shop.group_id === selectedGroupId,
  );

  useEffect(() => {
    console.log(
      "👜 shops →",
      shops.map((s) => ({
        name: s.name,
        groupId: s.group_id,
      })),
    );
  }, [shops]);

  useEffect(() => {
    console.log("🔍 filteredShops", filteredShops);
    console.log("🔍 selectedGroupId", selectedGroupId);
  }, [filteredShops, selectedGroupId]);

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />
      {!selectedGroupId ? (
        <div className="flex flex-1 items-center justify-center text-gray-400">
          loading...
        </div>
      ) : (
        <>
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
      <Tab />
    </div>
  );
}
