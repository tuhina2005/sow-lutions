import React, { useState } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useChat } from '../../hooks/useChat';

interface ChatDialogProps {
  onClose: () => void;
}

export default function ChatDialog({ onClose }: ChatDialogProps) {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const { messages, sendMessage, isLoading } = useChat();
  const [input, setInput] = useState('');
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-xl flex flex-col border border-gray-200
      ${isMobile ? 'fixed inset-x-0 inset-y-0 m-4 rounded-lg' : 'h-[500px]'}
    `}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-green-600 text-white rounded-t-lg">
        <h3 className="font-semibold">AgriSmart Assistant</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-green-700 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isBot
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-green-600 text-white'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}