"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabase";

/**
 * サインアップ用フォームコンポーネント
 * @returns JSX.Element 新規登録画面UI
 */
export const SignUp = () => {
  /**
   * ユーザーが入力するフォームデータ（名前・メール・パスワード）
   */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // ←必ず空文字で入れておく！
  });

  /**
   * 画面遷移用Router
   */
  const router = useRouter();

  /**
   * サインアップ処理
   * 1. Supabase Authでユーザー作成
   * 2. profilesテーブルへ追加情報（名前・メール）登録
   * 3. エラー時はアラートで通知
   * @param {React.FormEvent} e フォーム送信イベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Supabase Authでユーザー登録
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

      if (signUpError) {
        alert("サインアップに失敗しました：" + signUpError.message);
        return;
      }

      const userId = signUpData.user?.id;
      if (!userId) {
        alert("ユーザーIDの取得に失敗しました。");
        return;
      }

      // 2. profilesテーブルにnameなど追加登録
      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: userId,
          name: formData.name,
          email: formData.email,
        },
      ]);

      if (insertError) {
        alert("ユーザーデータの保存に失敗しました：" + insertError.message);
        return;
      }

      // 3. 正常時はログインページへ遷移
      alert("サインアップ成功！ログインページに移動します。");
      router.push("/auth/login");
    } catch (error) {
      alert("予期しないエラーが発生しました。");
    }
  };

  /**
   * フォーム入力変更時のstate更新
   * @param {React.ChangeEvent<HTMLInputElement>} e 入力イベント
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * サインアップ画面UI
   */
  return (
    <div className="mt-10 flex flex-col items-center justify-center px-4">
      {/* メインフォーム */}
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          新規登録
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-6">
            {/* 名前入力 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="mt-1 block w-full rounded-lg border-transparent bg-gray-100 px-4 py-3 focus:border-gray-500 focus:bg-white focus:ring-0"
              />
            </div>

            {/* メールアドレス入力 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="mt-1 block w-full rounded-lg border-transparent bg-gray-100 px-4 py-3 focus:border-gray-500 focus:bg-white focus:ring-0"
              />
            </div>

            {/* パスワード入力 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="off"
                className="mt-1 block w-full rounded-lg border-transparent bg-gray-100 px-4 py-3 focus:border-gray-500 focus:bg-white focus:ring-0"
              />
            </div>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            className="mt-10 flex w-full justify-center rounded-full bg-blue-500 px-4 py-3 text-lg font-semibold text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            新規登録
          </button>
        </form>

        {/* ログインページ誘導 */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-500 hover:text-blue-600"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
