"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBot } from "@/app/actions/bot";
import ChatWidget from "@/components/ChatWidget";

interface Bot {
  id: string;
  name: string;
  color_hex: string;
  welcome_message: string;
}

export default function ChatTestPage() {
  const params = useParams();
  const botId = params.botId as string;
  const [bot, setBot] = useState<Bot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBot = async () => {
      try {
        const result = await getBot(botId);
        if (result.success && result.bot) {
          setBot(result.bot);
        } else {
          setError(result.error || "Bot nem található");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Hiba a betöltéskor");
      } finally {
        setIsLoading(false);
      }
    };

    loadBot();
  }, [botId]);

  if (isLoading) {
    return (
      <div>
        <Link href={`/dashboard/bots/${botId}`} className="text-blue-600 hover:underline">
          ← Vissza a beállításokhoz
        </Link>
        <p className="mt-4 text-gray-500">Betöltés...</p>
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div>
        <Link href={`/dashboard/bots/${botId}`} className="text-blue-600 hover:underline">
          ← Vissza a beállításokhoz
        </Link>
        <p className="mt-4 text-red-600">{error || "Bot nem található"}</p>
      </div>
    );
  }

  return (
    <div>
      <Link href={`/dashboard/bots/${botId}`} className="text-blue-600 hover:underline">
        ← Vissza a beállításokhoz
      </Link>

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-6">{bot.name} - Chat Teszt</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Widget */}
          <div className="lg:col-span-2">
            <div className="h-96">
              <ChatWidget
                botId={bot.id}
                botName={bot.name}
                botColor={bot.color_hex}
                botAvatar="🤖"
              />
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-4">Teszt Információk</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Bot ID:</p>
                <code className="bg-white px-2 py-1 rounded text-xs break-all">
                  {bot.id}
                </code>
              </div>
              <div>
                <p className="text-gray-600">Bot neve:</p>
                <p className="font-medium">{bot.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Szín:</p>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: bot.color_hex }}
                  />
                  <code className="bg-white px-2 py-1 rounded text-xs">
                    {bot.color_hex}
                  </code>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                💡 <strong>Tipp:</strong> Teszteld a chatot az itt feltöltött tudásbázis alapján! Ha nem működik, győződj meg róla, hogy van-e tudásbázis feltöltve az előző lapon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
