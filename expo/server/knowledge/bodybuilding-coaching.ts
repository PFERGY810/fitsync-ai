export const BODYBUILDING_COACHING = {
  clientAssessment: {
    initial: {
      dataPoints: [
        "Height, weight, age, sex",
        "Training experience (years)",
        "Previous physique photos",
        "Current training program",
        "Current diet and supplements",
        "Medical conditions and injuries",
        "Enhancement status (if applicable)",
        "Goals (short term and long term)",
        "Available equipment and time",
        "Sleep and stress levels",
      ],
      measurements: [
        "Weight (weekly tracking)",
        "Chest (at nipple line)",
        "Shoulders (around deltoids)",
        "Arms (flexed, at peak)",
        "Forearms (at largest point)",
        "Waist (at navel)",
        "Hips (at widest point)",
        "Thighs (at largest point)",
        "Calves (at largest point)",
      ],
      photoProtocol: {
        poses: [
          "Front relaxed",
          "Front double bicep",
          "Side chest",
          "Back double bicep",
          "Rear lat spread",
          "Legs front and back",
        ],
        lighting: "Consistent lighting for comparison",
        frequency: "Every 2-4 weeks",
      },
    },
  },

  programmingPrinciples: {
    volumeProgression: {
      concept: "Gradually increase training volume over mesocycle",
      example: [
        "Week 1: 10 sets per muscle group",
        "Week 2: 12 sets per muscle group",
        "Week 3: 14 sets per muscle group",
        "Week 4: Deload - 6-8 sets per muscle group",
      ],
    },
    exerciseSelection: {
      principles: [
        "Include exercises targeting all portions of each muscle",
        "Mix of compound and isolation",
        "Consider client's anatomy and leverages",
        "Address weak points with priority",
      ],
      weakPointProgramming: [
        "Train weak points first in session when fresh",
        "Train weak points with higher frequency",
        "Use exercises that specifically target weak area",
        "Add extra sets for lagging muscle groups",
      ],
    },
    periodization: {
      mesocycle: "4-6 weeks of progressive overload",
      macrocycle: "Multiple mesocycles working toward peak",
      offseason: "Focus on building weak points, higher calories",
      prepPhase: "Focus on conditioning, calorie deficit",
    },
  },

  nutritionGuidelines: {
    offseason: {
      calories: "TDEE + 10-20%",
      protein: "1g per lb bodyweight",
      checkIn: "Weekly weigh-ins, adjust if gaining too fast or slow",
    },
    prep: {
      timeline: "12-20 weeks typically",
      calorie_reduction: "10-15% reduction every 2-3 weeks as needed",
      protein_increase: "Up to 1.2-1.4g per lb to preserve muscle",
      refeeds: "As body fat decreases, refeeds become more important",
    },
    peakWeek: {
      warning:
        "Manipulation should be subtle - drastic changes usually backfire",
      carbs: {
        depletion: "Optional - Mon-Wed lower carbs with high volume training",
        load: "Thurs-Sat gradually increase carbs (start conservative)",
        target:
          "Find carb amount that makes muscles full without spilling over",
      },
      water: {
        early: "High water intake Mon-Thurs",
        taper: "Slight reduction Fri-Sat (don't cut completely)",
        note: "Cutting water often backfires - body holds water when dehydrated",
      },
      sodium: {
        recommendation: "Keep moderate throughout",
        warning: "Cutting sodium completely can cause watery look",
      },
    },
  },

  posing: {
    importance: "Can make or break a physique presentation",
    mandatory: {
      men: [
        "Front double bicep",
        "Front lat spread",
        "Side chest",
        "Back double bicep",
        "Rear lat spread",
        "Side tricep",
        "Abs and thigh",
        "Most muscular",
      ],
      women: ["Front pose", "Side pose", "Back pose", "Model walk"],
    },
    tips: [
      "Practice daily for at least 30 minutes",
      "Focus on transitions as much as poses",
      "Find angles that highlight strengths",
      "Control breathing - don't hold breath too long",
      "Smile naturally",
      "Record practice sessions for review",
    ],
  },

  checkInProtocol: {
    frequency: "Weekly minimum, daily during prep",
    dataPoints: [
      "Morning weight (average of last 3 days)",
      "Progress photos (same time, lighting, poses)",
      "Training performance (strength changes)",
      "Energy and mood",
      "Sleep quality",
      "Hunger levels",
      "Digestion",
      "Recovery",
    ],
    adjustments: {
      weight_stalled: [
        "First: Increase cardio slightly (10-15 min)",
        "Second: Reduce calories by 100-200",
        "Third: Add refeed if not already",
      ],
      weight_dropping_too_fast: [
        "Increase calories (especially carbs)",
        "Reduce cardio",
        "Assess recovery (may be overtraining)",
      ],
      strength_dropping: [
        "May be cutting too aggressively",
        "Ensure protein is high enough",
        "Consider refeed timing",
      ],
    },
  },

  enhancedClientConsiderations: {
    programming: [
      "Can handle higher volume and frequency",
      "Recovery is accelerated",
      "Protein synthesis window extended",
      "May train same muscle group every 48-72 hours",
    ],
    nutrition: [
      "Better nutrient partitioning (especially on Tren/HGH)",
      "Can diet more aggressively while preserving muscle",
      "Protein synthesis capacity increased",
    ],
    compound_specific: {
      testosterone: "Base of all cycles, supports recovery",
      trenbolone: "Extreme nutrient partitioning, can recomp in deficit",
      masteron: "Hardening, anti-estrogenic, good for contest prep",
      winstrol: "Dry, hard look, often used last 4-6 weeks of prep",
      hgh: "Long-term body composition improvement, fat loss, recovery",
      insulin: "Shuttles nutrients post-workout, very dangerous if misused",
    },
    healthMonitoring: [
      "Regular bloodwork (every 3-6 months on cycle)",
      "Monitor: Liver enzymes, lipids, hematocrit, hormones",
      "Manage estrogen with AI as needed",
      "Manage prolactin on 19-nors",
      "Monitor blood pressure",
      "Consider cardio for heart health",
    ],
  },
};

export const SHOW_PREP_TIMELINE = {
  weeks20to16: {
    phase: "Assessment and Setup",
    training: "Full volume, address weak points",
    nutrition: "Establish baseline, slight deficit (300-500 cal)",
    cardio: "2-3 sessions weekly, 20-30 min",
    focus: "Dial in habits, establish tracking",
  },
  weeks16to12: {
    phase: "Steady Fat Loss",
    training: "Maintain or slight volume reduction",
    nutrition: "Adjust deficit as needed, refeeds weekly",
    cardio: "3-4 sessions, 30 min",
    focus: "Consistent progress, don't rush",
  },
  weeks12to8: {
    phase: "Aggressive Push",
    training: "Intensity high, volume may decrease",
    nutrition: "Deficit increases, protein stays high",
    cardio: "4-5 sessions, 30-45 min",
    focus: "Push through plateau, stay mentally strong",
  },
  weeks8to4: {
    phase: "Fine Tuning",
    training: "Maintain intensity, reduce volume if recovery suffers",
    nutrition: "Continue adjusting, multiple refeeds if lean",
    cardio: "As needed based on progress",
    focus: "Posing practice increases, tanning starts",
  },
  weeks4to1: {
    phase: "Peak Prep",
    training: "Deload week before show",
    nutrition: "Test peak week protocol 3 weeks out",
    cardio: "Reduce to allow muscles to fill",
    focus: "Don't try anything new, stick to what works",
  },
  peakWeek: {
    Monday: "High volume depletion workout, low carbs",
    Tuesday: "High volume depletion workout, low carbs",
    Wednesday: "Light pump workout, low carbs",
    Thursday: "Rest, begin carb load (conservative)",
    Friday: "Continue load, pump workout, reduce water slightly",
    Saturday:
      "Light pumping morning of show, carbs and sugar as needed for fullness",
  },
};

export const WEAK_POINT_PRIORITIZATION = {
  assessment: {
    method: "Compare physique to ideal proportions and competition standards",
    common_issues: {
      upper_body: [
        "Narrow shoulders",
        "Small arms",
        "Underdeveloped chest",
        "Weak back width",
      ],
      lower_body: [
        "Lagging quads",
        "Small hamstrings",
        "Underdeveloped glutes",
        "Small calves",
      ],
      symmetry: ["Imbalanced sides", "Uneven development"],
      proportions: ["Wide waist", "Narrow clavicles", "Short muscle bellies"],
    },
  },
  strategies: {
    frequency: "Train weak points 2-3x per week",
    priority: "Train weak points first in session when fresh",
    volume: "Add 2-4 extra sets per week for lagging parts",
    exercise_selection: "Choose exercises that target weak areas specifically",
    technique: "Focus on mind-muscle connection with weak parts",
  },
  examples: {
    weak_shoulders: [
      "Train delts 3x per week",
      "Add lateral raises daily (high frequency)",
      "Front delts likely overdeveloped - reduce pressing, add lateral work",
    ],
    weak_back: [
      "Train back 2-3x per week",
      "Prioritize width (pulldowns, pull-ups) or thickness (rows) based on need",
      "Add rack pulls or shrugs for traps if needed",
    ],
    weak_arms: [
      "Add arm day or extra arm work to existing days",
      "Train biceps and triceps 3x per week",
      "Focus on long head of triceps for overall arm size",
    ],
    weak_legs: [
      "Train legs 2x per week minimum",
      "Prioritize quad or hamstring work based on need",
      "Add drop sets and higher rep work for calves",
    ],
  },
};
