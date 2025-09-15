import { WorkoutPlanRequest, WorkoutPlanResponse, PhysiqueAnalysisResponse } from '@/types/ai';

export class WorkoutPlannerService {
  private readonly aiEndpoint = 'https://toolkit.rork.com/text/llm/';

  async generateWorkoutPlan(
    request: WorkoutPlanRequest, 
    physiqueAnalysis?: PhysiqueAnalysisResponse | null,
    userStats?: any
  ): Promise<WorkoutPlanResponse> {
    try {
      console.log('Generating workout plan for:', request.goal);
      
      const prompt = this.buildWorkoutPlanPrompt(request, physiqueAnalysis, userStats);
      
      const response = await fetch(this.aiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert strength and conditioning coach with extensive knowledge in hypertrophy, strength training, and program design. Create scientifically-backed workout programs tailored to individual needs and physique analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText}`);
      }

      const aiResult = await response.json();
      return this.parseWorkoutPlan(aiResult.completion, request);
      
    } catch (error) {
      console.error('Workout plan generation error:', error);
      throw new Error('Failed to generate workout plan');
    }
  }

  private buildWorkoutPlanPrompt(
    request: WorkoutPlanRequest,
    physiqueAnalysis?: PhysiqueAnalysisResponse | null,
    userStats?: any
  ): string {
    let physiqueContext = '';
    
    if (physiqueAnalysis) {
      physiqueContext = `
PHYSIQUE ANALYSIS CONTEXT:
- Weak points to prioritize: ${physiqueAnalysis.weakPoints.join(', ')}
- Strength points to maintain: ${physiqueAnalysis.strengthPoints.join(', ')}
- Body fat: ${physiqueAnalysis.metrics.bodyFat}%
- Muscle mass: ${physiqueAnalysis.metrics.muscleMass}%
- Symmetry score: ${physiqueAnalysis.metrics.symmetry}/10

Muscle group development scores:
${Object.entries(physiqueAnalysis.muscleGroups).map(([group, data]) => 
  `- ${group}: ${data.development}/10 (${data.notes})`
).join('\\n')}
      `;
    }

    return `
Create a comprehensive ${request.daysPerWeek}-day workout program with the following specifications:

PROGRAM REQUIREMENTS:
- Goal: ${request.goal}
- Experience level: ${request.experience}
- Days per week: ${request.daysPerWeek}
- Session duration: ${request.timePerSession} minutes
- Available equipment: ${request.equipment.join(', ')}
- Preferences: ${request.preferences?.join(', ') || 'None specified'}
- Limitations: ${request.limitations?.join(', ') || 'None specified'}

${physiqueContext}

${userStats ? `
USER STATS:
- Age: ${userStats.age}
- Weight: ${userStats.weight}kg
- Height: ${userStats.height}cm
- Experience: ${userStats.experience}
- Goals: ${userStats.goals?.join(', ')}
` : ''}

PROGRAM DESIGN PRINCIPLES:
1. **Periodization**: Include progressive overload and deload weeks
2. **Volume Distribution**: Optimal weekly volume for each muscle group
3. **Exercise Selection**: Compound movements prioritized, isolation for weak points
4. **Recovery**: Appropriate rest between sessions for muscle groups
5. **Progression**: Clear progression scheme (weight, reps, sets)

${request.goal === 'build_muscle' ? `
HYPERTROPHY FOCUS:
- Volume: 10-20 sets per muscle group per week
- Rep ranges: 6-15 reps for most exercises
- Rest periods: 2-3 minutes between sets
- Frequency: Each muscle group 2x per week minimum
` : ''}

${request.goal === 'strength' ? `
STRENGTH FOCUS:
- Intensity: 80-95% 1RM for main lifts
- Rep ranges: 1-6 reps for strength, 6-10 for accessories
- Rest periods: 3-5 minutes between sets
- Frequency: Main lifts 2-3x per week
` : ''}

Return your program in this exact JSON format:
{
  "plan": {
    "name": "<program name>",
    "duration": "<duration in weeks>",
    "description": "<program overview>",
    "schedule": [
      {
        "day": "Day 1",
        "type": "<workout type>",
        "duration": <minutes>,
        "exercises": [
          {
            "name": "<exercise name>",
            "sets": <number>,
            "reps": "<rep range>",
            "weight": "<weight guidance>",
            "notes": "<form cues/tips>",
            "targetMuscles": ["<muscle1>", "<muscle2>"]
          }
        ],
        "restDay": false
      }
    ]
  },
  "nutrition": {
    "dailyCalories": <estimated calories>,
    "macros": {
      "protein": <grams>,
      "carbs": <grams>,
      "fats": <grams>
    },
    "tips": [<nutrition tips array>]
  },
  "progressTracking": {
    "metrics": [<tracking metrics array>],
    "checkpoints": [<milestone checkpoints array>]
  }
}
    `.trim();
  }

  private parseWorkoutPlan(aiResponse: string, request: WorkoutPlanRequest): WorkoutPlanResponse {
    try {
      const jsonMatch = aiResponse.match(/\\{[\\s\\S]*\\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
      
      return this.createFallbackPlan(request);
    } catch (error) {
      console.error('Failed to parse workout plan:', error);
      return this.createFallbackPlan(request);
    }
  }

  private createFallbackPlan(request: WorkoutPlanRequest): WorkoutPlanResponse {
    const planName = this.getPlanName(request.goal, request.experience);
    
    return {
      plan: {
        name: planName,
        duration: '8 weeks',
        description: `A comprehensive ${request.goal} program designed for ${request.experience} level athletes`,
        schedule: this.generateFallbackSchedule(request)
      },
      nutrition: {
        dailyCalories: this.estimateCalories(request.goal),
        macros: this.calculateMacros(request.goal),
        tips: this.getNutritionTips(request.goal)
      },
      progressTracking: {
        metrics: ['Weight lifted', 'Reps completed', 'Body weight', 'Body measurements'],
        checkpoints: ['Week 2: Form check', 'Week 4: Progress photos', 'Week 6: Strength test', 'Week 8: Final assessment']
      }
    };
  }

  private getPlanName(goal: string, experience: string): string {
    const goalNames = {
      build_muscle: 'Hypertrophy Builder',
      lose_weight: 'Fat Loss Accelerator',
      strength: 'Strength Foundation',
      endurance: 'Endurance Enhancer'
    };
    
    return `${goalNames[goal as keyof typeof goalNames]} - ${experience.charAt(0).toUpperCase() + experience.slice(1)}`;
  }

  private generateFallbackSchedule(request: WorkoutPlanRequest) {
    const baseExercises = {
      upper: [
        { name: 'Push-ups', sets: 3, reps: '8-12', targetMuscles: ['chest', 'shoulders', 'triceps'] },
        { name: 'Pull-ups', sets: 3, reps: '5-10', targetMuscles: ['back', 'biceps'] },
        { name: 'Overhead Press', sets: 3, reps: '8-10', targetMuscles: ['shoulders', 'triceps'] },
        { name: 'Rows', sets: 3, reps: '10-12', targetMuscles: ['back', 'biceps'] }
      ],
      lower: [
        { name: 'Squats', sets: 3, reps: '10-15', targetMuscles: ['quadriceps', 'glutes'] },
        { name: 'Deadlifts', sets: 3, reps: '8-10', targetMuscles: ['hamstrings', 'glutes', 'back'] },
        { name: 'Lunges', sets: 3, reps: '10-12', targetMuscles: ['quadriceps', 'glutes'] },
        { name: 'Calf Raises', sets: 3, reps: '15-20', targetMuscles: ['calves'] }
      ]
    };

    const schedule = [];
    
    for (let day = 1; day <= request.daysPerWeek; day++) {
      const isUpper = day % 2 === 1;
      const exercises = isUpper ? baseExercises.upper : baseExercises.lower;
      
      schedule.push({
        day: `Day ${day}`,
        type: isUpper ? 'Upper Body' : 'Lower Body',
        duration: request.timePerSession,
        exercises: exercises.map(ex => ({
          ...ex,
          weight: 'Progressive',
          notes: 'Focus on form and control'
        })),
        restDay: false
      });
    }

    return schedule;
  }

  private estimateCalories(goal: string): number {
    const baseCalories = {
      build_muscle: 2800,
      lose_weight: 2200,
      strength: 2600,
      endurance: 2900
    };
    
    return baseCalories[goal as keyof typeof baseCalories] || 2500;
  }

  private calculateMacros(goal: string) {
    const macroRatios = {
      build_muscle: { protein: 30, carbs: 40, fats: 30 },
      lose_weight: { protein: 35, carbs: 30, fats: 35 },
      strength: { protein: 25, carbs: 45, fats: 30 },
      endurance: { protein: 20, carbs: 55, fats: 25 }
    };
    
    const ratios = macroRatios[goal as keyof typeof macroRatios] || macroRatios.build_muscle;
    const calories = this.estimateCalories(goal);
    
    return {
      protein: Math.round((calories * ratios.protein / 100) / 4),
      carbs: Math.round((calories * ratios.carbs / 100) / 4),
      fats: Math.round((calories * ratios.fats / 100) / 9)
    };
  }

  private getNutritionTips(goal: string): string[] {
    const tips = {
      build_muscle: [
        'Eat in a slight caloric surplus (300-500 calories)',
        'Consume 1.6-2.2g protein per kg body weight',
        'Time protein intake around workouts',
        'Stay hydrated with 3-4L water daily'
      ],
      lose_weight: [
        'Maintain a moderate caloric deficit (300-500 calories)',
        'Prioritize protein to preserve muscle mass',
        'Include plenty of vegetables for satiety',
        'Consider intermittent fasting if suitable'
      ],
      strength: [
        'Fuel workouts with adequate carbohydrates',
        'Focus on nutrient timing around training',
        'Include creatine supplementation',
        'Maintain consistent meal timing'
      ],
      endurance: [
        'Emphasize complex carbohydrates',
        'Stay well-hydrated before, during, and after exercise',
        'Include electrolyte replacement for long sessions',
        'Focus on recovery nutrition post-workout'
      ]
    };
    
    return tips[goal as keyof typeof tips] || tips.build_muscle;
  }

  async adaptPlanBasedOnProgress(
    currentPlan: WorkoutPlanResponse,
    progressData: any,
    physiqueChanges?: any
  ): Promise<WorkoutPlanResponse> {
    // Analyze progress and adapt the plan
    const adaptations = this.analyzeProgressAndAdapt(progressData, physiqueChanges);
    
    // Apply adaptations to the current plan
    const adaptedPlan = { ...currentPlan };
    
    // Adjust volume, intensity, or exercise selection based on progress
    if (adaptations.increaseVolume) {
      adaptedPlan.plan.schedule.forEach(day => {
        day.exercises.forEach(exercise => {
          if (adaptations.targetMuscles.includes(exercise.targetMuscles[0])) {
            exercise.sets += 1;
          }
        });
      });
    }
    
    if (adaptations.changeExercises) {
      // Replace exercises for lagging muscle groups
      // Implementation would depend on specific needs
    }
    
    return adaptedPlan;
  }

  private analyzeProgressAndAdapt(progressData: any, physiqueChanges?: any) {
    return {
      increaseVolume: progressData.plateaued || false,
      decreaseVolume: progressData.overreaching || false,
      changeExercises: physiqueChanges?.lagginMuscles?.length > 0 || false,
      targetMuscles: physiqueChanges?.laggingMuscles || []
    };
  }
}