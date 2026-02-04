export const MUSCLE_ANATOMY = {
  chest: {
    muscles: {
      pectoralisMajor: {
        origin: "Clavicle, sternum, ribs 1-6",
        insertion: "Lateral lip of bicipital groove of humerus",
        function: "Shoulder flexion, adduction, internal rotation",
        portions: {
          clavicular: "Upper chest - trained with incline movements",
          sternal: "Mid/lower chest - trained with flat/decline movements",
        },
      },
      pectoralisMinor: {
        location: "Deep to pec major",
        function: "Scapular protraction and depression",
      },
    },
    trainingImplications: [
      "Incline (30-45°) emphasizes clavicular head",
      "Flat bench targets sternal head",
      "Decline emphasizes lower sternal fibers",
      "Adduction movements (flyes) maximize stretch and contraction",
      "Internal rotation at peak contraction increases activation",
    ],
  },

  back: {
    muscles: {
      latissimusDorsi: {
        origin: "T7-L5 spinous processes, iliac crest, ribs 9-12",
        insertion: "Intertubercular groove of humerus",
        function: "Shoulder extension, adduction, internal rotation",
        widthFocus: "Pulldowns, pull-ups, rows with elbows flared",
      },
      trapezius: {
        portions: {
          upper: "Scapular elevation - shrugs",
          middle: "Scapular retraction - rows",
          lower: "Scapular depression - Y-raises",
        },
      },
      rhomboids: {
        function: "Scapular retraction",
        training: "Rows with squeeze at contraction",
      },
      erectorSpinae: {
        function: "Spinal extension",
        training: "Deadlifts, back extensions, good mornings",
      },
      teresMajor: {
        nickname: "Little lat",
        function: "Assists lat in all movements",
      },
    },
    trainingImplications: [
      "Vertical pulls (pulldowns, pull-ups) emphasize lat width",
      "Horizontal pulls (rows) emphasize thickness",
      "Elbow position changes emphasis: close = more lat, wide = more upper back",
      "Full scapular protraction at stretch, full retraction at contraction",
    ],
  },

  shoulders: {
    muscles: {
      deltoid: {
        portions: {
          anterior: "Shoulder flexion - front raises, overhead press",
          lateral: "Shoulder abduction - lateral raises",
          posterior: "Shoulder extension, external rotation - reverse flyes",
        },
      },
      rotatorcuff: {
        muscles: [
          "Supraspinatus",
          "Infraspinatus",
          "Teres minor",
          "Subscapularis",
        ],
        function: "Shoulder stabilization, external/internal rotation",
        training: "External rotations, face pulls for injury prevention",
      },
    },
    trainingImplications: [
      "Anterior delts get significant work from pressing - may need less direct work",
      "Lateral delts need isolation for 3D look",
      "Posterior delts often underdeveloped - prioritize face pulls, reverse flyes",
      "Slight forward lean on lateral raises targets lateral head better",
    ],
  },

  arms: {
    biceps: {
      muscles: {
        bicepsBrachii: {
          heads: {
            long: "Outer head - trained with narrow grip, behind body curls",
            short: "Inner head - trained with wide grip curls",
          },
          function: "Elbow flexion, forearm supination",
        },
        brachialis: {
          location: "Under biceps",
          training: "Hammer curls, reverse curls",
          importance: "Pushes biceps up for bigger appearance",
        },
        brachioradialis: {
          location: "Forearm",
          training: "Hammer curls, reverse curls",
        },
      },
    },
    triceps: {
      heads: {
        long: "Only head crossing shoulder - trained with overhead extensions",
        lateral: "Outer head - trained with pushdowns",
        medial: "Deep head - trained with all tricep movements",
      },
      function: "Elbow extension",
      note: "Triceps are 2/3 of arm size - prioritize for arm mass",
    },
  },

  legs: {
    quadriceps: {
      muscles: {
        rectusFemoris:
          "Only quad crossing hip - trained with leg extensions, sissy squats",
        vastusLateralis: "Outer quad - trained with wide stance squats",
        vastusMedialis: "Teardrop - trained with full ROM, narrow stance",
        vastusIntermedius: "Deep quad - trained with all quad movements",
      },
      function: "Knee extension, hip flexion (rectus femoris)",
    },
    hamstrings: {
      muscles: {
        bicepsFemoris: "Outer ham - long and short heads",
        semitendinosus: "Inner ham",
        semimembranosus: "Inner ham",
      },
      function: "Knee flexion, hip extension",
      training: [
        "Hip hinge movements (RDL, SLDL) for hip extension emphasis",
        "Leg curls for knee flexion emphasis",
        "Both needed for complete development",
      ],
    },
    glutes: {
      muscles: {
        gluteusMaximus: "Primary hip extensor - squats, hip thrusts, deadlifts",
        gluteusMedius: "Hip abduction - lateral band walks, abduction machine",
        gluteusMinimus: "Hip abduction, internal rotation",
      },
    },
    calves: {
      muscles: {
        gastrocnemius: "Upper calf - trained with straight leg raises",
        soleus: "Lower/deep calf - trained with bent knee raises",
      },
      note: "High rep (15-25) often works better for calves",
    },
  },
};

export const BIOMECHANICS_PRINCIPLES = {
  leverArms: {
    description: "Distance from joint axis to force application",
    implication: "Longer limbs = mechanical disadvantage but greater stretch",
  },
  forceVectorAnalysis: {
    description: "Direction of resistance relative to muscle fiber orientation",
    examples: [
      "Cable flyes maintain constant tension throughout ROM",
      "Incline DB curls stretch long head at bottom",
      "Leg press foot position changes muscle emphasis",
    ],
  },
  strengthCurves: {
    ascending: "Stronger at lockout (bench press, squat)",
    descending: "Stronger at stretch (pulldown)",
    bell: "Strongest in middle range (bicep curl)",
  },
  jointAngles: {
    description: "Optimal angles for muscle activation",
    examples: [
      "30-45° incline for upper chest",
      "90° elbow angle for maximum bicep tension",
      "Knee past toes in squat is safe and increases quad activation",
    ],
  },
};

export const POSTURE_ANATOMY = {
  anteriorPelvicTilt: {
    tightMuscles: ["Hip flexors", "Erector spinae"],
    weakMuscles: ["Glutes", "Abdominals"],
    appearance: "Pronounced lower back arch, protruding belly, duck butt",
    fixes: [
      "Hip flexor stretches",
      "Glute bridges",
      "Dead bugs",
      "Posterior pelvic tilt practice",
    ],
  },
  posteriorPelvicTilt: {
    tightMuscles: ["Hamstrings", "Glutes", "Abdominals"],
    weakMuscles: ["Hip flexors", "Erector spinae"],
    appearance: "Flat back, tucked pelvis",
    fixes: [
      "Hamstring stretches",
      "Hip flexor strengthening",
      "Back extensions",
    ],
  },
  upperCrossedSyndrome: {
    tightMuscles: ["Upper traps", "Levator scapulae", "Pec major/minor"],
    weakMuscles: ["Deep neck flexors", "Lower traps", "Serratus anterior"],
    appearance: "Forward head, rounded shoulders, kyphotic thoracic spine",
    fixes: ["Chin tucks", "Face pulls", "Wall slides", "Pec stretches"],
  },
  scapularWinging: {
    cause: "Weak serratus anterior, possible nerve damage",
    appearance: "Scapula protrudes from back, especially during pushing",
    fixes: ["Serratus punches", "Push-up plus", "Wall slides"],
  },
  ribFlare: {
    cause: "Weak obliques, tight lats, poor breathing patterns",
    appearance: "Lower ribs protrude forward",
    fixes: ["Dead bugs with 360° breathing", "Oblique work", "Lat stretches"],
  },
};

export const GOLDEN_RATIO_PROPORTIONS = {
  ratio: 1.618,
  idealMeasurements: {
    description: "Based on Grecian ideal and Steve Reeves proportions",
    formulas: {
      shoulders: "waist × 1.618",
      chest: "waist × 1.4",
      arms: "neck × 1.0",
      calves: "neck × 1.0 (or arm circumference)",
      thighs: "knee × 1.75",
    },
  },
  assessmentAreas: [
    {
      area: "Shoulder to waist ratio",
      ideal: "1.618:1",
      commonIssue: "Narrow shoulders or wide waist",
    },
    {
      area: "Chest to waist ratio",
      ideal: "1.4:1",
      commonIssue: "Underdeveloped chest",
    },
    {
      area: "Arm to neck ratio",
      ideal: "1:1",
      commonIssue: "Arms lagging behind",
    },
    {
      area: "Calf to arm ratio",
      ideal: "1:1",
      commonIssue: "Calves underdeveloped",
    },
    {
      area: "V-taper",
      ideal: "Wide lats, small waist",
      commonIssue: "Lat width lacking",
    },
  ],
};
