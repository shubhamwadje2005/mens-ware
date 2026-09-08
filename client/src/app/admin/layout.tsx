"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated, loading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (pathname !== "/admin/login" && !isAdminAuthenticated) {
        router.push("/admin/login");
      } else if (pathname === "/admin/login" && isAdminAuthenticated) {
        router.push("/admin/dashboard");
      }
    }
  }, [pathname, isAdminAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#ff6b00]" />
      </div>
    );
  }

  if (pathname === "/admin/login") return <>{children}</>;

  if (!isAdminAuthenticated) return null;

  return (
    <div className="admin-layout min-h-screen bg-[#050505] text-white transition-colors duration-300">
      <AdminSidebar />
      <main className="pl-0 lg:pl-64">
        <div className="p-6 pt-16 lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminGuard>{children}</AdminGuard>
    </AdminProvider>
  );
}

