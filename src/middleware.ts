import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // 無限リダイレクトを避けるために明確な条件を指定
  if (!user && !pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // ログイン済みユーザーがログインページにアクセスしようとしたらトップページへ
  if (user && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

// Middlewareを適用するパス
export const config = {
  matcher: [
    // _next、static files、favicon、auth を除外した全ページに適用
    "/((?!auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
