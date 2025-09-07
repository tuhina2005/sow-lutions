/**
 * Voice Chat Service
 * Handles speech-to-text and text-to-speech functionality
 */

export interface VoiceChatConfig {
  language: string;
  voiceGender: 'male' | 'female';
  speechRate: number;
  speechPitch: number;
}

export class VoiceChatService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  /**
   * Initialize speech recognition
   */
  private initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    } else {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
  }

  /**
   * Start listening for voice input
   */
  startListening(
    onResult: (text: string) => void,
    onError?: (error: string) => void,
    language: string = 'en'
  ): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // Set language based on user selection
    const langCode = this.getLanguageCode(language);
    this.recognition.lang = langCode;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('🎤 Voice recognition started');
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎤 Voice input:', transcript);
      onResult(transcript);
      this.isListening = false;
    };

    this.recognition.onerror = (event: any) => {
      console.error('🎤 Voice recognition error:', event.error);
      this.isListening = false;
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('🎤 Voice recognition ended');
    };

    this.recognition.start();
  }

  /**
   * Stop listening for voice input
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Speak text using text-to-speech
   */
  speak(
    text: string,
    language: string = 'en',
    config?: Partial<VoiceChatConfig>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Stop any current speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      const langCode = this.getLanguageCode(language);
      utterance.lang = langCode;

      // Set voice properties
      utterance.rate = config?.speechRate || 1.0;
      utterance.pitch = config?.speechPitch || 1.0;
      utterance.volume = 1.0;

      // Try to find a voice for the language
      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(langCode.split('-')[0])
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        console.log('🔊 Speech started:', text.substring(0, 50) + '...');
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        console.log('🔊 Speech ended');
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        console.error('🔊 Speech error:', event.error);
        reject(new Error(event.error));
      };

      this.synthesis.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stopSpeaking(): void {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Get language code for speech recognition/synthesis
   */
  private getLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'bn': 'bn-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
      'or': 'or-IN',
      'as': 'as-IN'
    };

    return languageMap[language] || 'en-US';
  }

  /**
   * Check if speech recognition is supported
   */
  isSpeechRecognitionSupported(): boolean {
    return !!(this.recognition);
  }

  /**
   * Check if speech synthesis is supported
   */
  isSpeechSynthesisSupported(): boolean {
    return !!(this.synthesis);
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const voiceChatService = new VoiceChatService();
