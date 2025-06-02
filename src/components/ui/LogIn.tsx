import React from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * ログインフォームで利用するデータ型
 */
type LoginFormValues = {
  email: string;
  password: string;
};

/**
 * ログイン画面コンポーネント
 * @returns ログイン画面のUI
 */
export const LogIn = () => {
  /**
   * Supabaseクライアントの初期化
   */
  const supabase = createClientComponentClient();

  /**
   * Next.jsのルーター
   */
  const router = useRouter();

  /**
   * エラーメッセージ用のステート
   */
  const [error, setError] = useState("");

  /**
   * react-hook-formでフォーム制御
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  /**
   * フォーム送信時の処理
   * @param data ユーザーが入力したメールアドレス・パスワード
   */
  const onSubmit = async (data: LoginFormValues) => {
    setError(""); // エラーリセット

    // Supabaseでのログイン処理
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError("ログインに失敗しました：" + error.message);
      return;
    }

    // ログイン成功時はshareページへリダイレクト
    router.push("/share");
  };

  return (
    <div className="mt-10 flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-center text-2xl font-bold text-gray-700">
          ログイン
        </h2>

        {/* ログインフォーム */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email 入力フィールド */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...register("email", {
                required: "メールアドレスを入力してください",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "正しいメールアドレスを入力してください",
                },
              })}
              type="email"
              placeholder="Enter your email"
              className="mt-1 w-full rounded-md border-transparent bg-gray-100 px-3 py-2 placeholder-gray-600"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password 入力フィールド */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...register("password", {
                required: "パスワードを入力してください",
                minLength: {
                  value: 8,
                  message: "8文字以上で入力してください",
                },
              })}
              type="password"
              placeholder="Enter your password"
              className="mt-1 w-full rounded-md border-transparent bg-gray-100 px-3 py-2 placeholder-gray-600"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            className="mt-5 w-full rounded-md bg-amber-500 py-2 text-lg font-semibold text-white transition hover:bg-amber-600"
          >
            ログイン
          </button>
          {/* エラーメッセージ */}
          {error && <p className="mt-2 text-center text-red-500">{error}</p>}
        </form>

        {/* サインアップページへのリンク */}
        <p className="mt-4 text-center text-sm text-black">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-amber-600 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
