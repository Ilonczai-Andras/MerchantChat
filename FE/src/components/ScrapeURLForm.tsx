'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ScrapeURLFormProps {
  botId: string;
  onScrapeSuccess?: () => void;
}

export default function ScrapeURLForm({ botId, onScrapeSuccess }: ScrapeURLFormProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Kérjük add meg az URL-t!');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // URL validálás
      new URL(url);

      const response = await fetch('/api/scrape-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId,
          url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'URL leszedés sikertelen');
      }

      const data = await response.json();
      setSuccess(`✅ ${data.message}`);
      setUrl('');
      onScrapeSuccess?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Hiba a leszedéskor';
      if (errorMsg.includes('Invalid URL')) {
        setError('❌ Érvénytelen URL formátum (pl: https://example.com)');
      } else {
        setError(`❌ ${errorMsg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="font-semibold text-gray-900">🌐 URL Leszedés</h4>
      <p className="text-sm text-gray-600">Másold be egy weboldal URL-t - a tartalom hozzáadódik a meglévőhöz</p>

      <form onSubmit={handleScrape} className="space-y-3">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/faq vagy https://webshop.hu/szallitas"
          disabled={isLoading}
          className="w-full"
        />

        <Button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full"
        >
          {isLoading ? '⏳ Leszedés...' : '🌐 URL Feldolgozása'}
        </Button>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-green-600">{success}</div>}

      <p className="text-xs text-gray-500">
        💡 Pl: Webshopod GYIK oldala, szállítási feltételek, vagy termékleírások
      </p>
    </div>
  );
}
