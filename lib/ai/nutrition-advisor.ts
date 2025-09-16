import { aiClient } from './ai-client';
import { NutritionRequest, NutritionResponse, PhysiqueAnalysisResponse } from '@/types/ai';

export class NutritionAdvisorService {
  async generateNutritionPlan(
    request: NutritionRequest,
    physiqueAnalysis: PhysiqueAnalysisResponse | null,
    zipCode: string = '',
    weeklyBudget: number = 100
  ): Promise<NutritionResponse> {
    try {
      // Build comprehensive prompt for AI nutrition planning
      const prompt = this.buildNutritionPlanPrompt(request, physiqueAnalysis, zipCode, weeklyBudget);
      
      // Get AI-generated nutrition plan
      const response = await aiClient.generateNutritionPlan(prompt);
      
      // Parse and enhance the response
      return this.enhanceNutritionPlan(JSON.parse(response), request, weeklyBudget);
    } catch (error) {
      console.error('Nutrition plan generation error:', error);
      return this.getFallbackNutritionPlan(request, weeklyBudget);
    }
  }

  private buildNutritionPlanPrompt(
    request: NutritionRequest,
    physiqueAnalysis: PhysiqueAnalysisResponse | null,
    zipCode: string,
    weeklyBudget: number
  ): string {
    const { goal, weight, height, age, gender, activityLevel, dietaryRestrictions, preferences } = request;
    
    let prompt = `Generate a detailed nutrition plan with the following parameters:

Goal: ${goal}
Weight: ${weight} kg
Height: ${height} cm
Age: ${age}
Gender: ${gender}
Activity Level: ${activityLevel}
Weekly Budget: $${weeklyBudget}
`;

    if (zipCode) {
      prompt += `Location (ZIP Code): ${zipCode}\n`;
    }

    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      prompt += `Dietary Restrictions: ${dietaryRestrictions.join(', ')}\n`;
    }

    if (preferences && preferences.length > 0) {
      prompt += `Food Preferences: ${preferences.join(', ')}\n`;
    }

    if (physiqueAnalysis) {
      prompt += `
Physique Analysis:
- Body Fat: ${physiqueAnalysis.metrics.bodyFat}%
- Muscle Mass: ${physiqueAnalysis.metrics.muscleMass}%
- Training Focus: ${physiqueAnalysis.weakPoints.join(', ')}
`;
    }

    prompt += `
Please create a comprehensive nutrition plan that includes:
1. Daily calorie target
2. Macronutrient breakdown (protein, carbs, fats)
3. Meal plan with breakfast, lunch, dinner, and snacks
4. Budget breakdown for grocery shopping
5. Nutrition tips specific to the goal

Format the response as a structured JSON object.`;

    return prompt;
  }

  private enhanceNutritionPlan(response: any, request: NutritionRequest, weeklyBudget: number): NutritionResponse {
    // Calculate calories if not provided
    const calculatedCalories = this.calculateCalories(request);
    
    // Calculate macros if not provided
    const calculatedMacros = this.calculateMacros(calculatedCalories, request.goal);
    
    // Ensure the plan has all required properties
    const enhancedPlan: NutritionResponse = {
      dailyCalories: response.dailyCalories || calculatedCalories,
      macros: {
        protein: response.macros?.protein || calculatedMacros.protein,
        carbs: response.macros?.carbs || calculatedMacros.carbs,
        fats: response.macros?.fats || calculatedMacros.fats
      },
      mealPlan: response.mealPlan || this.generateDefaultMealPlan(calculatedCalories, calculatedMacros),
      tips: response.tips || this.generateDefaultTips(request.goal),
      supplements: response.supplements || this.recommendSupplements(request.goal)
    };
    
    // Add budget breakdown if not provided
    if (weeklyBudget > 0) {
      enhancedPlan.budgetBreakdown = response.budgetBreakdown || this.generateBudgetBreakdown(weeklyBudget);
    }
    
    return enhancedPlan;
  }

  private calculateCalories(request: NutritionRequest): number {
    const { weight, height, age, gender, activityLevel, goal } = request;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Apply activity multiplier
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };
    
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);
    
    // Adjust based on goal
    if (goal === 'lose_weight') {
      return Math.round(tdee * 0.8); // 20% deficit
    } else if (goal === 'build_muscle') {
      return Math.round(tdee * 1.1); // 10% surplus
    } else {
      return Math.round(tdee); // maintenance
    }
  }

  private calculateMacros(calories: number, goal: string): { protein: { grams: number; percentage: number }; carbs: { grams: number; percentage: number }; fats: { grams: number; percentage: number } } {
    let proteinPercentage = 0;
    let carbsPercentage = 0;
    let fatsPercentage = 0;
    
    // Set macro percentages based on goal
    if (goal === 'build_muscle') {
      proteinPercentage = 30;
      carbsPercentage = 45;
      fatsPercentage = 25;
    } else if (goal === 'lose_weight') {
      proteinPercentage = 40;
      carbsPercentage = 30;
      fatsPercentage = 30;
    } else {
      proteinPercentage = 30;
      carbsPercentage = 40;
      fatsPercentage = 30;
    }
    
    // Calculate grams
    const proteinGrams = Math.round((calories * (proteinPercentage / 100)) / 4);
    const carbsGrams = Math.round((calories * (carbsPercentage / 100)) / 4);
    const fatsGrams = Math.round((calories * (fatsPercentage / 100)) / 9);
    
    return {
      protein: { grams: proteinGrams, percentage: proteinPercentage },
      carbs: { grams: carbsGrams, percentage: carbsPercentage },
      fats: { grams: fatsGrams, percentage: fatsPercentage }
    };
  }

  private generateDefaultMealPlan(calories: number, macros: any): any {
    // Calculate calories per meal
    const breakfastCalories = Math.round(calories * 0.25);
    const lunchCalories = Math.round(calories * 0.3);
    const dinnerCalories = Math.round(calories * 0.3);
    const snacksCalories = Math.round(calories * 0.15);
    
    return {
      breakfast: [
        {
          name: 'Protein Oatmeal with Berries',
          calories: breakfastCalories,
          protein: Math.round(macros.protein.grams * 0.25),
          carbs: Math.round(macros.carbs.grams * 0.3),
          fats: Math.round(macros.fats.grams * 0.2),
          ingredients: [
            'Rolled oats',
            'Whey protein powder',
            'Mixed berries',
            'Almond milk',
            'Chia seeds'
          ],
          prepTime: 10,
          cost: 2.5
        }
      ],
      lunch: [
        {
          name: 'Chicken and Vegetable Stir Fry with Rice',
          calories: lunchCalories,
          protein: Math.round(macros.protein.grams * 0.35),
          carbs: Math.round(macros.carbs.grams * 0.35),
          fats: Math.round(macros.fats.grams * 0.25),
          ingredients: [
            'Chicken breast',
            'Brown rice',
            'Mixed vegetables',
            'Olive oil',
            'Low-sodium soy sauce'
          ],
          prepTime: 20,
          cost: 3.5
        }
      ],
      dinner: [
        {
          name: 'Baked Salmon with Sweet Potato and Broccoli',
          calories: dinnerCalories,
          protein: Math.round(macros.protein.grams * 0.35),
          carbs: Math.round(macros.carbs.grams * 0.25),
          fats: Math.round(macros.fats.grams * 0.45),
          ingredients: [
            'Salmon fillet',
            'Sweet potato',
            'Broccoli',
            'Olive oil',
            'Lemon',
            'Herbs and spices'
          ],
          prepTime: 25,
          cost: 5
        }
      ],
      snacks: [
        {
          name: 'Greek Yogurt with Honey and Nuts',
          calories: Math.round(snacksCalories * 0.6),
          protein: Math.round(macros.protein.grams * 0.15),
          carbs: Math.round(macros.carbs.grams * 0.1),
          fats: Math.round(macros.fats.grams * 0.1),
          ingredients: [
            'Greek yogurt',
            'Honey',
            'Mixed nuts'
          ],
          prepTime: 5,
          cost: 1.5
        },
        {
          name: 'Protein Shake',
          calories: Math.round(snacksCalories * 0.4),
          protein: Math.round(macros.protein.grams * 0.15),
          carbs: Math.round(macros.carbs.grams * 0.05),
          fats: Math.round(macros.fats.grams * 0.05),
          ingredients: [
            'Whey protein powder',
            'Banana',
            'Almond milk',
            'Ice'
          ],
          prepTime: 5,
          cost: 1.5
        }
      ]
    };
  }

  private generateDefaultTips(goal: string): string[] {
    const commonTips = [
      'Stay hydrated by drinking at least 2-3 liters of water daily',
      'Eat protein with every meal to support muscle maintenance and growth',
      'Include a variety of colorful vegetables for micronutrients',
      'Plan and prep meals in advance to stay consistent',
      'Listen to your body and adjust portions based on hunger and fullness cues'
    ];
    
    const goalSpecificTips: Record<string, string[]> = {
      build_muscle: [
        'Consume protein within 30 minutes after your workout',
        'Ensure you are in a slight caloric surplus to support muscle growth',
        'Focus on progressive overload in your training to stimulate muscle growth',
        'Consider eating more carbs on training days and fewer on rest days',
        'Prioritize sleep for optimal recovery and hormone regulation'
      ],
      lose_weight: [
        'Focus on high-volume, low-calorie foods to stay full while in a deficit',
        'Incorporate protein at every meal to preserve muscle mass',
        'Consider intermittent fasting if it helps you maintain your calorie deficit',
        'Track your food intake to ensure you stay in a calorie deficit',
        'Include regular cardio and strength training for optimal fat loss'
      ],
      maintain: [
        'Monitor your weight weekly to ensure you are maintaining',
        'Adjust calories up or down based on weight trends',
        'Focus on nutrient-dense foods for overall health',
        'Practice mindful eating to maintain a healthy relationship with food',
        'Balance your macronutrients for optimal energy and recovery'
      ]
    };
    
    return [...commonTips, ...(goalSpecificTips[goal] || [])];
  }

  private recommendSupplements(goal: string): string[] {
    const commonSupplements = [
      'Whey protein powder for convenient protein intake',
      'Creatine monohydrate for improved strength and performance',
      'Vitamin D3 for immune function and bone health',
      'Omega-3 fatty acids for inflammation reduction and heart health'
    ];
    
    const goalSpecificSupplements: Record<string, string[]> = {
      build_muscle: [
        'Pre-workout for enhanced training performance',
        'ZMA for improved recovery and sleep quality',
        'Beta-alanine for increased muscular endurance',
        'Casein protein for slow-release protein before bed'
      ],
      lose_weight: [
        'Caffeine for increased energy expenditure and appetite control',
        'L-carnitine for improved fat metabolism',
        'Fiber supplements for increased satiety',
        'Electrolytes for hydration during increased activity'
      ],
      maintain: [
        'Multivitamin for nutritional insurance',
        'Probiotics for gut health',
        'Magnesium for muscle function and sleep quality',
        'Greens powder for additional micronutrients'
      ]
    };
    
    return [...commonSupplements, ...(goalSpecificSupplements[goal] || [])];
  }

  private generateBudgetBreakdown(weeklyBudget: number): any {
    // Allocate budget percentages
    const proteinPercentage = 0.4; // 40% for protein sources
    const producePercentage = 0.25; // 25% for fruits and vegetables
    const grainsPercentage = 0.15; // 15% for grains and starches
    const dairyPercentage = 0.1; // 10% for dairy products
    const otherPercentage = 0.1; // 10% for other items
    
    return {
      weeklyTotal: weeklyBudget,
      categories: {
        protein: Math.round(weeklyBudget * proteinPercentage),
        produce: Math.round(weeklyBudget * producePercentage),
        grains: Math.round(weeklyBudget * grainsPercentage),
        dairy: Math.round(weeklyBudget * dairyPercentage),
        other: Math.round(weeklyBudget * otherPercentage)
      },
      tips: [
        'Buy protein in bulk when on sale and freeze portions',
        'Choose seasonal produce for better prices',
        'Consider frozen vegetables as a cost-effective alternative',
        'Buy grains and legumes in bulk from wholesale stores',
        'Compare prices across different stores for the best deals',
        'Use apps to find discounts and coupons for groceries'
      ]
    };
  }

  private getFallbackNutritionPlan(request: NutritionRequest, weeklyBudget: number): NutritionResponse {
    const calories = this.calculateCalories(request);
    const macros = this.calculateMacros(calories, request.goal);
    
    const plan: NutritionResponse = {
      dailyCalories: calories,
      macros,
      mealPlan: this.generateDefaultMealPlan(calories, macros),
      tips: this.generateDefaultTips(request.goal),
      supplements: this.recommendSupplements(request.goal)
    };
    
    if (weeklyBudget > 0) {
      plan.budgetBreakdown = this.generateBudgetBreakdown(weeklyBudget);
    }
    
    return plan;
  }
}

export const nutritionAdvisorService = new NutritionAdvisorService();