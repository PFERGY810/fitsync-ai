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
    
    // Try to find JSON object first - use a more robust approach
    // Count braces to find the complete JSON object
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;
    let jsonStart = -1;
    let jsonEnd = -1;
    let isArray = false;
    
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\' && inString) {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') {
          if (jsonStart === -1 && bracketCount === 0) {
            jsonStart = i;
            isArray = false;
          }
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0 && bracketCount === 0 && jsonStart !== -1 && !isArray) {
            jsonEnd = i;
            break;
          }
        } else if (char === '[') {
          if (jsonStart === -1 && braceCount === 0) {
            jsonStart = i;
            isArray = true;
          }
          bracketCount++;
        } else if (char === ']') {
          bracketCount--;
          if (bracketCount === 0 && braceCount === 0 && jsonStart !== -1 && isArray) {
            jsonEnd = i;
            break;
          }
        }
      }
    }
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return cleaned.substring(jsonStart, jsonEnd + 1);
    }
    
    // Fallback: Try to extract the largest valid JSON structure
    const matches = cleaned.match(/{[\s\S]*}|\[[\s\S]*\]/);
    if (matches && matches[0]) {
      return matches[0];
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
      // Return a minimal valid structure
      return {
        metrics: {
          muscleMass: 75,
          bodyFat: 15,
          symmetry: 7,
          posture: 8,
          overallConvexity: 6
        },
        insights: ['Analysis in progress'],
        recommendations: ['Continue with your current routine'],
        muscleGroups: {},
        weakPoints: [],
        strengthPoints: []
      };
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
          IMPORTANT: Keep all arrays to exactly 2 items to prevent truncation.
          
          Use this EXACT structure:
          {
            "dailyCalories": 2000,
            "macros": {
              "protein": { "grams": 150, "percentage": 30 },
              "carbs": { "grams": 200, "percentage": 40 },
              "fats": { "grams": 67, "percentage": 30 }
            },
            "mealPlan": {
              "breakfast": ["Eggs with toast", "Greek yogurt"],
              "lunch": ["Chicken salad", "Brown rice"],
              "dinner": ["Salmon", "Vegetables"],
              "snacks": ["Protein shake", "Nuts"]
            },
            "tips": ["Stay hydrated", "Eat protein with meals"],
            "supplements": ["Whey protein", "Multivitamin"]
          }
          
          Keep all strings under 30 characters. Complete the JSON properly with closing braces.`
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
      
      // Ensure all required fields exist
      const result = {
        dailyCalories: parsed.dailyCalories || 2000,
        macros: {
          protein: parsed.macros?.protein || { grams: 150, percentage: 30 },
          carbs: parsed.macros?.carbs || { grams: 200, percentage: 40 },
          fats: parsed.macros?.fats || { grams: 67, percentage: 30 }
        },
        mealPlan: {
          breakfast: Array.isArray(parsed.mealPlan?.breakfast) ? parsed.mealPlan.breakfast.slice(0, 2) : ['Eggs with toast', 'Greek yogurt'],
          lunch: Array.isArray(parsed.mealPlan?.lunch) ? parsed.mealPlan.lunch.slice(0, 2) : ['Chicken salad', 'Brown rice'],
          dinner: Array.isArray(parsed.mealPlan?.dinner) ? parsed.mealPlan.dinner.slice(0, 2) : ['Salmon', 'Vegetables'],
          snacks: Array.isArray(parsed.mealPlan?.snacks) ? parsed.mealPlan.snacks.slice(0, 2) : ['Protein shake', 'Nuts']
        },
        tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 2) : ['Stay hydrated', 'Eat protein with meals'],
        supplements: Array.isArray(parsed.supplements) ? parsed.supplements.slice(0, 2) : ['Whey protein', 'Multivitamin']
      };
      
      return result;
    } catch (error) {
      console.error('AI nutrition plan generation failed:', error);
      // Return a minimal valid structure that the service can enhance
      return {
        dailyCalories: 2000,
        macros: {
          protein: { grams: 150, percentage: 30 },
          carbs: { grams: 200, percentage: 40 },
          fats: { grams: 67, percentage: 30 }
        },
        mealPlan: {
          breakfast: ['Eggs with toast', 'Greek yogurt'],
          lunch: ['Chicken salad', 'Brown rice'],
          dinner: ['Salmon', 'Vegetables'],
          snacks: ['Protein shake', 'Nuts']
        },
        tips: ['Stay hydrated', 'Eat protein with meals'],
        supplements: ['Whey protein', 'Multivitamin']
      };
    }
  }
}

export const aiClient = new AIClient();