import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

let embeddingPipeline: any = null;

async function getEmbedding(text: string): Promise<number[]> {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const embedding = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(embedding.data);
}

// TXT fájl olvasása
async function parseTXT(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// CSV fájl olvasása
async function parseCSV(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const decoder = new TextDecoder();
  const text = decoder.decode(buffer);
  
  const lines = text.split('\n');
  const rows = lines.map(line => 
    line.split(',').map(cell => cell.trim()).join(' ')
  );
  
  return rows.join('\n');
}

// PDF fájl olvasása - egyenlőre nem támogatott
async function parsePDF(file: File): Promise<string> {
  throw new Error('PDF feldolgozás jelenleg nem támogatott. Kérjük konvertáld TXT vagy CSV formátumra.');
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const botId = formData.get('botId') as string;
    const files = formData.getAll('files') as File[];

    if (!botId || !files || files.length === 0) {
      return NextResponse.json(
        { error: 'botId és fájlok szükségesek' },
        { status: 400 }
      );
    }

    let combinedText = '';

    // Fájlok feldolgozása
    for (const file of files) {
      let fileContent = '';

      if (file.name.endsWith('.txt')) {
        fileContent = await parseTXT(file);
      } else if (file.name.endsWith('.csv')) {
        fileContent = await parseCSV(file);
      } else if (file.name.endsWith('.pdf')) {
        fileContent = await parsePDF(file);
      } else {
        console.warn(`Ismeretlen fájltípus: ${file.name}`);
        continue;
      }

      combinedText += fileContent + '\n\n---\n\n';
    }

    if (!combinedText.trim()) {
      return NextResponse.json(
        { error: 'Nincsenek feldolgozható szövegek a fájlokból' },
        { status: 400 }
      );
    }

    // Szöveg darabolása (chunking) - 1000 karakter per chunk
    const chunks: string[] = [];
    const chunkSize = 1000;
    for (let i = 0; i < combinedText.length; i += chunkSize) {
      chunks.push(combinedText.substring(i, i + chunkSize));
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
      message: `✅ ${files.length} fájl feldolgozva, ${chunks.length} új chunk hozzáadva`,
    });
  } catch (error) {
    console.error('Upload hiba:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Hiba a feltöltéskor' },
      { status: 500 }
    );
  }
}
