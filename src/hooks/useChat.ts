import { useState } from 'react';
import { Message } from '../services/ai/types';
import { aiService } from '../services/ai/gemini.service';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your AgriSmart Assistant. I have access to a comprehensive agricultural knowledge base to provide you with accurate, region-specific farming advice. How can I help you today?", isBot: true }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [contextUsed, setContextUsed] = useState<string[]>([]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = { id: Date.now(), text, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const isAgriRelated = await aiService.isAgriculturalPrompt(text);

      if (!isAgriRelated) {
        const outOfBoundsMessage: Message = {
          id: Date.now(),
          text: "Sorry, your prompt is out of scope. I can only assist with agriculture-related queries.",
          isBot: true
        };
        setMessages(prev => [...prev, outOfBoundsMessage]);
        setIsLoading(false);
        return;
      }

      // Get AI response
      const response = await aiService.generateResponse(text);
      
      // Add AI message
      const aiMessage: Message = {
        id: Date.now(),
        text: response.error ? `Error: ${response.error}` : response.text,
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
    isLoading,
    contextUsed
  };
}