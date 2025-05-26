"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClientComponentClient(), []);

  const searchParams = useSearchParams();
  const groupIdFromQuery = searchParams.get("group");

  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    undefined,
  );

  const [sharedShops, setSharedShops] = useState<HotPepperShop[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (groups.length > 0) {
      const newSelectedGroupId = groupIdFromQuery ?? groups[0].id;
      setSelectedGroupId(newSelectedGroupId);
    }
  }, [groups, groupIdFromQuery]);

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

  const [apiShopInfo, setApiShopInfo] = useState<{
    [id: string]: HotPepperShop;
  }>({});

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

  useEffect(() => {
    setIsLoading(false);
  }, [sharedShops]);

  const [shops, setShops] = useState<HotPepperShop[]>([]);

  const cacheRef = useRef<Map<string, HotPepperShop>>(new Map());

  useEffect(() => {
    if (sharedShops.length === 0) {
      setShops([]); // 共有ショップが空なら表示も空
      return;
    }

    const targets = sharedShops.filter(
      (s) => !cacheRef.current.has(s.hotpepper_id),
    );

    if (targets.length === 0) {
      setShops(
        sharedShops
          .map((s) => cacheRef.current.get(s.hotpepper_id))
          .filter(Boolean) as HotPepperShop[],
      );
      return;
    }

    let ignore = false; // アンマウント対策
    (async () => {
      const fetched: HotPepperShop[] = [];

      for (const t of targets) {
        try {
          const res = await fetch("/api/hotpepper", {
            method: "POST",
            body: JSON.stringify({ id: t.hotpepper_id }),
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) continue;

          const json: HotPepperShop = await res.json();
          if (!json) continue;

          const apiData = Array.isArray(json) ? json[0] : json;
          if (!ignore) {
            setApiShopInfo((prev) => ({
              ...prev,
              [t.hotpepper_id]: apiData,
            }));
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
        } catch {}
      }

      if (!ignore) {
        fetched.forEach((f) => cacheRef.current.set(f.hotpepper_id, f));
        setShops(Array.from(cacheRef.current.values()));
      }
    })();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedShops]);

  const filteredShops = shops.filter(
    (shop) => shop.group_id === selectedGroupId,
  );

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />
      {!selectedGroupId ? (
        <div className="flex flex-1 items-center justify-center text-gray-400">
          loading...
        </div>
      ) : (
        <>
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
          <main className="flex-1 overflow-y-auto bg-gray-50 p-2">
            {isLoading ? (
              <p className="p-4 text-center text-sm text-gray-400">
                Loading...
              </p>
            ) : filteredShops.length === 0 ? (
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
