# 🚀 Agritech Chatbot Setup Guide

## Prerequisites

Before using the chatbot, you need to set up the following:

### 1. **Get Gemini API Key**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AIza...`)

### 2. **Setup Supabase Database**
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings > API

### 3. **Environment Variables**
Create a `.env` file in your project root:

```env
# Gemini AI API Key (Required)
VITE_GEMINI_API_KEY=AIzaSyC_your_actual_api_key_here

# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Installation Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database
```bash
# Apply the database migration
supabase db push
```

This will create all the required tables and sample data.

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Access the Chatbot
1. Open your browser to `http://localhost:5173`
2. Click on "AI Assistant" in the sidebar
3. Or navigate directly to `http://localhost:5173/agritech-chatbot`

## How to Use the Chatbot

### 1. **First Time Setup**
When you first open the chatbot:
1. Click "Setup Profile" button
2. Enter your details:
   - Name: Your name
   - Location: Your state/city (e.g., "Punjab, India")
   - Farm Size: Your farm area in acres
3. Click "Setup Profile"

### 2. **Language Selection**
1. Click the globe icon (🌐) in the top-right
2. Select your preferred language from the list
3. The interface will switch to your selected language

### 3. **Asking Questions**

#### **English Examples:**
- "What crops are suitable for my soil?"
- "How to improve soil health?"
- "Irrigation schedule for rice"
- "What fertilizer should I use for wheat?"
- "How to control pests in cotton?"

#### **Hindi Examples:**
- "मेरी मिट्टी के लिए कौन सी फसलें उपयुक्त हैं?"
- "मिट्टी की सेहत कैसे सुधारें?"
- "चावल के लिए सिंचाई का समय"
- "गेहूं के लिए कौन सा उर्वरक उपयोग करें?"

#### **Tamil Examples:**
- "என் மண்ணுக்கு எந்த பயிர்கள் பொருத்தமானவை?"
- "மண்ணின் ஆரோக்கியத்தை எவ்வாறு மேம்படுத்துவது?"
- "அரிசிக்கான நீர்ப்பாசன திட்டம்"
- "கோதுமைக்கு எந்த உரம் பயன்படுத்த வேண்டும்?"

### 4. **Quick Actions**
Use the pre-built questions in the sidebar:
- Click any quick question to auto-fill the input
- Modify the question if needed
- Press Enter or click Send

### 5. **Understanding Responses**
The chatbot provides:
- **Confidence Score**: How confident the AI is in its response
- **Context Used**: What information was used to generate the response
- **Processing Time**: How long it took to generate the response

## Features Available

### ✅ **Working Features:**
1. **Multilingual Chat**: Ask questions in 12 Indian languages
2. **Crop Recommendations**: Get crop suggestions based on soil type
3. **Soil Health Advice**: Learn how to improve your soil
4. **Irrigation Guidance**: Get watering schedules for different crops
5. **Fertilizer Recommendations**: Know what nutrients your crops need
6. **Pest Management**: Learn about pest control methods
7. **Weather Integration**: Get weather-aware advice
8. **Chat History**: All conversations are saved
9. **User Profiles**: Personalized recommendations based on your farm

### 📊 **Sample Data Included:**
- **8 Major Crops**: Rice, Wheat, Cotton, Sugarcane, Maize, Tomato, Potato, Onion
- **5 Soil Types**: Clay, Sandy, Loamy, Sandy Loam, Clay Loam
- **Agricultural Knowledge**: 5+ articles on farming practices
- **Multilingual Names**: All crops have names in Hindi, Tamil, English

## Troubleshooting

### Common Issues:

#### 1. **"API Key Not Found" Error**
- Check your `.env` file has the correct Gemini API key
- Restart the development server after adding environment variables
- Make sure the key starts with `AIza`

#### 2. **Database Connection Error**
- Verify your Supabase URL and anon key are correct
- Check if the migration was applied successfully
- Ensure your Supabase project is active

#### 3. **Language Not Working**
- Make sure you've selected a supported language
- Check if the Gemini API key has proper permissions
- Try switching to English first, then back to your preferred language

#### 4. **Slow Responses**
- This is normal for the first request (cold start)
- Subsequent requests should be faster
- Check your internet connection

#### 5. **Profile Setup Issues**
- Make sure you've entered valid data
- Check the browser console for any errors
- Try refreshing the page and setting up again

### Getting Help:

1. **Check Browser Console**: Press F12 and look for error messages
2. **Verify Environment Variables**: Make sure all required keys are set
3. **Test API Keys**: Try using the Gemini API key in Google AI Studio
4. **Check Supabase**: Verify your database is accessible

## Advanced Usage

### 1. **Adding More Crops**
To add more crops to the database:
```sql
INSERT INTO Crops (crop_name, crop_name_hindi, crop_name_tamil, soil_type, ph_min, ph_max, rainfall_min, rainfall_max, temp_min, temp_max, irrigation_needs, season) VALUES
('Your Crop', 'हिंदी नाम', 'தமிழ் பெயர்', 'Soil Type', 6.0, 7.0, 500, 1000, 20, 30, 'Medium', 'Season');
```

### 2. **Adding Agricultural Knowledge**
To add more knowledge articles:
```typescript
await vectorSearchService.addDocument(
  'Article Title',
  'Article content...',
  'agricultural_knowledge',
  'en',
  'India',
  'General'
);
```

### 3. **Customizing Responses**
Modify the prompt in `agritech-chatbot.service.ts` to change how the AI responds.

## Production Deployment

### For Production:
1. **Set up proper environment variables** on your hosting platform
2. **Configure Supabase** with production settings
3. **Add rate limiting** to prevent API abuse
4. **Set up monitoring** for API usage
5. **Configure caching** for better performance

### Recommended Hosting:
- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Database**: Supabase (already configured)
- **API**: Serverless functions (Vercel Functions, AWS Lambda)

## Support

If you encounter any issues:
1. Check this setup guide first
2. Verify all environment variables are set correctly
3. Ensure the database migration was applied successfully
4. Check the browser console for error messages

The chatbot is designed to be robust and user-friendly, but proper setup is essential for it to work correctly!
