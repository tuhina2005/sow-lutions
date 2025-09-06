import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Globe, Settings, History, Plus, MapPin } from 'lucide-react';
import { agritechChatbotRobustService } from '../../services/ai/agritech-chatbot-robust.service';
import { multilingualService } from '../../services/ai/multilingual.service';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  language: string;
  confidence?: number;
}

interface UserProfile {
  user_id: number;
  name: string;
  location: string;
  preferred_language: string;
  farm_size?: number;
  farms: any[];
}

export default function AgritechChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supportedLanguages = multilingualService.getSupportedLanguages();

  useEffect(() => {
    // Initialize with greeting
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    const greeting = await multilingualService.generateGreeting(selectedLanguage);
    const initialMessage: Message = {
      id: 'greeting',
      text: greeting,
      isBot: true,
      timestamp: new Date(),
      language: selectedLanguage
    };
    setMessages([initialMessage]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: input,
      isBot: false,
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use user profile ID if available, otherwise let the service find any available user
      const userId = userProfile?.user_id;
      
      const response = await agritechChatbotRobustService.generateResponse(
        input,
        selectedLanguage,
        userId,
        sessionId
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate response');
      }

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: response.text || 'Sorry, I could not generate a response.',
        isBot: true,
        timestamp: new Date(),
        language: selectedLanguage,
        confidence: response.confidence
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date(),
        language: selectedLanguage
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    setShowLanguageSelector(false);
    
    // Regenerate greeting in new language
    const greeting = await multilingualService.generateGreeting(newLanguage);
    const greetingMessage: Message = {
      id: `greeting_${Date.now()}`,
      text: greeting,
      isBot: true,
      timestamp: new Date(),
      language: newLanguage
    };
    setMessages([greetingMessage]);
  };

  const setupUserProfile = async () => {
    const profileData = {
      name: 'Demo User',
      location: 'Punjab, India',
      preferred_language: selectedLanguage,
      farm_size: 5.0,
      farming_experience_years: 10
    };

    const userId = await agritechChatbotRobustService.createUserProfile(profileData);
    if (userId) {
      // Add sample farm data
      await agritechChatbotRobustService.addFarmToUser(userId, {
        farm_name: 'Main Farm',
        soil_type: 'Loamy',
        ph: 6.5,
        organic_carbon: 1.2,
        irrigation_available: true,
        irrigation_type: 'Drip',
        farm_area: 5.0,
        latitude: 31.583,
        longitude: 75.983
      });

      setUserProfile({
        user_id: userId,
        ...profileData,
        farms: [{
          farm_id: 1,
          farm_name: 'Main Farm',
          soil_type: 'Loamy',
          ph: 6.5,
          organic_carbon: 1.2,
          irrigation_available: true,
          farm_area: 5.0,
          latitude: 31.583,
          longitude: 75.983
        }]
      });
    }
    setShowProfileSetup(false);
  };

  const getLanguageFlag = (langCode: string) => {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'hi': '🇮🇳',
      'ta': '🇮🇳',
      'te': '🇮🇳',
      'bn': '🇮🇳',
      'mr': '🇮🇳',
      'gu': '🇮🇳',
      'kn': '🇮🇳',
      'ml': '🇮🇳',
      'pa': '🇮🇳',
      'or': '🇮🇳',
      'as': '🇮🇳'
    };
    return flags[langCode] || '🌐';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">AgriTech Assistant</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                title="Change Language"
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowProfileSetup(true)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                title="Profile Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Language Selector */}
          {showLanguageSelector && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Select Language</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(supportedLanguages).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={`p-2 text-sm rounded-lg flex items-center space-x-2 ${
                      selectedLanguage === code
                        ? 'bg-green-100 text-green-800'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{getLanguageFlag(code)}</span>
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          {userProfile ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">{userProfile.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{userProfile.location}</span>
              </div>
              <div className="text-sm text-gray-600">
                Farm Size: {userProfile.farm_size} acres
              </div>
              <div className="text-sm text-gray-600">
                Language: {supportedLanguages[userProfile.preferred_language]}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => setShowProfileSetup(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                <span>Setup Profile</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Questions</h3>
          <div className="space-y-2">
            {selectedLanguage === 'en' && (
              <>
                <button
                  onClick={() => setInput('What crops are suitable for my soil?')}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  What crops are suitable for my soil?
                </button>
                <button
                  onClick={() => setInput('How to improve soil health?')}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  How to improve soil health?
                </button>
                <button
                  onClick={() => setInput('Irrigation schedule for rice')}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  Irrigation schedule for rice
                </button>
              </>
            )}
            {selectedLanguage === 'hi' && (
              <>
                <button
                  onClick={() => setInput('मेरी मिट्टी के लिए कौन सी फसलें उपयुक्त हैं?')}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  मेरी मिट्टी के लिए कौन सी फसलें उपयुक्त हैं?
                </button>
                <button
                  onClick={() => setInput('मिट्टी की सेहत कैसे सुधारें?')}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  मिट्टी की सेहत कैसे सुधारें?
                </button>
                <button
                  onClick={() => setInput('चावल के लिए सिंचाई का समय')}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  चावल के लिए सिंचाई का समय
                </button>
              </>
            )}
            {selectedLanguage === 'ta' && (
              <>
                <button
                  onClick={() => setInput('என் மண்ணுக்கு எந்த பயிர்கள் பொருத்தமானவை?')}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  என் மண்ணுக்கு எந்த பயிர்கள் பொருத்தமானவை?
                </button>
                <button
                  onClick={() => setInput('மண்ணின் ஆரோக்கியத்தை எவ்வாறு மேம்படுத்துவது?')}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  மண்ணின் ஆரோக்கியத்தை எவ்வாறு மேம்படுத்துவது?
                </button>
                <button
                  onClick={() => setInput('அரிசிக்கான நீர்ப்பாசன திட்டம்')}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  அரிசிக்கான நீர்ப்பாசன திட்டம்
                </button>
              </>
            )}
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Conversations</h3>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">No previous conversations</div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Agricultural Assistant</h1>
              <p className="text-sm text-gray-600">
                Ask me anything about farming, crops, soil, or agriculture
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{getLanguageFlag(selectedLanguage)}</span>
              <span>{supportedLanguages[selectedLanguage]}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex max-w-[80%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`flex-shrink-0 ${message.isBot ? 'mr-3' : 'ml-3'}`}>
                  {message.isBot ? (
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <div className="text-sm">{message.text}</div>
                  <div className={`text-xs mt-1 ${
                    message.isBot ? 'text-gray-500' : 'text-blue-100'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                    {message.confidence && (
                      <span className="ml-2">
                        Confidence: {Math.round(message.confidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask about farming in ${supportedLanguages[selectedLanguage]}...`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Setup Your Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  defaultValue="Demo User"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  defaultValue="Punjab, India"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (acres)</label>
                <input
                  type="number"
                  defaultValue="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowProfileSetup(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={setupUserProfile}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Setup Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
