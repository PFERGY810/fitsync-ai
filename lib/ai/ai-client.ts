import { AIMessage, AIResponse } from '@/types/ai';

class AIClient {
  private baseUrl = 'https://toolkit.rork.com/text/llm/';

  private cleanJsonResponse(response: string): string {
    if (!response || typeof response !== 'string') {
      throw new Error('Invalid response format');
    }

    // Remove markdown code blocks if present
    let cleaned = response.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    
    // Remove common AI response prefixes and suffixes
    cleaned = cleaned.replace(/^[^{\[]*(?={|\[)/, '');
    cleaned = cleaned.replace(/[^}\]]*$/, '');
    
    // Find the first { or [ and last } or ]
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    
    let start = -1;
    let end = -1;
    
    // Determine if we have an object or array
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      // Object
      start = firstBrace;
      end = lastBrace;
    } else if (firstBracket !== -1) {
      // Array
      start = firstBracket;
      end = lastBracket;
    }
    
    if (start !== -1 && end !== -1 && end > start) {
      return cleaned.substring(start, end + 1);
    }
    
    console.error('No valid JSON structure found in response:', cleaned.substring(0, 300));
    throw new Error('No valid JSON structure found in response');
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
        (str: string) => {
          let cleaned = str;
          // Remove trailing text after JSON
          cleaned = cleaned.replace(/}[^}]*$/, '}');
          cleaned = cleaned.replace(/][^\]]*$/, ']');
          // Quote unquoted keys
          cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
          // Single to double quotes
          cleaned = cleaned.replace(/'/g, '"');
          // Remove trailing commas
          cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
          // Remove control characters
          cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
          return cleaned;
        },
        
        // Step 2: Fix string content issues
        (str: string) => {
          let cleaned = str;
          // Fix common string content issues that break JSON
          cleaned = cleaned.replace(/"([^"]*?)\n([^"]*?)"/g, '"$1\\n$2"');
          cleaned = cleaned.replace(/"([^"]*?)\t([^"]*?)"/g, '"$1\\t$2"');
          cleaned = cleaned.replace(/"([^"]*?)\r([^"]*?)"/g, '"$1\\r$2"');
          return cleaned;
        },
        
        // Step 3: Fix incomplete arrays
        (str: string) => {
          let cleaned = str;
          // If we have an incomplete array, try to close it
          const openBrackets = (cleaned.match(/\[/g) || []).length;
          const closeBrackets = (cleaned.match(/\]/g) || []).length;
          if (openBrackets > closeBrackets) {
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
              cleaned += ']';
            }
          }
          return cleaned;
        },
        
        // Step 4: Fix incomplete objects
        (str: string) => {
          let cleaned = str;
          // If we have an incomplete object, try to close it
          const openBraces = (cleaned.match(/{/g) || []).length;
          const closeBraces = (cleaned.match(/}/g) || []).length;
          if (openBraces > closeBraces) {
            for (let i = 0; i < openBraces - closeBraces; i++) {
              cleaned += '}';
            }
          }
          return cleaned;
        }
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
    try {
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
    } catch (error) {
      console.error('Physique analysis error in AI client:', error);
      // Don't return fallback data - let the error bubble up
      throw error;
    }
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
          content: `You are an expert fitness coach. Create a workout plan as a valid JSON object.
          
          CRITICAL: Respond with ONLY valid JSON. No text before or after.
          IMPORTANT: Keep all arrays to exactly 2 items to prevent truncation.
          
          Use this EXACT structure:
          {
            "plan": {
              "name": "Beginner Program",
              "duration": "8 weeks",
              "description": "Full body workout plan",
              "schedule": []
            },
            "nutrition": {
              "dailyCalories": 2500,
              "macros": {
                "protein": 30,
                "carbs": 40,
                "fats": 30
              },
              "tips": ["Eat protein after workouts", "Stay hydrated"]
            },
            "progressTracking": {
              "metrics": ["Weight progression", "Body measurements"],
              "checkpoints": ["Week 4 assessment", "Week 8 evaluation"]
            }
          }
          
          Keep all strings under 50 characters. Complete the JSON properly with closing braces.`
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await this.generateText(messages);
      console.log('Raw workout response (first 300 chars):', response.substring(0, 300));
      
      const cleanedResponse = this.cleanJsonResponse(response);
      console.log('Cleaned workout JSON (first 300 chars):', cleanedResponse.substring(0, 300));
      
      const parsed = this.parseJsonSafely(cleanedResponse);
      
      // Ensure all required fields exist
      const result = {
        plan: {
          name: parsed.plan?.name || 'AI Generated Plan',
          duration: parsed.plan?.duration || '8 weeks',
          description: parsed.plan?.description || 'Custom workout plan',
          schedule: Array.isArray(parsed.plan?.schedule) ? parsed.plan.schedule : []
        },
        nutrition: {
          dailyCalories: parsed.nutrition?.dailyCalories || 2500,
          macros: {
            protein: parsed.nutrition?.macros?.protein || 30,
            carbs: parsed.nutrition?.macros?.carbs || 40,
            fats: parsed.nutrition?.macros?.fats || 30
          },
          tips: Array.isArray(parsed.nutrition?.tips) ? parsed.nutrition.tips.slice(0, 2) : ['Eat protein after workouts', 'Stay hydrated']
        },
        progressTracking: {
          metrics: Array.isArray(parsed.progressTracking?.metrics) ? parsed.progressTracking.metrics.slice(0, 2) : ['Weight progression', 'Body measurements'],
          checkpoints: Array.isArray(parsed.progressTracking?.checkpoints) ? parsed.progressTracking.checkpoints.slice(0, 2) : ['Week 4 assessment', 'Week 8 evaluation']
        }
      };
      
      return result;
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
          tips: ['Eat protein after workouts', 'Stay hydrated']
        },
        progressTracking: {
          metrics: ['Weight progression', 'Body measurements'],
          checkpoints: ['Week 4 assessment', 'Week 8 evaluation']
        }
      };
    }
  }

  async generateNutritionPlan(prompt: string): Promise<any> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are an expert nutritionist. Create a nutrition plan as a valid JSON object.
          
          CRITICAL: Respond with ONLY valid JSON. No text before or after.
          IMPORTANT: Keep all meal arrays to exactly 2 items to prevent truncation.
          IMPORTANT: Ensure all JSON is properly closed with matching braces and brackets.
          IMPORTANT: Use simple meal names without special characters or quotes inside strings.
          
          Use this EXACT structure (copy exactly):
          {
            "dailyCalories": 2000,
            "macros": {
              "protein": { "grams": 150, "percentage": 30 },
              "carbs": { "grams": 200, "percentage": 40 },
              "fats": { "grams": 67, "percentage": 30 }
            },
            "mealPlan": {
              "breakfast": [
                { "name": "Scrambled eggs", "calories": 200 },
                { "name": "Whole grain toast", "calories": 150 }
              ],
              "lunch": [
                { "name": "Grilled chicken", "calories": 300 },
                { "name": "Brown rice", "calories": 200 }
              ],
              "dinner": [
                { "name": "Baked salmon", "calories": 350 },
                { "name": "Steamed vegetables", "calories": 100 }
              ],
              "snacks": [
                { "name": "Protein shake", "calories": 150 },
                { "name": "Mixed nuts", "calories": 200 }
              ]
            },
            "tips": ["Stay hydrated", "Eat protein with meals"],
            "supplements": ["Whey protein", "Multivitamin"]
          }
          
          Keep all strings under 20 characters. Double-check that all arrays and objects are properly closed.`
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await this.generateText(messages);
      console.log('Raw nutrition response (first 300 chars):', response.substring(0, 300));
      
      const cleanedResponse = this.cleanJsonResponse(response);
      console.log('Cleaned nutrition JSON (first 300 chars):', cleanedResponse.substring(0, 300));
      
      const parsed = this.parseJsonSafely(cleanedResponse);
      
      // Ensure all required fields exist with proper validation
      const result = {
        dailyCalories: typeof parsed.dailyCalories === 'number' ? parsed.dailyCalories : 2000,
        macros: {
          protein: (parsed.macros?.protein && typeof parsed.macros.protein === 'object') 
            ? parsed.macros.protein 
            : { grams: 150, percentage: 30 },
          carbs: (parsed.macros?.carbs && typeof parsed.macros.carbs === 'object') 
            ? parsed.macros.carbs 
            : { grams: 200, percentage: 40 },
          fats: (parsed.macros?.fats && typeof parsed.macros.fats === 'object') 
            ? parsed.macros.fats 
            : { grams: 67, percentage: 30 }
        },
        mealPlan: {
          breakfast: Array.isArray(parsed.mealPlan?.breakfast) 
            ? parsed.mealPlan.breakfast.slice(0, 2) 
            : [{ name: 'Scrambled eggs', calories: 200 }, { name: 'Whole grain toast', calories: 150 }],
          lunch: Array.isArray(parsed.mealPlan?.lunch) 
            ? parsed.mealPlan.lunch.slice(0, 2) 
            : [{ name: 'Grilled chicken', calories: 300 }, { name: 'Brown rice', calories: 200 }],
          dinner: Array.isArray(parsed.mealPlan?.dinner) 
            ? parsed.mealPlan.dinner.slice(0, 2) 
            : [{ name: 'Baked salmon', calories: 350 }, { name: 'Steamed vegetables', calories: 100 }],
          snacks: Array.isArray(parsed.mealPlan?.snacks) 
            ? parsed.mealPlan.snacks.slice(0, 2) 
            : [{ name: 'Protein shake', calories: 150 }, { name: 'Mixed nuts', calories: 200 }]
        },
        tips: Array.isArray(parsed.tips) 
          ? parsed.tips.slice(0, 2) 
          : ['Stay hydrated', 'Eat protein with meals'],
        supplements: Array.isArray(parsed.supplements) 
          ? parsed.supplements.slice(0, 2) 
          : ['Whey protein', 'Multivitamin']
      };
      
      return result;
    } catch (error) {
      console.error('AI nutrition plan generation failed:', error);
      // Don't return fallback data - let the error bubble up
      throw error;
    }
  }
}

export const aiClient = new AIClient();