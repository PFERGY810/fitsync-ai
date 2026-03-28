export const POSTURE_ISSUES = {
  anteriorPelvicTilt: {
    description: "Pelvis tilted forward, creating excessive lumbar lordosis",
    visualSigns: [
      "Pronounced lower back arch",
      "Belly appears to protrude even when lean",
      "Butt sticks out ('duck butt')",
      "Hip flexors visibly short/tight",
    ],
    causes: [
      "Prolonged sitting",
      "Weak glutes and abs",
      "Tight hip flexors and erector spinae",
      "Poor core activation patterns",
    ],
    muscleImbalances: {
      tight: [
        "Hip flexors (psoas, iliacus, rectus femoris)",
        "Erector spinae",
        "QL",
      ],
      weak: ["Glutes", "Abdominals", "Hamstrings"],
    },
    negativeEffects: [
      "Lower back pain",
      "Poor squat and deadlift mechanics",
      "Reduced glute activation",
      "Appearance of love handles/belly even when lean",
    ],
    fixes: {
      stretches: [
        {
          name: "Couch stretch",
          duration: "2 min each side",
          frequency: "2x daily",
        },
        {
          name: "Kneeling hip flexor stretch",
          duration: "90 sec each side",
          frequency: "Daily",
        },
        {
          name: "Pigeon pose",
          duration: "2 min each side",
          frequency: "Daily",
        },
        {
          name: "Rectus femoris stretch",
          duration: "60 sec each side",
          frequency: "Daily",
        },
      ],
      strengthening: [
        {
          name: "Glute bridges",
          sets: "3x15",
          cue: "Posterior pelvic tilt at top",
        },
        {
          name: "Dead bugs",
          sets: "3x10 each side",
          cue: "Keep lower back flat on floor",
        },
        {
          name: "Reverse planks",
          sets: "3x30 sec",
          cue: "Squeeze glutes hard",
        },
        { name: "Hip thrusts", sets: "3x12", cue: "Full lockout with PPT" },
        {
          name: "Hollow body holds",
          sets: "3x30 sec",
          cue: "Flatten lower back",
        },
      ],
      dailyPractice: [
        "Practice posterior pelvic tilt standing throughout day",
        "Stand with feet hip width, tuck tailbone under",
        "Engage abs gently when standing/walking",
        "Sit on edge of chair, not slumped back",
      ],
      equipment: [
        "Standing desk to reduce sitting time",
        "Lacrosse ball for hip flexor release",
        "Foam roller for quads and back",
      ],
    },
    expectedTimeline: "4-8 weeks with consistent daily work",
  },

  posteriorPelvicTilt: {
    description: "Pelvis tilted backward, creating flat lower back",
    visualSigns: [
      "Flat/no lumbar curve",
      "Tucked tailbone",
      "Slouched posture",
      "Tight hamstrings",
    ],
    causes: [
      "Excessive ab training without back work",
      "Chronic slumped sitting",
      "Tight hamstrings",
      "Weak hip flexors",
    ],
    muscleImbalances: {
      tight: ["Hamstrings", "Glutes", "Abdominals"],
      weak: ["Hip flexors", "Erector spinae"],
    },
    negativeEffects: [
      "Poor deadlift lockout",
      "Reduced power in hip extension",
      "Disc problems long-term",
    ],
    fixes: {
      stretches: [
        {
          name: "Hamstring stretches",
          duration: "2 min each leg",
          frequency: "2x daily",
        },
        {
          name: "Glute stretches",
          duration: "90 sec each side",
          frequency: "Daily",
        },
      ],
      strengthening: [
        { name: "Back extensions", sets: "3x12", cue: "Control the movement" },
        {
          name: "Good mornings",
          sets: "3x10",
          cue: "Light weight, feel hamstring stretch",
        },
        {
          name: "Hip flexor march",
          sets: "3x10 each leg",
          cue: "Drive knee up against resistance",
        },
      ],
    },
  },

  scapularWinging: {
    description:
      "Shoulder blades protrude from back, especially during pushing",
    visualSigns: [
      "Scapula sticks out from rib cage",
      "More visible during push-up position",
      "Asymmetrical shoulder blade position",
    ],
    causes: [
      "Weak serratus anterior",
      "Poor scapular control",
      "Possible long thoracic nerve issue (if severe)",
    ],
    muscleImbalances: {
      weak: ["Serratus anterior", "Lower trapezius"],
      overactive: ["Upper trapezius", "Levator scapulae"],
    },
    negativeEffects: [
      "Shoulder impingement risk",
      "Reduced pressing strength",
      "Poor overhead position",
      "Shoulder instability",
    ],
    fixes: {
      exercises: [
        {
          name: "Serratus punches",
          sets: "3x15",
          cue: "Push shoulder blades apart at top",
        },
        {
          name: "Push-up plus",
          sets: "3x12",
          cue: "Extra push at top, rounding upper back",
        },
        {
          name: "Wall slides",
          sets: "3x10",
          cue: "Keep entire arm against wall",
        },
        {
          name: "Band pull-aparts",
          sets: "3x20",
          cue: "Squeeze scaps together",
        },
        {
          name: "Serratus press",
          sets: "3x12",
          cue: "Press dumbbells up and apart",
        },
      ],
      cues: [
        "Think 'long arms' when pressing",
        "Protract scaps at lockout of pressing movements",
        "Pack shoulders down and back when rowing",
      ],
    },
    expectedTimeline: "6-12 weeks for noticeable improvement",
  },

  ribFlare: {
    description:
      "Lower ribs protrude forward, especially visible when breathing",
    visualSigns: [
      "Ribs visible sticking out at bottom of rib cage",
      "More pronounced lying on back",
      "Visible gap between ribs and abs",
    ],
    causes: [
      "Weak external obliques",
      "Tight latissimus dorsi",
      "Poor diaphragmatic breathing",
      "Hyperextended posture pattern",
    ],
    muscleImbalances: {
      weak: ["External obliques", "Internal obliques", "Transverse abdominis"],
      tight: ["Latissimus dorsi", "Erector spinae"],
    },
    negativeEffects: [
      "Appearance of larger waist",
      "Core instability in lifts",
      "Poor breathing mechanics",
      "Often linked with APT",
    ],
    fixes: {
      breathing: [
        {
          name: "90/90 breathing",
          duration: "5 min",
          frequency: "2x daily",
          instructions:
            "Lie on back, legs on chair at 90°, breathe into belly AND sides, exhale fully pulling ribs down",
        },
        {
          name: "Crocodile breathing",
          duration: "3 min",
          frequency: "Daily",
          instructions:
            "Lie face down, breathe into floor, expand belly and sides",
        },
      ],
      exercises: [
        {
          name: "Dead bugs",
          sets: "3x10 each side",
          cue: "Keep ribs down throughout",
        },
        {
          name: "Pallof press",
          sets: "3x10",
          cue: "Exhale and pull ribs down at extension",
        },
        {
          name: "Ab wheel rollouts",
          sets: "3x8",
          cue: "Maintain rib position, don't flare",
        },
        {
          name: "Hanging leg raises",
          sets: "3x10",
          cue: "Posterior tilt throughout",
        },
      ],
      stretches: [
        {
          name: "Lat stretch on foam roller",
          duration: "2 min",
          frequency: "Daily",
        },
        { name: "Prayer stretch", duration: "90 sec", frequency: "Daily" },
      ],
      dailyPractice: [
        "Exhale fully and feel ribs drop before core exercises",
        "Practice 360° breathing throughout day",
        "Don't hyperextend when standing",
      ],
    },
    expectedTimeline: "4-12 weeks with consistent breathing practice",
  },

  upperCrossedSyndrome: {
    description: "Forward head, rounded shoulders, hunched upper back",
    visualSigns: [
      "Head forward of shoulders",
      "Rounded shoulders",
      "Increased thoracic kyphosis",
      "Elevated/shrugged shoulders",
    ],
    causes: [
      "Desk work and computer use",
      "Phone use (tech neck)",
      "Excessive pushing without pulling",
      "Weak postural muscles",
    ],
    muscleImbalances: {
      tight: [
        "Upper trapezius",
        "Levator scapulae",
        "Pectoralis major/minor",
        "SCM",
      ],
      weak: [
        "Deep neck flexors",
        "Lower/middle trapezius",
        "Serratus anterior",
        "Rhomboids",
      ],
    },
    negativeEffects: [
      "Neck pain and headaches",
      "Shoulder impingement",
      "Poor overhead position",
      "Reduced lung capacity",
    ],
    fixes: {
      stretches: [
        {
          name: "Doorway pec stretch",
          duration: "90 sec each side",
          frequency: "2x daily",
        },
        {
          name: "Upper trap stretch",
          duration: "60 sec each side",
          frequency: "Daily",
        },
        {
          name: "Levator scapulae stretch",
          duration: "60 sec each side",
          frequency: "Daily",
        },
        {
          name: "Thoracic extension on roller",
          duration: "2 min",
          frequency: "Daily",
        },
      ],
      strengthening: [
        {
          name: "Chin tucks",
          sets: "3x15",
          cue: "Make double chin, hold 5 sec",
        },
        {
          name: "Face pulls",
          sets: "3x15",
          cue: "External rotate at end, pull to face",
        },
        { name: "Y-T-W raises", sets: "2x10 each", cue: "Squeeze lower traps" },
        { name: "Prone trap raises", sets: "3x12", cue: "Lead with thumbs" },
        {
          name: "Wall slides",
          sets: "3x10",
          cue: "Keep back and arms against wall",
        },
        { name: "Band pull-aparts", sets: "100 daily", cue: "Various angles" },
      ],
      dailyPractice: [
        "Chin tuck while at computer",
        "Set phone at eye level",
        "Stand against wall to check posture",
        "Pull shoulders back and down periodically",
      ],
      equipment: [
        "Foam roller for thoracic extension",
        "Lacrosse ball for pec release",
        "Resistance band for face pulls and pull-aparts",
      ],
    },
    facialBenefits: [
      "Chin tucks help hyoid position, improving jawline appearance",
      "Forward head adds illusion of weaker chin",
      "Corrected posture = more CCW (counterclockwise) facial appearance",
      "Better posture improves overall attractiveness significantly",
    ],
    expectedTimeline: "6-12 weeks for significant improvement",
  },

  kyphosis: {
    description: "Excessive rounding of thoracic spine (hunchback)",
    visualSigns: [
      "Pronounced upper back rounding",
      "Difficulty standing fully upright",
      "Shoulders roll forward",
    ],
    causes: [
      "Prolonged poor posture",
      "Weak back extensors",
      "Tight chest and front delts",
      "Can be structural (Scheuermann's)",
    ],
    fixes: {
      stretches: [
        {
          name: "Foam roller thoracic extension",
          duration: "3 min",
          frequency: "Daily",
        },
        { name: "Cat-cow stretches", sets: "2x10", frequency: "Daily" },
        { name: "Thread the needle", sets: "10 each side", frequency: "Daily" },
      ],
      strengthening: [
        {
          name: "Prone Y raises",
          sets: "3x12",
          cue: "Lift arms in Y position",
        },
        { name: "Face pulls", sets: "3x15", cue: "High volume" },
        {
          name: "Rows (chest supported)",
          sets: "4x12",
          cue: "Pull to lower chest, squeeze",
        },
        { name: "Back extensions", sets: "3x12", cue: "Upper back focus" },
      ],
      equipment: [
        "Posture corrector brace (short-term use)",
        "Foam roller (essential)",
        "Peanut for thoracic mobility",
      ],
    },
  },

  scoliosis: {
    description: "Lateral curvature of spine",
    types: {
      structural: "True bone deformity, requires medical management",
      functional: "Muscle imbalance related, can be improved",
    },
    signs: [
      "Uneven shoulder height",
      "Uneven hip height",
      "One shoulder blade more prominent",
      "Visible curve when bending forward",
    ],
    management: {
      important:
        "Get diagnosed by professional - severe cases need medical intervention",
      exerciseApproach: [
        "Strengthen weak side",
        "Stretch tight side",
        "Focus on unilateral exercises",
        "Core stability emphasis",
      ],
      avoid: [
        "Heavy asymmetric loading without supervision",
        "Exercises that worsen curve",
      ],
    },
  },
};

export const POSTURE_WARMUPS = {
  preBenchPress: {
    duration: "5-7 minutes",
    sequence: [
      { exercise: "Foam roll thoracic spine", duration: "60 sec" },
      { exercise: "Banded dislocates", reps: "15" },
      { exercise: "Face pulls", reps: "15" },
      { exercise: "Scap push-ups", reps: "10" },
      { exercise: "Empty bar bench press", reps: "20 (slow and controlled)" },
    ],
  },
  preSquat: {
    duration: "8-10 minutes",
    sequence: [
      { exercise: "Foam roll quads and adductors", duration: "90 sec total" },
      { exercise: "90/90 hip switches", reps: "10 each side" },
      {
        exercise: "Goblet squat holds",
        duration: "60 sec (stretch at bottom)",
      },
      { exercise: "Hip circles", reps: "10 each direction" },
      { exercise: "Glute bridges", reps: "15" },
      { exercise: "Empty bar squat", reps: "15" },
    ],
  },
  preDeadlift: {
    duration: "7-8 minutes",
    sequence: [
      { exercise: "Cat-cow", reps: "10" },
      { exercise: "Hamstring stretch", duration: "60 sec each leg" },
      { exercise: "Hip hinge with dowel", reps: "15" },
      { exercise: "Bird dogs", reps: "10 each side" },
      { exercise: "Dead bugs", reps: "10 each side" },
      { exercise: "Light RDL", reps: "12" },
    ],
  },
  preOverheadPress: {
    duration: "5-7 minutes",
    sequence: [
      { exercise: "Wall slides", reps: "10" },
      { exercise: "Banded dislocates", reps: "15" },
      { exercise: "Shoulder circles", reps: "10 each direction" },
      { exercise: "Face pulls", reps: "15" },
      { exercise: "Light DB press", reps: "15" },
    ],
  },
  prePullUps: {
    duration: "5 minutes",
    sequence: [
      { exercise: "Dead hangs", duration: "30 sec" },
      { exercise: "Scapular pull-ups", reps: "10" },
      { exercise: "Band pull-aparts", reps: "20" },
      { exercise: "Arm circles", reps: "10 each direction" },
    ],
  },
};

export const POSTURE_SUPPLEMENTS = {
  forJointHealth: [
    { name: "Glucosamine", dose: "1500mg daily", benefit: "Cartilage support" },
    { name: "Chondroitin", dose: "1200mg daily", benefit: "Joint lubrication" },
    {
      name: "Collagen",
      dose: "10-15g daily",
      benefit: "Connective tissue support",
    },
    { name: "Omega-3", dose: "3-5g EPA/DHA", benefit: "Anti-inflammatory" },
    {
      name: "Vitamin C",
      dose: "500-1000mg daily",
      benefit: "Collagen synthesis",
    },
  ],
  forMuscleRelaxation: [
    {
      name: "Magnesium glycinate",
      dose: "400-600mg before bed",
      benefit: "Muscle relaxation, sleep",
    },
    {
      name: "Ashwagandha",
      dose: "300-600mg",
      benefit: "Reduces muscle tension from stress",
    },
  ],
  forBoneHealth: [
    { name: "Vitamin D3", dose: "3000-5000 IU", benefit: "Calcium absorption" },
    {
      name: "Vitamin K2",
      dose: "100-200mcg",
      benefit: "Directs calcium to bones",
    },
    {
      name: "Calcium",
      dose: "500-1000mg if not getting from diet",
      benefit: "Bone density",
    },
  ],
};

export const POSTURE_BRACES = {
  postureCorrector: {
    description: "Pulls shoulders back to train proper position",
    use: "1-2 hours daily maximum",
    caution: "Don't over-rely - build strength instead",
    bestFor: "Upper crossed syndrome, rounded shoulders",
  },
  lsiSupportBelt: {
    description: "Provides lumbar support",
    use: "During heavy lifting only",
    caution: "Don't use for all exercises - core needs to work",
    bestFor: "Lower back issues, temporary support",
  },
  kneeSupport: {
    description: "Compression sleeves or wraps",
    use: "During heavy squats/leg work",
    types: [
      "Neoprene sleeves (warmth + compression)",
      "Wraps (maximum support for max attempts)",
    ],
    bestFor: "Knee tracking issues, general support",
  },
};
