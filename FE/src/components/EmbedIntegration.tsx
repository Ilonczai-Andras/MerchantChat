'use client';

import { useState } from 'react';

interface EmbedIntegrationProps {
  botId: string;
  botName: string;
}

export function EmbedIntegration({ botId, botName }: EmbedIntegrationProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const getOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://your-domain.com';
  };

  const embedCode = `<script src="${getOrigin()}/embed.js?botId=${botId}"></script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="ui-card p-8 border-2 border-green-300 bg-green-50">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🌐</span>
        <div>
          <h3 className="text-lg font-semibold text-green-900">Integrálás Külső Weboldalakra</h3>
          <p className="text-sm text-green-800">Másold be ezt az embed kódot bármely weboldalra</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Bot Info */}
        <div className="bg-white p-3 rounded border-l-4 border-green-500">
          <p className="text-xs text-gray-600">Chatbot:</p>
          <p className="font-semibold text-gray-900">{botName}</p>
          <p className="text-xs text-gray-500 mt-1">Bot ID: <code className="bg-gray-100 px-1 rounded">{botId}</code></p>
        </div>

        {/* Embed Code */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Embed Kód:</p>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-gray-700">
            <code>{embedCode}</code>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopyCode}
          className={`ui-button ui-button-size-default w-full text-white font-semibold ${
            copiedCode
              ? 'bg-green-600 hover:bg-green-600'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {copiedCode ? '✓ Másolva a vágólapra!' : '📋 Kód Másolása'}
        </button>

        {/* Instructions */}
        <div className="bg-white p-4 rounded border border-green-200">
          <p className="text-xs font-semibold text-gray-800 mb-3">📖 Hogyan használd:</p>
          <ol className="text-xs text-gray-700 space-y-2 ml-4">
            <li>1. Másold a fenti kódot (kattints a gombra)</li>
            <li>2. Illeszd be a weboldal HTML-jébe (pl. &lt;body&gt; után)</li>
            <li>3. Mentsd el az oldalt</li>
            <li>4. A chat widget megjelenik a jobb alsó sarokban! 🎉</li>
          </ol>
        </div>

        {/* Features */}
        <div className="bg-white p-4 rounded border border-green-200">
          <p className="text-xs font-semibold text-gray-800 mb-3">✨ Funkciók:</p>
          <ul className="text-xs text-gray-700 space-y-1 ml-4">
            <li>✓ Automatikus szinkronizáció a bot beállításaival</li>
            <li>✓ Session memória (üzenetek megmaradnak F5 után)</li>
            <li>✓ Responsive design (mobil + desktop)</li>
            <li>✓ Izolált iFrame (nem zavarja az oldal stílusait)</li>
            <li>✓ Beépített chat előzmények</li>
          </ul>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Fontos:</strong> Az embed kód tartalmazza a bot ID-t. Ha nyilvánosan megosztod ezt az oldalt, bárki megtudja a bot ID-t. Ez azonban rendben van! 🔒
          </p>
        </div>
      </div>
    </div>
  );
}
