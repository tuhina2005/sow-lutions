import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../../config/ai.config';

export interface LanguageDetection {
  language: string;
  confidence: number;
  isSupported: boolean;
}

export interface MultilingualResponse {
  originalText: string;
  detectedLanguage: string;
  translatedText?: string;
  responseLanguage: string;
}

class MultilingualService {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);
    this.model = genAI.getGenerativeModel({ model: AI_CONFIG.model });
  }

  // Supported languages for the agritech chatbot
  private readonly supportedLanguages = {
    'en': 'English',
    'hi': 'Hindi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'bn': 'Bengali',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'or': 'Odia',
    'as': 'Assamese'
  };

  /**
   * Detect the language of the input text
   */
  async detectLanguage(text: string): Promise<LanguageDetection> {
    try {
      const prompt = `Detect the language of the following text. Respond with only the language code (e.g., 'en', 'hi', 'ta'). If the language is not supported, respond with 'en'.

Supported languages: ${Object.keys(this.supportedLanguages).join(', ')}

Text: "${text}"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const detectedLang = response.text().trim().toLowerCase();

      const isSupported = Object.keys(this.supportedLanguages).includes(detectedLang);
      const language = isSupported ? detectedLang : 'en';

      return {
        language,
        confidence: isSupported ? 0.9 : 0.7,
        isSupported
      };
    } catch (error) {
      console.error('Language detection error:', error);
      return {
        language: 'en',
        confidence: 0.5,
        isSupported: true
      };
    }
  }

  /**
   * Translate text to target language
   */
  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      if (!Object.keys(this.supportedLanguages).includes(targetLanguage)) {
        return text; // Return original if target language not supported
      }

      const prompt = `Translate the following text to ${this.supportedLanguages[targetLanguage as keyof typeof this.supportedLanguages]}. Maintain the agricultural context and technical terms. Respond with only the translated text.

Text: "${text}"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  }

  /**
   * Generate agricultural response in the user's language
   */
  async generateMultilingualResponse(
    userQuery: string,
    context: string,
    userLanguage: string
  ): Promise<string> {
    try {
      const languageName = this.supportedLanguages[userLanguage as keyof typeof this.supportedLanguages] || 'English';
      
      const prompt = `You are an expert agricultural advisor. Respond to the user's question in ${languageName}. Use the provided context to give accurate, practical agricultural advice. Be specific and actionable.

Context: ${context}

User Question: ${userQuery}

Instructions:
- Answer only in ${languageName}
- Use appropriate agricultural terminology in ${languageName}
- Provide specific, actionable advice
- Include relevant local practices and examples
- Keep responses concise but comprehensive
- If the question is not agriculture-related, politely redirect to agricultural topics

Response:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Multilingual response generation error:', error);
      return this.getFallbackResponse(userLanguage);
    }
  }

  /**
   * Get fallback response in case of errors
   */
  private getFallbackResponse(language: string): string {
    const fallbackResponses = {
      'en': "I apologize, but I'm having trouble processing your request right now. Please try again later.",
      'hi': "मुझे खेद है, लेकिन मैं आपके अनुरोध को संसाधित करने में समस्या आ रही है। कृपया बाद में पुनः प्रयास करें।",
      'ta': "மன்னிக்கவும், உங்கள் கோரிக்கையை செயலாக்குவதில் சிக்கல் உள்ளது. தயவுசெய்து பிறகு மீண்டும் முயற்சிக்கவும்।",
      'te': "క్షమించండి, మీ అభ్యర్థనను ప్రాసెస్ చేయడంలో సమస్య ఉంది. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి।",
      'bn': "আমি দুঃখিত, কিন্তু আপনার অনুরোধ প্রক্রিয়াকরণে সমস্যা হচ্ছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
      'mr': "माफ करा, पण तुमचा विनंती प्रक्रिया करताना समस्या येत आहे. कृपया नंतर पुन्हा प्रयत्न करा।",
      'gu': "માફ કરશો, પણ તમારી વિનંતી પ્રક્રિયા કરતી વખતે સમસ્યા આવી રહી છે. કૃપા કરીને પછી ફરીથી પ્રયત્ન કરો।",
      'kn': "ಕ್ಷಮಿಸಿ, ಆದರೆ ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಲ್ಲಿ ಸಮಸ್ಯೆ ಇದೆ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ।",
      'ml': "ക്ഷമിക്കണം, പക്ഷേ നിങ്ങളുടെ അഭ്യർത്ഥന പ്രോസസ്സ് ചെയ്യുന്നതിൽ പ്രശ്നമുണ്ട്. ദയവായി പിന്നീട് വീണ്ടും ശ്രമിക്കുക।",
      'pa': "ਮੁਆਫ਼ ਕਰੋ, ਪਰ ਤੁਹਾਡੀ ਬੇਨਤੀ ਨੂੰ ਪ੍ਰੋਸੈਸ ਕਰਨ ਵਿੱਚ ਸਮੱਸਿਆ ਆ ਰਹੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
      'or': "କ୍ଷମା କରନ୍ତୁ, କିନ୍ତୁ ଆପଣଙ୍କ ଅନୁରୋଧକୁ ପ୍ରକ୍ରିୟାକରଣ କରିବାରେ ସମସ୍ୟା ଆସୁଛି। ଦୟାକରି ପରେ ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।",
      'as': "ক্ষমা কৰিব, কিন্তু আপোনাৰ অনুৰোধ প্ৰক্ৰিয়াকৰণত সমস্যা আহিছে। অনুগ্ৰহ কৰি পিছত আকৌ চেষ্টা কৰক।"
    };

    return fallbackResponses[language as keyof typeof fallbackResponses] || fallbackResponses['en'];
  }

  /**
   * Get language name from code
   */
  getLanguageName(languageCode: string): string {
    return this.supportedLanguages[languageCode as keyof typeof this.supportedLanguages] || 'English';
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(languageCode: string): boolean {
    return Object.keys(this.supportedLanguages).includes(languageCode);
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): Record<string, string> {
    return this.supportedLanguages;
  }

  /**
   * Generate agricultural greeting in user's language
   */
  async generateGreeting(language: string): Promise<string> {
    const greetings = {
      'en': "Hello! I'm your agricultural assistant. How can I help you with farming today?",
      'hi': "नमस्ते! मैं आपका कृषि सहायक हूं। आज खेती में आपकी कैसे मदद कर सकता हूं?",
      'ta': "வணக்கம்! நான் உங்கள் விவசாய உதவியாளர். இன்று விவசாயத்தில் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
      'te': "నమస్కారం! నేను మీ వ్యవసాయ సహాయకుడిని. ఈరోజు వ్యవసాయంలో మీకు ఎలా సహాయం చేయగలను?",
      'bn': "নমস্কার! আমি আপনার কৃষি সহায়ক। আজ কৃষিকাজে আপনাকে কীভাবে সাহায্য করতে পারি?",
      'mr': "नमस्कार! मी तुमचा शेती सहायक आहे. आज शेतीत तुम्हाला कशी मदत करू शकतो?",
      'gu': "નમસ્તે! હું તમારો કૃષિ સહાયક છું. આજે ખેતીમાં તમને કેવી રીતે મદદ કરી શકું?",
      'kn': "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. ಇಂದು ಕೃಷಿಯಲ್ಲಿ ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
      'ml': "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ കാർഷിക സഹായിയാണ്. ഇന്ന് കാർഷിക വിഭാഗത്തിൽ നിങ്ങൾക്ക് എങ്ങനെ സഹായിക്കാം?",
      'pa': "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਖੇਤੀ ਸਹਾਇਕ ਹਾਂ। ਅੱਜ ਖੇਤੀ ਵਿੱਚ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
      'or': "ନମସ୍କାର! ମୁଁ ତୁମର କୃଷି ସହାୟକ। ଆଜି କୃଷିରେ ତୁମକୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
      'as': "নমস্কাৰ! মই আপোনাৰ কৃষি সহায়ক। আজি কৃষিত আপোনাক কেনেকৈ সহায় কৰিব পাৰো?"
    };

    return greetings[language as keyof typeof greetings] || greetings['en'];
  }
}

export const multilingualService = new MultilingualService();
