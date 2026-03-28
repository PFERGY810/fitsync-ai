export const STEROID_PHARMACOLOGY = {
  classes: {
    testosterone: {
      description: "Base of all cycles, primary male androgen",
      esters: {
        propionate: {
          halfLife: "0.8 days",
          frequency: "Every other day",
          kickIn: "1-2 weeks",
        },
        enanthate: {
          halfLife: "4.5 days",
          frequency: "2x weekly",
          kickIn: "4-6 weeks",
        },
        cypionate: {
          halfLife: "5 days",
          frequency: "2x weekly",
          kickIn: "4-6 weeks",
        },
        undecanoate: {
          halfLife: "16.5 days",
          frequency: "Every 10-14 days",
          kickIn: "6-8 weeks",
        },
        suspension: {
          halfLife: "0.5 days",
          frequency: "Daily or pre-workout",
          kickIn: "Immediate",
        },
      },
      effects: [
        "Increased protein synthesis",
        "Enhanced nitrogen retention",
        "Increased IGF-1 production",
        "Enhanced recovery",
        "Increased red blood cell production",
      ],
      sideEffects: [
        "Aromatization to estrogen",
        "DHT conversion",
        "Suppression of natural production",
      ],
      typicalDose: {
        trt: "100-200mg/week",
        blast: "300-500mg/week",
        advanced: "500-1000mg/week",
      },
    },

    nandrolone: {
      compounds: {
        decanoate: {
          tradeName: "Deca Durabolin",
          halfLife: "6-12 days",
          frequency: "Weekly",
        },
        phenylpropionate: {
          tradeName: "NPP",
          halfLife: "2.7 days",
          frequency: "Every other day",
        },
      },
      effects: [
        "Exceptional muscle building",
        "Joint lubrication (synovial fluid)",
        "Collagen synthesis",
        "Very anabolic, moderately androgenic",
      ],
      sideEffects: [
        "Prolactin increase",
        "Progesterone activity",
        "Deca dick",
        "Long detection time",
      ],
      notes: "Always run with testosterone base",
    },

    trenbolone: {
      esters: {
        acetate: {
          halfLife: "1 day",
          frequency: "Daily or EOD",
          kickIn: "1-2 weeks",
        },
        enanthate: {
          halfLife: "5-7 days",
          frequency: "2x weekly",
          kickIn: "3-4 weeks",
        },
        hexahydrobenzylcarbonate: {
          tradeName: "Parabolan",
          halfLife: "14 days",
          frequency: "Weekly",
        },
      },
      effects: [
        "5x more anabolic than testosterone",
        "Extreme nutrient partitioning",
        "Does not aromatize",
        "Dramatic strength increases",
        "Fat loss while building muscle",
      ],
      sideEffects: [
        "Insomnia (tren cough)",
        "Night sweats",
        "Increased aggression",
        "Cardiovascular strain",
        "Prolactin issues",
        "Suppresses thyroid",
      ],
      notes: "Most powerful compound, not for beginners",
    },

    boldenone: {
      tradeName: "Equipoise",
      halfLife: "14 days",
      effects: [
        "Lean muscle gains",
        "Increased appetite",
        "Enhanced vascularity",
        "Increased RBC (like EPO effect)",
      ],
      sideEffects: [
        "Anxiety in some users",
        "Increased hematocrit",
        "Slow acting",
      ],
      typicalDose: "400-800mg/week",
    },

    drostanolone: {
      tradeName: "Masteron",
      esters: {
        propionate: { halfLife: "2.5 days", frequency: "EOD" },
        enanthate: { halfLife: "5 days", frequency: "2x weekly" },
      },
      effects: [
        "Hardening effect",
        "Anti-estrogenic properties",
        "Strength without weight gain",
        "Contest prep staple",
      ],
      sideEffects: ["Hair loss acceleration", "Only shines at low body fat"],
      notes: "DHT derivative, best when lean",
    },

    methenolone: {
      tradeName: "Primobolan",
      forms: {
        enanthate: { route: "Injectable", halfLife: "10.5 days" },
        acetate: { route: "Oral", halfLife: "5-6 hours" },
      },
      effects: [
        "Mild but quality gains",
        "Good for cutting",
        "Low side effect profile",
        "No aromatization",
      ],
      notes: "Expensive, often faked, Arnold's favorite",
    },
  },

  orals: {
    dianabol: {
      chemicalName: "Methandrostenolone",
      halfLife: "3-6 hours",
      effects: ["Rapid mass gain", "Strength increase", "Water retention"],
      sideEffects: ["Liver toxic", "Estrogenic", "Water retention"],
      typicalDose: "20-50mg/day",
      duration: "4-6 weeks max",
    },
    anadrol: {
      chemicalName: "Oxymetholone",
      halfLife: "8-9 hours",
      effects: ["Extreme mass and strength", "Up to 30lbs in 6 weeks possible"],
      sideEffects: ["Very liver toxic", "Appetite suppression", "Headaches"],
      typicalDose: "50-100mg/day",
      duration: "4-6 weeks max",
    },
    anavar: {
      chemicalName: "Oxandrolone",
      halfLife: "9 hours",
      effects: ["Lean gains", "Strength without bulk", "Fat loss", "Mild"],
      sideEffects: ["Lipid damage", "Some liver stress", "Suppressive"],
      typicalDose: "40-80mg/day (men), 10-20mg/day (women)",
      notes: "One of few compounds women can use",
    },
    winstrol: {
      chemicalName: "Stanozolol",
      halfLife: "9 hours",
      effects: ["Dry, hard look", "Strength", "Vascularity"],
      sideEffects: ["Joint pain (dries joints)", "Liver toxic", "Hair loss"],
      typicalDose: "25-50mg/day",
    },
    turinabol: {
      chemicalName: "Chlorodehydromethyltestosterone",
      halfLife: "16 hours",
      effects: ["Slow, quality gains", "No water retention", "Low sides"],
      sideEffects: ["Liver stress", "Lipid impact"],
      typicalDose: "40-60mg/day",
    },
  },

  ancillaries: {
    aromataseInhibitors: {
      anastrozole: {
        tradeName: "Arimidex",
        dose: "0.5mg EOD or as needed",
        mechanism: "Competitive AI",
      },
      exemestane: {
        tradeName: "Aromasin",
        dose: "12.5-25mg EOD",
        mechanism: "Suicidal AI",
      },
      letrozole: {
        tradeName: "Femara",
        dose: "0.5-2.5mg/day",
        mechanism: "Strongest AI, crash E2 easily",
      },
    },
    serms: {
      tamoxifen: {
        tradeName: "Nolvadex",
        use: "PCT, gyno prevention",
        dose: "20-40mg/day",
      },
      clomiphene: { tradeName: "Clomid", use: "PCT", dose: "25-50mg/day" },
      raloxifene: {
        tradeName: "Evista",
        use: "Gyno reversal",
        dose: "60mg/day",
      },
    },
    prolactinControl: {
      cabergoline: {
        dose: "0.25-0.5mg 2x/week",
        use: "19-nor induced prolactin",
      },
      pramipexole: { dose: "0.125-0.25mg/day", use: "Alternative to caber" },
    },
    liverSupport: {
      tudca: { dose: "250-500mg/day", use: "With oral steroids" },
      nac: { dose: "600-1200mg/day", use: "General liver support" },
    },
    cardioSupport: {
      cardarine: {
        dose: "10-20mg/day",
        use: "Lipids, endurance (research chem)",
      },
      citrusBergamot: { dose: "500mg 2x/day", use: "Cholesterol support" },
      omega3: { dose: "3-5g/day", use: "General heart health" },
    },
  },
};

export const CYCLE_PROTOCOLS = {
  beginner: {
    name: "First Cycle",
    compounds: [
      {
        name: "Testosterone Enanthate",
        dose: "300-500mg/week",
        duration: "12-16 weeks",
      },
    ],
    ancillaries: ["AI on hand (Arimidex 0.5mg as needed)"],
    pct: "Nolvadex 40/40/20/20 starting 2 weeks after last pin",
    notes: "Keep it simple, learn how your body responds",
  },
  intermediate: {
    name: "Second Cycle",
    options: [
      {
        stack: "Test + Oral Kickstart",
        compounds: [
          {
            name: "Testosterone Enanthate",
            dose: "500mg/week",
            duration: "16 weeks",
          },
          { name: "Dianabol", dose: "30mg/day", duration: "Weeks 1-4" },
        ],
      },
      {
        stack: "Test + Nandrolone",
        compounds: [
          {
            name: "Testosterone Enanthate",
            dose: "500mg/week",
            duration: "16 weeks",
          },
          { name: "Deca Durabolin", dose: "400mg/week", duration: "14 weeks" },
        ],
        notes: "Keep test higher than deca to avoid deca dick",
      },
    ],
  },
  advanced: {
    name: "Advanced Bulk",
    example: [
      { name: "Testosterone Enanthate", dose: "750mg/week" },
      { name: "Trenbolone Enanthate", dose: "400mg/week" },
      { name: "Anadrol", dose: "50mg/day", duration: "Weeks 1-4" },
    ],
    notes:
      "Only for experienced users who know their response to each compound",
  },
  cutting: {
    name: "Competition Prep",
    example: [
      { name: "Testosterone Propionate", dose: "100mg EOD" },
      { name: "Trenbolone Acetate", dose: "75mg EOD" },
      { name: "Masteron Propionate", dose: "100mg EOD" },
      { name: "Winstrol", dose: "50mg/day", duration: "Last 4-6 weeks" },
    ],
    notes: "Short esters for precise control, winstrol for final hardening",
  },
};

export const HGH_PROTOCOLS = {
  description: "Human Growth Hormone - peptide hormone",
  benefits: [
    "Fat loss (especially visceral)",
    "Improved recovery",
    "Better sleep",
    "Collagen synthesis",
    "Synergy with AAS",
  ],
  dosing: {
    antiAging: "1-2 IU/day",
    fatLoss: "2-4 IU/day",
    bodybuilding: "4-8 IU/day",
    professional: "8-15+ IU/day",
  },
  timing: [
    "Fasted in morning for fat loss (insulin sensitive)",
    "Post-workout for recovery",
    "Before bed for sleep quality",
    "Split doses for higher amounts (2x daily)",
  ],
  sideEffects: [
    "Water retention",
    "Carpal tunnel",
    "Joint pain initially",
    "Insulin resistance at high doses",
  ],
};

export const INSULIN_PROTOCOLS = {
  warning: "EXTREMELY DANGEROUS - can cause death from hypoglycemia",
  types: {
    humalog: { onset: "15 min", peak: "1-2 hours", duration: "4-5 hours" },
    novolog: { onset: "10-20 min", peak: "1-3 hours", duration: "3-5 hours" },
    humulinR: { onset: "30 min", peak: "2-3 hours", duration: "5-7 hours" },
  },
  safetyRules: [
    "ALWAYS have fast-acting carbs on hand",
    "Start with 5 IU maximum",
    "10g carbs per IU of insulin minimum",
    "Never use alone",
    "Never use before bed",
  ],
  synergy:
    "Best used post-workout with HGH - shuttles nutrients and prevents HGH-induced insulin resistance",
};
