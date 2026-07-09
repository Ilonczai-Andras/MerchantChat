'use client';

import { useParams } from 'next/navigation';
import ChatWidget from '@/components/ChatWidget';

export default function EmbedPage() {
  const params = useParams();
  const botId = params.botId as string;

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      margin: 0, 
      padding: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <ChatWidget
        botId={botId}
        botName="Chatbot"
        botColor="#3B82F6"
        botAvatar="🤖"
      />
    </div>
  );
}
