import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { voiceChatService } from '../../services/ai/voice-chat.service';

interface VoiceChatButtonProps {
  onVoiceInput: (text: string) => void;
  onVoiceOutput: (text: string) => void;
  language: string;
  disabled?: boolean;
}

export default function VoiceChatButton({ 
  onVoiceInput, 
  onVoiceOutput, 
  language, 
  disabled = false 
}: VoiceChatButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if voice features are supported
    const speechSupported = voiceChatService.isSpeechRecognitionSupported();
    const synthesisSupported = voiceChatService.isSpeechSynthesisSupported();
    setIsVoiceEnabled(speechSupported && synthesisSupported);

    if (!speechSupported) {
      setError('Speech recognition not supported in this browser');
    } else if (!synthesisSupported) {
      setError('Speech synthesis not supported in this browser');
    }
  }, []);

  const handleStartListening = () => {
    if (disabled || !isVoiceEnabled) return;

    setError(null);
    setIsListening(true);

    voiceChatService.startListening(
      (text) => {
        setIsListening(false);
        onVoiceInput(text);
      },
      (error) => {
        setIsListening(false);
        setError(`Voice recognition error: ${error}`);
      },
      language
    );
  };

  const handleStopListening = () => {
    voiceChatService.stopListening();
    setIsListening(false);
  };

  const handleSpeakResponse = async (text: string) => {
    if (disabled || !isVoiceEnabled || !text) return;

    try {
      setIsSpeaking(true);
      setError(null);
      
      await voiceChatService.speak(text, language, {
        speechRate: 0.9,
        speechPitch: 1.0
      });
      
      setIsSpeaking(false);
    } catch (error) {
      setIsSpeaking(false);
      setError(`Speech synthesis error: ${error}`);
    }
  };

  const handleStopSpeaking = () => {
    voiceChatService.stopSpeaking();
    setIsSpeaking(false);
  };

  if (!isVoiceEnabled) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Mic className="w-5 h-5" />
        <span className="text-sm">Voice not supported</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Voice Input Button */}
      <button
        onClick={isListening ? handleStopListening : handleStartListening}
        disabled={disabled || isSpeaking}
        className={`p-2 rounded-lg transition-colors ${
          isListening
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        } ${disabled || isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Voice Output Button */}
      <button
        onClick={isSpeaking ? handleStopSpeaking : () => onVoiceOutput('')}
        disabled={disabled || isListening}
        className={`p-2 rounded-lg transition-colors ${
          isSpeaking
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-500 text-white hover:bg-gray-600'
        } ${disabled || isListening ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isSpeaking ? 'Stop speaking' : 'Speak last response'}
      >
        {isSpeaking ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-xs max-w-32">
          {error}
        </div>
      )}

      {/* Status Indicators */}
      {isListening && (
        <div className="flex items-center space-x-1 text-blue-600">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <span className="text-xs">Listening...</span>
        </div>
      )}

      {isSpeaking && (
        <div className="flex items-center space-x-1 text-green-600">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
          <span className="text-xs">Speaking...</span>
        </div>
      )}
    </div>
  );
}
