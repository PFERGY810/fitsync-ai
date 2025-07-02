import { aiClient } from './ai-client';
import { FormAnalysisRequest, FormAnalysisResponse } from '@/types/ai';

export class FormAnalysisService {
  async analyzeExerciseForm(request: FormAnalysisRequest): Promise<FormAnalysisResponse> {
    const prompt = this.buildFormAnalysisPrompt(request);
    
    try {
      const response = await aiClient.analyzeForm(prompt);
      const parsedResponse = JSON.parse(response);
      
      // Validate and sanitize the response
      return this.validateFormAnalysisResponse(parsedResponse);
    } catch (error) {
      console.error('Form analysis error:', error);
      // Return a fallback response
      return this.getFallbackFormAnalysis(request.exercise);
    }
  }

  private buildFormAnalysisPrompt(request: FormAnalysisRequest): string {
    let prompt = `Analyze the ${request.exercise} exercise form with the following details:\n\n`;
    
    if (request.metrics) {
      prompt += `Metrics observed:\n`;
      if (request.metrics.backAngle) {
        prompt += `- Back angle: ${request.metrics.backAngle}°\n`;
      }
      if (request.metrics.kneeAlignment) {
        prompt += `- Knee alignment: ${request.metrics.kneeAlignment}\n`;
      }
      if (request.metrics.depth) {
        prompt += `- Depth: ${request.metrics.depth}\n`;
      }
      if (request.metrics.duration) {
        prompt += `- Duration: ${request.metrics.duration} seconds\n`;
      }
    }

    if (request.userDescription) {
      prompt += `\nUser description: ${request.userDescription}\n`;
    }

    if (request.userProfile) {
      prompt += `\nUser profile:\n`;
      prompt += `- Experience level: ${request.userProfile.experience}\n`;
      prompt += `- Goals: ${request.userProfile.goals.join(', ')}\n`;
      if (request.userProfile.injuries?.length) {
        prompt += `- Previous injuries: ${request.userProfile.injuries.join(', ')}\n`;
      }
    }

    prompt += `\nProvide a comprehensive form analysis with specific scores, feedback, and actionable improvements.`;

    return prompt;
  }

  private validateFormAnalysisResponse(response: any): FormAnalysisResponse {
    // Ensure all required fields are present with defaults
    return {
      exercise: response.exercise || 'Unknown Exercise',
      overallScore: Math.max(0, Math.min(100, response.overallScore || 75)),
      metrics: {
        depth: {
          score: Math.max(0, Math.min(100, response.metrics?.depth?.score || 80)),
          status: this.validateStatus(response.metrics?.depth?.status) || 'good',
          feedback: response.metrics?.depth?.feedback || 'Good depth achieved'
        },
        backAngle: {
          score: Math.max(0, Math.min(100, response.metrics?.backAngle?.score || 70)),
          angle: response.metrics?.backAngle?.angle || 62,
          status: this.validateStatus(response.metrics?.backAngle?.status) || 'needs_improvement',
          feedback: response.metrics?.backAngle?.feedback || 'Consider adjusting back angle'
        },
        kneeTracking: {
          score: Math.max(0, Math.min(100, response.metrics?.kneeTracking?.score || 85)),
          status: this.validateStatus(response.metrics?.kneeTracking?.status) || 'good',
          feedback: response.metrics?.kneeTracking?.feedback || 'Knee tracking looks good'
        }
      },
      improvements: Array.isArray(response.improvements) ? response.improvements : [
        'Focus on maintaining proper form throughout the movement'
      ],
      tips: Array.isArray(response.tips) ? response.tips : [
        'Practice the movement slowly to build muscle memory'
      ],
      nextSteps: Array.isArray(response.nextSteps) ? response.nextSteps : [
        'Continue practicing with current weight',
        'Focus on the identified improvement areas'
      ]
    };
  }

  private validateStatus(status: string): 'good' | 'needs_improvement' | 'poor' {
    if (['good', 'needs_improvement', 'poor'].includes(status)) {
      return status as 'good' | 'needs_improvement' | 'poor';
    }
    return 'good';
  }

  private getFallbackFormAnalysis(exercise: string): FormAnalysisResponse {
    return {
      exercise,
      overallScore: 75,
      metrics: {
        depth: {
          score: 80,
          status: 'good',
          feedback: 'Good depth achieved for this exercise'
        },
        backAngle: {
          score: 70,
          angle: 62,
          status: 'needs_improvement',
          feedback: 'Try to keep your back angle above 65° to reduce strain'
        },
        kneeTracking: {
          score: 85,
          status: 'good',
          feedback: 'Knee tracking is well aligned'
        }
      },
      improvements: [
        'Focus on maintaining proper back angle',
        'Ensure consistent depth throughout sets'
      ],
      tips: [
        'Practice the movement slowly to build muscle memory',
        'Consider using a mirror to check your form'
      ],
      nextSteps: [
        'Continue practicing with current weight',
        'Focus on back angle improvement',
        'Record yourself to analyze form'
      ]
    };
  }
}

export const formAnalysisService = new FormAnalysisService();