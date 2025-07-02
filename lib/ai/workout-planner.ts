import { aiClient } from './ai-client';
import { WorkoutPlanRequest, WorkoutPlanResponse } from '@/types/ai';
import { PhysiqueAnalysisResult } from './physique-analyzer';

export class WorkoutPlannerService {
  async generateWorkoutPlan(
    request: WorkoutPlanRequest & { userStats?: any },
    physiqueAnalysis: PhysiqueAnalysisResult | null
  ): Promise<WorkoutPlanResponse> {
    try {
      // Build comprehensive prompt for AI workout planning
      const prompt = this.buildWorkoutPlanPrompt(request, physiqueAnalysis);
      
      // Get AI-generated workout plan
      const response = await aiClient.generateWorkoutPlan(prompt);
      
      // Parse and enhance the response
      return this.enhanceWorkoutPlan(JSON.parse(response), request);
    } catch (error) {
      console.error('Workout plan generation error:', error);
      return this.getFallbackWorkoutPlan(request);
    }
  }

  private buildWorkoutPlanPrompt(
    request: WorkoutPlanRequest & { userStats?: any },
    physiqueAnalysis: PhysiqueAnalysisResult | null
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
Physique Analysis:
- Body Fat: ${physiqueAnalysis.metrics.bodyFat}%
- Muscle Mass: ${physiqueAnalysis.metrics.muscleMass}%
- Symmetry: ${physiqueAnalysis.metrics.symmetry}/10
- Posture: ${physiqueAnalysis.metrics.posture}/10

Weak Points: ${physiqueAnalysis.weakPoints.join(', ')}
Strong Points: ${physiqueAnalysis.strengthPoints.join(', ')}
`;

      // Add muscle group specific details
      prompt += `\nMuscle Group Development:\n`;
      for (const [group, data] of Object.entries(physiqueAnalysis.muscleGroups)) {
        prompt += `- ${group}: Development ${data.development}/10, Symmetry ${data.symmetry}/10\n`;
      }
    }

    prompt += `
Please create a comprehensive workout plan that includes:
1. A weekly schedule with specific workouts for each day
2. Detailed exercises with sets, reps, and rest periods
3. Progressive overload strategy
4. Nutrition recommendations to support the training
5. Progress tracking metrics

Format the response as a structured JSON object.`;

    return prompt;
  }

  private enhanceWorkoutPlan(response: any, request: WorkoutPlanRequest): WorkoutPlanResponse {
    // Ensure the plan has all required properties
    const enhancedPlan = {
      plan: {
        name: response.plan?.name || this.generatePlanName(request.goal, request.experience),
        duration: response.plan?.duration || '8 weeks',
        description: response.plan?.description || this.generatePlanDescription(request),
        schedule: response.plan?.schedule || this.generateDefaultSchedule(request)
      },
      nutrition: response.nutrition || this.generateDefaultNutrition(request),
      progressTracking: response.progressTracking || {
        metrics: [
          'Weight',
          'Body measurements',
          'Progress photos',
          'Strength progression'
        ],
        checkpoints: [
          'Week 2: Initial progress assessment',
          'Week 4: Mid-program evaluation',
          'Week 8: Final results assessment'
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
          'Weight',
          'Body measurements',
          'Progress photos',
          'Strength progression'
        ],
        checkpoints: [
          'Week 2: Initial progress assessment',
          'Week 4: Mid-program evaluation',
          'Week 8: Final results assessment'
        ]
      }
    };
  }
}

export const workoutPlannerService = new WorkoutPlannerService();