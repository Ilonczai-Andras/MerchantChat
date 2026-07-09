import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const botId = url.searchParams.get('botId');

    if (!botId) {
      return NextResponse.json({ error: 'botId szükséges' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('chatbot_id', botId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ logs: data || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hiba a lekérés során' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const logId = url.searchParams.get('id');

    if (!logId) {
      return NextResponse.json({ error: 'id szükséges' }, { status: 400 });
    }

    const { error } = await supabase
      .from('chat_logs')
      .delete()
      .eq('id', logId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Törlés sikertelen' }, { status: 500 });
  }
}
