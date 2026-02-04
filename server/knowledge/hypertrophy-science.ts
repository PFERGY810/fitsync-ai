export const HYPERTROPHY_SCIENCE = {
  principles: {
    mechanicalTension: {
      description:
        "Primary driver of muscle growth through force production against resistance",
      optimization: [
        "Progressive overload: gradually increase weight, reps, or sets over time",
        "Time under tension: 40-70 seconds per set optimal for hypertrophy",
        "Full range of motion to maximize muscle fiber recruitment",
        "Control the eccentric phase (2-4 seconds negative)",
        "Peak contraction holds (1-2 seconds at top of movement)",
      ],
      enhancedConsiderations: [
        "Enhanced lifters can handle higher frequencies (2-3x per muscle group weekly)",
        "Anabolic compounds increase protein synthesis window - train more frequently",
        "Recovery is accelerated - reduce rest days between same muscle groups",
      ],
    },
    metabolicStress: {
      description:
        "Accumulation of metabolites (lactate, hydrogen ions) triggering anabolic signaling",
      optimization: [
        "Higher rep ranges (12-20) with shorter rest periods",
        "Drop sets, supersets, and giant sets",
        "Blood flow restriction training (20-40% 1RM)",
        "Pump-focused techniques at end of workout",
      ],
    },
    muscleDamage: {
      description:
        "Controlled micro-tears in muscle fibers that trigger repair and growth",
      optimization: [
        "Emphasize eccentric contractions",
        "Novel exercises the muscle isn't adapted to",
        "Deep stretch positions under load",
        "Don't overdo it - excessive damage impairs recovery",
      ],
    },
  },

  volumeGuidelines: {
    natural: {
      maintenance: "10-12 sets per muscle group per week",
      growth: "12-20 sets per muscle group per week",
      maximum: "20-25 sets (diminishing returns beyond)",
      frequency: "2x per week per muscle group optimal",
    },
    enhanced: {
      maintenance: "12-16 sets per muscle group per week",
      growth: "16-30 sets per muscle group per week",
      maximum: "30-40 sets (recovery allows more volume)",
      frequency: "2-3x per week per muscle group (faster recovery)",
      notes: [
        "Testosterone increases protein synthesis capacity",
        "Trenbolone dramatically increases nutrient partitioning",
        "19-nor compounds allow higher training frequency",
        "HGH improves recovery - can train more frequently",
      ],
    },
  },

  repRanges: {
    strength: {
      reps: "1-5",
      restPeriod: "3-5 min",
      primaryAdaptation: "Neural efficiency, myofibrillar",
    },
    hypertrophy: {
      reps: "6-12",
      restPeriod: "60-90 sec",
      primaryAdaptation: "Sarcoplasmic + myofibrillar",
    },
    endurance: {
      reps: "15-25",
      restPeriod: "30-60 sec",
      primaryAdaptation: "Metabolic, capillary density",
    },
    optimal: "Mix all rep ranges across training week for complete development",
  },

  rirGuidelines: {
    description: "Reps In Reserve - proximity to failure",
    recommendations: {
      compounds: "RIR 2-3 (leave 2-3 reps in tank to avoid CNS fatigue)",
      isolations: "RIR 0-1 (safer to go to failure)",
      deloadWeek: "RIR 4-5 (reduce intensity for recovery)",
    },
    enhanced:
      "Can push closer to failure more frequently due to enhanced recovery",
  },

  periodization: {
    linear: "Gradually increase weight week to week",
    undulating: "Vary intensity/volume daily or weekly",
    block:
      "Focus on one quality (strength, hypertrophy, peaking) per mesocycle",
    autoregulated: "Adjust based on daily readiness (sleep, stress, recovery)",
  },

  recoveryFactors: {
    sleep: "7-9 hours minimum, growth hormone peaks during deep sleep",
    nutrition: "Caloric surplus for growth, adequate protein (1.6-2.2g/kg)",
    stress: "Cortisol is catabolic - manage life stress",
    deloads: "Every 4-8 weeks reduce volume/intensity by 40-60%",
  },

  muscleGrowthTimeline: {
    beginner: "0.5-1% bodyweight gain per month possible",
    intermediate: "0.25-0.5% bodyweight gain per month",
    advanced: "0.1-0.25% bodyweight gain per month",
    enhanced: "Accelerated gains depending on compounds, dosage, genetics",
  },
};

export const TRAINING_SPLITS = {
  ppl: {
    name: "Push/Pull/Legs",
    frequency: "6 days/week (each muscle 2x)",
    structure: [
      "Push (chest, shoulders, triceps)",
      "Pull (back, biceps, rear delts)",
      "Legs (quads, hams, glutes, calves)",
    ],
    bestFor: "Intermediate to advanced, those with more time",
  },
  upperLower: {
    name: "Upper/Lower",
    frequency: "4 days/week (each muscle 2x)",
    structure: ["Upper (all pushing/pulling)", "Lower (all leg work)"],
    bestFor: "Beginners to intermediate, busy schedules",
  },
  fullBody: {
    name: "Full Body",
    frequency: "3 days/week (each muscle 3x)",
    structure: ["All major muscle groups each session"],
    bestFor: "Beginners, time-limited individuals",
  },
  broSplit: {
    name: "Bro Split",
    frequency: "5-6 days/week (each muscle 1x)",
    structure: ["Chest", "Back", "Shoulders", "Arms", "Legs"],
    bestFor: "Advanced with high volume tolerance, enhanced lifters",
  },
  arnoldSplit: {
    name: "Arnold Split",
    frequency: "6 days/week",
    structure: ["Chest/Back", "Shoulders/Arms", "Legs"],
    bestFor: "Advanced, high volume tolerance",
  },
};

export const PROGRESSIVE_OVERLOAD_METHODS = [
  {
    method: "Add weight",
    description: "Increase load by smallest increment available (2.5-5lbs)",
  },
  {
    method: "Add reps",
    description: "Perform more reps with same weight within target range",
  },
  {
    method: "Add sets",
    description: "Increase total working sets (1 set per week max)",
  },
  {
    method: "Improve technique",
    description: "Better form = more tension on target muscle",
  },
  { method: "Increase ROM", description: "Deeper stretch, fuller contraction" },
  { method: "Slow tempo", description: "Increase time under tension" },
  {
    method: "Reduce rest",
    description: "Same work in less time = density increase",
  },
  {
    method: "Add frequency",
    description: "Train muscle group more often per week",
  },
];
