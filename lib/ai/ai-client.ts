import { AIMessage, AIResponse } from '@/types/ai';

class AIClient {
  private baseUrl = 'https://toolkit.rork.com/text/llm/';

  private cleanJsonResponse(response: string): string {
    if (!response || typeof response !== 'string') {
      throw new Error('Invalid response format');
    }

    // Remove markdown code blocks if present
    let cleaned = response.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    
    // Remove common AI response prefixes
    cleaned = cleaned.replace(/^[^{\[]*(?={|\[)/, '');
    
    // Remove any text after the last } or ]
    cleaned = cleaned.replace(/(?<=}|\])[^}\]]*$/, '');
    
    // Try to find JSON object first
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
      return cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    // Try to find array format
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1 && firstBracket < lastBracket) {
      return cleaned.substring(firstBracket, lastBracket + 1);
    }
    
    console.error('No valid JSON found in response:', cleaned.substring(0, 300));
    throw new Error('No valid JSON found in response');
  }

  private parseJsonSafely(jsonString: string): any {
    if (!jsonString?.trim()) {
      throw new Error('Empty JSON string provided');
    }
    
    if (jsonString.length > 100000) {
      throw new Error('JSON string too large');
    }
    
    let sanitized = jsonString.trim();
    
    // Remove any BOM or invisible characters
    sanitized = sanitized.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF]/g, '');
    
    try {
      return JSON.parse(sanitized);
    } catch (firstError) {
      console.log('Initial JSON parse failed, attempting to fix common issues...');
      
      // Progressive cleaning attempts
      const cleaningSteps = [
        // Step 1: Basic cleanup
        (str: string) => str
          .replace(/}[^}]*$/, '}') // Remove trailing text after JSON
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Quote unquoted keys
          .replace(/'/g, '"') // Single to double quotes
          .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
          .replace(/[\x00-\x1F\x7F-\x9F]/g, ''), // Remove control characters
        
        // Step 2: Fix escape sequences
        (str: string) => str
          .replace(/\\n/g, '\\\\n')
          .replace(/\\t/g, '\\\\t')
          .replace(/\\r/g, '\\\\r')
          .replace(/\\"/g, '\\\\"'),
        
        // Step 3: Extract JSON pattern
        (str: string) => {
          const match = str.match(/{[\s\S]*}|\[[\s\S]*\]/);
          return match ? match[0] : str;
        },
        
        // Step 4: Aggressive cleanup
        (str: string) => str
          .replace(/\\+"/g, '"')
          .replace(/"\s*:\s*"([^"]*)"/g, (match, value) => {
            // Fix escaped quotes in string values
            return `"${value.replace(/"/g, '\\"')}"`;
          })
      ];
      
      let cleaned = sanitized;
      for (let i = 0; i < cleaningSteps.length; i++) {
        try {
          cleaned = cleaningSteps[i](cleaned);
          const parsed = JSON.parse(cleaned);
          console.log(`JSON parsing succeeded after step ${i + 1}`);
          return parsed;
        } catch (stepError) {
          console.log(`Step ${i + 1} failed:`, stepError instanceof Error ? stepError.message : String(stepError));
          continue;
        }
      }
      
      console.error('All JSON parsing attempts failed');
      console.error('Original (first 300 chars):', sanitized.substring(0, 300));
      console.error('Final cleaned (first 300 chars):', cleaned.substring(0, 300));
      console.error('Parse error:', firstError instanceof Error ? firstError.message : String(firstError));
      
      throw new Error(`Invalid JSON response from AI: ${firstError instanceof Error ? firstError.message : String(firstError)}`);
    }
  }

  async generateText(messages: AIMessage[]): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed with status ${response.status}`);
      }

      const data: AIResponse = await response.json();
      return data.completion.trim();
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  async analyzePhysique(prompt: string): Promise<any> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert fitness coach and physique analyst with deep knowledge of bodybuilding, 
        anatomy, and muscle development. Analyze the provided physique photo and provide detailed feedback 
        on muscle development, symmetry, body fat percentage, and areas for improvement. 
        Format your response as a structured JSON object.`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.generateText(messages);
    console.log('Raw AI response (first 500 chars):', response.substring(0, 500));
    
    const cleanedResponse = this.cleanJsonResponse(response);
    console.log('Cleaned JSON (first 500 chars):', cleanedResponse.substring(0, 500));
    
    return this.parseJsonSafely(cleanedResponse);
  }

  async analyzeForm(prompt: string): Promise<any> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert fitness coach specializing in exercise form analysis. 
        Analyze the provided exercise form description and metrics to provide detailed feedback 
        on technique, potential issues, and recommendations for improvement. 
        Format your response as a structured JSON object.`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await this.generateText(messages);
    console.log('Raw AI response (first 500 chars):', response.substring(0, 500));
    
    const cleanedResponse = this.cleanJsonResponse(response);
    console.log('Cleaned JSON (first 500 chars):', cleanedResponse.substring(0, 500));
    
    return this.parseJsonSafely(cleanedResponse);
  }

  async generateWorkoutPlan(prompt: string): Promise<any> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are an expert fitness coach and program designer with deep knowledge of 
          exercise science, periodization, and training methodologies. Create a detailed, personalized 
          workout plan based on the user's goals, experience level, and constraints. 
          
          IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any text before or after the JSON. 
          The JSON should follow this exact structure:
          {
            \"plan\": {
              \"name\": \"string\",
              \"duration\": \"string\",
              \"description\": \"string\",
              \"schedule\": []
            },
            \"nutrition\": {
              \"dailyCalories\": number,
              \"macros\": {
                \"protein\": number,
                \"carbs\": number,
                \"fats\": number
              },
              \"tips\": []
            },
            \"progressTracking\": {
              \"metrics\": [],
              \"checkpoints\": []
            }
          }`
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await this.generateText(messages);
      const cleanedResponse = this.cleanJsonResponse(response);
      return this.parseJsonSafely(cleanedResponse);
    } catch (error) {
      console.error('AI workout plan generation failed:', error);
      // Return a minimal valid structure that the service can enhance
      return {
        plan: {
          name: 'AI Generated Plan',
          duration: '8 weeks',
          description: 'Custom workout plan',
          schedule: []
        },
        nutrition: {
          dailyCalories: 2500,
          macros: {
            protein: 30,
            carbs: 40,
            fats: 30
          },
          tips: []
        },
        progressTracking: {
          metrics: [],
          checkpoints: []
        }
      };
    }
  }

  async generateNutritionPlan(prompt: string): Promise<any> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are an expert nutritionist and dietitian with deep knowledge of 
          sports nutrition, macronutrient requirements, and meal planning. Create a detailed, 
          personalized nutrition plan based on the user's goals, body metrics, and preferences. 
          
          IMPORTANT: You must respond with ONLY a valid JSON object. Do not include any text before or after the JSON. 
          The JSON should follow this exact structure:
          {
            \"dailyCalories\": number,
            \"macros\": {
              \"protein\": { \"grams\": number, \"percentage\": number },
              \"carbs\": { \"grams\": number, \"percentage\": number },
              \"fats\": { \"grams\": number, \"percentage\": number }
            },
            \"mealPlan\": {
              \"breakfast\": [],
              \"lunch\": [],
              \"dinner\": [],
              \"snacks\": []
            },
            \"tips\": [],
            \"supplements\": []
          }`
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await this.generateText(messages);
      const cleanedResponse = this.cleanJsonResponse(response);
      return this.parseJsonSafely(cleanedResponse);
    } catch (error) {
      console.error('AI nutrition plan generation failed:', error);
      // Return a minimal valid structure that the service can enhance
      return {
        dailyCalories: 2500,
        macros: {
          protein: { grams: 150, percentage: 30 },
          carbs: { grams: 250, percentage: 40 },
          fats: { grams: 83, percentage: 30 }
        },
        mealPlan: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: []
        },
        tips: [],
        supplements: []
      };
    }
  }
}

export const aiClient = new AIClient();