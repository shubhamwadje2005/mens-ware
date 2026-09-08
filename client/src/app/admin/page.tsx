"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white/40 text-sm">Redirecting to dashboard...</div>
    </div>
  );
}
