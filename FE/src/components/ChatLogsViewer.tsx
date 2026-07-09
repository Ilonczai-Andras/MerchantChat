'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ChatLog {
  id: string;
  user_message: string;
  bot_response: string;
  created_at: string;
}

export function ChatLogsViewer({ botId }: { botId: string }) {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/chat-logs?botId=${botId}`);
        if (!response.ok) {
          throw new Error('Nem sikerült betölteni az előzményeket');
        }
        const data = await response.json();
        setLogs(data.logs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ismeretlen hiba');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [botId]);

  const handleDeleteLog = async (logId: string) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt az üzenetet?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chat-logs?id=${logId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Törlés sikertelen');
      }

      setLogs(logs.filter(log => log.id !== logId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ismeretlen hiba');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Betöltés...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">⚠️ {error}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">📭 Nincsenek beszélgetések</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const date = new Date(log.created_at);
        const timeStr = date.toLocaleString('hu-HU');

        return (
          <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="text-xs text-gray-500">
                ⏰ {timeStr}
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteLog(log.id)}
                className="text-xs h-6 px-2"
              >
                🗑️ Törlés
              </Button>
            </div>

            {/* User Message */}
            <div className="mb-3 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
              <p className="text-xs font-semibold text-blue-900 mb-1">👤 Ügyfél</p>
              <p className="text-sm text-gray-800">{log.user_message}</p>
            </div>

            {/* Bot Reply */}
            <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
              <p className="text-xs font-semibold text-green-900 mb-1">🤖 Chatbot</p>
              <p className="text-sm text-gray-800">{log.bot_response}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
