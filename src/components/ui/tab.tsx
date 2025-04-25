import Link from "next/link";

export default function Tab() {
  return (
    <>
      <footer className="position-sticky grid grid-cols-4 border-t text-center text-sm font-semibold text-gray-700">
        <Link
          href="/share"
          className="flex flex-col items-center bg-orange-100 p-2 hover:bg-orange-200"
        >
          <span className="text-3xl">❤️</span>
          <span>シェア</span>
        </Link>
        <Link
          href="/map"
          className="flex flex-col items-center bg-orange-50 p-2 hover:bg-orange-100"
        >
          <span className="text-3xl">📍</span>
          <span>マップ</span>
        </Link>
        <Link
          href="/search"
          className="flex flex-col items-center bg-orange-100 p-2 hover:bg-orange-200"
        >
          <span className="text-3xl">🔍</span>
          <span>お店検索</span>
        </Link>
        <Link
          href="/mypage"
          className="flex flex-col items-center bg-orange-50 p-2 hover:bg-orange-100"
        >
          <span className="text-3xl">👤</span>
          <span>マイページ</span>
        </Link>
      </footer>
    </>
  );
}
