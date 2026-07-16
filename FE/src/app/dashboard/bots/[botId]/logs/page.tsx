'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChatLogsViewer } from '@/components/ChatLogsViewer';

export default function ChatLogsPage() {
  const params = useParams();
  const botId = params.botId as string;
  const router = useRouter();

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="ui-button ui-button-secondary ui-button-size-default mb-4"
        >
          ← Vissza
        </button>
        <h1 className="text-3xl font-bold">💬 Beszélgetés Előzmények</h1>
        <p className="text-gray-600 mt-2">
          Az összes ügyfél-chatbot beszélgetés a jelen bottal
        </p>
      </div>

      <ChatLogsViewer botId={botId} />
    </div>
  );
}
