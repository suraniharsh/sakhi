import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export class TipsService {
  private model: GenerativeModel;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    console.log('Creating GoogleGenerativeAI instance');
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      console.log('Gemini model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini model:', error);
      throw new Error('Failed to initialize Gemini model');
    }
  }

  async getDailyTip(phase?: string): Promise<{
    title: string;
    content: string;
    category: 'health' | 'wellness' | 'nutrition' | 'exercise' | 'mindfulness';
  }> {
    try {
      console.log(`Getting tip for phase: ${phase || 'general'}`);
      
      // Improved prompt that explicitly asks for JSON format
      const prompt = phase
        ? `Create a short health tip for someone in their ${phase} phase of menstrual cycle. 
           Return ONLY a JSON object with these exact fields: 
           {
             "title": "Short title here",
             "content": "1-2 sentence tip here",
             "category": "one of: health, wellness, nutrition, exercise, mindfulness"
           }
           Make the tip specific to the ${phase} phase. Do not include any markdown, explanations, or other text.`
        : `Create a short menstrual health tip.
           Return ONLY a JSON object with these exact fields: 
           {
             "title": "Short title here",
             "content": "1-2 sentence tip here",
             "category": "one of: health, wellness, nutrition, exercise, mindfulness"
           }
           Do not include any markdown, explanations, or other text.`;

      console.log('Sending prompt to Gemini');
      
      // Set a timeout for the API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API request timed out')), 10000);
      });
      
      // Use Promise.race to implement timeout
      const resultPromise = this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      });
      
      const result = await Promise.race([resultPromise, timeoutPromise]) as any;

      if (!result) {
        throw new Error('No response from Gemini');
      }

      const response = await result.response;
      if (!response) {
        throw new Error('Empty response from Gemini');
      }

      const text = response.text().trim();
      console.log('Raw response from Gemini:', text);

      // Extract JSON from the response
      let jsonStr = text;
      
      // If the response contains markdown code blocks, extract the JSON
      if (text.includes('```json')) {
        const match = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          jsonStr = match[1].trim();
        }
      } else if (text.includes('```')) {
        const match = text.match(/```\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          jsonStr = match[1].trim();
        }
      }
      
      // If the response still doesn't look like JSON, try to extract it
      if (!jsonStr.startsWith('{')) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
      }
      
      console.log('Extracted JSON string:', jsonStr);

      try {
        const tipData = JSON.parse(jsonStr);
        
        // Validate the response
        if (!tipData.title || !tipData.content || !tipData.category) {
          console.error('Invalid tip data structure:', tipData);
          throw new Error('Invalid response format - missing required fields');
        }

        // Normalize category
        const validCategories = ['health', 'wellness', 'nutrition', 'exercise', 'mindfulness'];
        let category = tipData.category.toLowerCase();
        if (!validCategories.includes(category)) {
          console.warn(`Invalid category "${category}" - defaulting to "health"`);
          category = 'health';
        }

        const tip = {
          title: tipData.title,
          content: tipData.content,
          category: category as 'health' | 'wellness' | 'nutrition' | 'exercise' | 'mindfulness'
        };

        console.log('Successfully generated tip:', tip);
        return tip;
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        console.error('Problematic text:', jsonStr);
        
        // Create a fallback tip based on the phase
        if (phase) {
          return {
            title: `${phase} Phase Tip`,
            content: `During your ${phase} phase, listen to your body's needs and adjust your activities accordingly.`,
            category: 'health'
          };
        } else {
          return {
            title: 'Self-Care Reminder',
            content: 'Regular self-care practices can help manage menstrual symptoms and improve overall well-being.',
            category: 'wellness'
          };
        }
      }
    } catch (error) {
      console.error('Error in TipsService:', error);
      
      // Return a fallback tip
      if (phase) {
        return {
          title: `${phase} Phase Tip`,
          content: `During your ${phase} phase, listen to your body's needs and adjust your activities accordingly.`,
          category: 'health'
        };
      } else {
        return {
          title: 'Stay Hydrated',
          content: 'Drinking plenty of water helps reduce bloating and cramps. Aim for 8-10 glasses daily.',
          category: 'health'
        };
      }
    }
  }
} 