import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const botId = url.searchParams.get('botId');
    const days = parseInt(url.searchParams.get('days') || '30');

    if (!botId) {
      return NextResponse.json({ error: 'botId szükséges' }, { status: 400 });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Összlépések lekérdezése
    const { data: allAnalytics, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('chatbot_id', botId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Statisztikák számítása
    const totalQuestions = allAnalytics?.length || 0;
    const avgResponseTime = allAnalytics?.length 
      ? Math.round(allAnalytics.reduce((sum, a) => sum + (a.response_time_ms || 0), 0) / allAnalytics.length)
      : 0;

    // Top kérdések (gyakoriság alapján)
    const questionFrequency: Record<string, number> = {};
    allAnalytics?.forEach(a => {
      questionFrequency[a.user_question] = (questionFrequency[a.user_question] || 0) + 1;
    });

    const topQuestions = Object.entries(questionFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([question, count]) => ({ question, count }));

    // Rating statisztikák
    const ratings = allAnalytics?.filter(a => a.user_rating !== null && a.user_rating !== 0) || [];
    const upvotes = ratings.filter(a => a.user_rating === 1).length;
    const downvotes = ratings.filter(a => a.user_rating === -1).length;
    const satisfactionRate = ratings.length > 0 
      ? Math.round((upvotes / ratings.length) * 100)
      : 0;

    // Óránkénti statisztikák (csúcsidők)
    const hourlyStats: Record<number, number> = {};
    allAnalytics?.forEach(a => {
      const hour = new Date(a.created_at).getHours();
      hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
    });

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourlyStats[i] || 0
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalQuestions,
        avgResponseTime,
        topQuestions,
        satisfaction: {
          upvotes,
          downvotes,
          satisfactionRate,
          totalRatings: ratings.length
        },
        hourlyData
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hiba a statisztikák lekérésekor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { chatbotId, userRating, analyticsId } = await req.json();

    if (!chatbotId || userRating === undefined) {
      return NextResponse.json({ error: 'chatbotId és userRating szükséges' }, { status: 400 });
    }

    // Az analyticsId-t használjuk, vagy a legutolsó rekordat
    let recordId = analyticsId;
    if (!recordId) {
      const { data: lastAnalytics, error: fetchError } = await supabase
        .from('analytics')
        .select('id')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !lastAnalytics) {
        return NextResponse.json({ error: 'Nincs analytics adat' }, { status: 404 });
      }

      recordId = lastAnalytics.id;
    }

    const { error: updateError } = await supabase
      .from('analytics')
      .update({ user_rating: userRating })
      .eq('id', recordId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Hiba a rating mentésekor' }, { status: 500 });
  }
}
