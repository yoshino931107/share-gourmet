import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

/**
 * 全ページ共通でユーザー認証を判定し、リダイレクトを行うミドルウェア
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // 未ログインで /auth 配下以外にアクセス → ログインページへリダイレクト
  if (!user && !pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // ログイン済みで /auth 配下にアクセス → /search にリダイレクト＆通知フラグ付与
  if (user && pathname.startsWith("/auth")) {
    const url = new URL("/search", req.url);
    url.searchParams.set("status", "already_logged_in");
    return NextResponse.redirect(url);
  }
}

// ミドルウェアを適用するパスを明示
export const config = {
  matcher: [
    "/auth/:path*",
    "/detail/:path*",
    "/group_setting",
    "/map",
    "/mypage",
    "/private",
    "/result",
    "/search",
    "/share",
    "/share-detail/:path*",
  ],
};
