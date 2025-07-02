import { AIMessage, AIResponse } from '@/types/ai';

class AIClient {
  private baseUrl = 'https://toolkit.rork.com/text/llm/';

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
      return data.completion;
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  async analyzePhysique(prompt: string): Promise<string> {
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

    return this.generateText(messages);
  }

  async analyzeForm(prompt: string): Promise<string> {
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

    return this.generateText(messages);
  }

  async generateWorkoutPlan(prompt: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert fitness coach and program designer with deep knowledge of 
        exercise science, periodization, and training methodologies. Create a detailed, personalized 
        workout plan based on the user's goals, experience level, and constraints. 
        Format your response as a structured JSON object.`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return this.generateText(messages);
  }

  async generateNutritionPlan(prompt: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are an expert nutritionist and dietitian with deep knowledge of 
        sports nutrition, macronutrient requirements, and meal planning. Create a detailed, 
        personalized nutrition plan based on the user's goals, body metrics, and preferences. 
        Format your response as a structured JSON object.`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return this.generateText(messages);
  }
}

export const aiClient = new AIClient();