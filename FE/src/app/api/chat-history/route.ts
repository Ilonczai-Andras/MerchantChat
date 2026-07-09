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

    // Chat logs lekérdezése
    const { data: logs, error: logsError } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('session_id', sessionId)
      .eq('chatbot_id', botId)
      .order('created_at', { ascending: true });

    if (logsError) throw logsError;

    // Analytics ID-k lekérdezése ugyanerre a session-re
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics')
      .select('id, user_question, created_at')
      .eq('session_id', sessionId)
      .eq('chatbot_id', botId)
      .order('created_at', { ascending: true });

    if (analyticsError) throw analyticsError;

    // Analytics ID-k hozzáadása a logok-hoz (időbeli sorrend alapján)
    const enrichedLogs = logs?.map((log, idx) => ({
      ...log,
      analytics_id: analyticsData?.[idx]?.id || null
    })) || [];

    return NextResponse.json({ logs: enrichedLogs });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hiba a lekérés során' }, { status: 500 });
  }
}
