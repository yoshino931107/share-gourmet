import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Tab() {
  const pathname = usePathname();
  return (
    <>
      <footer className="position-sticky relative grid grid-cols-4 bg-transparent text-center text-gray-700">
        <div className="relative flex h-20 items-end transition-transform duration-200">
          <Link
            href="/share"
            className={`flex h-20 w-full flex-col items-center rounded-t-xl border border-gray-500 p-2 shadow-[0_-4px_6px_rgba(145,145,145,0.2)] transition-all duration-200 ${
              pathname === "/share"
                ? "z-10 translate-y-[-8px] bg-gradient-to-b from-orange-300 via-orange-400 to-orange-500"
                : "bg-gradient-to-b from-orange-100 via-orange-200 to-orange-300"
            }`}
          >
            <Image
              src="/share-icon.svg"
              alt="share SVG"
              width={48}
              height={48}
            />
            <span className="text-sm font-black">シェア</span>
          </Link>
        </div>
        <div className="relative flex h-20 items-end transition-transform duration-200">
          <Link
            href="/map"
            className={`flex h-20 w-full flex-col items-center rounded-t-xl border border-gray-500 p-2 shadow-[0_-4px_6px_rgba(145,145,145,0.2)] transition-all duration-200 ${
              pathname === "/map"
                ? "z-10 translate-y-[-8px] bg-gradient-to-b from-orange-300 via-orange-400 to-orange-500"
                : "bg-gradient-to-b from-orange-50 via-orange-100 to-orange-200"
            }`}
          >
            <Image src="/map-icon.svg" alt="map SVG" width={41} height={41} />
            <span className="text-sm font-black">マップ</span>
          </Link>
        </div>
        <div className="relative flex h-20 items-end transition-transform duration-200">
          <Link
            href="/search"
            className={`flex h-20 w-full flex-col items-center rounded-t-xl border border-gray-500 p-2 shadow-[0_-4px_6px_rgba(145,145,145,0.2)] transition-all duration-200 ${
              pathname === "/search"
                ? "z-10 translate-y-[-8px] bg-gradient-to-b from-orange-300 via-orange-400 to-orange-500"
                : "bg-gradient-to-b from-orange-100 via-orange-200 to-orange-300"
            }`}
          >
            <Image
              src="/search-icon.svg"
              alt="search SVG"
              width={41}
              height={41}
            />
            <span className="text-sm font-black">お店検索</span>
          </Link>
        </div>
        <div className="relative flex h-20 items-end transition-transform duration-200">
          <Link
            href="/mypage"
            className={`flex h-20 w-full flex-col items-center rounded-t-xl border border-gray-500 p-2 shadow-[0_-4px_6px_rgba(145,145,145,0.2)] transition-all duration-200 ${
              pathname === "/mypage"
                ? "z-10 translate-y-[-8px] bg-gradient-to-b from-orange-300 via-orange-400 to-orange-500"
                : "bg-gradient-to-b from-orange-50 via-orange-100 to-orange-200"
            }`}
          >
            <Image
              src="/mypage-icon.svg"
              alt="mypage SVG"
              width={41}
              height={41}
            />
            <span className="text-sm font-black">マイページ</span>
          </Link>
        </div>
      </footer>
    </>
  );
}
