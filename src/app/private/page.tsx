import { Suspense } from "react";
import PrivateClient from "@/components/ui/PrivateClient";

export default function PrivatePage() {
  return (
    <Suspense fallback={<div className="mt-70">Loading...✍️</div>}>
      <PrivateClient />
    </Suspense>
  );
}
