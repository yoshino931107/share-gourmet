"use client";
import { useState, useEffect, useRef } from "react";
import PrivateClient from "@/components/ui/PrivateClient";

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
  };
  group_id?: string;
  group?: { name: string };
  urls?: {
    pc?: string;
    mobile?: string;
  };
  groupLabel?: string;
  middle_area?: string;
}

interface Group {
  id: string;
  name: string;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1555992336-c47a0c5141a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

export default function Home() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [sharedShops, setSharedShops] = useState<HotPepperShop[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [apiShopInfo, setApiShopInfo] = useState<{
    [id: string]: HotPepperShop;
  }>({});

  const [shops, setShops] = useState<HotPepperShop[]>([]);

  const cacheRef = useRef<Map<string, HotPepperShop>>(new Map());

  // グループ取得後に初期値を決める
  useEffect(() => {
    if (groups.length > 0 && selectedGroupId === null) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  useEffect(() => {
    import("@supabase/auth-helpers-nextjs").then(
      ({ createClientComponentClient }) => {
        const supabase = createClientComponentClient();

        const fetchGroups = async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          const { data } = await supabase
            .from("groups")
            .select("id, name")
            .or(`created_by.eq.${user.id}`);

          if (data) setGroups(data);
        };

        fetchGroups();

        const fetchSharedShops = async () => {
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

          // ユニーク化処理
          const uniqueShopsMap: { [key: string]: boolean } = {};
          const uniqueShops = [];

          const mappedShops: HotPepperShop[] = (data ?? []).map(
            (shop: {
              id: string;
              hotpepper_id: string;
              name: string;
              address?: string;
              genre?: string;
              image_url?: string;
              group_id?: string;
              group?: { name: string }[];
            }) => ({
              id: shop.id,
              hotpepper_id: shop.hotpepper_id,
              name: shop.name,
              address: shop.address ?? "",
              genre: shop.genre,
              image_url: shop.image_url,
              group_id: shop.group_id,
              group: shop.group ? shop.group[0] : undefined,
            }),
          );

          mappedShops.forEach((shop) => {
            if (!uniqueShopsMap[shop.hotpepper_id]) {
              uniqueShopsMap[shop.hotpepper_id] = true;
              uniqueShops.push(shop);
            }
          });

          setSharedShops(mappedShops);
        };

        fetchSharedShops();
      },
    );
  }, []);

  // Hotpepper API へ詳細情報を取りに行く
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
            urls: {
              pc: typeof apiData.urls === "string" ? apiData.urls : undefined,
            },
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
  }, [sharedShops, groups]);

  const filteredShops = shops.filter(
    (shop) => shop.group_id === selectedGroupId,
  );

  return (
    <PrivateClient
      selectedGroupId={selectedGroupId}
      setSelectedGroupId={setSelectedGroupId}
      groups={groups}
      filteredShops={filteredShops}
      apiShopInfo={apiShopInfo}
      fallbackImage={fallbackImage}
    />
  );
}
