"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "@/components/ui/header";
import Tab from "@/components/ui/tab";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const fallbackImage =
  "https://images.unsplash.com/photo-1555992336-c47a0c5141a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

export default function Home() {
  const [sharedShops, setSharedShops] = useState<any[]>([]);

  const [selectedGroup, setSelectedGroup] = useState("すべて");
  const groups = ["すべて", "ラーメン部", "カフェ会"];

  useEffect(() => {
    const fetchSharedShops = async () => {
      const { data, error } = await supabase
        .from("shared_shops")
        .select("hotpepper_id, group:groups(name)")
        .order("created_at", { ascending: false });

      if (data) {
        setSharedShops(data);
      }
    };

    fetchSharedShops();
  }, []);

  const [shops, setShops] = useState([]);

  useEffect(() => {
    if (sharedShops.length === 0) return;

    const fetchShops = async () => {
      const results = await Promise.all(
        sharedShops.map(async (shared) => {
          const res = await fetch("/api/hotpepper", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: shared.hotpepper_id }),
          });

          const data = await res.json();
          return data ? { ...data, groupName: shared.group.name } : null;
        }),
      );

      setShops(results.filter(Boolean));
    };

    fetchShops();
  }, [sharedShops]);

  const handleShareShop = async (shop) => {
    const { data, error } = await supabase.from("shared_shops").insert([
      {
        user_id: user.id,
        hotpepper_id: shop.id,
        name: shop.name,
        image_url: shop.photo.pc.l,
        url: shop.urls.pc,
        address: shop.address,
        genre: shop.genre.name,
      },
    ]);

    if (error) {
      console.error("❌ 登録エラー:", error);
    } else {
      console.log("✅ シェア完了！");
    }
  };

  const router = useRouter();
  const supabase = createClientComponentClient();

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

  const filteredShops = shops.filter((shop) =>
    selectedGroup === "すべて" ? true : shop.groupName === selectedGroup,
  );

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />
      <div className="flex justify-around border-b bg-white px-4 py-2">
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className={`text-sm font-medium ${
              selectedGroup === group
                ? "border-b-2 border-orange-400 text-orange-400"
                : "text-gray-500"
            }`}
          >
            {group}
          </button>
        ))}
      </div>
      <main className="flex-1 overflow-y-auto bg-gray-50 p-2">
        {filteredShops.length === 0 ? (
          <div className="grid grid-cols-3 gap-px bg-gray-300">
            {Array(15)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="bg-white p-2">
                  <div className="aspect-square w-full bg-gray-200" />
                  <div className="mt-1 h-3 w-2/3 bg-gray-200" />
                  <div className="mt-1 h-2 w-1/2 bg-gray-100" />
                </div>
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-px bg-gray-300">
            {filteredShops.map((shop) => (
              <Link
                href={`/shop/${shop.id}`}
                key={shop.id}
                className="bg-white p-2"
              >
                <img
                  src={shop?.photo?.pc?.l ? shop.photo.pc.l : fallbackImage}
                  alt={shop.name}
                  className="aspect-square w-full object-cover"
                />
                <div className="mt-1 truncate text-sm font-bold">
                  {shop.name}
                </div>
                <div className="truncate text-xs text-gray-500">
                  {shop.genre?.name}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Tab />
    </div>
  );
}
