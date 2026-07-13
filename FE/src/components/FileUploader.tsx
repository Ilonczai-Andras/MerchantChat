'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  botId: string;
  onUploadSuccess?: () => void;
}

export default function FileUploader({ botId, onUploadSuccess }: FileUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('botId', botId);

      // Összes kiválasztott fájlt hozzáadjuk
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await fetch('/api/upload-files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fájlfeltöltés sikertelen');
      }

      const data = await response.json();
      setSuccess(`✅ ${data.message}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadSuccess?.();
    } catch (err) {
      setError(`❌ ${err instanceof Error ? err.message : 'Hiba a feltöltéskor'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-semibold text-gray-900">📁 Fájlfeltöltés</h4>
      <p className="text-sm text-gray-600">Töltsd fel TXT vagy CSV fájlokat - a tartalom hozzáadódik a meglévőhöz</p>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.csv"
        onChange={handleFileChange}
        disabled={isLoading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          disabled:opacity-50"
      />

      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-green-600">{success}</div>}

      {isLoading && <p className="text-sm text-gray-500">Feldolgozás...</p>}
    </div>
  );
}
