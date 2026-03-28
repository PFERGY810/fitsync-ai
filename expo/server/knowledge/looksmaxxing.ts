export const LOOKSMAXXING_DISCLAIMER = [
  "This content is theoretical and informational only.",
  "Not medical advice. Do not attempt high-risk procedures.",
  "Consult licensed medical professionals for any treatment decisions.",
  "High-risk items are explicitly flagged and discouraged.",
];

export const LOOKSMAXXING_KNOWLEDGE = {
  boneGrowthMethods: {
    mechanical: [
      {
        name: "Bone microtrauma concepts (high risk)",
        theory: "Wolff's Law suggests bone adapts to stress.",
        risk: "HIGH",
        status: "Not recommended. Do not attempt.",
        notes: [
          "Potential for fractures, nerve damage, and asymmetry.",
          "No safe or validated protocol for cosmetic bone remodeling.",
        ],
      },
      {
        name: "Massage gun stimulation (low evidence)",
        theory: "Vibration may influence tissue response over time.",
        risk: "MEDIUM",
        status: "Unproven for facial bone changes.",
        notes: [
          "May irritate soft tissue. Avoid sensitive areas.",
          "Consider medical guidance before use.",
        ],
      },
      {
        name: "PEMF devices (clinical in fracture healing)",
        theory: "Pulsed electromagnetic fields can support bone healing.",
        risk: "MEDIUM",
        status: "Evidence for fractures; cosmetic use unproven.",
        notes: [
          "Device efficacy varies widely.",
          "Not a substitute for medical treatment.",
        ],
      },
    ],
    compounds: [
      {
        name: "MK-677 (Ibutamoren)",
        purpose: "GH/IGF-1 pathway support (theoretical).",
        risk: "HIGH",
        notes: [
          "Not approved for cosmetic use.",
          "Potential side effects and contraindications.",
        ],
      },
      {
        name: "CJC-1295 + Ipamorelin",
        purpose: "GHRH/GHRP signaling (theoretical).",
        risk: "HIGH",
        notes: [
          "Injectable peptides with medical risk.",
          "Requires physician oversight.",
        ],
      },
      {
        name: "Vitamin D3 + K2 (MK-7)",
        purpose: "Bone metabolism support.",
        risk: "LOW",
        notes: [
          "Safer, common supplement pairing; still requires lab monitoring.",
        ],
      },
    ],
    lifestyle: [
      {
        name: "Sleep optimization",
        purpose: "Support growth hormone and recovery.",
        risk: "LOW",
      },
      {
        name: "Protein and collagen intake",
        purpose: "Support connective tissue health.",
        risk: "LOW",
      },
    ],
  },

  fatReduction: {
    facial: [
      {
        name: "Calorie deficit",
        mechanism: "Overall fat loss reduces facial adiposity.",
        risk: "LOW",
      },
      {
        name: "Ultrasonic cavitation (clinical)",
        mechanism: "Ultrasound may reduce adipocytes locally.",
        risk: "MEDIUM",
        notes: ["Results vary; consult licensed providers."],
      },
      {
        name: "Cryolipolysis (CoolSculpting)",
        mechanism: "Controlled cooling to reduce fat cells.",
        risk: "MEDIUM",
        notes: ["Requires medical provider; outcomes vary."],
      },
      {
        name: "Buccal fat removal (surgical)",
        mechanism: "Surgical excision of buccal fat pads.",
        risk: "HIGH",
        notes: [
          "Permanent changes. Not recommended without specialist consult.",
        ],
      },
    ],
    compounds: [
      {
        name: "Thyroid manipulation (high risk)",
        purpose: "Metabolic rate changes.",
        risk: "HIGH",
        notes: ["Medical supervision required."],
      },
    ],
    natural: [
      { name: "Sodium and water balance", risk: "LOW" },
      { name: "Sleep and stress management", risk: "LOW" },
    ],
  },

  skinOptimization: {
    retinoids: [
      {
        name: "Tretinoin (topical)",
        purpose: "Collagen support and texture improvement.",
        risk: "MEDIUM",
        notes: ["Start low and consult dermatology."],
      },
    ],
    peptides: [
      {
        name: "GHK-Cu (topical)",
        purpose: "Collagen support (limited evidence).",
        risk: "LOW",
      },
    ],
    procedures: [
      {
        name: "Chemical peels or laser resurfacing",
        risk: "MEDIUM",
        notes: ["Professional supervision required."],
      },
    ],
  },

  jawlineEnhancement: {
    chewing: [
      {
        name: "Mastic gum chewing",
        purpose: "Masseter endurance and tone.",
        risk: "LOW",
        notes: ["Avoid TMJ strain; stop if pain occurs."],
      },
    ],
    exercises: [
      {
        name: "Posture and tongue posture training",
        purpose: "Appearance improvement through posture alignment.",
        risk: "LOW",
      },
    ],
    procedures: [
      {
        name: "Botox (masseter reduction)",
        risk: "MEDIUM",
        notes: ["Medical provider only."],
      },
    ],
  },

  protocols: {
    hollowCheeks: {
      summary: "Reduce facial fat and improve mid-face definition.",
      steps: [
        "Maintain a sustainable calorie deficit.",
        "Use consistent sleep and hydration routines.",
        "Consider professional evaluation for clinical options.",
      ],
      timeline: "6-12 months",
      risk: "LOW-MEDIUM",
    },
    boneRemodeling: {
      summary: "High-risk, unproven approaches to facial bone change.",
      steps: [
        "Not recommended. Avoid high-risk mechanical trauma.",
        "If concerned, consult medical professionals about alternatives.",
      ],
      timeline: "N/A",
      risk: "HIGH",
    },
  },

  riskAssessments: {
    boneSmashing: "HIGH",
    compounds: "MEDIUM-HIGH",
    cavitation: "LOW-MEDIUM",
    surgery: "HIGH",
  },
};
