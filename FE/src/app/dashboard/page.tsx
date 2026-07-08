"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth";
import { getUserBots } from "@/app/actions/bot";

interface Bot {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBots = async () => {
      try {
        if (!user?.id) {
          setError("User not authenticated");
          setIsLoading(false);
          return;
        }

        const result = await getUserBots(user.id);

        if (result.success) {
          setBots(result.bots);
        } else {
          // If there's an error, it might be because Supabase is not configured
          if (result.error?.includes("required") || result.error?.includes("configured")) {
            setError(
              "Supabase konfigurálása szükséges a chatbotok betöltéséhez. Kérjük add meg az szükséges environment variables-okat a .env.local fájlban."
            );
          } else {
            setError(result.error || "Hiba történt a chatbotok betöltése során");
          }
        }
      } catch (err) {
        console.error("Error loading bots:", err);
        setError(
          "Hiba történt a chatbotok betöltése során. Ellenőrizd a Supabase konfigurációt."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadBots();
  }, [user?.id]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Irányítópult</h2>
          <p className="text-gray-600 mt-1">
            Üdvözlünk az adminisztrátor panelben {user?.email && `- ${user.email}`}
          </p>
        </div>
        <Link href="/dashboard/bots/new">
          <Button>+ Új chatbot</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-semibold">Konfigurációs hiba</p>
          <p className="text-sm mt-1">{error}</p>
          <details className="mt-3 text-xs">
            <summary className="cursor-pointer underline">Beállítási útmutató</summary>
            <div className="mt-2 p-2 bg-red-50 rounded space-y-2">
              <p className="font-semibold">1. Adatbázis táblák létrehozása:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Nyisd meg a <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase</a> projekted</li>
                <li>Menj az <strong>SQL Editor</strong> szekcióba</li>
                <li>Hozz létre egy új query-t</li>
                <li>Másolj be az SQL-t a <code className="bg-red-200 px-1 rounded">docs/DATABASE_SETUP.sql</code> fájlból</li>
                <li>Futtasd végig az összes parancsot</li>
              </ol>
              <p className="font-semibold mt-3">2. Felhasználó profil létrehozása:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Nyisd meg az <strong>Authentication</strong> szekciót</li>
                <li>Keress meg a felhasználót (email-el)</li>
                <li>Másolj ki az <strong>User ID</strong>-t</li>
                <li>Futtasd le ezt az SQL-t az SQL Editor-ban:</li>
              </ol>
              <code className="bg-red-200 px-2 py-1 rounded block mt-2 text-xs overflow-x-auto">
                INSERT INTO profiles (id, company_name, subscription_status) VALUES('USER_ID_HERE', 'My Company', 'free');
              </code>
            </div>
          </details>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="col-span-3 text-gray-500">Betöltés...</p>
        ) : bots.length === 0 ? (
          <Card className="col-span-3 p-8 text-center">
            <p className="text-gray-500 mb-4">
              Még nincs chatbotod. Hozz létre egy újat a kezdéshez.
            </p>
            <Link href="/dashboard/bots/new">
              <Button>Első chatbot létrehozása</Button>
            </Link>
          </Card>
        ) : (
          bots.map((bot) => (
            <Card key={bot.id} className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold mb-2">{bot.name}</h3>
              <p className="text-xs text-gray-400 mb-4">
                Létrehozva: {new Date(bot.created_at).toLocaleDateString("hu-HU")}
              </p>
              <Link href={`/dashboard/bots/${bot.id}`}>
                <Button variant="outline" className="w-full">
                  Beállítások
                </Button>
              </Link>
            </Card>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Összes chatbot</p>
            <p className="text-3xl font-bold mt-2">{bots.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Aktív konverzációk</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Felhasználók</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </Card>
        </div>
      )}
    </div>
  );
}
