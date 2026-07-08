"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, signOut, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Betöltés...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow">
        <div className="p-6">
          <h2 className="text-2xl font-bold">MerchantChat</h2>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>

        <nav className="space-y-2 px-4">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium"
          >
            Irányítópult
          </Link>
          <Link
            href="/dashboard/bots"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium"
          >
            Chatbotok
          </Link>
          <Link
            href="/dashboard/settings"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100 font-medium"
          >
            Beállítások
          </Link>
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            Kijelentkezés
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="bg-white shadow">
          <div className="px-8 py-4">
            <h1 className="text-xl font-semibold">Adminisztrátor Panel</h1>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
