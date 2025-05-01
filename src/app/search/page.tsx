"use client";
import Link from "next/link";
import Header from "@/components/ui/header";
import Tab from "@/components/ui/tab";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SearchPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const dummyImages = Array(30).fill("https://placehold.jp/150x150.png");

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-2">
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
      <Tab />
    </div>
  );
}
