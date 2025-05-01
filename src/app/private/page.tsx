"use client";
import Link from "next/link";
import { useEffect } from "react";
import Header from "@/components/ui/header";
import Tab from "@/components/ui/tab";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function PrivatePage() {
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

  const dummyImages = Array(12).fill("https://placehold.jp/150x150.png");

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <>
        <header className="border-b bg-gray-600 p-4 text-xl font-bold text-white">
          シェアグル
        </header>
      </>
      <main className="flex-1 overflow-y-auto bg-gray-400 p-2">
        <div className="grid grid-cols-3 gap-2">
          {dummyImages.map((src, i) => (
            <Link href={`/shop/${i}`} key={i}>
              <img
                src={src}
                alt={`Shop ${i}`}
                className="aspect-square w-full rounded object-cover"
              />
            </Link>
          ))}
        </div>
      </main>
      <>
        <footer className="position-sticky grid grid-cols-4 border-t text-center text-sm font-semibold text-gray-700">
          <Link
            href="/share"
            className="flex flex-col items-center bg-gray-600 p-2 text-white hover:bg-gray-700"
          >
            <span className="text-3xl">❤️</span>
            <span>シェア</span>
          </Link>
          <Link
            href="/map"
            className="flex flex-col items-center bg-gray-500 p-2 text-white hover:bg-gray-600"
          >
            <span className="text-3xl">📍</span>
            <span>マップ</span>
          </Link>
          <Link
            href="/search"
            className="flex flex-col items-center bg-gray-600 p-2 text-white hover:bg-gray-700"
          >
            <span className="text-3xl">🔍</span>
            <span>お店検索</span>
          </Link>
          <Link
            href="/mypage"
            className="flex flex-col items-center bg-gray-500 p-2 text-white hover:bg-gray-600"
          >
            <span className="text-3xl">👤</span>
            <span>マイページ</span>
          </Link>
        </footer>
      </>
    </div>
  );
}
