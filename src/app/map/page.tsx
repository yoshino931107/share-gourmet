"use client";
/**
 * @fileoverview
 * このファイルは、ユーザーの所属するグループごとに共有された飲食店情報を地図上に表示するページコンポーネントを提供します。
 * Supabaseを用いてログインユーザーのグループ情報と共有店舗情報を取得し、
 * それらをグループ切替タブと地図表示でユーザーに提供します。
 */

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
  /**
   * @description
   * グループ一覧の状態管理
   */
  const [groups, setGroups] = useState<Group[]>([]);
  /**
   * @description
   * 選択中グループに紐づく共有店舗情報の状態管理
   */
  const [sharedShops, setSharedShops] = useState<HotPepperShop[]>([]);
  /**
   * @description
   * 現在選択されているグループIDの状態管理
   */
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    undefined,
  );

  // Supabaseクライアントを忘れずに生成
  const supabase = createClientComponentClient();

  /**
   * @description
   * グループ一覧が取得できたら、初期選択として最初のグループをselectedGroupIdに設定する処理
   */
  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  /**
   * @description
   * Supabaseからログインユーザーのグループ一覧を取得し、状態にセットする非同期処理
   */
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

  /**
   * @description
   * 選択されたグループIDに基づいて、そのグループに共有されている店舗情報をSupabaseから取得し状態にセットする非同期処理
   */
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
      {/**
       * @description
       * グループ切り替え用のタブUI部分
       * selectedGroupIdが未設定の場合はローディング表示
       */}
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
      {/**
       * @description
       * 地図表示エリア
       * 共有店舗情報をMapContentコンポーネントに渡して表示
       */}
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
      {/**
       * @description
       * ページ下部のTabコンポーネント表示
       */}
      <Tab />
    </div>
  );
}
