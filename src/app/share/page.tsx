"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRef } from "react";
import Tab from "@/components/ui/tab";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSearchParams } from "next/navigation";

const fallbackImage =
  "https://images.unsplash.com/photo-1555992336-c47a0c5141a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

export default function Home() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const searchParams = useSearchParams();
  const groupIdFromQuery = searchParams.get("group");

  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    undefined,
  );

  const [sharedShops, setSharedShops] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

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

      const { data, error } = await supabase
        .from("groups")
        .select("id, name")
        .eq("user_id", user.id);

      if (data) setGroups(data);
    };

    fetchGroups();
  }, []);

  const [apiShopInfo, setApiShopInfo] = useState<{ [id: string]: any }>({});

  useEffect(() => {
    // supabaseのお店一覧（sharedShops）をループしてAPIにリクエスト
    sharedShops.forEach(async (shop) => {
      const res = await fetch("/api/hotpepper", {
        method: "POST",
        body: JSON.stringify({ id: shop.hotpepper_id }),
        headers: { "Content-Type": "application/json" },
      });
      const [apiData] = await res.json();
      setApiShopInfo((prev) => ({
        ...prev,
        [shop.hotpepper_id]: apiData,
      }));
    });
  }, [sharedShops]);

  useEffect(() => {
    console.log("🧩 sharedShops が変化:", sharedShops);
  }, [sharedShops]);

  useEffect(() => {
    const fetchSharedShops = async () => {
      // const {
      //   data: { user },
      // } = await supabase.auth.getUser();

      // ✅ ここでnullチェックを入れる！
      // if (!user) {
      //   console.warn("⚠️ ユーザー未ログイン");
      //   return;
      // }

      // 一時的な固定ユーザーID（Supabaseの user_id を貼り付けてね）
      // const user = "bfef7f82-3642-4186-b5d9-71710a01c47f"; // ← 実際のIDにしてね

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // 未ログイン時の挙動
        return;
      }

      console.log(user.id);

      const { data, error } = await supabase
        .from("shared_shops")
        .select(
          "id, hotpepper_id, name, genre, image_url, group_id, group:groups(name), created_at",
        )
        .eq("user_id", user.id)
        .not("hotpepper_id", "is", null)
        .order("created_at", { ascending: false });

      console.log("取得データ", data);

      // ユニーク化処理
      const uniqueShopsMap = {};
      const uniqueShops = [];
      if (data) {
        data.forEach((shop) => {
          if (!uniqueShopsMap[shop.hotpepper_id]) {
            uniqueShopsMap[shop.hotpepper_id] = true;
            uniqueShops.push(shop);
          }
        });
        setSharedShops(data);
      } else {
        setSharedShops([]);
      }
    };

    fetchSharedShops();
  }, []);

  const [shops, setShops] = useState([]);

  const cacheRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    // 共有されたお店が無いなら何もしない
    if (sharedShops.length === 0) return;

    // まだ取得していない hotpepper_id を抽出
    const targets = sharedShops.filter(
      (s) => !cacheRef.current.has(s.hotpepper_id),
    );

    // 何も無ければキャッシュをそのまま表示
    if (targets.length === 0) {
      setShops(Array.from(cacheRef.current.values()));
      return;
    }

    // 非同期でまとめて取得
    (async () => {
      const fetched: any[] = [];

      for (const t of targets) {
        try {
          const res = await fetch("/api/hotpepper", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: t.hotpepper_id }),
          });

          if (!res.ok) {
            console.warn("⚠️ fetch 失敗:", res.statusText);
            continue;
          }

          const json = await res.json();
          if (!json) continue;

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
            id: t.id, // ← 追加 (UUID)
            hotpepper_id: t.hotpepper_id,
            name: t.name ?? json.name ?? "名称不明",
            genre: json.genre,
            address: json.address,
            photo: json.photo,
            image_url:
              t.image_url ?? json.image_url ?? json.photo?.pc?.l ?? null,
            urls: json.urls,
            groupId: t.group_id,
            groupLabel: label,
          });
        } catch (err) {
          console.error("❌ fetch エラー:", err);
        }
      }

      // キャッシュに保存
      fetched.forEach((f) => cacheRef.current.set(f.hotpepper_id, f));
      setShops(Array.from(cacheRef.current.values()));
    })();
  }, [sharedShops]);

  const handleShare = async (shop: any | null) => {
    if (!shop) {
      console.warn("⚠️ handleShare に null が渡りました");
      return;
    }
    console.log("🔔 share =>", shop.id, shop.name);
  };

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const {
  //       data: { user },
  //     } = await supabase.auth.getUser();
  //     if (!user) {
  //       router.push("/auth/login");
  //     }
  //   };
  //   checkAuth();
  // }, []);

  const dummyImages = Array(30).fill("https://placehold.jp/120x120.png");

  const filteredShops = shops.filter(
    (shop) => shop.groupId === selectedGroupId,
  );

  useEffect(() => {
    console.log(
      "👜 shops →",
      shops.map((s) => ({
        name: s.name,
        groupId: s.groupId,
      })),
    );
  }, [shops]);

  useEffect(() => {
    console.log("🔍 filteredShops", filteredShops);
    console.log("🔍 selectedGroupId", selectedGroupId);
  }, [filteredShops, selectedGroupId]);

  // console.log("🛠 groups JSX を描画します", groups);

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
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
                  console.log("🖼️ shop.image_url:", shop.image_url);

                  return (
                    <Link
                      href={`/share-detail/${shop.id}`}
                      key={shop.hotpepper_id}
                    >
                      <div className="cursor-pointer border border-gray-300 bg-white p-1 transition hover:opacity-80">
                        <img
                          src={shop?.image_url || fallbackImage}
                          alt={shop?.name ?? "no image"}
                          className="aspect-square w-full object-cover"
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
  );
}
