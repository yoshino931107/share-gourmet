"use client";
import { LogIn } from "@/components/ui/LogIn";
import Header from "@/components/ui/Header";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <LogIn />
    </div>
  );
};

export default LoginPage;
