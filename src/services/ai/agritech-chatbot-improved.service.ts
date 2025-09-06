import { supabase } from '../../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../../config/ai.config';

interface ChatContext {
  user: any;
  farms: any[];
  crops: any[];
  soilInfo: any[];
  documents: any[];
  weather: any;
  sessionId: string;
}

interface ChatResponse {
  response: string;
  language: string;
  confidence: number;
  processingTime: number;
  contextUsed: any;
}

class AgritechChatbotImprovedService {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);
    this.model = genAI.getGenerativeModel({ model: AI_CONFIG.model });
  }

  /**
   * Main function to generate AI response with database context
   */
  async generateResponse(
    userQuery: string,
    userLanguage: string = 'en',
    userId: number = 1,
    sessionId: string = 'default-session'
  ): Promise<{ success: boolean; text?: string; confidence?: number; error?: string; processingTime?: number; contextUsed?: any }> {
    const startTime = Date.now();

    try {
      console.log('🔍 Starting AI response generation...');
      console.log('Query:', userQuery);
      console.log('User ID:', userId);
      console.log('Language:', userLanguage);

      // Step 1: Get user context
      const userContext = await this.getUserContext(userId);
      console.log('✅ User context retrieved:', userContext);

      // Step 2: Retrieve structured data
      const structuredData = await this.retrieveStructuredData(userQuery, userContext);
      console.log('✅ Structured data retrieved:', structuredData);

      // Step 3: Get weather data
      const weatherData = await this.getWeatherData(userContext);
      console.log('✅ Weather data retrieved:', weatherData);

      // Step 4: Package context
      const context = this.packageContext(userContext, structuredData, [], weatherData, sessionId);
      console.log('✅ Context packaged:', context);

      // Step 5: Generate response
      const response = await this.generateAIResponse(userQuery, context, userLanguage);
      console.log('✅ AI response generated:', response);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        text: response.text,
        confidence: response.confidence,
        processingTime,
        contextUsed: {
          user: !!context.user,
          farms: context.farms.length,
          crops: context.crops.length,
          soilInfo: context.soilInfo.length,
          weather: !!context.weather,
          hasPersonalizedData: !!(context.user && context.farms.length > 0)
        }
      };

    } catch (error) {
      console.error('❌ AI response generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get user context from database
   */
  private async getUserContext(userId: number): Promise<any> {
    try {
      console.log(`🔍 Getting user context for user ID: ${userId}`);

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError) {
        console.log('⚠️ No user found, using default context:', userError.message);
        return null;
      }

      console.log('✅ User found:', user.name, 'from', user.location);

      const { data: farms, error: farmsError } = await supabase
        .from('user_farms')
        .select('*')
        .eq('user_id', userId);

      if (farmsError) {
        console.log('⚠️ Error getting farms:', farmsError.message);
        return { user, farms: [] };
      }

      console.log('✅ Farms found:', farms?.length || 0);
      return {
        user,
        farms: farms || []
      };
    } catch (error) {
      console.error('❌ Error getting user context:', error);
      return null;
    }
  }

  /**
   * Retrieve structured data based on query
   */
  private async retrieveStructuredData(userQuery: string, userContext: any): Promise<any> {
    const results = {
      crops: [],
      soilInfo: [],
      recommendations: []
    };

    try {
      console.log('🔍 Retrieving structured data for query:', userQuery);
      const queryLower = userQuery.toLowerCase();

      // If user has farm data, get personalized recommendations
      if (userContext?.farms && userContext.farms.length > 0) {
        const farm = userContext.farms[0];
        console.log('🔍 User has farm data:', farm.soil_type, 'soil, pH', farm.ph);

        if (farm.soil_type && farm.ph) {
          console.log('🔍 Getting personalized crop recommendations...');
          
          try {
            const { data: cropRecommendations, error } = await supabase
              .rpc('get_crops_by_soil_and_climate', {
                p_soil_type: farm.soil_type,
                p_ph: farm.ph,
                p_rainfall: 1000,
                p_temp_min: 20,
                p_temp_max: 35
              });

            if (error) {
              console.log('⚠️ RPC function failed, trying direct query:', error.message);
              
              // Fallback: direct query to crops table
              const { data: directCrops, error: directError } = await supabase
                .from('crops')
                .select('*')
                .ilike('soil_type', `%${farm.soil_type}%`)
                .limit(5);

              if (!directError && directCrops) {
                results.crops = directCrops;
                console.log('✅ Direct crop query successful:', directCrops.length, 'crops');
              }
            } else if (cropRecommendations) {
              results.crops = cropRecommendations;
              console.log('✅ Personalized crop recommendations:', cropRecommendations.length, 'crops');
            }
          } catch (rpcError) {
            console.log('⚠️ RPC error, using fallback:', rpcError);
          }
        }
      }

      // Search for crops based on query keywords
      if (queryLower.includes('crop') || queryLower.includes('बीज') || queryLower.includes('பயிர்')) {
        console.log('🔍 Query mentions crops, getting crop data...');
        
        const { data: crops, error } = await supabase
          .from('crops')
          .select('*')
          .limit(5);

        if (!error && crops) {
          results.crops = [...results.crops, ...crops];
          console.log('✅ Additional crops found:', crops.length);
        }
      }

      // Search for soil information
      if (queryLower.includes('soil') || queryLower.includes('मिट्टी') || queryLower.includes('மண்')) {
        console.log('🔍 Query mentions soil, getting soil data...');
        
        const { data: soilInfo, error } = await supabase
          .from('soil_properties')
          .select('*')
          .limit(3);

        if (!error && soilInfo) {
          results.soilInfo = soilInfo;
          console.log('✅ Soil information found:', soilInfo.length, 'types');
        }
      }

      // If user has farm data, also get specific soil info for their soil type
      if (userContext?.farms && userContext.farms.length > 0) {
        const farm = userContext.farms[0];
        if (farm.soil_type) {
          console.log('🔍 Getting specific soil info for:', farm.soil_type);
          
          const { data: specificSoil, error } = await supabase
            .from('soil_properties')
            .select('*')
            .ilike('soil_name', `%${farm.soil_type}%`)
            .limit(2);

          if (!error && specificSoil) {
            results.soilInfo = [...results.soilInfo, ...specificSoil];
            console.log('✅ Specific soil info found:', specificSoil.length, 'types');
          }
        }
      }

      console.log('✅ Structured data retrieval complete:', {
        crops: results.crops.length,
        soilInfo: results.soilInfo.length
      });

      return results;
    } catch (error) {
      console.error('❌ Error retrieving structured data:', error);
      return results;
    }
  }

  /**
   * Get weather data for user location
   */
  private async getWeatherData(userContext: any): Promise<any> {
    try {
      if (!userContext?.farms || userContext.farms.length === 0) {
        console.log('⚠️ No farm data for weather');
        return null;
      }

      const farm = userContext.farms[0];
      if (!farm.latitude || !farm.longitude) {
        console.log('⚠️ No coordinates for weather');
        return null;
      }

      console.log('🔍 Getting weather data for coordinates:', farm.latitude, farm.longitude);

      // Mock weather data for now
      const weatherData = {
        temperature: 28,
        humidity: 65,
        rainfall: 0,
        wind_speed: 12,
        conditions: 'Partly cloudy'
      };

      console.log('✅ Weather data retrieved:', weatherData);
      return weatherData;
    } catch (error) {
      console.error('❌ Error getting weather data:', error);
      return null;
    }
  }

  /**
   * Package context for AI
   */
  private packageContext(
    userContext: any,
    structuredData: any,
    unstructuredData: any[],
    weatherData: any,
    sessionId: string
  ): ChatContext {
    const context = {
      user: userContext?.user || null,
      farms: userContext?.farms || [],
      crops: structuredData.crops || [],
      soilInfo: structuredData.soilInfo || [],
      documents: unstructuredData || [],
      weather: weatherData,
      sessionId
    };

    console.log('✅ Context packaged:', {
      hasUser: !!context.user,
      farmCount: context.farms.length,
      cropCount: context.crops.length,
      soilCount: context.soilInfo.length,
      hasWeather: !!context.weather
    });

    return context;
  }

  /**
   * Generate AI response using Gemini
   */
  private async generateAIResponse(userQuery: string, context: ChatContext, userLanguage: string): Promise<{ text: string; confidence: number }> {
    try {
      const languageName = userLanguage === 'en' ? 'English' : 
                          userLanguage === 'hi' ? 'Hindi' : 
                          userLanguage === 'ta' ? 'Tamil' : 'English';

      console.log('🔍 Generating AI response in:', languageName);

      // Build context string
      let contextString = '';
      
      if (context.user) {
        contextString += `User Profile:\n`;
        contextString += `- Name: ${context.user.name}\n`;
        contextString += `- Location: ${context.user.location}\n`;
        contextString += `- Farm Size: ${context.user.farm_size || 'Not specified'}\n`;
        contextString += `- Preferred Language: ${context.user.preferred_language || 'English'}\n`;
      }

      if (context.farms.length > 0) {
        contextString += `\nFarm Information:\n`;
        context.farms.forEach((farm, index) => {
          contextString += `- Farm ${index + 1}: ${farm.farm_name || 'Unnamed'}\n`;
          contextString += `  Soil Type: ${farm.soil_type || 'Not specified'}\n`;
          contextString += `  pH Level: ${farm.ph || 'Not specified'}\n`;
          contextString += `  Organic Carbon: ${farm.organic_carbon || 'Not specified'}%\n`;
          contextString += `  Farm Area: ${farm.farm_area || 'Not specified'} acres\n`;
          contextString += `  Irrigation: ${farm.irrigation_available ? 'Available' : 'Not available'}\n`;
          contextString += `  Irrigation Type: ${farm.irrigation_type || 'Not specified'}\n`;
        });
      }

      if (context.weather) {
        contextString += `\nCurrent Weather:\n`;
        contextString += `- Temperature: ${context.weather.temperature}°C\n`;
        contextString += `- Humidity: ${context.weather.humidity}%\n`;
        contextString += `- Rainfall: ${context.weather.rainfall}mm\n`;
        contextString += `- Conditions: ${context.weather.conditions}\n`;
      }

      if (context.crops.length > 0) {
        contextString += `\nRelevant Crops for Your Farm:\n`;
        context.crops.slice(0, 5).forEach((crop, index) => {
          contextString += `${index + 1}. ${crop.crop_name}`;
          if (crop.crop_name_hindi) contextString += ` (${crop.crop_name_hindi})`;
          contextString += `\n   - Season: ${crop.season}\n`;
          contextString += `   - Soil Type: ${crop.soil_type}\n`;
          contextString += `   - pH Range: ${crop.ph_min}-${crop.ph_max}\n`;
          contextString += `   - Temperature: ${crop.temp_min}-${crop.temp_max}°C\n`;
          if (crop.yield_per_hectare) contextString += `   - Expected Yield: ${crop.yield_per_hectare} kg/hectare\n`;
          contextString += `\n`;
        });
      }

      if (context.soilInfo.length > 0) {
        contextString += `\nSoil Information:\n`;
        context.soilInfo.forEach((soil, index) => {
          contextString += `${index + 1}. ${soil.soil_name}`;
          if (soil.soil_name_hindi) contextString += ` (${soil.soil_name_hindi})`;
          contextString += `\n   - Texture: ${soil.texture}\n`;
          contextString += `   - Fertility: ${soil.fertility}\n`;
          contextString += `   - Water Retention: ${soil.water_retention}\n`;
          if (soil.suitable_crops) contextString += `   - Suitable Crops: ${soil.suitable_crops.join(', ')}\n`;
          contextString += `\n`;
        });
      }

      const prompt = `You are an expert agricultural advisor specializing in Indian farming practices. You have access to the user's specific farm data and should provide personalized recommendations.

IMPORTANT INSTRUCTIONS:
- Answer ONLY in ${languageName}
- Use the user's specific farm data to provide personalized advice
- Mention their soil type, pH, and farm conditions specifically
- Provide actionable recommendations based on their exact farm profile
- Include relevant local practices and examples
- If the question is not agriculture-related, politely redirect to agricultural topics
- Be specific and practical in your advice
- Always consider the user's location and farm conditions

Context Information:
${contextString}

User Question: ${userQuery}

Provide a personalized response in ${languageName} based on their specific farm data:`;

      console.log('🔍 Sending enhanced prompt to Gemini...');
      console.log('Prompt length:', prompt.length);
      console.log('Has user data:', !!context.user);
      console.log('Has farm data:', context.farms.length > 0);
      console.log('Has crop data:', context.crops.length > 0);
      console.log('Has soil data:', context.soilInfo.length > 0);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      // Calculate confidence based on context availability
      let confidence = 0.3; // Base confidence
      if (context.user) confidence += 0.2;
      if (context.farms.length > 0) confidence += 0.3;
      if (context.crops.length > 0) confidence += 0.1;
      if (context.soilInfo.length > 0) confidence += 0.1;

      console.log('✅ AI response generated with confidence:', confidence);

      return {
        text: responseText,
        confidence: Math.min(confidence, 1.0)
      };
    } catch (error) {
      console.error('❌ Error generating AI response:', error);
      return {
        text: `I apologize, but I'm having trouble processing your request right now. Error: ${error}`,
        confidence: 0.1
      };
    }
  }
}

export const agritechChatbotImprovedService = new AgritechChatbotImprovedService();
