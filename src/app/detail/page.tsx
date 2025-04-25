"use client";
import Header from "@/components/ui/header";
import DetailPhoto from "@/components/ui/DetailPhoto";
import Tab from "@/components/ui/tab";

export default function Detail() {
  return (
    <div className="mx-auto h-screen max-w-md flex-col">
      <Header />
      <main className="bg-gray-50">
        <DetailPhoto
          src={"https://placehold.jp/410x250.png"}
          alt={"result画像1"}
        />
        <div className="flex-1">
          <h2 className="m-5 text-3xl font-semibold text-gray-900">
            お店の名前お店の名前お店の名前お店の名前
          </h2>
          <div className="m-5">
            <div className="flex items-center">
              <span className="mt-1 mr-2 text-xl text-rose-500">★★★★☆ 4.0</span>
              <span className="text-xs text-gray-500">（食べログ評価）</span>
            </div>
            <div className="mt-1 flex text-sm text-gray-700">
              <span className="mr-2">駅名駅名駅名</span>
              <span className="mr-2">/</span>
              <span>ジャンル</span>
            </div>
            <div className="mt-2 flex text-sm text-gray-700">
              <span className="mr-2">☀️0,000〜0,000円</span>
              <span>🌙0,000〜0,000円</span>
            </div>
          </div>
          <h3 className="m-5 text-2xl font-semibold text-gray-900">
            お店の詳細見出しお店の詳細見出し
          </h3>
          <p className="m-5 text-base text-gray-900">
            お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細お店の詳細
          </p>
        </div>
      </main>
      <Tab />
    </div>
  );
}
