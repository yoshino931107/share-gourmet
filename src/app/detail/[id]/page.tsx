"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/supabase";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DetailPage() {
  const [shops, setShops] = useState<any[]>([]);

  const params = useParams();
  const shopId = params.id as string;

  useEffect(() => {
    const fetchShop = async () => {
      const { data, error } = await supabase
        .from("shared_shops")
        .select("*")
        .eq("hotpepper_id", shopId) // ← HotPepper ID is stored in this column
        .single();

      if (error) {
        console.error(error);
      } else if (data) {
        setShops([data]); // set as array for map rendering
      }
    };
    if (shopId) fetchShop();
  }, [shopId]);

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="mb-4 text-2xl font-bold">検索結果</h1>
      {shops.map((shop: any) => (
        <Link
          key={shop.id}
          href={`/detail/${shop.id}`}
          className="mb-4 block rounded-lg bg-white p-3 shadow hover:bg-gray-50"
        >
          <div className="flex">
            <img
              src={shop.image_url}
              alt={shop.name}
              className="mr-4 h-20 w-20 rounded object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold">{shop.name}</h2>
              <p className="text-sm text-gray-600">{shop.address}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
