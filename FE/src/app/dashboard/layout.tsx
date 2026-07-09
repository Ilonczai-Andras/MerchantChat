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
      {/* Sidebar - Fixed */}
      <aside className="w-64 bg-white shadow fixed left-0 top-0 bottom-0 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">MerchantChat</h2>
          <p className="text-sm text-gray-500 mt-1 truncate">{user?.email}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
          <Link
            href="/dashboard"
            className="block px-4 py-3 rounded-lg hover:bg-blue-50 font-medium text-gray-700 hover:text-blue-600 transition"
          >
            📊 Irányítópult
          </Link>
          <Link
            href="/dashboard/bots"
            className="block px-4 py-3 rounded-lg hover:bg-blue-50 font-medium text-gray-700 hover:text-blue-600 transition"
          >
            🤖 Chatbotok
          </Link>
          <Link
            href="/dashboard/settings"
            className="block px-4 py-3 rounded-lg hover:bg-blue-50 font-medium text-gray-700 hover:text-blue-600 transition"
          >
            ⚙️ Beállítások
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            Kijelentkezés
          </Button>
        </div>
      </aside>

      {/* Main Content - Offset by sidebar */}
      <main className="flex-1 ml-64">
        <header className="sticky top-0 z-10 bg-white shadow">
          <div className="px-8 py-4">
            <h1 className="text-xl font-semibold text-gray-900">Adminisztrátor Panel</h1>
          </div>
        </header>

        <div className="p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
