"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "./context/auth";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Betöltés...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="max-w-md w-full mx-4 p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">MerchantChat</h1>
        <p className="text-gray-600 mb-8">
          Adminisztrátor panel chatbotok kezeléséhez
        </p>

        <div className="space-y-4">
          <Link href="/login" className="block">
            <Button className="w-full">Bejelentkezés</Button>
          </Link>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">vagy</span>
            </div>
          </div>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Regisztráció
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          A bejelentkezéshez rendelkezned kell egy aktív fiókkal
        </p>
      </Card>
    </div>
  );
}

