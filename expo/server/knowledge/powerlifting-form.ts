export const EXERCISE_FORM_DATABASE = {
  compounds: {
    benchPress: {
      name: "Barbell Bench Press",
      primaryMuscles: ["Pectoralis major", "Anterior deltoid", "Triceps"],
      setup: {
        positioning: [
          "Lie flat with eyes under the bar",
          "5 points of contact: head, upper back, glutes, both feet",
          "Retract and depress scapulae (squeeze shoulder blades together and down)",
          "Create slight arch in lower back (maintain neutral spine)",
          "Feet flat on floor or on toes (competition rules vary)",
        ],
        grip: [
          "Grip width: 1.5-2x shoulder width",
          "Wrists stacked over elbows at bottom",
          "Full grip around bar (not suicide grip for safety)",
          "Squeeze bar hard to create irradiation",
        ],
      },
      execution: [
        "Unrack with straight arms, bring bar over chest",
        "Lower with control to mid-chest/nipple line",
        "Touch chest (don't bounce)",
        "Drive through feet, press bar back toward rack",
        "Lock out fully at top",
      ],
      formCues: [
        "Break the bar apart (external rotation of shoulders)",
        "Leg drive: push floor away, not up",
        "Keep chest high throughout",
        "Control the descent (2-3 seconds)",
        "Drive bar slightly back toward face as you press",
      ],
      commonMistakes: [
        { mistake: "Flaring elbows 90°", fix: "Keep elbows 45-75° from torso" },
        { mistake: "Bouncing bar off chest", fix: "Pause briefly on chest" },
        {
          mistake: "Losing back tightness",
          fix: "Stay tight from unrack to rerack",
        },
        {
          mistake: "Butt coming off bench",
          fix: "Drive through feet into floor, not up",
        },
        {
          mistake: "Uneven pressing",
          fix: "Focus on weak side, check grip width",
        },
      ],
      breathingPattern:
        "Big breath at top, hold on descent, exhale at sticking point or lockout",
      tempo: {
        hypertrophy: "3-1-1-0 (3 sec down, 1 sec pause, 1 sec up)",
        strength: "2-1-X-0 (controlled down, pause, explosive up)",
      },
      warmupProtocol: [
        "Empty bar x 15-20",
        "40% x 10",
        "60% x 5",
        "75% x 3",
        "85% x 1-2",
        "Working sets",
      ],
    },

    squat: {
      name: "Barbell Back Squat",
      primaryMuscles: ["Quadriceps", "Glutes", "Hamstrings", "Erector spinae"],
      setup: {
        barPosition: {
          highBar: "On upper traps, more upright torso, more quad dominant",
          lowBar:
            "On rear delts/spine of scapula, more forward lean, more hip dominant",
        },
        stance: [
          "Feet shoulder width or slightly wider",
          "Toes pointed out 15-30° (depends on hip anatomy)",
          "Weight distributed mid-foot to heels",
        ],
        grip: [
          "Hands as close as mobility allows",
          "Elbows pulled down and back",
          "Wrists straight or slightly flexed",
        ],
      },
      execution: [
        "Unrack: take 2-3 steps back only",
        "Big breath, brace core hard",
        "Initiate by breaking at hips AND knees simultaneously",
        "Descend under control until hip crease below knee (parallel or below)",
        "Drive through mid-foot, push floor away",
        "Stand tall, squeeze glutes at top",
      ],
      formCues: [
        "Spread the floor apart with feet (external rotation)",
        "Knees track over toes (don't cave in)",
        "Chest up, don't let upper back round",
        "Sit back AND down (not just back or just down)",
        "Drive out of the hole, don't pause unless training paused squats",
      ],
      commonMistakes: [
        {
          mistake: "Knee cave (valgus)",
          fix: "Push knees out, strengthen hip abductors",
        },
        {
          mistake: "Butt wink (lumbar flexion at bottom)",
          fix: "Work on hip mobility, don't go deeper than you can control",
        },
        {
          mistake: "Good morning squat (hips rise first)",
          fix: "Drive chest up, strengthen quads",
        },
        {
          mistake: "Heels rising",
          fix: "Work on ankle mobility, elevate heels with plates if needed",
        },
        { mistake: "Looking down", fix: "Pick spot on floor 10-15 feet ahead" },
      ],
      breathingPattern:
        "Big breath at top, brace hard, hold through entire rep, breathe at top",
      depth: {
        powerlifting: "Hip crease must break parallel for competition",
        hypertrophy: "Full depth if mobility allows - more muscle activation",
        partial: "Quarter squats for specific overload (not main movement)",
      },
      warmupProtocol: [
        "Goblet squat x 10",
        "Empty bar x 15",
        "40% x 10",
        "60% x 5",
        "75% x 3",
        "85% x 2",
        "Working sets",
      ],
    },

    deadlift: {
      name: "Conventional Deadlift",
      primaryMuscles: [
        "Erector spinae",
        "Glutes",
        "Hamstrings",
        "Quadriceps",
        "Traps",
      ],
      setup: {
        footPosition: [
          "Feet hip width (narrower than squat)",
          "Bar over mid-foot (1-2 inches from shins)",
          "Toes pointed straight or slightly out",
        ],
        grip: {
          double_overhand: "Both palms facing back, use until grip fails",
          mixed: "One overhand, one underhand - allows heavier weight",
          hook: "Thumb wrapped under fingers - secure but painful initially",
        },
        bodyPosition: [
          "Hips higher than squat, lower than row",
          "Shoulders over or slightly in front of bar",
          "Back flat (neutral spine)",
          "Chest up, lats engaged",
        ],
      },
      execution: [
        "Approach bar, set feet",
        "Hinge and grip bar without moving it",
        "Pull slack out of bar (click of plates against bar)",
        "Big breath, brace hard",
        "Push floor away, keep bar close to body",
        "Hips and shoulders rise together",
        "Lock out by squeezing glutes (don't hyperextend)",
        "Lower with control (hinge at hips first)",
      ],
      formCues: [
        "Drag bar up legs (wear long socks)",
        "Push floor away (not pull bar up)",
        "Chest up, don't let upper back round",
        "Lock out with glutes, not by leaning back",
        "Lats stay engaged (protect bar from drifting forward)",
      ],
      commonMistakes: [
        {
          mistake: "Bar drifting forward",
          fix: "Keep lats tight, drag bar up legs",
        },
        {
          mistake: "Hips shooting up first",
          fix: "Push floor away, keep hips down longer",
        },
        {
          mistake: "Lower back rounding",
          fix: "Brace harder, don't start with hips too low",
        },
        {
          mistake: "Hitching (resting on thighs)",
          fix: "Illegal in competition, use leg drive",
        },
        {
          mistake: "Hyperextending at lockout",
          fix: "Just stand straight, squeeze glutes",
        },
      ],
      breathingPattern:
        "Breath at top, hold entire rep, especially on heavy singles",
      variations: {
        sumo: "Wide stance, hands inside knees, more hip dominant",
        romanian: "Straight(ish) legs, hip hinge, hamstring focus",
        trapBar: "More quad involvement, easier on lower back",
      },
      warmupProtocol: [
        "Hip hinge with dowel x 15",
        "45lb plate x 10 (or light bar)",
        "40% x 8",
        "60% x 5",
        "75% x 3",
        "85% x 1",
        "Working sets",
      ],
    },

    overheadPress: {
      name: "Standing Overhead Press",
      primaryMuscles: [
        "Anterior deltoid",
        "Lateral deltoid",
        "Triceps",
        "Core",
      ],
      setup: {
        stance: [
          "Feet shoulder width or slightly narrower",
          "Glutes and core tight (full body exercise)",
          "Slight lean back to clear chin",
        ],
        grip: [
          "Just outside shoulder width",
          "Elbows slightly in front of bar",
          "Wrists stacked over elbows",
        ],
      },
      execution: [
        "Start with bar at upper chest/clavicle",
        "Big breath, brace core",
        "Press straight up, moving head back slightly",
        "Push head through as bar passes face",
        "Lock out directly over mid-foot",
        "Shrug at top for full range",
      ],
      formCues: [
        "Bar path: slight J-curve around face",
        "Squeeze glutes to prevent excessive lean",
        "Push head through the window at top",
        "Lock elbows fully",
        "Keep rib cage down (don't flare)",
      ],
      commonMistakes: [
        {
          mistake: "Excessive lean back",
          fix: "Squeeze glutes, brace core harder",
        },
        {
          mistake: "Pressing in front of body",
          fix: "Push head through at top",
        },
        {
          mistake: "Flared ribs",
          fix: "Exhale and pull ribs down before pressing",
        },
        { mistake: "Not locking out", fix: "Full lockout with shrug at top" },
      ],
      breathingPattern: "Breath at bottom, hold through press, exhale at top",
      variations: {
        pushPress: "Use leg drive to initiate - can handle more weight",
        seatedPress: "Removes leg drive, more strict",
        behindNeck: "Only with good shoulder mobility, injury risk",
      },
    },

    barbellRow: {
      name: "Barbell Row",
      primaryMuscles: [
        "Latissimus dorsi",
        "Rhomboids",
        "Trapezius",
        "Rear deltoid",
        "Biceps",
      ],
      setup: {
        stance: "Shoulder width or slightly wider",
        hingeAngle: "45-60 degrees, more horizontal = more lat involvement",
        grip: "Just outside shoulder width, overhand or underhand",
      },
      execution: [
        "Hinge at hips with flat back",
        "Let bar hang at arm's length",
        "Pull bar to lower chest/upper abdomen",
        "Lead with elbows, squeeze back at top",
        "Lower with control",
      ],
      formCues: [
        "Pull to hips for lower lat emphasis",
        "Pull to chest for upper back emphasis",
        "Don't use momentum (unless training heavy cheat rows)",
        "Squeeze at top for 1-2 seconds",
        "Keep core braced to protect lower back",
      ],
      commonMistakes: [
        {
          mistake: "Using momentum/standing up",
          fix: "Reduce weight, maintain fixed torso angle",
        },
        {
          mistake: "Pulling to wrong position",
          fix: "Target lower chest/upper stomach",
        },
        {
          mistake: "Not feeling back",
          fix: "Use straps to remove grip, focus on squeeze",
        },
        {
          mistake: "Rounding lower back",
          fix: "Brace harder, may need to reduce weight",
        },
      ],
    },

    pullUp: {
      name: "Pull-Up",
      primaryMuscles: ["Latissimus dorsi", "Biceps", "Brachialis", "Rhomboids"],
      setup: {
        grip: {
          overhand: "Pronated grip, more lat/brachialis focus",
          underhand: "Chinup grip, more bicep involvement",
          neutral: "Palms facing, easiest on shoulders",
        },
        width:
          "Slightly wider than shoulder width for lats, narrower for biceps",
      },
      execution: [
        "Dead hang with scapula engaged (not passive hang)",
        "Initiate by depressing and retracting scapula",
        "Pull chest toward bar",
        "Chin over bar (or chest to bar for full ROM)",
        "Lower with control to dead hang",
      ],
      formCues: [
        "Pull elbows to pockets (not behind you)",
        "Chest to bar for full contraction",
        "Control the negative (builds strength)",
        "Don't kip unless training CrossFit style",
        "Keep core tight to prevent swing",
      ],
      commonMistakes: [
        {
          mistake: "Half reps",
          fix: "Full ROM from dead hang to chin over bar",
        },
        { mistake: "Swinging/kipping", fix: "Slow down, engage core" },
        {
          mistake: "Only pulling with arms",
          fix: "Start with scapular pull-ups",
        },
        {
          mistake: "Can't do any",
          fix: "Build with negatives, band assisted, or lat pulldowns",
        },
      ],
      progressions: [
        "Scapular pull-ups",
        "Negative pull-ups (5-10 sec lower)",
        "Band assisted pull-ups",
        "Full pull-ups",
        "Weighted pull-ups",
        "L-sit pull-ups",
        "Muscle-ups",
      ],
    },
  },

  isolations: {
    bicepCurl: {
      name: "Bicep Curl",
      variations: [
        {
          name: "Standing barbell curl",
          focus: "Overall mass, heavier weight",
        },
        {
          name: "Incline dumbbell curl",
          focus: "Long head stretch, peak contraction",
        },
        { name: "Preacher curl", focus: "Short head, eliminates momentum" },
        { name: "Hammer curl", focus: "Brachialis, forearm" },
        { name: "Spider curl", focus: "Peak contraction, short head" },
        { name: "Cable curl", focus: "Constant tension throughout" },
      ],
      formCues: [
        "Don't swing - isolate the bicep",
        "Supinate (turn pinky up) at top for peak contraction",
        "Control the negative (2-3 seconds)",
        "Keep elbows pinned to sides",
        "Full stretch at bottom",
      ],
    },
    tricepExtension: {
      name: "Tricep Extensions",
      variations: [
        { name: "Rope pushdowns", focus: "All heads, constant tension" },
        { name: "Overhead extension", focus: "Long head (stretched overhead)" },
        { name: "Skull crushers", focus: "Long head, heavy load" },
        { name: "Close grip bench", focus: "Overall mass, compound" },
        { name: "Kickbacks", focus: "Peak contraction, lateral head" },
      ],
      formCues: [
        "Lock elbows at extension",
        "Keep elbows stationary (don't flare)",
        "For long head: arms overhead or incline position",
        "Full stretch on overhead movements",
        "Squeeze at lockout",
      ],
    },
    lateralRaise: {
      name: "Lateral Raise",
      formCues: [
        "Slight forward lean to target lateral head",
        "Lead with elbows, not hands",
        "Stop at shoulder height (higher = trap takeover)",
        "Pinky up or neutral (not thumb up)",
        "Control the descent",
      ],
      commonMistakes: [
        { mistake: "Shrugging up", fix: "Keep shoulders down, lower weight" },
        { mistake: "Swinging", fix: "Slower tempo, reduce weight" },
        { mistake: "Going too high", fix: "Stop at shoulder level" },
      ],
    },
    legExtension: {
      name: "Leg Extension",
      formCues: [
        "Adjust pad to above ankle",
        "Seat back supports lower back",
        "Lock out at top, squeeze quad",
        "Control descent (don't let weight drop)",
        "Keep hips in seat (don't lift off)",
      ],
      tips: [
        "Point toes in for outer quad (vastus lateralis)",
        "Point toes out for inner quad (vastus medialis/teardrop)",
        "Higher reps (12-20) often work well",
      ],
    },
    legCurl: {
      name: "Leg Curl",
      variations: ["Lying", "Seated", "Standing"],
      formCues: [
        "Full stretch at bottom",
        "Curl as high as possible",
        "Keep hips down (especially lying curl)",
        "Point toes down for more hamstring activation",
        "Control the negative",
      ],
    },
  },
};

export const STRENGTH_STANDARDS = {
  description:
    "Approximate strength standards by experience level (1RM as multiple of bodyweight)",
  male: {
    bench: {
      beginner: 0.5,
      novice: 0.75,
      intermediate: 1.0,
      advanced: 1.5,
      elite: 2.0,
    },
    squat: {
      beginner: 0.75,
      novice: 1.0,
      intermediate: 1.5,
      advanced: 2.0,
      elite: 2.5,
    },
    deadlift: {
      beginner: 1.0,
      novice: 1.25,
      intermediate: 1.75,
      advanced: 2.5,
      elite: 3.0,
    },
    overheadPress: {
      beginner: 0.35,
      novice: 0.5,
      intermediate: 0.75,
      advanced: 1.0,
      elite: 1.25,
    },
    barbellRow: {
      beginner: 0.5,
      novice: 0.75,
      intermediate: 1.0,
      advanced: 1.25,
      elite: 1.5,
    },
  },
  female: {
    bench: {
      beginner: 0.25,
      novice: 0.5,
      intermediate: 0.75,
      advanced: 1.0,
      elite: 1.25,
    },
    squat: {
      beginner: 0.5,
      novice: 0.75,
      intermediate: 1.0,
      advanced: 1.5,
      elite: 2.0,
    },
    deadlift: {
      beginner: 0.75,
      novice: 1.0,
      intermediate: 1.5,
      advanced: 2.0,
      elite: 2.5,
    },
    overheadPress: {
      beginner: 0.2,
      novice: 0.35,
      intermediate: 0.5,
      advanced: 0.75,
      elite: 1.0,
    },
    barbellRow: {
      beginner: 0.35,
      novice: 0.5,
      intermediate: 0.75,
      advanced: 1.0,
      elite: 1.25,
    },
  },
  enhanced: {
    note: "Enhanced lifters typically exceed these standards significantly",
    benchMultiplier: 1.3,
    squatMultiplier: 1.2,
    deadliftMultiplier: 1.2,
  },
};

export const WARMUP_TIMING = {
  description: "Timing warmups before main lifts",
  generalProtocol: {
    totalTime: "15-20 minutes before first working set",
    sequence: [
      {
        phase: "General warm-up",
        duration: "5 min",
        activities: "Light cardio, jumping jacks, dynamic stretching",
      },
      {
        phase: "Movement-specific mobility",
        duration: "5 min",
        activities: "Based on what you're training",
      },
      {
        phase: "Ramp-up sets",
        duration: "5-10 min",
        activities: "Progressive loading to working weight",
      },
    ],
  },
  example: {
    scenario: "Workout at 5:00 PM, bench press is first exercise",
    timeline: [
      { time: "4:40 PM", activity: "Arrive, change, light walk or bike 5 min" },
      {
        time: "4:45 PM",
        activity: "Dynamic stretching, shoulder circles, arm swings",
      },
      {
        time: "4:50 PM",
        activity: "Foam roll thoracic, band dislocates, face pulls",
      },
      {
        time: "4:55 PM",
        activity: "Empty bar x 15, 95lb x 10, 135lb x 5, 185lb x 3, 205lb x 2",
      },
      { time: "5:00 PM", activity: "First working set at working weight" },
    ],
  },
};
