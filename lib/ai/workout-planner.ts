import { aiClient } from './ai-client';
import { WorkoutPlanRequest, WorkoutPlanResponse, PhysiqueAnalysisResponse } from '@/types/ai';

export class WorkoutPlannerService {
  async generateWorkoutPlan(
    request: WorkoutPlanRequest & { userStats?: any },
    physiqueAnalysis: PhysiqueAnalysisResponse | null = null
  ): Promise<WorkoutPlanResponse> {
    try {
      // Build comprehensive prompt for AI workout planning
      const prompt = this.buildWorkoutPlanPrompt(request, physiqueAnalysis);
      
      // Get AI-generated workout plan
      const response = await aiClient.generateWorkoutPlan(prompt);
      
      // Parse and enhance the response
      try {
        const parsedResponse = JSON.parse(response);
        return this.enhanceWorkoutPlan(parsedResponse, request, physiqueAnalysis);
      } catch (parseError) {
        console.error('Error parsing workout plan response:', parseError);
        return this.createStructuredPlanFromText(response, request, physiqueAnalysis);
      }
    } catch (error) {
      console.error('Workout plan generation error:', error);
      return this.getFallbackWorkoutPlan(request);
    }
  }

  private buildWorkoutPlanPrompt(
    request: WorkoutPlanRequest & { userStats?: any },
    physiqueAnalysis: PhysiqueAnalysisResponse | null = null
  ): string {
    const { goal, experience, daysPerWeek, timePerSession, equipment, preferences, limitations, userStats } = request;
    
    let prompt = `Generate a detailed workout plan with the following parameters:

Goal: ${goal}
Experience Level: ${experience}
Days Per Week: ${daysPerWeek}
Time Per Session: ${timePerSession} minutes
Available Equipment: ${equipment?.join(', ') || 'Basic gym equipment'}
`;

    if (preferences && preferences.length > 0) {
      prompt += `Preferences: ${preferences.join(', ')}\n`;
    }

    if (limitations && limitations.length > 0) {
      prompt += `Limitations/Injuries: ${limitations.join(', ')}\n`;
    }

    if (userStats) {
      prompt += `
User Stats:
- Age: ${userStats.age || 'N/A'}
- Gender: ${userStats.gender || 'N/A'}
- Height: ${userStats.height || 'N/A'} cm
- Weight: ${userStats.weight || 'N/A'} kg
`;
    }

    if (physiqueAnalysis) {
      prompt += `
Physique Analysis Results:
- Overall Muscle Mass: ${physiqueAnalysis.metrics.muscleMass}%
- Body Fat: ${physiqueAnalysis.metrics.bodyFat}%
- Symmetry Score: ${physiqueAnalysis.metrics.symmetry}/10
- Posture Score: ${physiqueAnalysis.metrics.posture}/10
- Overall Convexity: ${physiqueAnalysis.metrics.overallConvexity}/10

Weak Points to Prioritize:
${physiqueAnalysis.weakPoints.map(wp => `- ${wp}`).join('\n')}

Strength Points to Maintain:
${physiqueAnalysis.strengthPoints.map(sp => `- ${sp}`).join('\n')}

Muscle Group Analysis:`;
      
      Object.entries(physiqueAnalysis.muscleGroups).forEach(([group, analysis]) => {
        prompt += `
- ${group}: Development ${analysis.development}/10, Convexity ${analysis.convexity}/10, Symmetry ${analysis.symmetry}/10`;
      });
    }

    prompt += `

Please create a detailed hypertrophy-focused workout plan that:
1. Prioritizes weak points identified in the physique analysis
2. Uses progressive overload principles with specific volume targets
3. Includes compound and isolation exercises with proper form cues
4. Provides specific sets, reps, rest periods, and RPE targets
5. Incorporates periodization for continuous progress
6. Adapts to the user's experience level and available time
7. Focuses on muscle building as the primary goal
8. Includes recovery and deload planning

Format the response as a structured JSON object with detailed exercise prescriptions.`;

    return prompt;
  }

  private enhanceWorkoutPlan(
    response: any, 
    request: WorkoutPlanRequest,
    physiqueAnalysis: PhysiqueAnalysisResponse | null = null
  ): WorkoutPlanResponse {
    // Ensure the plan has all required properties
    const enhancedPlan = {
      plan: {
        name: response.plan?.name || this.generatePlanName(request.goal, request.experience),
        duration: response.plan?.duration || '8 weeks',
        description: response.plan?.description || this.generatePlanDescription(request),
        schedule: this.enhanceSchedule(response.plan?.schedule || [], request, physiqueAnalysis)
      },
      nutrition: {
        dailyCalories: response.nutrition?.dailyCalories || this.calculateCalories(request),
        macros: {
          protein: response.nutrition?.macros?.protein || this.calculateProtein(request),
          carbs: response.nutrition?.macros?.carbs || this.calculateCarbs(request),
          fats: response.nutrition?.macros?.fats || this.calculateFats(request)
        },
        tips: response.nutrition?.tips || this.generateNutritionTips(request, physiqueAnalysis)
      },
      progressTracking: {
        metrics: response.progressTracking?.metrics || [
          'Weight progression on key lifts',
          'Body weight and composition changes',
          'Progress photos from multiple angles',
          'Muscle circumference measurements',
          'Physique analysis scores'
        ],
        checkpoints: response.progressTracking?.checkpoints || [
          'Week 2: Form assessment and initial adaptations',
          'Week 4: Mid-program evaluation and load adjustments',
          'Week 6: Exercise variation and intensity progression',
          'Week 8: Program completion and next phase planning'
        ]
      }
    };
    
    return enhancedPlan;
  }

  private generatePlanName(goal: string, experience: string): string {
    const goalNames = {
      build_muscle: 'Hypertrophy',
      lose_weight: 'Fat Loss',
      strength: 'Strength Building',
      endurance: 'Endurance'
    };
    
    const experienceNames = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced'
    };
    
    const goalName = goalNames[goal as keyof typeof goalNames] || 'Custom';
    const experienceName = experienceNames[experience as keyof typeof experienceNames] || 'Custom';
    
    return `${experienceName} ${goalName} Program`;
  }

  private generatePlanDescription(request: WorkoutPlanRequest): string {
    const { goal, daysPerWeek, timePerSession } = request;
    
    const goalDescriptions = {
      build_muscle: 'focused on progressive overload and hypertrophy training',
      lose_weight: 'designed to maximize calorie burn and fat loss',
      strength: 'centered on building maximal strength and power',
      endurance: 'aimed at improving cardiovascular fitness and muscular endurance'
    };
    
    const goalDescription = goalDescriptions[goal as keyof typeof goalDescriptions] || 'customized to your specific needs';
    
    return `A ${daysPerWeek}-day per week program ${goalDescription}. Each workout is designed to be completed in approximately ${timePerSession} minutes.`;
  }

  private generateDefaultSchedule(request: WorkoutPlanRequest): any[] {
    const { goal, daysPerWeek, experience } = request;
    
    // Generate a basic schedule based on the goal and days per week
    const schedule = [];
    
    if (goal === 'build_muscle' || goal === 'strength') {
      // Push/Pull/Legs split for muscle building or strength
      if (daysPerWeek >= 6) {
        // 6-day PPL
        schedule.push(
          { day: 'Monday', type: 'Push (Chest, Shoulders, Triceps)', restDay: false },
          { day: 'Tuesday', type: 'Pull (Back, Biceps)', restDay: false },
          { day: 'Wednesday', type: 'Legs (Quads, Hamstrings, Calves)', restDay: false },
          { day: 'Thursday', type: 'Push (Chest, Shoulders, Triceps)', restDay: false },
          { day: 'Friday', type: 'Pull (Back, Biceps)', restDay: false },
          { day: 'Saturday', type: 'Legs (Quads, Hamstrings, Calves)', restDay: false },
          { day: 'Sunday', type: 'Rest & Recovery', restDay: true }
        );
      } else if (daysPerWeek >= 4) {
        // 4-5 day upper/lower
        schedule.push(
          { day: 'Monday', type: 'Upper Body', restDay: false },
          { day: 'Tuesday', type: 'Lower Body', restDay: false },
          { day: 'Wednesday', type: 'Rest & Recovery', restDay: true },
          { day: 'Thursday', type: 'Upper Body', restDay: false },
          { day: 'Friday', type: 'Lower Body', restDay: false },
          { day: 'Saturday', type: daysPerWeek >= 5 ? 'Full Body' : 'Rest & Recovery', restDay: daysPerWeek < 5 },
          { day: 'Sunday', type: 'Rest & Recovery', restDay: true }
        );
      } else {
        // 3-day full body
        schedule.push(
          { day: 'Monday', type: 'Full Body', restDay: false },
          { day: 'Tuesday', type: 'Rest & Recovery', restDay: true },
          { day: 'Wednesday', type: 'Full Body', restDay: false },
          { day: 'Thursday', type: 'Rest & Recovery', restDay: true },
          { day: 'Friday', type: 'Full Body', restDay: false },
          { day: 'Saturday', type: 'Rest & Recovery', restDay: true },
          { day: 'Sunday', type: 'Rest & Recovery', restDay: true }
        );
      }
    } else if (goal === 'lose_weight' || goal === 'endurance') {
      // More frequent training with cardio for weight loss or endurance
      for (let i = 0; i < 7; i++) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const isWorkoutDay = i < daysPerWeek;
        
        let workoutType = 'Rest & Recovery';
        if (isWorkoutDay) {
          if (i % 3 === 0) {
            workoutType = 'Full Body + HIIT';
          } else if (i % 3 === 1) {
            workoutType = 'Upper Body + Cardio';
          } else {
            workoutType = 'Lower Body + Cardio';
          }
        }
        
        schedule.push({
          day: days[i],
          type: workoutType,
          restDay: !isWorkoutDay
        });
      }
    }
    
    // Add exercises to each workout day
    return schedule.map(day => {
      if (day.restDay) {
        return {
          ...day,
          duration: 0,
          exercises: []
        };
      }
      
      return {
        ...day,
        duration: request.timePerSession,
        exercises: this.generateExercisesForWorkoutType(day.type, experience)
      };
    });
  }

  private generateExercisesForWorkoutType(workoutType: string, experience: string): any[] {
    const exercises = [];
    
    // Determine number of exercises based on experience level
    const exerciseCount = experience === 'beginner' ? 4 : experience === 'intermediate' ? 6 : 8;
    
    if (workoutType.includes('Push') || workoutType.includes('Upper')) {
      exercises.push(
        {
          name: 'Bench Press',
          sets: experience === 'beginner' ? 3 : 4,
          reps: '8-10',
          targetMuscles: ['Chest', 'Triceps', 'Shoulders']
        },
        {
          name: 'Overhead Press',
          sets: experience === 'beginner' ? 3 : 4,
          reps: '8-10',
          targetMuscles: ['Shoulders', 'Triceps']
        }
      );
      
      if (exerciseCount > 2) {
        exercises.push(
          {
            name: 'Incline Dumbbell Press',
            sets: 3,
            reps: '10-12',
            targetMuscles: ['Upper Chest', 'Shoulders']
          },
          {
            name: 'Tricep Pushdowns',
            sets: 3,
            reps: '12-15',
            targetMuscles: ['Triceps']
          }
        );
      }
      
      if (exerciseCount > 4) {
        exercises.push(
          {
            name: 'Lateral Raises',
            sets: 3,
            reps: '12-15',
            targetMuscles: ['Lateral Deltoids']
          },
          {
            name: 'Chest Flyes',
            sets: 3,
            reps: '12-15',
            targetMuscles: ['Chest']
          }
        );
      }
      
      if (exerciseCount > 6) {
        exercises.push(
          {
            name: 'Skull Crushers',
            sets: 3,
            reps: '10-12',
            targetMuscles: ['Triceps']
          },
          {
            name: 'Push-Ups',
            sets: 3,
            reps: 'AMRAP',
            targetMuscles: ['Chest', 'Shoulders', 'Triceps']
          }
        );
      }
    } else if (workoutType.includes('Pull')) {
      exercises.push(
        {
          name: 'Pull-Ups/Lat Pulldowns',
          sets: experience === 'beginner' ? 3 : 4,
          reps: '8-10',
          targetMuscles: ['Back', 'Biceps']
        },
        {
          name: 'Bent Over Rows',
          sets: experience === 'beginner' ? 3 : 4,
          reps: '8-10',
          targetMuscles: ['Back', 'Biceps']
        }
      );
      
      if (exerciseCount > 2) {
        exercises.push(
          {
            name: 'Face Pulls',
            sets: 3,
            reps: '12-15',
            targetMuscles: ['Rear Deltoids', 'Upper Back']
          },
          {
            name: 'Bicep Curls',
            sets: 3,
            reps: '10-12',
            targetMuscles: ['Biceps']
          }
        );
      }
      
      if (exerciseCount > 4) {
        exercises.push(
          {
            name: 'Seated Cable Rows',
            sets: 3,
            reps: '10-12',
            targetMuscles: ['Mid Back']
          },
          {
            name: 'Hammer Curls',
            sets: 3,
            reps: '10-12',
            targetMuscles: ['Biceps', 'Forearms']
          }
        );
      }
      
      if (exerciseCount > 6) {
        exercises.push(
          {
            name: 'Shrugs',
            sets: 3,
            reps: '12-15',
            targetMuscles: ['Traps']
          },
          {
            name: 'Reverse Flyes',
            sets: 3,
            reps: '12-15',
            targetMuscles: ['Rear Deltoids']
          }
        );
      }
    } else if (workoutType.includes('Legs')) {
      exercises.push(
        {
          name: 'Squats',
          sets: experience === 'beginner' ? 3 : 4,
          reps: '8-10',
          targetMuscles: ['Quads', 'Glutes', 'Hamstrings']
        },
        {
          name: 'Romanian Deadlifts',
          sets: experience === 'beginner' ? 3 : 4,
          reps: '8-10',
          targetMuscles: ['Hamstrings', 'Glutes', 'Lower Back']
        }
      );
      
      if (exerciseCount > 2) {
        exercises.push(
          {
            name: 'Leg Press',
            sets: 3,
            reps: '10-12',
            targetMuscles: ['Quads', 'Glutes']
          },
          {
            name: 'Calf Raises',
            sets: 3,
            reps: '15-20',
            targetMuscles: ['Calves']
          }
        );
      }
      
      if (exerciseCount > 4) {
        exercises.push(
          {
            name: 'Leg Extensions',
            sets: 3,
            reps: '12-15',
            targetMuscles: ['Quads']
          },
          {
            name: 'Leg Curls',
            sets: 3,
            reps: '12-15',
            targetMuscles: ['Hamstrings']
          }
        );
      }
      
      if (exerciseCount > 6) {
        exercises.push(
          {
            name: 'Hip Thrusts',
            sets: 3,
            reps: '10-12',
            targetMuscles: ['Glutes']
          },
          {
            name: 'Walking Lunges',
            sets: 3,
            reps: '10 per leg',
            targetMuscles: ['Quads', 'Glutes', 'Hamstrings']
          }
        );
      }
    } else if (workoutType.includes('Full Body')) {
      exercises.push(
        {
          name: 'Squats',
          sets: experience === 'beginner' ? 3 : 4,
          reps: '8-10',
          targetMuscles: ['Quads', 'Glutes', 'Hamstrings']
        },
        {
          name: 'Bench Press',
          sets: experience === 'beginner' ? 3 : 4,
          reps: '8-10',
          targetMuscles: ['Chest', 'Triceps', 'Shoulders']
        }
      );
      
      if (exerciseCount > 2) {
        exercises.push(
          {
            name: 'Bent Over Rows',
            sets: 3,
            reps: '8-10',
            targetMuscles: ['Back', 'Biceps']
          },
          {
            name: 'Overhead Press',
            sets: 3,
            reps: '8-10',
            targetMuscles: ['Shoulders', 'Triceps']
          }
        );
      }
      
      if (exerciseCount > 4) {
        exercises.push(
          {
            name: 'Romanian Deadlifts',
            sets: 3,
            reps: '8-10',
            targetMuscles: ['Hamstrings', 'Glutes', 'Lower Back']
          },
          {
            name: 'Pull-Ups/Lat Pulldowns',
            sets: 3,
            reps: '8-10',
            targetMuscles: ['Back', 'Biceps']
          }
        );
      }
      
      if (exerciseCount > 6) {
        exercises.push(
          {
            name: 'Bicep Curls',
            sets: 3,
            reps: '10-12',
            targetMuscles: ['Biceps']
          },
          {
            name: 'Tricep Pushdowns',
            sets: 3,
            reps: '10-12',
            targetMuscles: ['Triceps']
          }
        );
      }
    }
    
    // Add HIIT or cardio if specified in the workout type
    if (workoutType.includes('HIIT')) {
      exercises.push({
        name: 'HIIT Circuit',
        sets: 1,
        reps: '20 minutes',
        notes: '30 seconds work, 30 seconds rest for 20 minutes',
        targetMuscles: ['Cardiovascular System', 'Full Body']
      });
    } else if (workoutType.includes('Cardio')) {
      exercises.push({
        name: 'Steady State Cardio',
        sets: 1,
        reps: '20-30 minutes',
        notes: 'Moderate intensity (65-75% max heart rate)',
        targetMuscles: ['Cardiovascular System']
      });
    }
    
    return exercises;
  }

  private generateDefaultNutrition(request: WorkoutPlanRequest): any {
    const { goal } = request;
    
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    let calories = 0;
    
    // Set macros based on goal
    if (goal === 'build_muscle') {
      protein = 30;
      carbs = 45;
      fats = 25;
      calories = 2800;
    } else if (goal === 'lose_weight') {
      protein = 40;
      carbs = 30;
      fats = 30;
      calories = 2000;
    } else if (goal === 'strength') {
      protein = 30;
      carbs = 40;
      fats = 30;
      calories = 2600;
    } else if (goal === 'endurance') {
      protein = 25;
      carbs = 55;
      fats = 20;
      calories = 2400;
    }
    
    return {
      dailyCalories: calories,
      macros: {
        protein,
        carbs,
        fats
      },
      tips: [
        'Consume protein within 30 minutes after your workout',
        'Stay hydrated throughout the day',
        'Prioritize whole foods over processed options',
        'Adjust calorie intake based on your progress',
        'Consider tracking your food intake for better results'
      ]
    };
  }

  private createStructuredPlanFromText(
    responseText: string,
    request: WorkoutPlanRequest & { userStats?: any },
    physiqueAnalysis: PhysiqueAnalysisResponse | null = null
  ): WorkoutPlanResponse {
    // Fallback parsing logic for unstructured responses
    return this.getFallbackWorkoutPlan(request);
  }

  private enhanceSchedule(
    schedule: any[],
    request: WorkoutPlanRequest & { userStats?: any },
    physiqueAnalysis: PhysiqueAnalysisResponse | null = null
  ) {
    if (!schedule || schedule.length === 0) {
      return this.generateDefaultSchedule(request);
    }

    return schedule.map(day => ({
      day: day.day || 'Training Day',
      type: day.type || 'Full Body',
      duration: day.duration || request.timePerSession,
      exercises: day.exercises?.map((exercise: any) => ({
        name: exercise.name || 'Exercise',
        sets: exercise.sets || 3,
        reps: exercise.reps || '8-12',
        weight: exercise.weight || 'Progressive',
        notes: exercise.notes || 'Focus on form',
        targetMuscles: exercise.targetMuscles || ['Full Body']
      })) || [],
      restDay: day.restDay || false
    }));
  }

  private calculateCalories(request: WorkoutPlanRequest & { userStats?: any }): number {
    const { userStats, goal } = request;
    
    if (!userStats) {
      // Default calories based on goal
      const goalCalories = {
        build_muscle: 2800,
        lose_weight: 2000,
        strength: 2600,
        endurance: 2400
      };
      return goalCalories[goal as keyof typeof goalCalories] || 2500;
    }
    
    const { weight, height, age, gender } = userStats;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Activity multiplier based on goal
    let activityMultiplier = 1.6; // Moderate activity
    if (goal === 'build_muscle' || goal === 'strength') {
      activityMultiplier = 1.8; // Very active
    } else if (goal === 'lose_weight') {
      activityMultiplier = 1.5; // Light activity for deficit
    } else if (goal === 'endurance') {
      activityMultiplier = 1.9; // Extra active
    }
    
    return Math.round(bmr * activityMultiplier);
  }

  private calculateProtein(request: WorkoutPlanRequest & { userStats?: any }): number {
    const { goal } = request;
    
    // Protein percentage based on goal
    const proteinPercentages = {
      build_muscle: 30,
      lose_weight: 40,
      strength: 30,
      endurance: 25
    };
    
    return proteinPercentages[goal as keyof typeof proteinPercentages] || 30;
  }

  private calculateCarbs(request: WorkoutPlanRequest & { userStats?: any }): number {
    const { goal } = request;
    
    // Carb percentage based on goal
    const carbPercentages = {
      build_muscle: 45,
      lose_weight: 30,
      strength: 40,
      endurance: 55
    };
    
    return carbPercentages[goal as keyof typeof carbPercentages] || 40;
  }

  private calculateFats(request: WorkoutPlanRequest & { userStats?: any }): number {
    const { goal } = request;
    
    // Fat percentage based on goal
    const fatPercentages = {
      build_muscle: 25,
      lose_weight: 30,
      strength: 30,
      endurance: 20
    };
    
    return fatPercentages[goal as keyof typeof fatPercentages] || 25;
  }

  private generateNutritionTips(
    request: WorkoutPlanRequest & { userStats?: any },
    physiqueAnalysis: PhysiqueAnalysisResponse | null = null
  ): string[] {
    const { goal } = request;
    const baseTips = [
      'Stay hydrated throughout the day (aim for 3-4 liters)',
      'Prioritize whole foods over processed options',
      'Time your meals around your workouts for optimal performance'
    ];

    if (goal === 'build_muscle') {
      baseTips.push(
        'Consume 20-30g protein within 2 hours post-workout',
        'Eat in a slight caloric surplus (300-500 calories above maintenance)',
        'Include complex carbs for sustained energy during workouts'
      );
    } else if (goal === 'lose_weight') {
      baseTips.push(
        'Maintain a moderate caloric deficit (300-500 calories below maintenance)',
        'Prioritize protein to preserve muscle mass during weight loss',
        'Consider intermittent fasting if it fits your lifestyle'
      );
    } else if (goal === 'strength') {
      baseTips.push(
        'Fuel your workouts with adequate carbohydrates',
        'Don\'t neglect healthy fats for hormone production',
        'Consider creatine supplementation (3-5g daily)'
      );
    } else if (goal === 'endurance') {
      baseTips.push(
        'Focus on complex carbohydrates for sustained energy',
        'Include electrolytes during longer training sessions',
        'Practice your race-day nutrition strategy during training'
      );
    }

    if (physiqueAnalysis) {
      if (physiqueAnalysis.metrics.bodyFat > 20) {
        baseTips.push('Consider reducing refined sugars and processed foods');
      }
      if (physiqueAnalysis.metrics.muscleMass < 75) {
        baseTips.push('Increase protein intake to support muscle growth');
      }
    }

    return baseTips;
  }

  private getFallbackWorkoutPlan(request: WorkoutPlanRequest): WorkoutPlanResponse {
    return {
      plan: {
        name: this.generatePlanName(request.goal, request.experience),
        duration: '8 weeks',
        description: this.generatePlanDescription(request),
        schedule: this.generateDefaultSchedule(request)
      },
      nutrition: this.generateDefaultNutrition(request),
      progressTracking: {
        metrics: [
          'Weight progression on key lifts',
          'Body weight and composition changes',
          'Progress photos from multiple angles',
          'Muscle circumference measurements'
        ],
        checkpoints: [
          'Week 2: Form assessment and initial adaptations',
          'Week 4: Mid-program evaluation and load adjustments',
          'Week 8: Program completion and next phase planning'
        ]
      }
    };
  }
}

export const workoutPlannerService = new WorkoutPlannerService();