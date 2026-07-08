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

export interface CreateKnowledgeInput {
  botId: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface UpdateKnowledgeInput {
  knowledgeId: string;
  content?: string;
  metadata?: Record<string, any>;
}

export interface KnowledgeBase {
  id: string;
  chatbot_id: string;
  content: string;
  embedding: number[] | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

/**
 * Add knowledge/context to a chatbot's knowledge base
 */
export async function addKnowledge(input: CreateKnowledgeInput) {
  try {
    const { botId, content, embedding, metadata } = input;

    if (!botId || !content) {
      return {
        success: false,
        error: "Bot ID és content mezők kötelezőek",
      };
    }

    const { data, error } = await supabase
      .from("knowledge_base")
      .insert([
        {
          chatbot_id: botId,
          content,
          embedding: embedding || null,
          metadata: metadata || {},
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
      knowledge: data,
    };
  } catch (error) {
    console.error("Error adding knowledge:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all knowledge for a chatbot
 */
export async function getBotKnowledge(botId: string, limit: number = 100) {
  try {
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("chatbot_id", botId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return {
      success: true,
      knowledge: data || [],
    };
  } catch (error) {
    console.error("Error fetching knowledge:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      knowledge: [],
    };
  }
}

/**
 * Update a knowledge entry
 */
export async function updateKnowledge(input: UpdateKnowledgeInput) {
  try {
    const { knowledgeId, content, metadata } = input;

    const updates: Record<string, any> = {};

    if (content !== undefined) updates.content = content;
    if (metadata !== undefined) updates.metadata = metadata;

    if (Object.keys(updates).length === 0) {
      return {
        success: false,
        error: "Nincs módosítandó adat",
      };
    }

    const { data, error } = await supabase
      .from("knowledge_base")
      .update(updates)
      .eq("id", knowledgeId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      knowledge: data,
    };
  } catch (error) {
    console.error("Error updating knowledge:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a knowledge entry
 */
export async function deleteKnowledge(knowledgeId: string) {
  try {
    const { error } = await supabase
      .from("knowledge_base")
      .delete()
      .eq("id", knowledgeId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "Tudásbázis tétel sikeresen törölve",
    };
  } catch (error) {
    console.error("Error deleting knowledge:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete all knowledge for a bot
 */
export async function deleteBotAllKnowledge(botId: string) {
  try {
    const { error } = await supabase
      .from("knowledge_base")
      .delete()
      .eq("chatbot_id", botId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: "Összes tudásbázis tétel sikeresen törölve",
    };
  } catch (error) {
    console.error("Error deleting all knowledge:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search knowledge base (for RAG)
 */
export async function searchKnowledge(botId: string, searchQuery: string) {
  try {
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("chatbot_id", botId)
      .ilike("content", `%${searchQuery}%`)
      .limit(5);

    if (error) {
      throw error;
    }

    return {
      success: true,
      results: data || [],
    };
  } catch (error) {
    console.error("Error searching knowledge:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      results: [],
    };
  }
}
