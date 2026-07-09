import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(
  req: Request,
  { params }: { params: { botId: string } }
) {
  try {
    const botId = params.botId;

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID szükséges' }, { status: 400 });
    }

    // Leszedni a bot adatait
    const { data, error } = await supabase
      .from('chatbots')
      .select('id, name, color_hex, welcome_message')
      .eq('id', botId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Bot nem található' }, { status: 404 });
    }

    return NextResponse.json({ bot: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hiba a lekérés során' }, { status: 500 });
  }
}
