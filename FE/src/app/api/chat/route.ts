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
    const { chatbotId, userMessage, sessionId } = await req.json();

    // 1. A vásárló kérdésének vektorizálása
    const queryEmbedding = await getEmbedding(userMessage);

    // 2. Hasonló szövegek keresése az adatbázisban
    const { data: documents, error: rpcError } = await supabase.rpc('match_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 5,
      p_chatbot_id: chatbotId
    });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      return NextResponse.json({ error: `RPC hiba: ${rpcError.message}` }, { status: 500 });
    }

    console.log('RPC Documents found:', documents?.length || 0);
    console.log('Documents:', documents);

    const contextText = documents?.map((doc: any) => doc.content).join('\n\n---\n\n') || 'Nincs találat a tudásbázisban.';

    const userPrompt = `Te egy udvarias, segítőkész magyar nyelvű ügyfélszolgálati AI chatbot vagy.

                        Az alábbi TUDÁSBÁZIS tartalmazza az összes információt, amit tudnod kell:

                        <TUDASBAZIS>
                        ${contextText}
                        </TUDASBAZIS>

                        FONTOS SZABÁLYOK:
                        1. Kizárólag a TUDÁSBÁZIS alapján válaszolj
                        2. Ha a válasz nincs benne a TUDÁSBÁZISBAN, mondd el udvariasan, hogy nem tudod a választ
                        3. Javasold, hogy vegyék fel a kapcsolatot az ügyfélszolgálattal, ha nincs információ
                        4. NE találj ki információkat!
                        5. Válaszolj mindig magyarul!

                        Vásárló kérdése: ${userMessage}`;

    // 4. Válasz generálása Gemini 2.5 Flash-al
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    const chatResponse = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
      }
    });

    const botReply = chatResponse.response.text();

    // Mentjük a beszélgetést
    const finalSessionId = sessionId || `session_${Date.now()}`;
    const { error: logError } = await supabase
      .from('chat_logs')
      .insert({
        chatbot_id: chatbotId,
        session_id: finalSessionId,
        user_message: userMessage,
        bot_response: botReply,
        created_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Chat log error:', logError);
      // Nem szakítjuk meg a folyamatot, csak logolunk
    }

    return NextResponse.json({ reply: botReply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hiba a feldolgozás során' }, { status: 500 });
  }
}
