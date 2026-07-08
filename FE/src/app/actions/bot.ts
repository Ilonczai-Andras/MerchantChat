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

export interface CreateBotInput {
  name: string;
  colorHex?: string;
  welcomeMessage?: string;
  userId: string;
}

export interface UpdateBotInput {
  botId: string;
  name?: string;
  colorHex?: string;
  welcomeMessage?: string;
}

export interface ChatBot {
  id: string;
  user_id: string;
  name: string;
  color_hex: string;
  welcome_message: string;
  created_at: string;
}

/**
 * Create a new chatbot
 */
export async function createBot(input: CreateBotInput) {
  try {
    const { name, colorHex, welcomeMessage, userId } = input;

    if (!name || !userId) {
      return {
        success: false,
        error: "Name and userId are required",
      };
    }

    const { data, error } = await supabase
      .from("chatbots")
      .insert([
        {
          name,
          color_hex: colorHex || "#3B82F6",
          welcome_message: welcomeMessage || "Üdvözöm! Hogyan segíthetek?",
          user_id: userId,
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
      bot: data,
    };
  } catch (error) {
    console.error("Error creating bot:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all bots for a user
 */
export async function getUserBots(userId: string) {
  try {
    const { data, error } = await supabase
      .from("chatbots")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      throw error;
    }

    return {
      success: true,
      bots: data || [],
    };
  } catch (error) {
    console.error("Error fetching bots:", error);
    
    // Provide more helpful error messages
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage.includes("does not exist")) {
      return {
        success: false,
        error: "A 'chatbots' tábla még nem létezik az adatbázisban. Kérjük hajtsd végre az inicializálási SQL-t.",
        bots: [],
      };
    }
    
    return {
      success: false,
      error: errorMessage,
      bots: [],
    };
  }
}

/**
 * Get a single bot by ID
 */
export async function getBot(botId: string) {
  try {
    const { data, error } = await supabase
      .from("chatbots")
      .select("*")
      .eq("id", botId)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      bot: data,
    };
  } catch (error) {
    console.error("Error fetching bot:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update a bot's settings
 */
export async function updateBot(input: UpdateBotInput) {
  try {
    const { botId, name, colorHex, welcomeMessage } = input;

    const updates: Record<string, any> = {};

    if (name !== undefined) updates.name = name;
    if (colorHex !== undefined) updates.color_hex = colorHex;
    if (welcomeMessage !== undefined) updates.welcome_message = welcomeMessage;

    if (Object.keys(updates).length === 0) {
      return {
        success: false,
        error: "Nincs módosítandó adat",
      };
    }

    const { data, error } = await supabase
      .from("chatbots")
      .update(updates)
      .eq("id", botId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      bot: data,
    };
  } catch (error) {
    console.error("Error updating bot:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a bot
 */
export async function deleteBot(botId: string) {
  try {
    const { error } = await supabase
      .from("chatbots")
      .delete()
      .eq("id", botId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "Chatbot sikeresen törölve",
    };
  } catch (error) {
    console.error("Error deleting bot:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
