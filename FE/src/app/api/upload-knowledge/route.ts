import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

let embeddingPipeline: any = null;

async function getEmbedding(text: string): Promise<number[]> {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const embedding = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(embedding.data);
}

export async function POST(req: Request) {
  try {
    const { chatbotId, textContent } = await req.json();

    // 1. Szöveg egyszerű darabolása
    const chunks = textContent.match(/[\s\S]{1,1000}/g) || [];

    for (const chunk of chunks) {
      // 2. Vektor generálása (Embedding)
      const embedding = await getEmbedding(chunk);

      const { error } = await supabase.from('knowledge_base').insert({
        chatbot_id: chatbotId,
        content: chunk,
        embedding: embedding,
      });

      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: 'Tudásbázis feldolgozva és vektorizálva!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hiba a feldolgozás során' }, { status: 500 });
  }
}
