"use client";
import Link from "next/link";
import { useEffect } from "react";
import Header from "@/components/ui/header";
import Tab from "@/components/ui/tab";
import { MapContent } from "@/components/ui/Map";

export default function MapPage() {
  return (
    <div className="mx-auto flex h-screen max-w-md flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-2">
        <div className="h-svh">
          <MapContent />
        </div>
      </main>
      <Tab />
    </div>
  );
}
