import { useState } from 'react';
import { Message } from '../services/ai/types';
import { aiService } from '../services/ai/gemini.service';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your AgriSmart Assistant. How can I help you today?", isBot: true }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = { id: Date.now(), text, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get AI response
      const response = await aiService.generateResponse(text);
      
      // Add AI message
      const aiMessage: Message = {
        id: Date.now(),
        text: response.text,
        isBot: true
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      // Add error message
      const errorMessage: Message = {
        id: Date.now(),
        text: "I apologize, but I'm having trouble responding right now. Please try again later.",
        isBot: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading
  };
}