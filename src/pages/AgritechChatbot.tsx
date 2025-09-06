import React from 'react';
import PageTransition from '../components/shared/PageTransition';
import AgritechChatbot from '../components/chat/AgritechChatbot';

export default function AgritechChatbotPage() {
  return (
    <PageTransition>
      <AgritechChatbot />
    </PageTransition>
  );
}
