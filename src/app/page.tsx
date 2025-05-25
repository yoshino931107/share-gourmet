"use client";
import Header from "@/components/ui/Header";
import Link from "next/link";

export default function TopPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 px-4 pb-8">
        {/* メインカード */}
        <main className="mx-auto my-4 max-w-full px-4 py-6 text-xl">
          {/* キャッチコピー */}
          <h1 className="mb-2 text-4xl leading-tight font-extrabold">
            気になるグルメ、
            <br />
            シェア＆ストック！
          </h1>
          <div className="mb-4 text-center text-lg font-bold">
            <span className="tracking-wider">シェアグル</span>は<br />
            気軽にああああああ
            <br />
            ああああああああああ
            <br />
            アプリです。
          </div>

          {/* 機能詳細 */}
          <section className="mb-8">
            <h2 className="mb-2 text-center text-2xl font-bold tracking-wider">
              機能詳細
            </h2>
            <ul className="mb-4 space-y-3 text-lg">
              <li>
                🔍 <span className="font-semibold">検索機能</span>
                <br />
                「カフェ、居酒屋」など、探したいジャンルや場所でお店リサーチ検索！
              </li>
              <li>
                ❤️ <span className="font-semibold">シェア機能</span>
                <br />
                気になるお店を見つけたら、共有したいグループにワンタップでシェア！
              </li>
              <li>
                📍 <span className="font-semibold">マップ機能</span>
                <br />
                シェアされたお店の情報をマーカーで一括表示。お店までの経路もすぐ分かる！
              </li>
              <li>
                📋 <span className="font-semibold">保存（ストック）機能</span>
                <br />
                個人で気になったお店は保存して、あとから振り返りやすい！
              </li>
              <li>
                📝 <span className="font-semibold">メモ機能</span>
                <br />
                お店ごとの感想やおすすめポイントも、気になるポイントを書き残しておけるから便利！
              </li>
            </ul>
            <Link href="/auth/signup">
              <button className="w-full rounded bg-gray-700 py-2 text-lg font-bold text-white shadow">
                シェアグルを使ってみる！
              </button>
            </Link>
          </section>

          {/* 利用の流れ */}
          <section className="mb-8">
            <h2 className="mb-2 text-center text-2xl font-bold tracking-wider">
              利用の流れ
            </h2>
            <ol className="mb-4 list-decimal space-y-1 pl-6 text-lg">
              <li>目的から気になるお店をストック</li>
              <li>
                友人や家族との外食予定を決まったら、グループ内で情報をシェア
              </li>
              <li>みんなで地図・メモを見比べながらお店を比較・検討</li>
              <li>決定したら、ホットペッパーの予約ページへ（ボタンで誘導）</li>
            </ol>
          </section>

          {/* 利用シーン */}
          <section>
            <h2 className="mb-2 text-center text-2xl font-bold tracking-wider">
              利用シーン
            </h2>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-lg">
              <li>よく集まる友達と</li>
              <li>おいしいもの好きの恋人と</li>
              <li>たまに外食する家族と</li>
              <li>会社のランチ仲間の同僚と</li>
              <li>旅行先でのお店探しに</li>
            </ul>
            <button className="w-full rounded bg-gray-700 py-2 text-lg font-bold text-white shadow">
              シェアグルを使ってみる！
            </button>
          </section>
        </main>
      </div>
    </>
  );
}
