"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmbedIntegration } from "@/components/EmbedIntegration";
import FileUploader from "@/components/FileUploader";
import { getBot, updateBot, deleteBot } from "@/app/actions/bot";

interface Bot {
  id: string;
  name: string;
  color_hex: string;
  welcome_message: string;
  created_at: string;
  user_id: string;
}

export default function BotSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const botId = params.botId as string;

  const [bot, setBot] = useState<Bot | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    colorHex: "",
    welcomeMessage: "",
  });
  const [knowledgeText, setKnowledgeText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingKnowledge, setIsUploadingKnowledge] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadBot = async () => {
      try {
        const result = await getBot(botId);

        if (result.success && result.bot) {
          setBot(result.bot);
          setFormData({
            name: result.bot.name,
            colorHex: result.bot.color_hex,
            welcomeMessage: result.bot.welcome_message,
          });

          // Betöltjük az előző tudásbázist
          const knowledgeRes = await fetch(
            `/api/upload-knowledge?chatbotId=${botId}`
          );
          if (knowledgeRes.ok) {
            const knowledgeData = await knowledgeRes.json();
            if (knowledgeData.content) {
              setKnowledgeText(knowledgeData.content);
            }
          }
        } else {
          setError(result.error || "Chatbot nem található");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    loadBot();
  }, [botId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    if (!formData.name.trim()) {
      setError("A chatbot neve kötelező");
      return;
    }

    if (!formData.colorHex.trim()) {
      setError("A szín kiválasztása kötelező");
      return;
    }

    if (!formData.welcomeMessage.trim()) {
      setError("Az üdvözlő üzenet megadása kötelező");
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateBot({
        botId,
        name: formData.name.trim(),
        colorHex: formData.colorHex.trim(),
        welcomeMessage: formData.welcomeMessage.trim(),
      });

      if (result.success) {
        setSuccess("Beállítások sikeresen mentve");
        setBot(result.bot);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a chatbotot?")) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const result = await deleteBot(botId);

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!knowledgeText.trim()) {
      setError("Kérjük, írj be szöveget a feltöltéshez");
      return;
    }

    setIsUploadingKnowledge(true);

    try {
      const response = await fetch("/api/upload-knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatbotId: botId,
          textContent: knowledgeText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Feltöltés sikertelen");
      }

      const data = await response.json();
      setSuccess("Tudásbázis sikeresen feltöltve és vektorizálva!");
      
      // Betöltjük az új szöveget
      const knowledgeRes = await fetch(
        `/api/upload-knowledge?chatbotId=${botId}`
      );
      if (knowledgeRes.ok) {
        const knowledgeData = await knowledgeRes.json();
        if (knowledgeData.content) {
          setKnowledgeText(knowledgeData.content);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba");
    } finally {
      setIsUploadingKnowledge(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Vissza az irányítópultra
        </Link>
        <p className="mt-4 text-gray-500">Betöltés...</p>
      </div>
    );
  }

  if (!bot) {
    return (
      <div>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Vissza az irányítópultra
        </Link>
        <p className="mt-4 text-red-600">{error || "Chatbot nem található"}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Vissza az irányítópultra
        </Link>
        <div className="flex items-center gap-3 mt-4">
          <div
            className="w-8 h-8 rounded-lg"
            style={{ backgroundColor: bot.color_hex }}
          />
          <h2 className="text-3xl font-bold">{bot.name} - Beállítások</h2>
        </div>
        <p className="text-gray-600 text-sm mt-1">
          ID: {bot.id}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            <h3 className="text-lg font-semibold mb-6">Alapvető beállítások</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Chatbot neve
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Chatbot neve"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Bot szín
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    name="colorHex"
                    value={formData.colorHex}
                    onChange={handleChange}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    name="colorHex"
                    value={formData.colorHex}
                    onChange={handleChange}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Üdvözlő üzenet
                </label>
                <textarea
                  name="welcomeMessage"
                  value={formData.welcomeMessage}
                  onChange={handleChange}
                  placeholder="Üdvözöm! Hogyan segíthetek?"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Az ügyfelek ezt az üzenetet látják amikor megnyitják a chatot
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={isSaving || !formData.name.trim() || !formData.colorHex.trim() || !formData.welcomeMessage.trim()}
              >
                {isSaving ? "Mentés..." : "Beállítások mentése"}
              </Button>
            </form>
          </Card>

          {/* Knowledge Base */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">📚 Tudásbázis</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Töltsd fel fájlokat vagy másold be szövegesen
                </p>
              </div>
            </div>

            {/* File Uploader */}
            <div className="mb-8">
              <FileUploader botId={botId} onUploadSuccess={() => {
                setSuccess("Fájlok feldolgozva!");
                setTimeout(() => setSuccess(""), 3000);
              }} />
            </div>

            {/* Text Editor */}
            <div className="border-t pt-8">
              <h4 className="font-semibold mb-4">Vagy szerkeszd szövegesen</h4>
              <form onSubmit={handleUploadKnowledge} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <span>Tudásbázis szövege</span>
                    {knowledgeText.trim() && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        ✓ Szöveg mentve
                      </span>
                    )}
                  </label>
                  <textarea
                    value={knowledgeText}
                    onChange={(e) => setKnowledgeText(e.target.value)}
                    placeholder="Másold be az új szöveget (GYIK, szállítási feltételek, stb.) vagy szerkeszd az előzőt..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Az új szöveg felülírja az előzőt. A szöveg 1000 karakteres blokkokra lesz darabolva és vektorizálva.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isUploadingKnowledge || !knowledgeText.trim()}
                >
                  {isUploadingKnowledge ? "Mentés..." : "🚀 Tudásbázis Mentése"}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chat Test */}
          <Card className="p-6 border-green-200 bg-green-50">
            <h4 className="font-semibold text-green-900 mb-2">💬 Chat Teszt</h4>
            <p className="text-xs text-green-800 mb-4">
              Teszteld a chatbot működését a valós tudásbázis alapján.
            </p>
            <Link href={`/dashboard/bots/${botId}/chat`}>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Chat Megnyitása
              </Button>
            </Link>
          </Card>

          {/* Chat Logs */}
          <Card className="p-6 border-purple-200 bg-purple-50">
            <h4 className="font-semibold text-purple-900 mb-2">💬 Beszélgetés Előzmények</h4>
            <p className="text-xs text-purple-800 mb-4">
              Nézd meg az összes ügyfél-chatbot beszélgetést.
            </p>
            <Link href={`/dashboard/bots/${botId}/logs`}>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Előzmények Megtekintése
              </Button>
            </Link>
          </Card>

          {/* Preview */}
          <Card className="p-6 border-2" style={{ borderColor: bot.color_hex }}>
            <h4 className="font-semibold mb-4">Előnézet</h4>
            <div
              className="rounded-lg p-4 text-white"
              style={{ backgroundColor: bot.color_hex }}
            >
              <p className="text-sm font-semibold mb-2">{bot.name}</p>
              <p className="text-sm">{formData.welcomeMessage}</p>
            </div>
          </Card>

          {/* Delete */}
          <Card className="p-6 border-red-200 bg-red-50">
            <h4 className="font-semibold text-red-900 mb-2">Veszélyes zóna</h4>
            <p className="text-xs text-red-800 mb-4">
              A chatbot végleg törlésre kerül.
            </p>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Törlés..." : "Chatbot törlése"}
            </Button>
          </Card>
        </div>
      </div>

      {/* Embed Integration Section */}
      <div className="mt-12">
        <EmbedIntegration botId={botId} botName={bot?.name || "Chatbot"} />
      </div>
    </div>
  );
}
