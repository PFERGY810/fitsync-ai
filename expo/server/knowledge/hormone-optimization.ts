export const ANDROGEN_RECEPTOR_OPTIMIZATION = {
  description:
    "Strategies to maximize androgen receptor sensitivity and density for enhanced response to androgens",

  receptorBasics: {
    whatIsAR:
      "Androgen receptors are nuclear receptors that bind testosterone and DHT to initiate anabolic signaling",
    locations: "Found in muscle, bone, fat, brain, and other tissues",
    mechanism:
      "Ligand binding → receptor activation → DNA transcription → protein synthesis",
  },

  maximizingSensitivity: {
    training: {
      resistance: [
        "Heavy compound movements upregulate AR in trained muscles",
        "Training a muscle increases AR density in that muscle",
        "Frequency matters - train each muscle 2-3x weekly for consistent AR elevation",
        "High volume training may temporarily downregulate AR - use deload weeks",
      ],
      hiit: "High intensity intervals boost AR expression acutely",
    },

    nutrition: {
      carbohydrates: [
        "Adequate carbs prevent cortisol-mediated AR downregulation",
        "Low carb diets can reduce AR expression over time",
        "Cycle carbs around training for optimal AR activity",
      ],
      fats: [
        "Dietary fat is essential for hormone production",
        "30-40% of calories from fat optimal",
        "Saturated fat supports testosterone production",
        "Omega-3s reduce inflammation that can impair AR signaling",
      ],
      protein: [
        "Adequate protein prevents muscle catabolism",
        "Leucine spikes protein synthesis through mTOR pathway",
        "1.6-2.2g/kg bodyweight optimal",
      ],
    },

    supplements: {
      carnitine: {
        dose: "2-3g L-carnitine L-tartrate daily",
        mechanism: "Increases AR density in muscle tissue",
        timing: "With high-carb meal for insulin-mediated uptake",
        research: "Studies show 15-20% increase in AR content",
      },
      creatine: {
        dose: "5g daily",
        mechanism: "May enhance DHT conversion, supports cellular energy",
        note: "Consistent use more important than loading",
      },
      vitaminD: {
        dose: "3000-5000 IU daily",
        mechanism: "Functions as hormone, supports testosterone production",
        target: "Blood levels 50-70 ng/mL optimal",
      },
      zinc: {
        dose: "25-45mg daily",
        mechanism: "Essential for testosterone synthesis, aromatase inhibition",
        note: "Don't exceed 50mg - can impair copper absorption",
      },
      magnesium: {
        dose: "400-500mg daily",
        mechanism: "Frees testosterone from SHBG, supports sleep",
        forms: "Glycinate or citrate best absorbed",
      },
      ashwagandha: {
        dose: "300-600mg KSM-66 extract",
        mechanism: "Reduces cortisol, may increase testosterone 10-15%",
        timing: "Morning and evening",
      },
    },

    lifestyle: {
      sleep: [
        "7-9 hours critical - testosterone produced during deep sleep",
        "Sleep deprivation can drop testosterone 10-15% in one week",
        "Consistent sleep schedule optimizes circadian hormone release",
      ],
      stress: [
        "Chronic stress elevates cortisol which competes with testosterone",
        "Cortisol directly downregulates androgen receptors",
        "Meditation, walking, breathing exercises reduce cortisol",
      ],
      alcohol: [
        "Alcohol acutely suppresses testosterone",
        "Chronic use can permanently impair Leydig cells",
        "Limit to 1-2 drinks occasionally, avoid binge drinking",
      ],
      bodyfat: [
        "Higher body fat = more aromatase activity = more estrogen",
        "Sweet spot is 10-15% body fat for most men",
        "Too lean (<8%) can impair testosterone production",
      ],
    },

    cyclicStrategies: {
      arCycling: {
        concept:
          "Periodically reducing androgen exposure to resensitize receptors",
        protocol: "Some advanced users cruise at TRT doses between blasts",
        duration: "Time on = time off (or longer) for receptor recovery",
      },
      compoundRotation: {
        concept: "Different androgens may bind AR slightly differently",
        strategy: "Rotate compounds between cycles",
        example: "Test/Deca cycle → Test/Primo cycle → Test/EQ cycle",
      },
    },
  },

  enhancedUserConsiderations: [
    "Supraphysiological doses eventually downregulate AR regardless of optimization",
    "Receptor saturation occurs - more drugs doesn't always mean more gains",
    "Time off allows AR upregulation - cruise periods are important",
    "L-carnitine especially useful during cruise/PCT to maintain AR density",
  ],
};

export const INSULIN_SENSITIVITY_OPTIMIZATION = {
  description:
    "Maximizing insulin sensitivity for better nutrient partitioning and testosterone synergy",

  whyItMatters: {
    muscleBuilding: [
      "Insulin shuttles amino acids and glucose into muscle cells",
      "High sensitivity = nutrients go to muscle instead of fat",
      "Better pumps and muscle fullness",
      "Enhanced recovery between sessions",
    ],
    hormoneInteraction: [
      "Insulin and testosterone work synergistically for protein synthesis",
      "Insulin resistance impairs testosterone production",
      "HGH can cause insulin resistance - need to manage",
      "Better insulin sensitivity = more effective steroid response",
    ],
  },

  strategies: {
    training: {
      resistance: [
        "Strength training dramatically improves insulin sensitivity",
        "GLUT4 transporter density increases with training",
        "Post-workout window: muscles are insulin sensitive for 2-4 hours",
        "Train before largest meal of the day",
      ],
      cardio: [
        "Low intensity steady state (LISS) improves basal insulin sensitivity",
        "20-30 min walking daily has significant impact",
        "HIIT provides acute sensitivity boost for 24-48 hours",
        "Fasted cardio can enhance fat oxidation but may impair muscle retention",
      ],
    },

    nutrition: {
      mealTiming: [
        "Largest meals around training (pre and post workout)",
        "Carb-backload: earn carbs through training",
        "Front-load protein and fats earlier in day",
        "Keep evening meals lower carb if not training",
      ],
      carbCycling: {
        highDays: "Training days - 2-4g/kg carbs around workout",
        lowDays: "Rest days - 1-2g/kg carbs, emphasize protein and fats",
        noDays: "Optional: very low carb days for insulin reset",
      },
      foodChoices: [
        "Prioritize low glycemic carbs (oats, sweet potato, rice)",
        "High fiber intake slows glucose absorption",
        "Vinegar with meals can reduce glucose spike",
        "Pair carbs with protein and fats to slow digestion",
      ],
    },

    supplements: {
      berberine: {
        dose: "500mg 2-3x daily with meals",
        mechanism: "AMPK activation - similar to metformin",
        effect: "Can reduce fasting glucose 15-20%",
        note: "Don't combine with metformin without medical supervision",
      },
      chromium: {
        dose: "200-1000mcg daily",
        mechanism: "Enhances insulin receptor sensitivity",
        form: "Chromium picolinate or polynicotinate",
      },
      alphaLipoicAcid: {
        dose: "300-600mg with carb-heavy meals",
        mechanism: "Antioxidant that mimics some insulin effects",
        note: "R-ALA form most bioavailable",
      },
      cinnamon: {
        dose: "1-6g daily or Ceylon cinnamon extract",
        mechanism: "Improves glucose uptake",
        note: "Use Ceylon, not Cassia (liver toxic)",
      },
      glycerol: {
        dose: "10-20ml with pre-workout meal",
        mechanism: "Hyperhydration, may enhance glucose uptake",
        effect: "Better pumps, hydration",
      },
      fish_oil: {
        dose: "3-5g EPA/DHA daily",
        mechanism: "Reduces inflammation, improves membrane fluidity",
        effect: "Enhanced insulin receptor function",
      },
    },

    lifestyle: {
      sleep: [
        "Sleep deprivation rapidly causes insulin resistance",
        "One night of poor sleep can reduce sensitivity 25-30%",
        "Prioritize 7-9 hours consistently",
      ],
      coldExposure: [
        "Cold showers/ice baths activate brown adipose tissue",
        "Brown fat improves glucose disposal",
        "2-3 minutes cold exposure post-workout",
      ],
      walking: [
        "10-15 minute walk after meals lowers glucose significantly",
        "Simple habit with major impact",
        "Aim for 10k steps daily",
      ],
    },

    hghInsulinManagement: {
      problem: "HGH at higher doses (4+ IU) causes insulin resistance",
      solutions: [
        "Keep HGH dose moderate (2-4 IU) when prioritizing insulin sensitivity",
        "Use metformin or berberine to counteract",
        "Time HGH away from carb-heavy meals",
        "Consider fasted AM HGH dosing for fat loss protocols",
        "Monitor fasting glucose and HbA1c regularly",
      ],
    },
  },

  onCycleConsiderations: {
    testosteroneEffect: "Testosterone generally improves insulin sensitivity",
    trenboloneEffect: "Trenbolone can cause insulin resistance - monitor carbs",
    hghEffect: "High dose HGH requires insulin management strategies",
    insulinUse:
      "Exogenous insulin is extremely dangerous but powerful - only for advanced users with medical knowledge",
  },
};

export const SHBG_MANIPULATION = {
  description:
    "Sex Hormone Binding Globulin - binds testosterone making it unavailable for use",

  basics: {
    whatIsSHBG: "Protein produced by liver that binds sex hormones",
    problem: "Bound testosterone cannot enter cells or exert anabolic effects",
    goal: "Lower SHBG (within reason) to increase free testosterone percentage",
    normalRange: "10-50 nmol/L (lower is generally better for bodybuilding)",
  },

  factorsThatIncreaseSHBG: {
    diet: ["Very low calorie diets", "Excessive fiber", "Low carb long-term"],
    hormones: [
      "Estrogen (why women have higher SHBG)",
      "Thyroid hormone (hyperthyroidism)",
    ],
    age: "SHBG increases with age naturally",
    medications: ["Some antidepressants", "Certain blood pressure meds"],
    conditions: ["Liver disease", "Hyperthyroidism"],
  },

  factorsThatDecreaseSHBG: {
    diet: [
      "Adequate caloric intake",
      "Moderate protein (not excessive)",
      "Healthy fats, especially saturated",
    ],
    hormones: [
      "Testosterone itself (negative feedback)",
      "DHT strongly lowers SHBG",
      "Insulin lowers SHBG (why diabetics often have low SHBG)",
      "Growth hormone",
    ],
    supplements: {
      boron: {
        dose: "6-10mg daily",
        mechanism: "Can reduce SHBG 10-20% within 1-2 weeks",
        research: "One of few supplements with solid evidence",
      },
      magnesium: {
        dose: "400-500mg daily",
        mechanism: "Helps free testosterone from SHBG",
        note: "Most people are deficient anyway",
      },
      vitaminD: {
        dose: "3000-5000 IU daily",
        mechanism: "Inversely correlated with SHBG levels",
        target: "Blood levels 50-70 ng/mL",
      },
      stingingNettle: {
        dose: "300-600mg root extract",
        mechanism: "Lignans may compete with testosterone for SHBG binding",
        note: "Mixed research results",
      },
    },
    medications: {
      proviron: {
        chemical: "Mesterolone",
        dose: "25-50mg daily",
        mechanism: "Binds strongly to SHBG, freeing testosterone",
        note: "Also DHT derivative with hardening effects",
      },
      danazol: {
        mechanism: "Suppresses SHBG production",
        note: "Prescription only, used for endometriosis",
      },
    },
  },

  enhancedUserStrategies: {
    aas: [
      "Most AAS naturally lower SHBG",
      "DHT derivatives (Masteron, Proviron, Winstrol) are most effective",
      "Running DHT derivative alongside testosterone maximizes free T",
    ],
    proviron: {
      use: "25-50mg daily acts as SHBG sponge",
      benefit: "More free testosterone from same dose",
      synergy: "Stack with testosterone for enhanced effect",
    },
    monitoring: [
      "Get bloodwork including free testosterone AND SHBG",
      "Calculate free T percentage (should be 2-3% of total)",
      "Very low SHBG (<10) can cause issues with stable blood levels",
    ],
  },

  warnings: [
    "Extremely low SHBG is not desirable - causes hormone fluctuations",
    "SHBG provides reservoir effect for testosterone",
    "Target 15-30 nmol/L for optimal balance",
    "Always interpret with free testosterone measurement",
  ],
};
