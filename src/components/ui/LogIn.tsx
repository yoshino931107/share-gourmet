import React from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginFormValues = {
  email: string;
  password: string;
};

export const LogIn = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    setError(""); // エラーリセット
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError("ログインに失敗しました：" + error.message);
      return;
    }

    // 成功時のリダイレクト
    router.push("/share");
  };

  return (
    <div className="mt-10 flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-center text-2xl font-bold text-gray-700">
          ログイン
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
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

          {/* Password */}
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

          {/* Submit */}
          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-blue-500 py-2 text-lg font-semibold text-white transition hover:bg-blue-600"
          >
            ログイン
          </button>
          {error && <p className="mt-2 text-center text-red-500">{error}</p>}
        </form>

        <p className="mt-4 text-center text-sm text-black">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-blue-500 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};
