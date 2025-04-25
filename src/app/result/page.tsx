"use client";
import Header from "@/components/ui/header";
import ResultPhoto from "@/components/ui/ResultPhoto";
import HorizontalLine from "@/components/ui/horizontalLine";
import Tab from "@/components/ui/tab";

const Result = (props) => {
  return (
    <div className="mx-auto h-screen max-w-md flex-col">
      <Header />
      <main className="bg-gray-50">
        <div className="flex items-start p-4">
          <ResultPhoto
            src={"https://placehold.jp/150x150.png"}
            alt={"result画像1"}
          />
          <div className="ml-4 flex-1">
            <h2 className="mt-1 mb-1 text-xl font-semibold text-gray-900">
              お店の名前お店の名前お店の名前お店の名前
            </h2>
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
        </div>
        <HorizontalLine />
        <div className="flex items-start p-4">
          <ResultPhoto
            src={"https://placehold.jp/150x150.png"}
            alt={"result画像1"}
          />
          <div className="ml-4 flex-1">
            <h2 className="mt-1 mb-1 text-xl font-semibold text-gray-900">
              お店の名前お店の名前お店の名前お店の名前
            </h2>
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
        </div>
        <HorizontalLine />
        <div className="flex items-start p-4">
          <ResultPhoto
            src={"https://placehold.jp/150x150.png"}
            alt={"result画像1"}
          />
          <div className="ml-4 flex-1">
            <h2 className="mt-1 mb-1 text-xl font-semibold text-gray-900">
              お店の名前お店の名前お店の名前お店の名前
            </h2>
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
        </div>
      </main>
      <Tab />
    </div>
  );
};

export default Result;
