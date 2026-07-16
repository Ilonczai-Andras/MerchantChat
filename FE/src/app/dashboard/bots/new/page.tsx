"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/auth";
import { createBot } from "@/app/actions/bot";

export default function NewBotPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    colorHex: "#3B82F6",
    welcomeMessage: "Üdvözöm! Hogyan segíthetek?",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      setError("Az üdvözlő üzenet kötelező");
      return;
    }

    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createBot({
        name: formData.name.trim(),
        colorHex: formData.colorHex.trim(),
        welcomeMessage: formData.welcomeMessage.trim(),
        userId: user.id,
      });

      if (result.success) {
        router.push(`/dashboard/bots/${result.bot.id}`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Vissza az irányítópultra
        </Link>
        <h2 className="text-3xl font-bold mt-4">Új chatbot létrehozása</h2>
      </div>

      <div className="ui-card max-w-2xl p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Chatbot neve <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="pl. Ügyfélszolgálat Bot"
              required
              className="ui-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Az ügyfeleid ezt a nevet fogják látni
            </p>
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
              <input
                type="text"
                name="colorHex"
                value={formData.colorHex}
                onChange={handleChange}
                placeholder="#3B82F6"
                className="ui-input flex-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              A chat widget megjelenítésének színe
            </p>
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Az ügyfelek ezt az üzenetet látják amikor megnyitják a chatot
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit" 
              disabled={isLoading || !formData.name.trim() || !formData.colorHex.trim() || !formData.welcomeMessage.trim()}
              className="ui-button ui-button-default ui-button-size-default"
            >
              {isLoading ? "Létrehozás..." : "Chatbot létrehozása"}
            </button>
            <Link href="/dashboard">
              <button className="ui-button ui-button-outline ui-button-size-default">Mégse</button>
            </Link>
          </div>
        </form>
      </div>

      {/* Template suggestions */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-4">Sablonok</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="ui-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() =>
                setFormData({
                  name: template.name,
                  colorHex: template.colorHex,
                  welcomeMessage: template.welcomeMessage,
                })
              }
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: template.colorHex }}
                />
                <h4 className="font-semibold">{template.name}</h4>
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const templates = [
  {
    id: 1,
    name: "Ügyfélszolgálat",
    description: "Ügyféltámogatás és problémamegoldás",
    colorHex: "#EF4444",
    welcomeMessage: "Üdvözöm az ügyfélszolgálatnál! Hogyan segíthetek?",
  },
  {
    id: 2,
    name: "Termékinformáció",
    description: "Termékek bemutatása és ajánlása",
    colorHex: "#3B82F6",
    welcomeMessage:
      "Szia! Szívesen segítek a termékkeinkről szóló információ kereséséhez.",
  },
  {
    id: 3,
    name: "Technikai támogatás",
    description: "Technikai problémák megoldása",
    colorHex: "#8B5CF6",
    welcomeMessage: "Technikai támogatás itt! Miben segíthetek?",
  },
];

