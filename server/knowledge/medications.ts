export const MEDICATIONS_DATABASE = {
  stimulants: {
    adderall: {
      genericName: "Amphetamine/Dextroamphetamine",
      variants: ["Adderall IR", "Adderall XR"],
      dietImpacts: [
        {
          effect: "Significant appetite suppression",
          severity: "high",
          adjustment:
            "Schedule meals - don't skip. Eat before medication kicks in.",
        },
        {
          effect: "Increased metabolism",
          severity: "moderate",
          adjustment: "Add 100-200 extra calories to maintain weight goals.",
        },
        {
          effect: "Dehydration risk",
          severity: "moderate",
          adjustment: "Increase water intake by 20-30%. Monitor urine color.",
        },
        {
          effect: "Reduced hunger signals",
          severity: "high",
          adjustment:
            "Set meal alarms. Prepare calorie-dense shakes if eating is difficult.",
        },
      ],
      trainingImpacts: [
        {
          effect: "Elevated heart rate",
          severity: "moderate",
          adjustment:
            "Monitor HR during training. Limit stimulant pre-workouts.",
        },
        {
          effect: "Improved focus",
          severity: "positive",
          adjustment: "Use enhanced focus for mind-muscle connection.",
        },
        {
          effect: "May mask fatigue",
          severity: "moderate",
          adjustment:
            "Be cautious of overtraining. Use objective recovery metrics.",
        },
        {
          effect: "Increased thermogenesis",
          severity: "moderate",
          adjustment:
            "Stay hydrated. Consider training in cooler environments.",
        },
      ],
      volumeMultiplier: 0.95,
      frequencyMultiplier: 1.0,
      specialNotes: [
        "Take medication at consistent times relative to training",
        "Avoid additional caffeine pre-workout if HR is elevated",
        "Protein shakes are easier than solid food if appetite suppressed",
        "Consider training before medication wears off for focus benefits",
      ],
    },
    vyvanse: {
      genericName: "Lisdexamfetamine",
      dietImpacts: [
        {
          effect: "Strong appetite suppression",
          severity: "high",
          adjustment:
            "Eat substantial breakfast before medication. Calorie-dense snacks.",
        },
        {
          effect: "Smoother release than Adderall",
          severity: "moderate",
          adjustment:
            "More predictable eating windows. Plan meals around peak effects.",
        },
      ],
      trainingImpacts: [
        {
          effect: "Steady energy throughout day",
          severity: "positive",
          adjustment: "Good for morning or afternoon training.",
        },
        {
          effect: "Less crash than IR stimulants",
          severity: "positive",
          adjustment: "Evening training possible but may affect sleep.",
        },
      ],
      volumeMultiplier: 0.95,
      frequencyMultiplier: 1.0,
      specialNotes: ["Longer half-life means effects persist into evening"],
    },
    ritalin: {
      genericName: "Methylphenidate",
      dietImpacts: [
        {
          effect: "Moderate appetite suppression",
          severity: "moderate",
          adjustment: "Easier to maintain appetite than amphetamines.",
        },
        {
          effect: "Shorter duration",
          severity: "moderate",
          adjustment: "Appetite returns faster - plan meals for off-periods.",
        },
      ],
      trainingImpacts: [
        {
          effect: "Shorter acting",
          severity: "moderate",
          adjustment: "Time training for focus peak (2-4 hours post-dose).",
        },
        {
          effect: "Less cardiovascular impact than amphetamines",
          severity: "positive",
          adjustment: "More flexibility with pre-workout stimulants.",
        },
      ],
      volumeMultiplier: 1.0,
      frequencyMultiplier: 1.0,
      specialNotes: ["Consider IR vs XR timing for optimal training focus"],
    },
  },

  bloodPressureMeds: {
    eplerenone: {
      genericName: "Eplerenone",
      drugClass: "Mineralocorticoid Receptor Antagonist (MRA)",
      dietImpacts: [
        {
          effect: "Potassium retention",
          severity: "high",
          adjustment:
            "LIMIT high-potassium foods (bananas, potatoes, spinach). Monitor levels.",
        },
        {
          effect: "Sodium excretion",
          severity: "moderate",
          adjustment:
            "May need slightly more sodium, especially around training.",
        },
        {
          effect: "Electrolyte balance changes",
          severity: "moderate",
          adjustment:
            "Consider electrolyte drinks with lower potassium formulas.",
        },
      ],
      trainingImpacts: [
        {
          effect: "Reduced water retention from steroids",
          severity: "positive",
          adjustment: "Better muscle definition. Less bloat.",
        },
        {
          effect: "May reduce BP too much during training",
          severity: "moderate",
          adjustment:
            "Monitor for dizziness on heavy compounds. Avoid rapid position changes.",
        },
        {
          effect: "Blocks aldosterone effects",
          severity: "positive",
          adjustment: "Helps mitigate steroid-induced BP elevation.",
        },
      ],
      volumeMultiplier: 1.0,
      frequencyMultiplier: 1.0,
      specialNotes: [
        "Critical on testosterone cycles to manage BP and water",
        "Get potassium levels checked regularly",
        "Better tolerated than spironolactone for men (less anti-androgen)",
      ],
    },
    lisinopril: {
      genericName: "Lisinopril",
      drugClass: "ACE Inhibitor",
      dietImpacts: [
        {
          effect: "Potassium retention",
          severity: "moderate",
          adjustment: "Limit high-potassium foods.",
        },
        {
          effect: "No major macro adjustments needed",
          severity: "low",
          adjustment: "Standard diet protocols apply.",
        },
      ],
      trainingImpacts: [
        {
          effect: "May cause first-dose hypotension",
          severity: "moderate",
          adjustment:
            "Be cautious first few days. Avoid heavy training initially.",
        },
        {
          effect: "ACE inhibitor cough (rare)",
          severity: "low",
          adjustment: "If persistent cough develops, discuss with doctor.",
        },
      ],
      volumeMultiplier: 1.0,
      frequencyMultiplier: 1.0,
      specialNotes: ["Common choice for steroid users managing BP"],
    },
    amlodipine: {
      genericName: "Amlodipine",
      drugClass: "Calcium Channel Blocker",
      dietImpacts: [
        {
          effect: "May cause ankle swelling",
          severity: "moderate",
          adjustment: "Reduce sodium if swelling occurs.",
        },
        {
          effect: "Grapefruit interaction",
          severity: "high",
          adjustment: "AVOID grapefruit and grapefruit juice completely.",
        },
      ],
      trainingImpacts: [
        {
          effect: "Generally well-tolerated for training",
          severity: "positive",
          adjustment: "No major volume adjustments needed.",
        },
        {
          effect: "May cause peripheral edema",
          severity: "moderate",
          adjustment: "Don't confuse with water retention from steroids.",
        },
      ],
      volumeMultiplier: 1.0,
      frequencyMultiplier: 1.0,
      specialNotes: [
        "Often combined with ACE inhibitors for better BP control",
      ],
    },
  },

  hairLossMeds: {
    finasteride: {
      genericName: "Finasteride",
      drugClass: "5-alpha Reductase Inhibitor",
      dosages: ["1mg (Propecia)", "5mg (Proscar)"],
      dietImpacts: [
        {
          effect: "No direct diet impacts",
          severity: "none",
          adjustment: "Standard nutrition protocols apply.",
        },
      ],
      trainingImpacts: [
        {
          effect: "Blocks DHT conversion",
          severity: "moderate",
          adjustment: "May slightly reduce DHT-driven strength gains.",
        },
        {
          effect: "Potential strength plateau",
          severity: "low",
          adjustment: "Focus on progressive overload. Effects are subtle.",
        },
        {
          effect: "Reduced neurosteroid activity",
          severity: "low",
          adjustment: "Some users report reduced motivation - monitor mood.",
        },
      ],
      volumeMultiplier: 0.95,
      frequencyMultiplier: 1.0,
      specialNotes: [
        "Blocks ~70% of DHT conversion",
        "May reduce some androgenic effects of testosterone",
        "Does NOT affect injectable DHT derivatives (Masteron, Proviron, Winstrol)",
      ],
    },
    dutasteride: {
      genericName: "Dutasteride",
      drugClass: "5-alpha Reductase Inhibitor",
      dietImpacts: [
        {
          effect: "No direct diet impacts",
          severity: "none",
          adjustment: "Standard nutrition protocols apply.",
        },
      ],
      trainingImpacts: [
        {
          effect: "Blocks 95%+ of DHT",
          severity: "moderate",
          adjustment: "More significant DHT reduction than finasteride.",
        },
        {
          effect: "More noticeable strength effects",
          severity: "moderate",
          adjustment: "May notice slight strength reduction.",
        },
      ],
      volumeMultiplier: 0.92,
      frequencyMultiplier: 1.0,
      specialNotes: [
        "More potent than finasteride",
        "Longer half-life (3-5 weeks)",
        "Consider if finasteride insufficient for hair protection",
      ],
    },
    minoxidil_oral: {
      genericName: "Minoxidil (Oral)",
      drugClass: "Vasodilator",
      dietImpacts: [
        {
          effect: "May cause water retention",
          severity: "moderate",
          adjustment: "Monitor sodium intake. May mask definition.",
        },
        {
          effect: "Potassium considerations",
          severity: "low",
          adjustment: "Maintain adequate potassium intake.",
        },
      ],
      trainingImpacts: [
        {
          effect: "Significant BP reduction",
          severity: "high",
          adjustment:
            "Monitor for dizziness during heavy compounds (squats, deadlifts).",
        },
        {
          effect: "Increased heart rate (reflex tachycardia)",
          severity: "moderate",
          adjustment: "May feel elevated HR during training. Normal response.",
        },
        {
          effect: "Enhanced vascularity",
          severity: "positive",
          adjustment: "Vasodilator effect increases pump and vascularity.",
        },
        {
          effect: "May affect stamina",
          severity: "moderate",
          adjustment: "Some users report reduced work capacity initially.",
        },
      ],
      volumeMultiplier: 0.95,
      frequencyMultiplier: 1.0,
      specialNotes: [
        "Start with low dose (2.5mg) and titrate up",
        "Often paired with beta-blocker to counter tachycardia",
        "More effective for hair than topical but more systemic effects",
        "Common doses: 2.5mg, 5mg, 10mg daily",
      ],
    },
  },

  sleepAids: {
    melatonin: {
      genericName: "Melatonin",
      drugClass: "Hormone Supplement",
      dietImpacts: [
        {
          effect: "No direct diet impacts",
          severity: "none",
          adjustment: "Standard nutrition protocols apply.",
        },
      ],
      trainingImpacts: [
        {
          effect: "Improved sleep quality",
          severity: "positive",
          adjustment: "Better recovery from enhanced sleep.",
        },
        {
          effect: "May improve growth hormone pulse",
          severity: "positive",
          adjustment: "Take 30 min before bed.",
        },
      ],
      volumeMultiplier: 1.05,
      frequencyMultiplier: 1.0,
      specialNotes: ["0.3-3mg is typically sufficient. More is not better."],
    },
    trazodone: {
      genericName: "Trazodone",
      drugClass: "Serotonin Modulator",
      dietImpacts: [
        {
          effect: "May cause next-day grogginess",
          severity: "moderate",
          adjustment: "Take 8+ hours before wake time.",
        },
      ],
      trainingImpacts: [
        {
          effect: "Improved sleep architecture",
          severity: "positive",
          adjustment: "Better deep sleep = better recovery.",
        },
        {
          effect: "Morning sedation possible",
          severity: "moderate",
          adjustment: "Avoid early morning training if groggy.",
        },
      ],
      volumeMultiplier: 1.02,
      frequencyMultiplier: 1.0,
      specialNotes: ["Common for tren/stimulant-induced insomnia"],
    },
  },

  thyroid: {
    levothyroxine: {
      genericName: "Levothyroxine (T4)",
      drugClass: "Thyroid Hormone Replacement",
      dietImpacts: [
        {
          effect: "Affects metabolic rate",
          severity: "high",
          adjustment:
            "Calorie needs may change. Adjust macros based on metabolic response.",
        },
        {
          effect: "Take on empty stomach",
          severity: "moderate",
          adjustment: "Wait 30-60 min before eating.",
        },
        {
          effect: "Calcium/iron interaction",
          severity: "moderate",
          adjustment: "Space supplements 4+ hours from medication.",
        },
      ],
      trainingImpacts: [
        {
          effect: "Optimal thyroid = optimal metabolism",
          severity: "positive",
          adjustment: "Proper levels support training capacity.",
        },
        {
          effect: "Underdosed = fatigue and weakness",
          severity: "high",
          adjustment: "If fatigued, get levels checked.",
        },
      ],
      volumeMultiplier: 1.0,
      frequencyMultiplier: 1.0,
      specialNotes: [
        "Important to monitor when using trenbolone (suppresses thyroid)",
      ],
    },
    cytomel: {
      genericName: "Liothyronine (T3)",
      drugClass: "Active Thyroid Hormone",
      dietImpacts: [
        {
          effect: "Significantly increases metabolism",
          severity: "high",
          adjustment:
            "Add 200-400 calories when using for cutting. Protein higher to prevent catabolism.",
        },
        {
          effect: "Can burn muscle if calories too low",
          severity: "high",
          adjustment: "Maintain high protein (1.2g+ per lb).",
        },
      ],
      trainingImpacts: [
        {
          effect: "Increased energy expenditure",
          severity: "high",
          adjustment: "May fatigue faster. Reduce volume slightly.",
        },
        {
          effect: "Enhanced fat burning",
          severity: "positive",
          adjustment: "Synergistic with cardio for fat loss.",
        },
        {
          effect: "Catabolic risk",
          severity: "moderate",
          adjustment:
            "Best used on cycle with anabolics for muscle preservation.",
        },
      ],
      volumeMultiplier: 0.9,
      frequencyMultiplier: 1.0,
      specialNotes: [
        "25-75mcg/day common range",
        "Always taper off to avoid thyroid suppression",
        "Best used with AAS to prevent muscle loss",
      ],
    },
  },

  antiEstrogens: {
    anastrozole: {
      genericName: "Anastrozole (Arimidex)",
      drugClass: "Aromatase Inhibitor",
      dietImpacts: [
        {
          effect: "May affect lipid profile",
          severity: "moderate",
          adjustment: "Include omega-3s. Monitor cholesterol.",
        },
        {
          effect: "Joint issues from low estrogen",
          severity: "moderate",
          adjustment: "Omega-3s and collagen may help joints.",
        },
      ],
      trainingImpacts: [
        {
          effect: "Reduced water retention",
          severity: "positive",
          adjustment: "Drier look but may affect joint comfort.",
        },
        {
          effect: "Joint pain if estrogen too low",
          severity: "moderate",
          adjustment: "Don't crash estrogen. Use minimum effective dose.",
        },
      ],
      volumeMultiplier: 1.0,
      frequencyMultiplier: 1.0,
      specialNotes: ["0.25-0.5mg EOD is often sufficient. Less is more."],
    },
  },
};

export const getMedicationImpacts = (
  medications: Array<{ name: string; dose?: string }>,
) => {
  const impacts: {
    dietImpacts: Array<{ medication: string; effects: any[] }>;
    trainingImpacts: Array<{ medication: string; effects: any[] }>;
    overallVolumeMultiplier: number;
    overallFrequencyMultiplier: number;
    criticalNotes: string[];
  } = {
    dietImpacts: [],
    trainingImpacts: [],
    overallVolumeMultiplier: 1.0,
    overallFrequencyMultiplier: 1.0,
    criticalNotes: [],
  };

  for (const med of medications) {
    const medName = med.name.toLowerCase().replace(/\s+/g, "_");

    for (const category of Object.values(MEDICATIONS_DATABASE)) {
      for (const [key, data] of Object.entries(category)) {
        if (
          medName.includes(key) ||
          key.includes(medName) ||
          (data as any).genericName?.toLowerCase().includes(medName)
        ) {
          const medData = data as any;

          if (medData.dietImpacts) {
            impacts.dietImpacts.push({
              medication: med.name,
              effects: medData.dietImpacts,
            });
          }

          if (medData.trainingImpacts) {
            impacts.trainingImpacts.push({
              medication: med.name,
              effects: medData.trainingImpacts,
            });
          }

          if (medData.volumeMultiplier) {
            impacts.overallVolumeMultiplier *= medData.volumeMultiplier;
          }

          if (medData.frequencyMultiplier) {
            impacts.overallFrequencyMultiplier *= medData.frequencyMultiplier;
          }

          if (medData.specialNotes) {
            impacts.criticalNotes.push(
              ...medData.specialNotes.map((n: string) => `${med.name}: ${n}`),
            );
          }
        }
      }
    }
  }

  return impacts;
};
