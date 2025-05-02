"use client";
import Link from "next/link";
import Header from "@/components/ui/header";
import Tab from "@/components/ui/tab";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

export default function SearchPage() {
  const [searchWord, setSearchWord] = useState("");

  const [hotpepperResults, setHotpepperResults] = useState([]);

  useEffect(() => {
    if (searchWord.trim() === "") return;

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

  const router = useRouter();
  const supabase = createClientComponentClient();

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
