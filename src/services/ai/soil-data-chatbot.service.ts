import { supabase } from '../../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../../config/ai.config';
import { responseCustomizerService, ResponseConfig } from './response-customizer.service';

interface SoilDataContext {
  soilData: any[];
  totalRecords: number;
}

export class SoilDataChatbotService {
  private model: any;

  constructor() {
    try {
      this.model = new GoogleGenerativeAI(AI_CONFIG.apiKey).getGenerativeModel({ model: "gemini-pro" });
      console.log('✅ Gemini model initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Gemini model:', error);
      this.model = null;
    }
  }

  /**
   * Generate AI response using only soil_data table context
   */
  async generateResponse(
    userQuery: string,
    userLanguage: string = 'en',
    sessionId: string = 'default'
  ): Promise<{ success: boolean; text?: string; error?: string; confidence?: number; processingTime?: number; contextUsed?: any }> {
    const startTime = Date.now();
    
    try {
      console.log('🌱 Soil Data Chatbot - Processing query:', userQuery);
      
      // Get soil data context
      const context = await this.getSoilDataContext(userQuery);
      
      if (!context || context.soilData.length === 0) {
        return {
          success: false,
          error: 'No soil data available for context',
          confidence: 0.1,
          processingTime: Date.now() - startTime
        };
      }

      // Generate AI response
      const aiResponse = await this.generateAIResponse(userQuery, context, userLanguage);
      
      // Apply response customization
      const customizedText = this.customizeResponse(aiResponse.text, userLanguage);
      
      const processingTime = Date.now() - startTime;
      
      console.log('✅ Soil Data Chatbot - Response generated successfully');
      console.log(`📊 Processing time: ${processingTime}ms`);
      console.log(`📊 Context records: ${context.totalRecords}`);
      
      return {
        success: true,
        text: customizedText,
        confidence: aiResponse.confidence,
        processingTime,
        contextUsed: {
          soilDataRecords: context.totalRecords,
          locations: context.soilData.map(s => s.location),
          soilTypes: [...new Set(context.soilData.map(s => s.soil_type))]
        }
      };

    } catch (error) {
      console.error('❌ Soil Data Chatbot - Error:', error);
      return {
        success: false,
        error: `Soil data chatbot error: ${error}`,
        confidence: 0.1,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get soil data context from database
   */
  private async getSoilDataContext(query: string): Promise<SoilDataContext | null> {
    try {
      console.log('🔍 Retrieving soil data context...');
      
      // Get all soil data records
      const { data: soilData, error } = await supabase
        .from('soil_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching soil data:', error);
        console.error('Error details:', error);
        return null;
      }

      if (!soilData || soilData.length === 0) {
        console.log('⚠️ No soil data found in database');
        return null;
      }

      console.log(`✅ Retrieved ${soilData.length} soil data records`);
      console.log('Sample record:', soilData[0]);
      
      // Clean and validate data
      const cleanedSoilData = soilData.map(record => ({
        ...record,
        location: record.location || 'Unknown Location',
        soil_type: record.soil_type || 'Unknown Soil Type',
        state: record.state || 'Unknown State',
        district: record.district || 'Unknown District'
      }));

      return {
        soilData: cleanedSoilData,
        totalRecords: cleanedSoilData.length
      };

    } catch (error) {
      console.error('❌ Error getting soil data context:', error);
      return null;
    }
  }

  /**
   * Generate AI response using Gemini
   */
  private async generateAIResponse(
    userQuery: string, 
    context: SoilDataContext, 
    userLanguage: string
  ): Promise<{ text: string; confidence: number }> {
    try {
      const languageName = userLanguage === 'en' ? 'English' : 
                          userLanguage === 'hi' ? 'Hindi' : 
                          userLanguage === 'ta' ? 'Tamil' : 'English';

      console.log('🔍 Generating AI response in:', languageName);

      // Build soil data context string
      let contextString = `Soil Data Information (${context.totalRecords} records):\n\n`;
      
      context.soilData.forEach((soil, index) => {
        contextString += `Soil Data ${index + 1}:\n`;
        contextString += `- Location: ${soil.location} (${soil.state}, ${soil.district})\n`;
        contextString += `- Soil Type: ${soil.soil_type}\n`;
        contextString += `- pH Level: ${soil.ph_level}\n`;
        contextString += `- Organic Carbon: ${soil.organic_carbon}%\n`;
        contextString += `- Nitrogen: ${soil.nitrogen_content} ppm\n`;
        contextString += `- Phosphorus: ${soil.phosphorus_content} ppm\n`;
        contextString += `- Potassium: ${soil.potassium_content} ppm\n`;
        contextString += `- Soil Depth: ${soil.soil_depth} cm\n`;
        contextString += `- Texture: ${soil.texture}\n`;
        contextString += `- Drainage: ${soil.drainage_type}\n`;
        contextString += `- Water Holding Capacity: ${soil.water_holding_capacity}%\n`;
        contextString += `- Temperature: ${soil.temperature}°C\n`;
        contextString += `- Annual Rainfall: ${soil.rainfall_annual} mm\n`;
        contextString += `- Humidity: ${soil.humidity}%\n`;
        contextString += `- Elevation: ${soil.elevation} m\n`;
        contextString += `- Suitable Crops: ${soil.suitable_crops?.join(', ') || 'Not specified'}\n`;
        contextString += `- Recommended Fertilizers: ${soil.recommended_fertilizers?.join(', ') || 'Not specified'}\n`;
        contextString += `- Irrigation Requirements: ${soil.irrigation_requirements || 'Not specified'}\n`;
        contextString += `- Soil Health Score: ${soil.soil_health_score}/10\n`;
        contextString += `- Improvement Recommendations: ${soil.improvement_recommendations?.join(', ') || 'Not specified'}\n`;
        contextString += `\n`;
      });

      const responseGuidelines = responseCustomizerService.createResponsePrompt({
        maxWords: 200,
        useMarkdown: true,
        includeEmojis: true,
        responseStyle: 'conversational',
        language: userLanguage
      });

      const prompt = `You are an expert agricultural soil scientist specializing in Indian farming conditions. You have access to comprehensive soil data and should provide detailed, science-based recommendations.

IMPORTANT INSTRUCTIONS:
- Answer ONLY in ${languageName}
- Use ONLY the provided soil data for your recommendations
- Provide specific, actionable advice based on the soil parameters
- Include relevant scientific explanations for your recommendations
- Consider local climate and farming conditions
- If the question is not soil/agriculture-related, politely redirect to soil and agricultural topics
- Be specific about pH levels, nutrient content, and soil health scores
- Always consider the soil health score and improvement recommendations

Soil Data Context:
${contextString}

User Question: ${userQuery}

Provide a detailed response based on the soil data in ${languageName}:${responseGuidelines}`;

      console.log('🔍 Sending soil data prompt to Gemini...');
      console.log('Prompt length:', prompt.length);
      console.log('Soil data records:', context.totalRecords);

      if (!this.model) {
        throw new Error('Gemini model not initialized. Check API key.');
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      // Calculate confidence based on soil data availability
      let confidence = 0.5; // Base confidence for soil data
      if (context.totalRecords > 0) confidence += 0.3;
      if (context.soilData.some(s => s.soil_health_score > 7)) confidence += 0.1;
      if (context.soilData.some(s => s.suitable_crops && s.suitable_crops.length > 0)) confidence += 0.1;

      console.log('✅ AI response generated with confidence:', confidence);

      return {
        text: responseText,
        confidence: Math.min(confidence, 1.0)
      };

    } catch (error) {
      console.error('❌ Error generating AI response:', error);
      return {
        text: `I apologize, but I'm having trouble processing your soil data request right now. Error: ${error}`,
        confidence: 0.1
      };
    }
  }

  /**
   * Customize response with formatting and limits
   */
  private customizeResponse(response: string, userLanguage: string): string {
    const config: ResponseConfig = {
      maxWords: 200,
      useMarkdown: true,
      includeEmojis: true,
      responseStyle: 'conversational',
      language: userLanguage
    };

    const customized = responseCustomizerService.customizeResponse(response, config);
    
    console.log(`📊 Response stats: ${customized.wordCount} words, ${customized.originalLength} → ${customized.text.length} chars`);
    
    return customized.text;
  }

  /**
   * Get soil data statistics
   */
  async getSoilDataStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('soil_data')
        .select('*');

      if (error) throw error;

      const stats = {
        totalRecords: data.length,
        locations: [...new Set(data.map(s => s.location))],
        soilTypes: [...new Set(data.map(s => s.soil_type))],
        phRange: {
          min: Math.min(...data.map(s => s.ph_level)),
          max: Math.max(...data.map(s => s.ph_level))
        },
        avgSoilHealth: data.reduce((sum, s) => sum + (s.soil_health_score || 0), 0) / data.length,
        states: [...new Set(data.map(s => s.state))],
        districts: [...new Set(data.map(s => s.district))]
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting soil data stats:', error);
      return null;
    }
  }
}

export const soilDataChatbotService = new SoilDataChatbotService();
