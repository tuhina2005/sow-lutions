import { supabase } from '../../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '../../config/ai.config';
import { responseCustomizerService, ResponseConfig } from './response-customizer.service';

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

class AgritechChatbotRobustService {
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
    userId?: number,
    sessionId: string = 'default-session'
  ): Promise<{ success: boolean; text?: string; confidence?: number; error?: string; processingTime?: number; contextUsed?: any }> {
    const startTime = Date.now();

    try {
      console.log('🔍 Starting AI response generation...');
      console.log('Query:', userQuery);
      console.log('User ID:', userId);
      console.log('Language:', userLanguage);

      // Step 1: Get user context (handle missing user gracefully)
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
   * Get user context from database - handles missing users gracefully
   */
  private async getUserContext(userId?: number): Promise<any> {
    try {
      // If no userId provided, try to find any user
      if (!userId) {
        console.log('🔍 No user ID provided, looking for any available user...');
        
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('user_id', { ascending: true })
          .limit(1);

        if (usersError || !users || users.length === 0) {
          console.log('⚠️ No users found in database');
          return null;
        }

        userId = users[0].user_id;
        console.log('✅ Using first available user ID:', userId);
      }

      console.log(`🔍 Getting user context for user ID: ${userId}`);

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError) {
        console.log('⚠️ User not found, trying to find any user:', userError.message);
        
        // Fallback: get any user
        const { data: anyUser, error: anyUserError } = await supabase
          .from('users')
          .select('*')
          .order('user_id', { ascending: true })
          .limit(1)
          .single();

        if (anyUserError || !anyUser) {
          console.log('⚠️ No users found in database at all');
          return null;
        }

        console.log('✅ Using fallback user:', anyUser.name);
        user = anyUser;
        userId = anyUser.user_id;
      } else {
        console.log('✅ User found:', user.name, 'from', user.location);
      }

      // Get farms for this user
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
   * Customize response with formatting and limits
   */
  private customizeResponse(response: string, userLanguage: string): string {
    const config: ResponseConfig = {
      maxWords: 200, // Adjust word limit here
      useMarkdown: true, // Enable markdown formatting
      includeEmojis: true, // Enable emojis
      responseStyle: 'conversational', // 'concise' | 'detailed' | 'conversational'
      language: userLanguage
    };

    const customized = responseCustomizerService.customizeResponse(response, config);
    
    console.log(`📊 Response stats: ${customized.wordCount} words, ${customized.originalLength} → ${customized.text.length} chars`);
    
    return customized.text;
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
      } else {
        contextString += `User Profile: No specific user data available (using general agricultural knowledge)\n`;
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
      } else {
        contextString += `\nFarm Information: No specific farm data available (providing general advice)\n`;
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

      const responseGuidelines = responseCustomizerService.createResponsePrompt({
        maxWords: 200,
        useMarkdown: true,
        includeEmojis: true,
        responseStyle: 'conversational',
        language: userLanguage
      });

      const prompt = `You are an expert agricultural advisor specializing in Indian farming practices. ${context.user ? 'You have access to the user\'s specific farm data and should provide personalized recommendations.' : 'You should provide general agricultural advice based on best practices.'}

IMPORTANT INSTRUCTIONS:
- Answer ONLY in ${languageName}
- ${context.user ? 'Use the user\'s specific farm data to provide personalized advice' : 'Provide general agricultural advice based on best practices'}
- ${context.user ? 'Mention their soil type, pH, and farm conditions specifically' : 'Include relevant information about different soil types and conditions'}
- Provide actionable recommendations
- Include relevant local practices and examples
- If the question is not agriculture-related, politely redirect to agricultural topics
- Be specific and practical in your advice
- Always consider Indian farming conditions and practices

Context Information:
${contextString}

User Question: ${userQuery}

Provide a ${context.user ? 'personalized' : 'general'} response in ${languageName}:${responseGuidelines}`;

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

      // Apply response customization (word limit, markdown, emojis)
      const customizedText = this.customizeResponse(responseText, userLanguage);

      return {
        text: customizedText,
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

  /**
   * Dynamic field reader - automatically adapts to new database fields
   */
  private async getDynamicUserContext(userId?: number): Promise<any> {
    try {
      if (!userId) {
        // Find any available user
        const { data: users } = await supabase
          .from('users')
          .select('*')
          .limit(1);
        
        if (!users || users.length === 0) {
          return null;
        }
        userId = users[0].user_id;
      }

      // Get user with all fields (automatically includes new fields)
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userError || !user) {
        console.log('⚠️ No user found, using fallback context');
        return null;
      }

      // Get user farms with all fields (automatically includes new fields)
      const { data: farms, error: farmsError } = await supabase
        .from('user_farms')
        .select('*')
        .eq('user_id', userId);

      if (farmsError) {
        console.log('⚠️ Error fetching farms:', farmsError);
      }

      // Get user history with all fields (automatically includes new fields)
      const { data: history, error: historyError } = await supabase
        .from('user_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (historyError) {
        console.log('⚠️ Error fetching history:', historyError);
      }

      // Get crops with all fields (automatically includes new fields)
      const { data: crops, error: cropsError } = await supabase
        .from('crops')
        .select('*')
        .limit(10);

      if (cropsError) {
        console.log('⚠️ Error fetching crops:', cropsError);
      }

      // Get soil properties with all fields (automatically includes new fields)
      const { data: soils, error: soilsError } = await supabase
        .from('soil_properties')
        .select('*')
        .limit(10);

      if (soilsError) {
        console.log('⚠️ Error fetching soils:', soilsError);
      }

      return {
        user: user,
        farms: farms || [],
        history: history || [],
        crops: crops || [],
        soils: soils || [],
        // Add any new fields automatically
        allFields: {
          userFields: Object.keys(user || {}),
          farmFields: farms && farms.length > 0 ? Object.keys(farms[0]) : [],
          cropFields: crops && crops.length > 0 ? Object.keys(crops[0]) : [],
          soilFields: soils && soils.length > 0 ? Object.keys(soils[0]) : []
        }
      };
    } catch (error) {
      console.error('❌ Error getting dynamic user context:', error);
      return null;
    }
  }

  /**
   * Create or update user profile
   */
  async createUserProfile(userData: {
    name: string;
    email?: string;
    phone?: string;
    location: string;
    state?: string;
    district?: string;
    preferred_language?: string;
    farm_size?: number;
    farming_experience_years?: number;
  }): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select('user_id')
        .single();

      if (error) throw error;
      return data.user_id;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  /**
   * Add farm to user profile
   */
  async addFarmToUser(
    userId: number,
    farmData: {
      farm_name?: string;
      soil_type?: string;
      ph?: number;
      organic_carbon?: number;
      irrigation_available?: boolean;
      irrigation_type?: string;
      farm_area?: number;
      latitude?: number;
      longitude?: number;
      elevation?: number;
    }
  ): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('user_farms')
        .insert({
          user_id: userId,
          ...farmData
        })
        .select('farm_id')
        .single();

      if (error) throw error;
      return data.farm_id;
    } catch (error) {
      console.error('Error adding farm:', error);
      return null;
    }
  }
}

export const agritechChatbotRobustService = new AgritechChatbotRobustService();
