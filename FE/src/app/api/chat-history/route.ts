import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const botId = url.searchParams.get('botId');

    if (!sessionId || !botId) {
      return NextResponse.json({ error: 'sessionId és botId szükséges' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('session_id', sessionId)
      .eq('chatbot_id', botId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ logs: data || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hiba a lekérés során' }, { status: 500 });
  }
}
