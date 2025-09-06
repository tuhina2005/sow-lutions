# 🎨 AI Agent Response Customization Guide

## **✅ How to Customize AI Agent Responses**

You can now easily customize the AI agent's responses with word limits, markdown formatting, emojis, and more!

## **🔧 Quick Customization (Using Debug Tool)**

### **Step 1: Access Response Configuration**
1. **Go to "Farm Data"** → **"Debug Tool"**
2. **Use "Response Configuration Test"** (at the top)
3. **Adjust settings** in real-time
4. **Test different configurations**

### **Step 2: Available Settings**
- **Max Words**: 50-500 words (default: 200)
- **Markdown**: Enable/disable formatting
- **Emojis**: Add visual elements
- **Style**: Concise, Detailed, or Conversational
- **Language**: English, Hindi, Tamil

## **⚙️ Advanced Customization (Code Level)**

### **1. Change Default Settings**

Edit `src/services/ai/agritech-chatbot-robust.service.ts`:

```typescript
private customizeResponse(response: string, userLanguage: string): string {
  const config: ResponseConfig = {
    maxWords: 150, // Change word limit here
    useMarkdown: true, // Enable/disable markdown
    includeEmojis: false, // Enable/disable emojis
    responseStyle: 'concise', // 'concise' | 'detailed' | 'conversational'
    language: userLanguage
  };
  // ... rest of the method
}
```

### **2. Add Custom Formatting**

Edit `src/services/ai/response-customizer.service.ts`:

```typescript
// Add custom formatting rules
private applyCustomFormatting(response: string): string {
  let formatted = response;
  
  // Add your custom formatting here
  formatted = formatted.replace(/\b(important|critical|urgent)\b/gi, '**$1**');
  formatted = formatted.replace(/\b(pH|kg|hectare)\b/g, '`$1`');
  
  return formatted;
}
```

### **3. Add Custom Emojis**

```typescript
// Add custom emoji mappings
private addCustomEmojis(response: string, language: string): string {
  let emojiResponse = response;
  
  // Add your custom emojis
  emojiResponse = emojiResponse.replace(/\b(fertilizer|nutrient)\b/gi, '🌿 $1');
  emojiResponse = emojiResponse.replace(/\b(water|irrigation)\b/gi, '💧 $1');
  emojiResponse = emojiResponse.replace(/\b(harvest|yield)\b/gi, '🌾 $1');
  
  return emojiResponse;
}
```

## **📝 Response Formatting Options**

### **Markdown Formatting**
- **Headers**: `### Section Title` → Large heading
- **Bold**: `**important text**` → **important text**
- **Italic**: `*emphasized text*` → *emphasized text*
- **Code**: `pH level` → `pH level`
- **Lists**: `- item` → • item

### **Emoji Categories**
- **🌱 Crops**: rice, wheat, maize, etc.
- **🌍 Soil**: soil, earth, ground
- **💧 Water**: irrigation, water, rain
- **🌿 Nutrients**: fertilizer, nutrients, organic
- **🌾 Harvest**: yield, harvest, production
- **💡 Tips**: advice, recommendation, tip
- **⚠️ Warnings**: caution, warning, alert

## **🎯 Response Styles**

### **Concise Style**
- Short, direct answers
- Bullet points
- Key information only
- Word limit: 50-100 words

### **Detailed Style**
- Comprehensive explanations
- Multiple sections
- Examples and context
- Word limit: 300-500 words

### **Conversational Style**
- Friendly, engaging tone
- Questions and answers
- Personal touch
- Word limit: 150-250 words

## **🌍 Language-Specific Customization**

### **English**
- Standard markdown formatting
- Technical terms in code blocks
- Professional tone

### **Hindi**
- Devanagari script support
- Cultural context
- Local farming terms

### **Tamil**
- Tamil script support
- Regional farming practices
- Local crop names

## **🧪 Testing Your Customizations**

### **1. Use Response Configuration Test**
- Real-time testing
- Visual feedback
- Statistics display
- Multiple query testing

### **2. Test with Different Queries**
- Crop recommendations
- Soil advice
- Irrigation methods
- Fertilizer suggestions

### **3. Check Response Quality**
- Word count accuracy
- Markdown rendering
- Emoji placement
- Language appropriateness

## **📊 Response Statistics**

The system tracks:
- **Word Count**: Actual words in response
- **Character Count**: Before/after formatting
- **Formatting Applied**: Markdown, emojis, etc.
- **Style Used**: Concise, detailed, conversational

## **🔧 Common Customizations**

### **1. Increase Word Limit**
```typescript
maxWords: 300, // For more detailed responses
```

### **2. Disable Emojis**
```typescript
includeEmojis: false, // For professional responses
```

### **3. Use Plain Text**
```typescript
useMarkdown: false, // For simple text responses
```

### **4. Change Response Style**
```typescript
responseStyle: 'detailed', // For comprehensive answers
```

## **🚀 Advanced Features**

### **1. Dynamic Word Limits**
```typescript
// Adjust word limit based on query type
const wordLimit = query.includes('explain') ? 400 : 200;
```

### **2. Conditional Formatting**
```typescript
// Apply different formatting based on content
if (response.includes('warning')) {
  // Add warning formatting
}
```

### **3. Language-Specific Emojis**
```typescript
// Different emojis for different languages
if (language === 'hi') {
  // Use Hindi-specific emojis
}
```

## **📋 Best Practices**

### **1. Test Incrementally**
- Start with small changes
- Test each modification
- Verify response quality

### **2. Consider User Experience**
- Don't overuse emojis
- Keep formatting consistent
- Maintain readability

### **3. Monitor Performance**
- Check response generation time
- Verify word count accuracy
- Test with different queries

### **4. Document Changes**
- Comment your customizations
- Keep track of what works
- Share successful configurations

## **🔍 Troubleshooting**

### **Problem: Responses Too Long**
**Solution**: Reduce `maxWords` setting

### **Problem: Markdown Not Rendering**
**Solution**: Check if `useMarkdown` is enabled

### **Problem: Emojis Not Showing**
**Solution**: Verify `includeEmojis` is true

### **Problem: Wrong Language**
**Solution**: Check `language` setting matches user input

## **✅ Summary**

You now have full control over AI agent responses:

1. **Word Limits** - Control response length
2. **Markdown Formatting** - Add structure and emphasis
3. **Emojis** - Make responses more engaging
4. **Response Styles** - Choose the right tone
5. **Language Support** - Multilingual formatting
6. **Real-time Testing** - Test configurations instantly

**Start with the Response Configuration Test tool to experiment with different settings!** 🎯
