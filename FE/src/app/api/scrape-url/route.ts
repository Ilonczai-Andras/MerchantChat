import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';
import * as cheerio from 'cheerio';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

let embeddingPipeline: any = null;

async function getEmbedding(text: string): Promise<number[]> {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const embedding = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(embedding.data);
}

async function scrapeURL(url: string): Promise<string> {
  try {
    // URL validálás
    const urlObj = new URL(url);
    
    // Fetch a HTML-t
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Parse HTML-t cheerio-val
    const $ = cheerio.load(html);

    // Eltávolítunk script és style elemeket
    $('script, style, noscript').remove();

    // Szöveg leszedése
    let text = $('body').text();

    // Tisztítás: több szóköz helyettesítése eggyel
    text = text.replace(/\s+/g, ' ').trim();

    if (!text) {
      throw new Error('Nem sikerült szöveget kivonatni az URL-ből');
    }

    return text;
  } catch (err) {
    console.error('URL scrape hiba:', err);
    throw new Error(`URL leszedés sikertelen: ${err instanceof Error ? err.message : 'Ismeretlen hiba'}`);
  }
}

export async function POST(req: Request) {
  try {
    const { botId, url } = await req.json();

    if (!botId || !url) {
      return NextResponse.json(
        { error: 'botId és url szükségesek' },
        { status: 400 }
      );
    }

    // URL leszedése
    const content = await scrapeURL(url);

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'Nincsenek feldolgozható szövegek az URL-ből' },
        { status: 400 }
      );
    }



    // Szöveg darabolása (chunking) - 1000 karakter per chunk
    const chunks: string[] = [];
    const chunkSize = 1000;
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.substring(i, i + chunkSize));
    }

    // Vektorizálás és adatbázisba mentés
    const insertData = [];
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      insertData.push({
        chatbot_id: botId,
        content: chunk,
        embedding: embedding,
      });
    }

    const { error: insertError } = await supabase
      .from('knowledge_base')
      .insert(insertData);

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      message: `✅ URL feldolgozva, ${chunks.length} új chunk hozzáadva`,
    });
  } catch (error) {
    console.error('Scrape hiba:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Hiba a leszedéskor' },
      { status: 500 }
    );
  }
}
