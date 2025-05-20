"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn } from "@/components/ui/LogIn";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ここにログイン処理を実装
    console.log("Login attempt with:", { email, password });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <LogIn />
    </div>
  );
};

export default LoginPage;
