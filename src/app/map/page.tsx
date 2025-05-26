"use client";
import Header from "@/components/ui/Header";
import Tab from "@/components/ui/Tab";
import { MapContent } from "@/components/ui/Map";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface HotPepperShop {
  hotpepper_id: string;
  id: string;
  name: string;
  address: string;
  genre?: string;
  budget?: string;
  image_url?: string;
  photo?: {
    pc?: { l?: string; m?: string; s?: string };
    mobile?: { l?: string; s?: string };
  };
  latitude: number | null;
  longitude: number | null;
}

interface Group {
  id: string;
  name: string;
}

export default function MapPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [sharedShops, setSharedShops] = useState<HotPepperShop[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    undefined,
  );

  // Supabaseクライアントを忘れずに生成
  const supabase = createClientComponentClient();

  useEffect(() => {
    // グループ初期選択
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  useEffect(() => {
    const fetchGroups = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("groups")
        .select("id, name")
        .eq("user_id", user.id);

      if (data) setGroups(data);
    };

    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;

    const fetchSharedShops = async () => {
      const { data } = await supabase
        .from("shared_shops")
        .select("*")
        .eq("group_id", selectedGroupId);

      if (data) setSharedShops(data);
    };

    fetchSharedShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId]);

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-white">
      <Header />
      {/* グループ切り替えタブ */}
      {!selectedGroupId ? (
        <div className="flex flex-1 items-center justify-center text-gray-400">
          loading...
        </div>
      ) : (
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
      )}
      {/* Map表示エリア（今は仮のMapContentでOK！） */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-2">
        <div className="h-full rounded-xl shadow">
          <MapContent
            shops={sharedShops.map((shop) => ({
              ...shop,
              latitude: shop.latitude ?? 0,
              longitude: shop.longitude ?? 0,
            }))}
          />
        </div>
      </main>
      <Tab />
    </div>
  );
}
