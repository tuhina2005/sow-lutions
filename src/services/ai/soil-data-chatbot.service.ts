import { supabase } from '../../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../../config/ai.config';
import { responseCustomizerService, ResponseConfig } from './response-customizer.service';
import { multilingualService } from './multilingual.service';

interface SoilDataContext {
  soilData: any[];
  totalRecords: number;
}

export class SoilDataChatbotService {
  private model: any;

  constructor() {
    try {
      this.model = new GoogleGenerativeAI(AI_CONFIG.apiKey).getGenerativeModel({ model: AI_CONFIG.model });
      console.log('✅ Gemini model initialized successfully with model:', AI_CONFIG.model);
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
      
      // Transform the existing data structure to match expected format
      const cleanedSoilData = soilData.map(record => {
        // Map existing fields to expected structure
        const phLevel = record.phh2o_0to5cm ? record.phh2o_0to5cm / 10 : 6.5; // Convert from 0-100 scale to 0-10 scale
        const organicCarbon = record.soc_0to5cm ? record.soc_0to5cm / 10 : 1.5; // Convert from g/kg to %
        const clay = record.clay_0to5cm ? record.clay_0to5cm / 10 : 20; // Convert from g/kg to %
        const sand = record.sand_0to5cm ? record.sand_0to5cm / 10 : 40; // Convert from g/kg to %
        const silt = record.silt_0to5cm ? record.silt_0to5cm / 10 : 40; // Convert from g/kg to %
        
        // Determine soil type based on texture
        let soilType = 'Loamy';
        if (clay > 40) soilType = 'Clay';
        else if (sand > 60) soilType = 'Sandy';
        else if (silt > 50) soilType = 'Silty';
        
        // Determine location from coordinates
        const lat = record.lat || 31.111861;
        const lon = record.lon || 75.4765718;
        let location = 'Punjab, India';
        let state = 'Punjab';
        let district = 'Ludhiana';
        
        if (lat > 20 && lat < 25 && lon > 75 && lon < 80) {
          location = 'Maharashtra, India';
          state = 'Maharashtra';
          district = 'Nagpur';
        } else if (lat > 10 && lat < 15 && lon > 75 && lon < 80) {
          location = 'Tamil Nadu, India';
          state = 'Tamil Nadu';
          district = 'Coimbatore';
        }
        
        // Calculate soil health score based on parameters
        let soilHealthScore = 6.0;
        if (phLevel >= 6.0 && phLevel <= 7.5) soilHealthScore += 1.0;
        if (organicCarbon >= 1.0) soilHealthScore += 1.0;
        if (clay >= 20 && clay <= 40) soilHealthScore += 1.0;
        if (sand >= 30 && sand <= 60) soilHealthScore += 1.0;
        
        // Determine suitable crops based on soil type and pH
        let suitableCrops = ['Wheat', 'Rice', 'Maize'];
        if (soilType === 'Clay' && phLevel >= 6.0) {
          suitableCrops = ['Rice', 'Sugarcane', 'Cotton'];
        } else if (soilType === 'Sandy' && phLevel >= 6.5) {
          suitableCrops = ['Groundnut', 'Potato', 'Wheat'];
        } else if (soilType === 'Loamy') {
          suitableCrops = ['Wheat', 'Rice', 'Cotton', 'Maize'];
        }
        
        // Determine recommended fertilizers
        let recommendedFertilizers = ['NPK 15:15:15', 'Urea', 'DAP'];
        if (phLevel < 6.0) {
          recommendedFertilizers.push('Lime');
        }
        if (organicCarbon < 1.0) {
          recommendedFertilizers.push('Compost', 'Farmyard manure');
        }
        
        return {
          id: record.id,
          location: location,
          state: state,
          district: district,
          soil_type: soilType,
          ph_level: phLevel,
          organic_carbon: organicCarbon,
          nitrogen_content: 120.0, // Estimated
          phosphorus_content: 45.0, // Estimated
          potassium_content: 180.0, // Estimated
          soil_depth: 45.0, // Estimated
          texture: soilType,
          drainage_type: clay > 40 ? 'Poor' : clay > 20 ? 'Moderate' : 'Good',
          water_holding_capacity: clay > 40 ? 35.0 : clay > 20 ? 25.0 : 20.0,
          bulk_density: record.bdod_0to5cm ? record.bdod_0to5cm / 100 : 1.35,
          cation_exchange_capacity: record.cec_0to5cm ? record.cec_0to5cm / 10 : 15.0,
          electrical_conductivity: 0.8, // Estimated
          temperature: record.skin_temperature ? record.skin_temperature - 273.15 : 28.0, // Convert from Kelvin
          rainfall_annual: 650.0, // Estimated
          humidity: 65.0, // Estimated
          elevation: 250.0, // Estimated
          latitude: lat,
          longitude: lon,
          suitable_crops: suitableCrops,
          recommended_fertilizers: recommendedFertilizers,
          irrigation_requirements: clay > 40 ? 'Flood irrigation suitable' : 'Drip irrigation recommended',
          soil_health_score: Math.min(soilHealthScore, 10.0),
          improvement_recommendations: [
            phLevel < 6.0 ? 'Add lime to increase pH' : 'pH is optimal',
            organicCarbon < 1.0 ? 'Increase organic matter' : 'Organic matter is adequate',
            clay > 40 ? 'Improve drainage' : 'Drainage is adequate'
          ].filter(rec => !rec.includes('is optimal') && !rec.includes('is adequate')),
          created_at: record.created_at
        };
      });

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
      const languageName = multilingualService.getLanguageName(userLanguage);
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

🚨 CRITICAL LANGUAGE REQUIREMENT - THIS IS MANDATORY:
- You MUST respond ONLY in ${languageName} (${userLanguage})
- Do NOT use English words or phrases
- Use appropriate agricultural terminology in ${languageName}
- Write the entire response in ${languageName} script/characters
- If you cannot respond in ${languageName}, DO NOT say anything about it - just respond in English and the system will translate it

IMPORTANT INSTRUCTIONS:
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
      let responseText = response.text().trim();

      // Check if response is in the correct language (improved detection)
      const isEnglishResponse = /^[a-zA-Z\s.,!?;:'"()-]+$/.test(responseText);
      const hasNonEnglishChars = /[^\x00-\x7F]/.test(responseText); // Check for non-ASCII characters
      const isCorrectLanguage = userLanguage === 'en' ? isEnglishResponse : hasNonEnglishChars;

      // If not in correct language and not English, try to translate
      if (!isCorrectLanguage && userLanguage !== 'en') {
        console.log('🔄 Response not in correct language, attempting translation...');
        try {
          const translatedText = await multilingualService.translateText(responseText, userLanguage);
          if (translatedText && translatedText !== responseText) {
            responseText = translatedText;
            console.log('✅ Response translated to', languageName);
          } else {
            console.log('⚠️ Translation returned same text, trying alternative approach...');
            // Try translating with a more specific prompt
            const translationPrompt = `Translate the following English agricultural advice to ${languageName}. Maintain the technical accuracy and agricultural context:

"${responseText}"

Provide only the translated text in ${languageName}:`;
            
            const translationResult = await this.model.generateContent(translationPrompt);
            const translationResponse = await translationResult.response;
            const alternativeTranslation = translationResponse.text().trim();
            
            if (alternativeTranslation && alternativeTranslation !== responseText) {
              responseText = alternativeTranslation;
              console.log('✅ Response translated using alternative method');
            }
          }
        } catch (translationError) {
          console.log('⚠️ Translation failed, using original response');
        }
      }

      // Calculate confidence based on soil data availability
      let confidence = 0.5; // Base confidence for soil data
      if (context.totalRecords > 0) confidence += 0.3;
      if (context.soilData.some(s => s.soil_health_score > 7)) confidence += 0.1;
      if (context.soilData.some(s => s.suitable_crops && s.suitable_crops.length > 0)) confidence += 0.1;
      if (isCorrectLanguage) confidence += 0.1; // Bonus for correct language

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
