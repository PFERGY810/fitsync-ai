export const NUTRITION_SCIENCE = {
  macronutrients: {
    protein: {
      function: "Primary building block for muscle tissue, enzymes, hormones",
      dailyRequirements: {
        sedentary: "0.8g/kg bodyweight",
        active: "1.2-1.6g/kg bodyweight",
        bodybuilding: "1.6-2.2g/kg bodyweight",
        enhanced:
          "2.0-2.5g/kg bodyweight (increased protein synthesis capacity)",
        cutting: "2.2-2.8g/kg bodyweight (muscle preservation priority)",
      },
      sources: {
        complete: ["Chicken", "Beef", "Fish", "Eggs", "Dairy", "Whey"],
        incomplete: [
          "Legumes",
          "Nuts",
          "Grains - combine for complete amino profile",
        ],
      },
      timing: {
        general: "Spread across 4-6 meals for optimal MPS stimulation",
        perMeal: "25-40g per meal to maximize muscle protein synthesis",
        postWorkout: "40-50g within 2 hours of training",
        beforeBed:
          "Casein or slow-digesting protein for overnight amino acid supply",
      },
      leucineThreshold:
        "2.5-3g leucine per meal triggers MPS - whey and eggs are high",
    },

    carbohydrates: {
      function:
        "Primary energy source, glycogen replenishment, protein sparing",
      types: {
        complex: {
          examples: ["Oats", "Rice", "Sweet potato", "Quinoa", "Whole grains"],
          timing: "Most meals, especially around training",
        },
        simple: {
          examples: ["Fruit", "Dextrose", "Honey", "White rice"],
          timing: "Intra/post workout for rapid glycogen replenishment",
        },
        fiber: {
          target: "25-40g daily",
          sources: ["Vegetables", "Oats", "Legumes", "Psyllium"],
          benefits: "Gut health, satiety, glucose control",
        },
      },
      requirements: {
        lowActivity: "2-3g/kg bodyweight",
        moderate: "3-5g/kg bodyweight",
        highActivity: "5-7g/kg bodyweight",
        bulking: "4-6g/kg bodyweight",
        cutting: "1.5-3g/kg bodyweight (carb cycling beneficial)",
      },
      timing: {
        preworkout: "30-50g complex carbs 1-2 hours before",
        intraworkout: "20-40g fast carbs for sessions >60min",
        postworkout: "50-100g for glycogen replenishment",
      },
    },

    fats: {
      function:
        "Hormone production, cell membrane integrity, vitamin absorption",
      types: {
        saturated: {
          sources: ["Beef", "Dairy", "Coconut oil", "Eggs"],
          importance: "Essential for testosterone production",
          target: "10-15% of total calories",
        },
        monounsaturated: {
          sources: ["Olive oil", "Avocado", "Nuts", "Beef"],
          benefits: "Heart health, anti-inflammatory",
        },
        polyunsaturated: {
          omega3: {
            sources: ["Fatty fish", "Fish oil", "Flax", "Walnuts"],
            benefits: "Anti-inflammatory, brain health, joint health",
            target: "3-5g EPA/DHA daily",
          },
          omega6: {
            sources: ["Vegetable oils", "Nuts", "Seeds"],
            note: "Most get too much - balance with omega-3",
          },
        },
        trans: {
          sources: ["Processed foods", "Partially hydrogenated oils"],
          recommendation: "AVOID completely",
        },
      },
      requirements: {
        minimum: "20% of calories (hormone production)",
        optimal: "25-35% of calories",
        lowFat: "Can impair testosterone - don't go below 0.5g/kg",
      },
    },
  },

  caloricTargets: {
    tdeeCalculation: {
      bmr: {
        mifflinStJeor: {
          male: "10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5",
          female: "10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161",
        },
      },
      activityMultipliers: {
        sedentary: 1.2,
        lightlyActive: 1.375,
        moderatelyActive: 1.55,
        veryActive: 1.725,
        extremelyActive: 1.9,
      },
    },
    goals: {
      bulking: {
        surplus: "300-500 calories above TDEE",
        enhanced:
          "500-1000 calories (can utilize more due to enhanced partitioning)",
        rate: "0.5-1lb per week natural, 1-2lb enhanced",
      },
      cutting: {
        deficit: "300-500 calories below TDEE",
        aggressive: "750-1000 calories (risk of muscle loss)",
        rate: "0.5-1% bodyweight per week",
        enhanced: "Can preserve more muscle in larger deficit",
      },
      recomposition: {
        calories: "Maintenance or slight deficit",
        emphasis: "High protein, proper training",
        bestFor: "Beginners, enhanced users, returning after break",
      },
    },
  },

  mealTiming: {
    frequency: "4-6 meals optimal for MPS stimulation",
    preworkout: {
      timing: "1-3 hours before training",
      composition:
        "Moderate protein (25-40g), moderate carbs (30-50g), low fat",
    },
    postworkout: {
      timing: "Within 2 hours (anabolic window is larger than thought)",
      composition:
        "High protein (40-50g), high carbs (50-100g), low fat for faster digestion",
    },
    beforeBed: {
      importance: "Longest fasting period of day",
      recommendation:
        "Casein protein or cottage cheese for slow amino acid release",
    },
  },

  supplements: {
    essential: {
      wheyProtein: {
        dose: "25-50g post-workout or as needed to hit protein goals",
        type: "Isolate for lean, concentrate for budget",
      },
      creatine: {
        dose: "5g daily (no loading needed)",
        benefits: [
          "Strength",
          "Power",
          "Muscle fullness",
          "Cognitive benefits",
        ],
      },
      vitaminD: {
        dose: "3000-5000 IU daily",
        benefits: "Hormone support, immune function, bone health",
      },
      omega3: {
        dose: "3-5g EPA/DHA daily",
        benefits: "Anti-inflammatory, heart, brain, joint health",
      },
    },
    beneficial: {
      caffeine: {
        dose: "200-400mg pre-workout",
        benefits: "Energy, focus, strength, fat oxidation",
      },
      citrulline: {
        dose: "6-8g pre-workout",
        benefits: "Blood flow, pumps, endurance",
      },
      betaAlanine: {
        dose: "3-5g daily",
        benefits: "Muscular endurance, buffers lactic acid",
      },
    },
  },

  hydration: {
    baseline: "0.5-1oz per pound bodyweight",
    training: "Add 16-32oz per hour of intense training",
    signs_of_dehydration: [
      "Dark urine",
      "Thirst",
      "Fatigue",
      "Decreased performance",
    ],
    electrolytes: "Add sodium, potassium, magnesium if sweating heavily",
  },
};

export const BODYBUILDING_NUTRITION = {
  bulkingPhase: {
    calories: "TDEE + 300-500 (natural), TDEE + 500-1000 (enhanced)",
    macros: {
      protein: "1g per lb bodyweight",
      fat: "0.4-0.5g per lb bodyweight",
      carbs: "Fill remaining calories",
    },
    focus: [
      "Caloric surplus is priority #1",
      "Train hard to give muscles reason to grow",
      "Accept some fat gain (minimize with lean bulk)",
      "Enhanced users partition better - can bulk more aggressively",
    ],
    enhancedConsiderations: [
      "Trenbolone allows recomp - minimal fat gain in surplus",
      "Insulin dramatically increases nutrient uptake",
      "HGH improves partitioning long-term",
    ],
  },

  cuttingPhase: {
    calories: "TDEE - 300-500 (conservative), TDEE - 750-1000 (aggressive)",
    macros: {
      protein: "1.2-1.4g per lb bodyweight (increased to preserve muscle)",
      fat: "0.3-0.4g per lb bodyweight (minimum for hormones)",
      carbs: "Fill remaining (lowest macro but don't eliminate)",
    },
    focus: [
      "Preserve muscle mass",
      "High protein is non-negotiable",
      "Training intensity stays high, volume may decrease",
      "Cardio increases as diet progresses",
    ],
    enhancedCutting: [
      "Anabolics allow larger deficit while preserving muscle",
      "Trenbolone is king for cutting - partitioning effect",
      "Masteron/Winstrol for final hardening",
      "HGH for stubborn fat and muscle preservation",
    ],
  },

  contestPrep: {
    timeline: "12-20 weeks depending on starting condition",
    phases: {
      early: {
        weeks: "12-8 weeks out",
        deficit: "Moderate (500-750 cal)",
        cardio: "3-4 sessions weekly",
        focus: "Steady fat loss, maintain fullness",
      },
      mid: {
        weeks: "8-4 weeks out",
        deficit: "Aggressive (750-1000 cal)",
        cardio: "5-6 sessions weekly",
        focus: "Push through plateau, refeed weekly",
      },
      late: {
        weeks: "4-1 weeks out",
        deficit: "Variable based on condition",
        cardio: "As needed (some reduce to prevent flat look)",
        focus: "Fine tuning, depleting, loading",
      },
      peakWeek: {
        carbs: "Deplete Mon-Wed, load Thu-Sat",
        water: "High early week, reduce/cut before show",
        sodium: "Moderate throughout (cutting sodium backfires)",
      },
    },
  },

  refeedStrategies: {
    purpose: "Restore glycogen, boost leptin, mental break",
    frequency: {
      highBodFat: "Every 2 weeks",
      moderateBodFat: "Weekly",
      lowBodFat: "2x weekly or more",
    },
    execution: {
      calories: "Maintenance or slight surplus",
      macros: "High carbs (3-4x normal), moderate protein, low fat",
      duration: "1 day typically, 2 days if very lean",
    },
  },
};

export const GROCERY_CATEGORIES = {
  proteins: {
    lean: [
      {
        item: "Chicken breast",
        servingSize: "6oz",
        protein: 45,
        carbs: 0,
        fat: 3,
        cost: "budget",
      },
      {
        item: "Turkey breast",
        servingSize: "6oz",
        protein: 40,
        carbs: 0,
        fat: 2,
        cost: "budget",
      },
      {
        item: "Tilapia",
        servingSize: "6oz",
        protein: 42,
        carbs: 0,
        fat: 4,
        cost: "budget",
      },
      {
        item: "Egg whites",
        servingSize: "1 cup",
        protein: 26,
        carbs: 2,
        fat: 0,
        cost: "budget",
      },
      {
        item: "Shrimp",
        servingSize: "6oz",
        protein: 36,
        carbs: 0,
        fat: 2,
        cost: "moderate",
      },
      {
        item: "Cod",
        servingSize: "6oz",
        protein: 40,
        carbs: 0,
        fat: 2,
        cost: "moderate",
      },
    ],
    fattier: [
      {
        item: "Salmon",
        servingSize: "6oz",
        protein: 40,
        carbs: 0,
        fat: 18,
        cost: "premium",
      },
      {
        item: "Ground beef 85%",
        servingSize: "6oz",
        protein: 38,
        carbs: 0,
        fat: 24,
        cost: "moderate",
      },
      {
        item: "Whole eggs",
        servingSize: "3 large",
        protein: 18,
        carbs: 0,
        fat: 15,
        cost: "budget",
      },
      {
        item: "Steak",
        servingSize: "6oz",
        protein: 42,
        carbs: 0,
        fat: 20,
        cost: "premium",
      },
      {
        item: "Pork chops",
        servingSize: "6oz",
        protein: 36,
        carbs: 0,
        fat: 12,
        cost: "moderate",
      },
    ],
    dairy: [
      {
        item: "Greek yogurt 0%",
        servingSize: "1 cup",
        protein: 23,
        carbs: 9,
        fat: 0,
        cost: "moderate",
      },
      {
        item: "Cottage cheese 2%",
        servingSize: "1 cup",
        protein: 28,
        carbs: 6,
        fat: 5,
        cost: "budget",
      },
      {
        item: "Whey protein",
        servingSize: "1 scoop",
        protein: 25,
        carbs: 3,
        fat: 1,
        cost: "moderate",
      },
    ],
  },
  carbohydrates: {
    complex: [
      {
        item: "Rice (white)",
        servingSize: "1 cup cooked",
        protein: 4,
        carbs: 45,
        fat: 0,
        cost: "budget",
      },
      {
        item: "Rice (brown)",
        servingSize: "1 cup cooked",
        protein: 5,
        carbs: 45,
        fat: 2,
        cost: "budget",
      },
      {
        item: "Oats",
        servingSize: "1 cup dry",
        protein: 10,
        carbs: 54,
        fat: 6,
        cost: "budget",
      },
      {
        item: "Sweet potato",
        servingSize: "1 medium",
        protein: 2,
        carbs: 26,
        fat: 0,
        cost: "budget",
      },
      {
        item: "Quinoa",
        servingSize: "1 cup cooked",
        protein: 8,
        carbs: 39,
        fat: 4,
        cost: "moderate",
      },
      {
        item: "Pasta",
        servingSize: "2oz dry",
        protein: 7,
        carbs: 43,
        fat: 1,
        cost: "budget",
      },
      {
        item: "Bread (whole wheat)",
        servingSize: "2 slices",
        protein: 8,
        carbs: 24,
        fat: 2,
        cost: "budget",
      },
    ],
    fruits: [
      {
        item: "Banana",
        servingSize: "1 medium",
        protein: 1,
        carbs: 27,
        fat: 0,
        cost: "budget",
      },
      {
        item: "Apple",
        servingSize: "1 medium",
        protein: 0,
        carbs: 25,
        fat: 0,
        cost: "budget",
      },
      {
        item: "Berries",
        servingSize: "1 cup",
        protein: 1,
        carbs: 15,
        fat: 0,
        cost: "moderate",
      },
      {
        item: "Orange",
        servingSize: "1 medium",
        protein: 1,
        carbs: 15,
        fat: 0,
        cost: "budget",
      },
    ],
    vegetables: [
      {
        item: "Broccoli",
        servingSize: "1 cup",
        protein: 3,
        carbs: 6,
        fat: 0,
        cost: "budget",
      },
      {
        item: "Spinach",
        servingSize: "2 cups",
        protein: 2,
        carbs: 2,
        fat: 0,
        cost: "budget",
      },
      {
        item: "Asparagus",
        servingSize: "1 cup",
        protein: 3,
        carbs: 5,
        fat: 0,
        cost: "moderate",
      },
      {
        item: "Green beans",
        servingSize: "1 cup",
        protein: 2,
        carbs: 7,
        fat: 0,
        cost: "budget",
      },
    ],
  },
  fats: {
    oils: [
      {
        item: "Olive oil",
        servingSize: "1 tbsp",
        protein: 0,
        carbs: 0,
        fat: 14,
        cost: "moderate",
      },
      {
        item: "Coconut oil",
        servingSize: "1 tbsp",
        protein: 0,
        carbs: 0,
        fat: 14,
        cost: "moderate",
      },
    ],
    whole: [
      {
        item: "Avocado",
        servingSize: "1/2",
        protein: 1,
        carbs: 6,
        fat: 15,
        cost: "moderate",
      },
      {
        item: "Almonds",
        servingSize: "1oz",
        protein: 6,
        carbs: 6,
        fat: 14,
        cost: "moderate",
      },
      {
        item: "Peanut butter",
        servingSize: "2 tbsp",
        protein: 8,
        carbs: 6,
        fat: 16,
        cost: "budget",
      },
      {
        item: "Walnuts",
        servingSize: "1oz",
        protein: 4,
        carbs: 4,
        fat: 18,
        cost: "moderate",
      },
    ],
  },
  beverages: [
    { item: "Water", importance: "Essential", daily: "1 gallon minimum" },
    { item: "Diet soda", notes: "Zero calorie option for cravings" },
    { item: "Coffee", notes: "Pre-workout, metabolism boost" },
    { item: "Green tea", notes: "Antioxidants, slight metabolism boost" },
    {
      item: "Electrolyte drinks",
      notes: "Training days, low/zero sugar versions",
    },
  ],
};
