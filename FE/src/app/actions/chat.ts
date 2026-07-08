"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "Supabase is not fully configured. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env.local"
  );
}

const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey || "placeholder-key"
);

export interface CreateChatLogInput {
  botId: string;
  sessionId: string;
  userMessage: string;
  botResponse: string;
}

export interface ChatLog {
  id: string;
  chatbot_id: string;
  session_id: string;
  user_message: string;
  bot_response: string;
  created_at: string;
}

/**
 * Save a chat message exchange
 */
export async function saveChatLog(input: CreateChatLogInput) {
  try {
    const { botId, sessionId, userMessage, botResponse } = input;

    if (!botId || !sessionId || !userMessage || !botResponse) {
      return {
        success: false,
        error: "Összes mező kitöltése szükséges",
      };
    }

    const { data, error } = await supabase
      .from("chat_logs")
      .insert([
        {
          chatbot_id: botId,
          session_id: sessionId,
          user_message: userMessage,
          bot_response: botResponse,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      chatLog: data,
    };
  } catch (error) {
    console.error("Error saving chat log:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get chat history for a session
 */
export async function getSessionChatHistory(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from("chat_logs")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return {
      success: true,
      messages: data || [],
    };
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      messages: [],
    };
  }
}

/**
 * Get all chat logs for a bot
 */
export async function getBotChatLogs(
  botId: string,
  limit: number = 100,
  offset: number = 0
) {
  try {
    const { data, error, count } = await supabase
      .from("chat_logs")
      .select("*", { count: "exact" })
      .eq("chatbot_id", botId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return {
      success: true,
      logs: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error("Error fetching bot chat logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      logs: [],
      total: 0,
    };
  }
}

/**
 * Delete old chat logs
 */
export async function deleteChatLogsBefore(botId: string, beforeDate: Date) {
  try {
    const { error } = await supabase
      .from("chat_logs")
      .delete()
      .eq("chatbot_id", botId)
      .lt("created_at", beforeDate.toISOString());

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "Chat naplók sikeresen törölve",
    };
  } catch (error) {
    console.error("Error deleting chat logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
