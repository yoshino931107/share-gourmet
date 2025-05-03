"use client";
import Link from "next/link";
import Header from "@/components/ui/header";
import Tab from "@/components/ui/tab";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

function extractHotpepperIdFromUrl(url: string): string | null {
  const match = url.match(/\/str(J\d{9})\//);
  return match ? match[1] : null;
}

export default function SearchPage() {
  const [searchWord, setSearchWord] = useState("");

  const [hotpepperResults, setHotpepperResults] = useState([]);

  const [recommendedShops, setRecommendedShops] = useState([
    {
      id: "dummy1",
      name: "おすすめラーメン",
      genre: { name: "ラーメン" },
      photo: {
        pc: {
          l: "https://images.unsplash.com/photo-1555992336-c47a0c5141a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        },
      },
      urls: { pc: "#" },
    },
    {
      id: "dummy2",
      name: "まったりカフェ",
      genre: { name: "カフェ" },
      photo: {
        pc: {
          l: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        },
      },
      urls: { pc: "#" },
    },
    {
      id: "dummy3",
      name: "餃子居酒屋",
      genre: { name: "居酒屋" },
      photo: {
        pc: {
          l: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        },
      },
      urls: { pc: "#" },
    },
    {
      id: "dummy4",
      name: "焼肉太郎",
      genre: { name: "焼肉" },
      photo: {
        pc: {
          l: "https://images.unsplash.com/photo-1606755962778-b991dd052fa3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        },
      },
      urls: { pc: "#" },
    },
    {
      id: "dummy5",
      name: "ネオ喫茶",
      genre: { name: "カフェ" },
      photo: {
        pc: {
          l: "https://images.unsplash.com/photo-1550966871-3ed2f66f2d02?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        },
      },
      urls: { pc: "#" },
    },
    {
      id: "dummy6",
      name: "洋食ダイナー",
      genre: { name: "洋食" },
      photo: {
        pc: {
          l: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        },
      },
      urls: { pc: "#" },
    },
    {
      id: "dummy7",
      name: "天ぷら小町",
      genre: { name: "和食" },
      photo: {
        pc: {
          l: "https://images.unsplash.com/photo-1603297631365-e3c36c94a4dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        },
      },
      urls: { pc: "#" },
    },
    {
      id: "dummy8",
      name: "寿司一番",
      genre: { name: "寿司" },
      photo: {
        pc: {
          l: "https://images.unsplash.com/photo-1585238342028-3edb5aef3ae5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        },
      },
      urls: { pc: "#" },
    },
    {
      id: "dummy9",
      name: "ピザ屋さん",
      genre: { name: "イタリアン" },
      photo: {
        pc: {
          l: "https://images.unsplash.com/photo-1548365328-5c8f7c7d4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        },
      },
      urls: { pc: "#" },
    },
    {
      id: "dummy10",
      name: "ベーカリー カフェ",
      genre: { name: "ベーカリー" },
      photo: {
        pc: {
          l: "https://images.unsplash.com/photo-1604908812961-934ddae41201?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        },
      },
      urls: { pc: "#" },
    },
    {
      id: "dummy11",
      name: "中華食堂",
      genre: { name: "中華" },
      photo: {
        pc: {
          l: "https://images.unsplash.com/photo-1613141411985-e8e5b3089f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        },
      },
      urls: { pc: "#" },
    },
    {
      id: "dummy12",
      name: "ベジカフェ",
      genre: { name: "ヘルシー" },
      photo: {
        pc: {
          l: "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        },
      },
      urls: { pc: "#" },
    },
  ]);

  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (searchWord.trim() === "") return;

    const id = extractHotpepperIdFromUrl(searchWord.trim());
    if (id) {
      router.push(`/shop/${id}`);
      return;
    }

    const fetchData = async () => {
      const res = await fetch(
        `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=${process.env.NEXT_PUBLIC_HOTPEPPER_API_KEY}&keyword=${encodeURIComponent(
          searchWord,
        )}&format=json`,
      );
      const data = await res.json();
      setHotpepperResults(data.results.shop || []);
    };

    fetchData();
  }, [searchWord]);

  const dummyImages = Array(30).fill("https://placehold.jp/150x150.png");

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-2">
        <div className="mt-2 mb-4 flex items-center rounded-xl border border-gray-300 bg-white px-3 py-2">
          <MagnifyingGlassIcon className="mr-2 h-7 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="お店を検索"
            className="w-full text-sm focus:outline-none"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />
        </div>
        {recommendedShops.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 px-2 text-sm font-semibold text-gray-700">
              おすすめのお店
            </h2>
            <div className="grid grid-cols-3 gap-px bg-gray-300">
              {recommendedShops.map((shop) => (
                <Link
                  href={shop.urls.pc}
                  key={shop.id}
                  className="bg-white p-2"
                >
                  <img
                    src={shop.photo?.pc?.l}
                    alt={shop.name}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="mt-1 truncate text-sm font-bold">
                    {shop.name}
                  </div>
                  <div className="truncate text-xs text-gray-500">
                    {shop.genre.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-px bg-gray-300">
          {hotpepperResults.map((shop) => (
            <Link href={shop.urls.pc} key={shop.id} className="bg-white">
              <img
                src={shop.photo.pc.l || "https://placehold.jp/150x150.png"}
                alt={shop.name}
                className="aspect-square w-full object-cover"
              />
            </Link>
          ))}
        </div>
      </main>
      <Tab />
    </div>
  );
}
