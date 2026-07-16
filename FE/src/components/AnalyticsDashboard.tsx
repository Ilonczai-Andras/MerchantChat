'use client';

import { useEffect, useState } from 'react';

interface AnalyticsData {
  totalQuestions: number;
  avgResponseTime: number;
  topQuestions: Array<{ question: string; count: number }>;
  satisfaction: {
    upvotes: number;
    downvotes: number;
    satisfactionRate: number;
    totalRatings: number;
  };
  hourlyData: Array<{ hour: number; count: number }>;
}

export function AnalyticsDashboard({ botId }: { botId: string }) {
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics?botId=${botId}&days=30`);
        if (!response.ok) {
          throw new Error('Statisztikák betöltése sikertelen');
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Hiba');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [botId]);

  if (isLoading) {
    return <p className="text-gray-500">Betöltés...</p>;
  }

  if (error || !stats) {
    return <p className="text-red-500">⚠️ {error}</p>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Questions */}
        <div className="ui-card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-gray-600">Összes Kérdés</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalQuestions}</p>
          <p className="text-xs text-gray-500 mt-1">Utolsó 30 nap</p>
        </div>

        {/* Avg Response Time */}
        <div className="ui-card p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-gray-600">Átlag Válaszidő</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.avgResponseTime}ms</p>
          <p className="text-xs text-gray-500 mt-1">Gyorsabb jobb</p>
        </div>

        {/* Satisfaction */}
        <div className="ui-card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <p className="text-sm text-gray-600">Megelégedettség</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{stats.satisfaction.satisfactionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">
            👍 {stats.satisfaction.upvotes} | 👎 {stats.satisfaction.downvotes}
          </p>
        </div>

        {/* Total Ratings */}
        <div className="ui-card p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <p className="text-sm text-gray-600">Összesen Értékelve</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.satisfaction.totalRatings}</p>
          <p className="text-xs text-gray-500 mt-1">Válaszok után</p>
        </div>
      </div>

      {/* Top Questions */}
      <div className="ui-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔝 Leggyakoribb Kérdések</h3>
        <div className="space-y-2">
          {stats.topQuestions.length > 0 ? (
            stats.topQuestions.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-800 flex-1">{item.question.substring(0, 60)}...</p>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500 h-2 rounded flex-1" style={{ width: `${Math.min(item.count * 20, 150)}px` }}></div>
                  <span className="text-sm font-semibold text-gray-600 w-8 text-right">{item.count}x</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Nincsenek kérdések még</p>
          )}
        </div>
      </div>

      {/* Hourly Chart */}
      <div className="ui-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Csúcsidők (Óránkénti)</h3>
        {stats.hourlyData && stats.hourlyData.length > 0 ? (
          <div className="flex items-end justify-between gap-1 h-32 bg-gray-50 p-3 rounded">
            {stats.hourlyData.map((item) => {
              const maxCount = Math.max(...stats.hourlyData.map(h => h.count));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 5;
              return (
                <div key={item.hour} className="flex flex-col items-center flex-1 gap-1">
                  <div
                    className={`w-full ${item.count > 0 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300'} rounded-t transition`}
                    style={{ height: `${Math.max(height, 5)}%`, minHeight: '4px' }}
                    title={`${item.hour}:00 - ${item.count} kérdés`}
                  ></div>
                  <p className="text-xs text-gray-600">{item.hour}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Nincsenek adatok az órákról</p>
        )}
        <p className="text-xs text-gray-500 mt-2 text-center">Óra (0-23)</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-900">
          💡 <strong>Tipp:</strong> Az értékelésekhez a ChatWidget-ben 👍/👎 gombokat kell hozzáadni!
        </p>
      </div>
    </div>
  );
}
