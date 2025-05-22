"use client";
import Tab from "@/components/ui/tab";
import { MapContent } from "@/components/ui/Map";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function MapPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [sharedShops, setSharedShops] = useState<any[]>([]);
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

      const { data, error } = await supabase
        .from("groups")
        .select("id, name")
        .eq("user_id", user.id);

      if (data) setGroups(data);
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) return;

    const fetchSharedShops = async () => {
      const { data, error } = await supabase
        .from("shared_shops")
        .select("*")
        .eq("group_id", selectedGroupId);

      if (data) setSharedShops(data);
    };

    fetchSharedShops();
  }, [selectedGroupId]);

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-white">
      {/* グループ切り替えタブ */}
      <div className="flex justify-around border-b bg-white px-4 py-2">
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
      {/* Map表示エリア（今は仮のMapContentでOK！） */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-2">
        <div className="h-full rounded-xl shadow">
          <MapContent shops={sharedShops} />
        </div>
      </main>
      <Tab />
    </div>
  );
}
