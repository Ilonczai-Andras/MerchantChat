"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  rating?: number; // -1: down, 0: none, 1: up
  analyticsId?: string; // Analytics rekord ID
}

interface ChatWidgetProps {
  botId: string;
  botName?: string;
  botColor?: string;
  botAvatar?: string;
}

export default function ChatWidget({
  botId,
  botName = "Assistant",
  botColor = "#3B82F6",
  botAvatar = "🤖",
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [ratingInProgress, setRatingInProgress] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);

  // Inicializálni a sessionId-t és betölteni az előzményeket
  useEffect(() => {
    const initSession = async () => {
      // Leszedni vagy generálni a sessionId-t
      let sid = typeof window !== "undefined" ? localStorage.getItem(`chat_session_${botId}`) : null;
      if (!sid) {
        sid = `session_${botId}_${Date.now()}`;
        if (typeof window !== "undefined") {
          localStorage.setItem(`chat_session_${botId}`, sid);
        }
      }
      setSessionId(sid);

      // Betölteni az előzményeket
      try {
        const response = await fetch(`/api/chat-history?sessionId=${sid}&botId=${botId}`);
        if (response.ok) {
          const data = await response.json();
          const historicalMessages: Message[] = (data.logs || []).map((log: any) => [
            {
              id: `${log.id}_user`,
              role: "user" as const,
              content: log.user_message,
              timestamp: new Date(log.created_at),
            },
            {
              id: `${log.id}_bot`,
              role: "bot" as const,
              content: log.bot_response,
              timestamp: new Date(log.created_at),
              analyticsId: log.analytics_id,
              rating: log.analytics_rating || undefined,
            },
          ]).flat();
          setMessages(historicalMessages);
        }
      } catch (err) {
        console.error("Előzmények betöltésének hiba:", err);
      }
    };

    initSession();
  }, [botId]);

  // Auto-scroll to bottom - csak új üzenetek esetén
  useEffect(() => {
    const currentCount = messages.length;
    if (currentCount > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = currentCount;
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatbotId: botId,
          userMessage: inputValue,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error(`⏳ ${errorData.error}`);
        }
        throw new Error(errorData.error || "Chat hiba");
      }

      const data = await response.json();

      // Add bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.reply,
        timestamp: new Date(),
        analyticsId: data.analyticsId,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba");
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (messageId: string, analyticsId: string | undefined, rating: number) => {
    setRatingInProgress(true);
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatbotId: botId,
          userRating: rating,
          analyticsId,
        }),
      });

      if (response.ok) {
        // Frissítjük az üzenetet rating-gel
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, rating } : msg
          )
        );
      }
    } catch (err) {
      console.error('Rating error:', err);
    } finally {
      setRatingInProgress(false);
    }
  };

  return (
    <div className="ui-card flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className="p-4 text-white flex items-center gap-3"
        style={{ backgroundColor: botColor }}
      >
        <div className="text-3xl">{botAvatar}</div>
        <div>
          <h3 className="font-semibold text-lg">{botName}</h3>
          <p className="text-xs opacity-90">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-5xl mb-2">👋</div>
            <p className="text-center text-sm">
              Üdvözöm! Hogyan segíthetek?
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === "user"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("hu-HU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Rating Buttons - csak bot üzenetekhez */}
                  {msg.role === "bot" && (
                    <div className="flex gap-2 mt-2 ml-1">
                      <button
                        onClick={() => handleRating(msg.id, msg.analyticsId, 1)}
                        disabled={ratingInProgress || msg.rating !== undefined}
                        className={`px-2 py-1 rounded text-xs font-semibold transition ${
                          msg.rating === 1
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-green-200 disabled:opacity-50"
                        }`}
                      >
                        👍
                      </button>
                      <button
                        onClick={() => handleRating(msg.id, msg.analyticsId, -1)}
                        disabled={ratingInProgress || msg.rating !== undefined}
                        className={`px-2 py-1 rounded text-xs font-semibold transition ${
                          msg.rating === -1
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-red-200 disabled:opacity-50"
                        }`}
                      >
                        👎
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-100 border-t border-red-200 text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Írd be a kérdésedet..."
            disabled={isLoading}
            className="ui-input flex-1"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            style={{ backgroundColor: botColor }}
            className="ui-button ui-button-default ui-button-size-default text-white hover:opacity-90"
          >
            {isLoading ? "..." : "Küld"}
          </button>
        </div>
      </form>
    </div>
  );
}
