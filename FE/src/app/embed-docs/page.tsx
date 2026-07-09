'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function EmbedDocsPage() {
  const [copiedCode, setCopiedCode] = useState(false);

  const embedCode = `<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/embed.js?botId=YOUR_BOT_ID"></script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Vissza a Dashboard-ra
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌐 Chat Widget Beágyazása
          </h1>
          <p className="text-xl text-gray-700">
            Integrálj egy chat widgetet bármilyen weboldalra mindössze 1 sor kóddal!
          </p>
        </div>

        {/* Quick Start */}
        <Card className="p-8 mb-8 border-2 border-green-500 bg-green-50">
          <h2 className="text-2xl font-bold text-green-900 mb-6">✅ Gyors Kezdés</h2>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-800 mb-2">1. Másold be ezt a kódot a &lt;head&gt; vagy &lt;/body&gt; elé:</p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code>{embedCode}</code>
              </div>
              <Button
                onClick={handleCopyCode}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white"
              >
                {copiedCode ? '✓ Másolva!' : '📋 Másolás'}
              </Button>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-2">2. Cseréld le a &quot;YOUR_BOT_ID&quot;-t a bot ID-jával:</p>
              <div className="bg-gray-100 p-3 rounded border-l-4 border-blue-500">
                <p className="text-sm text-gray-700">
                  Ahol találod a Bot ID-t? → Dashboard → Bot Beállítások → Az oldal tetején látható
                </p>
              </div>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-2">3. Kész! 🎉</p>
              <p className="text-gray-700">
                A widget automatikusan betöltődik az oldal jobb alsó sarkában.
              </p>
            </div>
          </div>
        </Card>

        {/* Features */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Funkciók</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-semibold">Responsive Design</p>
                <p className="text-sm text-gray-600">Mobil & desktop optimalizálva</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-2xl">💾</span>
              <div>
                <p className="font-semibold">Session Memória</p>
                <p className="text-sm text-gray-600">Üzenetlánc megmarad az oldal frissítés után</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <p className="font-semibold">Bot Szín</p>
                <p className="text-sm text-gray-600">A widget a bot színével jelenik meg</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-semibold">Izolált iFrame</p>
                <p className="text-sm text-gray-600">Nem zavarja az oldal stílusait</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-semibold">Könnyű</p>
                <p className="text-sm text-gray-600">Minimal JS footprint, gyors betöltés</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="text-2xl">🌍</span>
              <div>
                <p className="font-semibold">Cross-Domain</p>
                <p className="text-sm text-gray-600">Bármely weboldalra beilleszthető</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Troubleshooting */}
        <Card className="p-8 mb-8 bg-yellow-50 border-2 border-yellow-300">
          <h2 className="text-2xl font-bold text-yellow-900 mb-6">🔧 Hibaelhárítás</h2>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-800">❓ A widget nem jelenik meg</p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1 ml-4">
                <li>✓ Ellenőrizd, hogy a bot ID helyes-e</li>
                <li>✓ Nyisd meg a böngésző Console-t (F12) és keress hibákat</li>
                <li>✓ Győződj meg, hogy a bot aktív és van tudásbázisa</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-800">❓ Az üzenetek nem mentésre kerülnek</p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1 ml-4">
                <li>✓ Ellenőrizd a böngésző Network tab-ot</li>
                <li>✓ A chat_logs tábla létezik-e a Supabase-ben?</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-800">❓ A widget nagy vagy rossz pozícióban van</p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1 ml-4">
                <li>✓ Módosítsd az embed.js-t CSS szerint</li>
                <li>✓ Vagy adj egy CSS override-ot az oldalon</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Example */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Teljes HTML Példa</h2>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`<!DOCTYPE html>
<html>
<head>
    <title>Moje webové stránky</title>
</head>
<body>
    <h1>Üdvözöm a weboldalamat!</h1>
    <p>Van egy kérdésed? Írj a chatbot-nak!</p>

    <!-- Beágyazd a chat widget-et itt: -->
    <script src="https://your-domain.com/embed.js?botId=YOUR_BOT_ID"></script>
</body>
</html>`}</pre>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-700">
            Szükséged van segítségre? {' '}
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              Fordulj az admin panelhez
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
