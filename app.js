// ── Config ──
const CYCLE = ["upper", "lowerA", "chestBack", "lowerB", "shouldersArms", "rest"];
const CYCLE_LABELS = { upper: "עליון", lowerA: "רגליים A", chestBack: "חזה/גב", lowerB: "רגליים B", shouldersArms: "כתפיים/ידיים", rest: "מנוחה" };
const CYCLE_EMOJI = { upper: "💪", lowerA: "🦵", chestBack: "🏋️", lowerB: "🦵", shouldersArms: "💪", rest: "😴" };
const DEFAULT_START = "2026-04-05";
let START = localStorage.getItem("fittrack_cycle_start") || DEFAULT_START;

const SCHEDULE = [
  { id: "wake", time: "07:30", label: "השכמה", icon: "☀️", cat: "routine", detail: "" },
  { id: "meal1", time: "07:45", label: "ארוחת בוקר", icon: "🍳", cat: "meal", detail: "2 פרוסות לחם מלא / 5 פריכיות אורז\nקוטג׳ 2% / גבינה לבנה / טונה+ביצה\n1 ירק ירוק | 2 קפה + חלב" },
  { id: "work", time: "08:00", label: "יציאה לעבודה", icon: "💼", cat: "routine", detail: "" },
  { id: "meal2", time: "12:30", label: "ארוחת צהריים", icon: "🥗", cat: "meal", detail: "200 ג׳ אורז/בורגול/כוסמת/קינואה/עדשים\n250 ג׳ עוף/הודו/דג (140 סלמון)\n2 ירקות (1 ירוק לפחות)" },
  { id: "meal3", time: "16:00", label: "ארוחת ביניים", icon: "🥜", cat: "meal", detail: "פרי / 2 תמרים / חטיף עד 100 קל׳\n15 שקדים / 7 חצאי אגוז מלך\nיוגורט חלבון 110 קל׳" },
  { id: "meal4", time: "19:00", label: "ארוחת ערב", icon: "🍽️", cat: "meal", detail: "2 פרוסות לחם / 5 פריכיות אורז\nביצה שלמה | חצי קוטג׳/גבינה/טונה\n2 ירקות | טחינה/חמאת בוטנים/אבוקדו" },
  { id: "workout", time: "20:00", label: "אימון", icon: "🏋️", cat: "workout", detail: "" },
  { id: "shake", time: "22:30", label: "שייק אחרי אימון", icon: "🥤", cat: "meal", detail: "סקופ חלבון + 2 תמרים / בננה\n(ביום מנוחה: חלבון בלבד)" },
  { id: "meal5", time: "23:15", label: "ארוחת לילה", icon: "🌙", cat: "meal", detail: "יוגורט חלבון 110 קל׳" },
  { id: "sleep", time: "01:00", label: "שינה", icon: "😴", cat: "routine", detail: "לפחות 7 שעות רצופות" }
];

const CAT_COLORS = {
  meal: { bg: "rgba(255,152,0,0.07)", accent: "#ff9800", border: "rgba(255,152,0,0.2)" },
  workout: { bg: "rgba(76,175,80,0.07)", accent: "#4caf50", border: "rgba(76,175,80,0.2)" },
  routine: { bg: "rgba(100,140,180,0.05)", accent: "#6a8fb5", border: "rgba(100,140,180,0.15)" }
};

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

// ── Workouts ──
// Weekly cycle: Mon=upper, Tue=lowerA, Wed=rest, Thu=chestBack, Fri=lowerB, Sat=shouldersArms, Sun=rest
const WORKOUT_DAYS = { 1: "upper", 2: "lowerA", 3: null, 4: "chestBack", 5: "lowerB", 6: "shouldersArms", 0: null };

const WORKOUTS = {
  upper: { label: "UPPER", icon: "💪", groups: [
    { tag: "A", type: "superset", exercises: [
      { id: "upper-back-row", label: "Upper Back Row", sub: "Row machine / Cable / Free weight", sets: 4, reps: "5-8", info: "Overhand grip. Elbows ~45-70° flared/abducted. Emphasize scapular retraction.\n\nCan be machine or free weight.\n\nRest: ~3+ min between sets, or ~2 min if alternating with Incline Bench." },
      { id: "incline-bench", label: "Incline Bench Press", sub: "Smith machine / Dumbbells", sets: 4, reps: "5-8", info: "Can use Smith machine or dumbbells.\n\nRest: ~3+ min between sets, or ~2 min if alternating with Upper Back Row." }
    ]},
    { tag: "B", type: "superset", exercises: [
      { id: "lat-pulldown", label: "Lat Pulldowns", sub: "Neutral grip / Unilateral", sets: 3, reps: "8-12", info: "Neutral grip, lat bias. Maintain a neutral spine.\n\nEmphasize shoulder extension, keeping elbows close to sides vs flared.\n\nYou may enjoy doing these unilaterally to get a better stretch, pulling slightly across body by shifting hips into the side you are training.\n\nRest: ~2 min if alternating with Flat Press." },
      { id: "flat-press", label: "Flat Press", sub: "Machine / Dumbbells / Barbell", sets: 3, reps: "8-12", info: "Can be machine or free weight.\n\nRest: ~2 min if alternating with Lat Pulldowns." }
    ]},
    { tag: "C", type: "cluster", exercises: [
      { id: "tricep-ext-overhead", label: "Tricep Extensions (overhead)", sub: "Cable low-to-high", sets: 1, reps: "12-15 + 3 clusters", info: "Low to high / overhead cable extension.\n\n1 set of 12-15 reps to ~0-1 RIR, then 3 cluster sets to ~0-1 RIR.\n\nRest ~15-20 sec between clusters." }
    ]},
    { tag: "D", type: "cluster", exercises: [
      { id: "cable-curls", label: "Standing Cable Curls", sub: "Elbows close to sides", sets: 1, reps: "12-15 + 3 clusters", info: "Keep elbows near sides throughout the movement.\n\n1 set of 12-15 reps to ~0-1 RIR, then 3 cluster sets to ~0-1 RIR.\n\nRest ~15-20 sec between clusters." }
    ]},
    { tag: "E", type: "cluster", exercises: [
      { id: "lateral-raise", label: "Lateral Raise", sub: "Dumbbells / Cable", sets: 1, reps: "12-15 + 3 clusters", info: "Perform in the scapular plane (slightly forward, not straight to the side).\n\n1 set of 12-15 reps to ~0-1 RIR, then 3 cluster sets to ~0-1 RIR.\n\nRest ~15-20 sec between clusters." }
    ]}
  ]},
  lowerA: { label: "LOWER A", icon: "🦵", groups: [
    { tag: "A", type: "single", exercises: [
      { id: "bb-rdl", label: "BB RDLs", sub: "Barbell", sets: 3, reps: "6-10", info: "Romanian Deadlifts with barbell.\n\nFocus on hip hinge, slight knee bend, feel the stretch in hamstrings.\n\nRest: ~3-4 min between sets." }
    ]},
    { tag: "B", type: "single", exercises: [
      { id: "leg-press", label: "Leg Press", sub: "Machine, quad bias", sets: 3, reps: "6-10", info: "Quad bias — use a narrower, lower foot placement to emphasize quads.\n\nRest: ~3-4 min between sets." }
    ]},
    { tag: "C", type: "superset", exercises: [
      { id: "lying-leg-curls", label: "Lying Leg Curls", sub: "Machine", sets: 3, reps: "12-15", info: "Lying leg curl machine.\n\nRest: ~60-90 sec if alternating with Split Squats, or ~2-3 min if doing alone." },
      { id: "split-squats", label: "Split Squats (rear foot elevated)", sub: "Smith machine / Dumbbells", sets: 2, reps: "8-10", info: "Bulgarian split squats with rear foot elevated. Glute bias.\n\nSmith machine works great for these, but DBs are fine too.\n\nRest: ~60-90 sec if alternating with Lying Leg Curls." }
    ]},
    { tag: "D", type: "single", exercises: [
      { id: "standing-calf-a", label: "Standing Calf Raises", sub: "2s pause in stretch", sets: 4, reps: "8-12", info: "Pause 2 seconds in the stretched position (bottom) each rep.\n\nRest: ~2+ min between sets." }
    ]},
    { tag: "E", type: "single", exercises: [
      { id: "reverse-crunches", label: "Reverse Crunches", sub: "Bodyweight", sets: 3, reps: "max", info: "Bodyweight reverse crunches. Go to ~1-2 RIR each set." }
    ]}
  ]},
  chestBack: { label: "CHEST / BACK", icon: "🏋️", groups: [
    { tag: "A", type: "superset", exercises: [
      { id: "flat-bench", label: "Flat Bench Press", sub: "Barbell / Smith machine", sets: 3, reps: "5-8", info: "Flat barbell or Smith machine bench press.\n\nRest: ~3+ min between sets, or ~2 min if alternating with Rows." },
      { id: "rows-lat", label: "Rows (lat bias)", sub: "DB Row / Seated Cable Row / HS Low Row", sets: 3, reps: "5-8", info: "Lat-biased rows. Ex: Kneeling DB Rows, Seated Cable Rows, HS Low Rows.\n\nMaintain a neutral ribcage. Emphasize shoulder extension, keeping elbows close to sides vs flared.\n\nTry to avoid going beyond ~90° shoulder flexion.\n\nYou may enjoy doing these unilaterally for a better stretch.\n\nRest: ~2 min if alternating with Flat Bench." }
    ]},
    { tag: "B", type: "superset", exercises: [
      { id: "incline-press-b", label: "Incline Press", sub: "Machine / Dumbbells", sets: 3, reps: "8-12", info: "Can be machine or free weight.\n\nRest: ~2 min if alternating with Wide Grip Pulldown." },
      { id: "wide-pulldown", label: "Wide Grip Pulldown", sub: "Overhand grip / Pull-ups", sets: 3, reps: "8-12", info: "Wide grip / frontal plane pulldown or pull-up. Overhand grip, upper back bias.\n\nEmphasize scapular retraction.\n\nRest: ~2 min if alternating with Incline Press." }
    ]},
    { tag: "C", type: "single", exercises: [
      { id: "cable-flys", label: "High to Low Cable Flys", sub: "Cables", sets: 2, reps: "12-15", info: "High to low cable fly movement.\n\nRest: ~2+ min between sets." }
    ]},
    { tag: "D", type: "single", exercises: [
      { id: "lat-prayers", label: "Cable Lat Prayers / Pullovers", sub: "Cable", sets: 2, reps: "12-15", info: "Cable lat prayers or pullovers.\n\nTry not to exceed ~120 degrees shoulder flexion.\n\nRest: ~2+ min between sets." }
    ]}
  ]},
  lowerB: { label: "LOWER B", icon: "🦵", groups: [
    { tag: "A", type: "single", exercises: [
      { id: "back-squats", label: "Back Squats", sub: "Barbell", sets: 3, reps: "5-8", info: "Barbell back squats.\n\nRest: ~3-4 min between sets." }
    ]},
    { tag: "B", type: "superset", exercises: [
      { id: "seated-leg-curls", label: "Seated Leg Curls", sub: "Machine", sets: 4, reps: "8-12", info: "Seated leg curl machine.\n\nRest: ~60 sec if alternating with Leg Extensions, or ~2+ min if doing alone." },
      { id: "leg-extensions", label: "Leg Extensions", sub: "Machine", sets: 3, reps: "12-15", info: "Leg extension machine.\n\nRest: ~60 sec if alternating with Seated Leg Curls." }
    ]},
    { tag: "C", type: "single", exercises: [
      { id: "standing-calf-b", label: "Standing Calf Raises", sub: "2s pause in stretch", sets: 4, reps: "12-15", info: "Pause 2 seconds in the stretched position (bottom) each rep.\n\nRest: ~2+ min between sets." }
    ]},
    { tag: "D", type: "single", exercises: [
      { id: "rope-crunches", label: "Rope Crunches", sub: "Cable", sets: 3, reps: "8-12", info: "Cable rope crunches.\n\nRest: ~2+ min between sets." }
    ]}
  ]},
  shouldersArms: { label: "SHOULDERS / ARMS", icon: "💪", groups: [
    { tag: "A", type: "single", exercises: [
      { id: "delt-press", label: "Anterior Delt Press", sub: "Dumbbells / Machine", sets: 3, reps: "6-10", info: "Anterior delt press. Can be free weight or machine.\n\nRest: ~3+ min between sets." }
    ]},
    { tag: "B", type: "superset", exercises: [
      { id: "bayesian-curls", label: "Bayesian Cable Curls", sub: "Cable, shoulder 20-30° extension", sets: 3, reps: "12-15", info: "Face away / Bayesian cable curls.\n\nShoulder should be in ~20-30° extension to get a better stretch on the long head of the bicep.\n\nRest: ~60-90 sec if alternating with Rope Tricep Extensions." },
      { id: "rope-tricep-ext", label: "Rope Tricep Extensions", sub: "Cable high-to-low", sets: 3, reps: "12-15", info: "Rope tricep extensions, cable from high to low.\n\nRest: ~60-90 sec if alternating with Bayesian Curls." }
    ]},
    { tag: "C", type: "single", exercises: [
      { id: "cable-lateral", label: "Cable Lateral Raises", sub: "Cable", sets: 4, reps: "12-15", info: "Cable lateral raises.\n\nRest: ~2 min between sets." }
    ]},
    { tag: "D", type: "cluster", exercises: [
      { id: "hammer-curls", label: "Hammer Curls", sub: "Dumbbells / Cable", sets: 1, reps: "12-15 + 3 clusters", info: "Hammer curls with dumbbells or cable.\n\n1 set of 12-15 reps to ~0-1 RIR, then 3 cluster sets to ~0-1 RIR.\n\nRest ~15-20 sec between clusters." }
    ]},
    { tag: "E", type: "cluster", exercises: [
      { id: "tricep-ext-oh-b", label: "Tricep Extensions (overhead)", sub: "Cable low-to-high", sets: 1, reps: "12-15 + 3 clusters", info: "Overhead tricep extension, cable from low to high.\n\n1 set of 12-15 reps to ~0-1 RIR, then 3 cluster sets to ~0-1 RIR.\n\nRest ~15-20 sec between clusters." }
    ]}
  ]}
};

// ── Achievements ──
const ACHIEVEMENTS = [
  // Consistency
  { id: "streak-3", cat: "consistency", icon: "🔥", title: "התחלה חזקה", desc: "רצף של 3 ימים", target: 3, progress: d => d.streak, check: d => d.streak >= 3 },
  { id: "streak-7", cat: "consistency", icon: "🔥", title: "לוחם שבועי", desc: "רצף של 7 ימים", target: 7, progress: d => d.streak, check: d => d.streak >= 7 },
  { id: "streak-14", cat: "consistency", icon: "🔥", title: "חיה של שבועיים", desc: "רצף של 14 ימים", target: 14, progress: d => d.streak, check: d => d.streak >= 14 },
  { id: "streak-30", cat: "consistency", icon: "🔥", title: "מכונה חודשית", desc: "רצף של 30 ימים", target: 30, progress: d => d.streak, check: d => d.streak >= 30 },
  { id: "streak-60", cat: "consistency", icon: "🔥", title: "רצון ברזל", desc: "רצף של 60 ימים", target: 60, progress: d => d.streak, check: d => d.streak >= 60 },
  { id: "streak-100", cat: "consistency", icon: "🔥", title: "בלתי ניתן לעצירה", desc: "רצף של 100 ימים", target: 100, progress: d => d.streak, check: d => d.streak >= 100 },
  // כוח
  { id: "first-workout", cat: "strength", icon: "💪", title: "יום ראשון", desc: "תעד את האימון הראשון", target: 1, progress: d => d.totalWorkouts, check: d => d.totalWorkouts >= 1 },
  { id: "workouts-2", cat: "strength", icon: "💪", title: "חוזר לעוד", desc: "2 אימונים", target: 2, progress: d => d.totalWorkouts, check: d => d.totalWorkouts >= 2 },
  { id: "workouts-5", cat: "strength", icon: "💪", title: "שבוע ראשון בחדר", desc: "5 אימונים", target: 5, progress: d => d.totalWorkouts, check: d => d.totalWorkouts >= 5 },
  { id: "first-pr", cat: "strength", icon: "🏆", title: "דם ראשון", desc: "שבור שיא אישי ראשון", target: 1, progress: d => d.totalPRs, check: d => d.totalPRs >= 1 },
  { id: "pr-5", cat: "strength", icon: "🏆", title: "צייד שיאים", desc: "5 שיאים אישיים", target: 5, progress: d => d.totalPRs, check: d => d.totalPRs >= 5 },
  { id: "pr-10", cat: "strength", icon: "🏆", title: "מכונת שיאים", desc: "10 שיאים אישיים", target: 10, progress: d => d.totalPRs, check: d => d.totalPRs >= 10 },
  { id: "pr-25", cat: "strength", icon: "🏆", title: "אגדת שיאים", desc: "25 שיאים אישיים", target: 25, progress: d => d.totalPRs, check: d => d.totalPRs >= 25 },
  // צעדים
  { id: "steps-3k", cat: "steps", icon: "👟", title: "צעדים ראשונים", desc: "3,000 צעדים ביום", target: 3000, progress: d => d.todaySteps, check: d => d.todaySteps >= 3000 },
  { id: "steps-5k", cat: "steps", icon: "👟", title: "מתחילים לזוז", desc: "5,000 צעדים ביום", target: 5000, progress: d => d.todaySteps, check: d => d.todaySteps >= 5000 },
  { id: "steps-7k", cat: "steps", icon: "👟", title: "הולך יפה", desc: "7,000 צעדים ביום", target: 7000, progress: d => d.todaySteps, check: d => d.todaySteps >= 7000 },
  { id: "steps-10k", cat: "steps", icon: "👟", title: "אלוף הצעדים", desc: "10,000 צעדים ביום", target: 10000, progress: d => d.todaySteps, check: d => d.todaySteps >= 10000 },
  { id: "steps-15k", cat: "steps", icon: "👟", title: "רץ הכביש", desc: "15,000 צעדים ביום", target: 15000, progress: d => d.todaySteps, check: d => d.todaySteps >= 15000 },
  // משקל — תיעוד
  { id: "weight-first", cat: "weight", icon: "⚖️", title: "בדיקת משקל", desc: "תעד משקל ראשון", target: 1, progress: d => d.weightDays, check: d => d.weightDays >= 1 },
  { id: "weight-3", cat: "weight", icon: "⚖️", title: "שלושה ימים", desc: "תעד משקל 3 ימים", target: 3, progress: d => d.weightDays, check: d => d.weightDays >= 3 },
  { id: "weight-7", cat: "weight", icon: "⚖️", title: "שבוע על המשקל", desc: "תעד משקל 7 ימים", target: 7, progress: d => d.weightDays, check: d => d.weightDays >= 7 },
  { id: "weight-14", cat: "weight", icon: "⚖️", title: "שבועיים על המשקל", desc: "תעד משקל 14 ימים", target: 14, progress: d => d.weightDays, check: d => d.weightDays >= 14 },
  { id: "weight-30", cat: "weight", icon: "⚖️", title: "עוקב עקבי", desc: "תעד משקל 30 ימים", target: 30, progress: d => d.weightDays, check: d => d.weightDays >= 30 },
  // משקל — ירידה
  { id: "lose-0.5", cat: "weight", icon: "🔻", title: "ההתחלה", desc: "ירדת חצי קילו", target: 0.5, unit: "kg", progress: d => Math.round(d.weightLost * 10) / 10, check: d => d.weightLost >= 0.5 },
  { id: "lose-1", cat: "weight", icon: "🔻", title: "קילו ראשון", desc: "ירדת קילו", target: 1, unit: "kg", progress: d => Math.round(d.weightLost * 10) / 10, check: d => d.weightLost >= 1 },
  { id: "lose-2", cat: "weight", icon: "🔻", title: "בדרך הנכונה", desc: "ירדת 2 קילו", target: 2, unit: "kg", progress: d => Math.round(d.weightLost * 10) / 10, check: d => d.weightLost >= 2 },
  { id: "lose-3", cat: "weight", icon: "🔻", title: "שלושה למטה", desc: "ירדת 3 קילו", target: 3, unit: "kg", progress: d => Math.round(d.weightLost * 10) / 10, check: d => d.weightLost >= 3 },
  { id: "lose-5", cat: "weight", icon: "🏅", title: "יעד הושג!", desc: "ירדת 5 קילו", target: 5, unit: "kg", progress: d => Math.round(d.weightLost * 10) / 10, check: d => d.weightLost >= 5 },
  // תזונה
  { id: "meals-half", cat: "nutrition", icon: "🥗", title: "חצי יום", desc: "השלם 5 משימות ביום", target: 1, progress: d => d.halfDays, check: d => d.halfDays >= 1 },
  { id: "meals-perfect", cat: "nutrition", icon: "🥗", title: "יום מושלם", desc: "השלם את כל 10 המשימות", target: 1, progress: d => d.perfectDays, check: d => d.perfectDays >= 1 },
  { id: "meals-perfect-3", cat: "nutrition", icon: "🥗", title: "שלושה מושלמים", desc: "3 ימים מושלמים", target: 3, progress: d => d.perfectDays, check: d => d.perfectDays >= 3 },
  { id: "meals-week", cat: "nutrition", icon: "🥗", title: "שבוע מלא", desc: "7 ימים מושלמים", target: 7, progress: d => d.perfectDays, check: d => d.perfectDays >= 7 },
  { id: "meals-50", cat: "nutrition", icon: "🥗", title: "גיבור חצי הדרך", desc: "50 ימים מושלמים", target: 50, progress: d => d.perfectDays, check: d => d.perfectDays >= 50 },
  { id: "meals-100", cat: "nutrition", icon: "🥗", title: "מועדון המאה", desc: "100 ימים מושלמים", target: 100, progress: d => d.perfectDays, check: d => d.perfectDays >= 100 },
  // אבני דרך
  { id: "workouts-10", cat: "milestones", icon: "🎯", title: "רק מתחילים", desc: "10 אימונים", target: 10, progress: d => d.totalWorkouts, check: d => d.totalWorkouts >= 10 },
  { id: "workouts-50", cat: "milestones", icon: "🎯", title: "חולה חדר כושר", desc: "50 אימונים", target: 50, progress: d => d.totalWorkouts, check: d => d.totalWorkouts >= 50 },
  { id: "workouts-100", cat: "milestones", icon: "🎯", title: "ותיק הברזל", desc: "100 אימונים", target: 100, progress: d => d.totalWorkouts, check: d => d.totalWorkouts >= 100 },
  { id: "app-30", cat: "milestones", icon: "📅", title: "חודש ראשון", desc: "שימוש באפליקציה 30 ימים", target: 30, progress: d => d.totalDays, check: d => d.totalDays >= 30 }
];

const ACH_CATS = [
  { id: "consistency", label: "עקביות", icon: "🔥" },
  { id: "strength", label: "כוח", icon: "💪" },
  { id: "steps", label: "צעדים", icon: "👟" },
  { id: "weight", label: "משקל", icon: "⚖️" },
  { id: "nutrition", label: "תזונה", icon: "🥗" },
  { id: "milestones", label: "אבני דרך", icon: "🎯" }
];

function getWorkoutType(ds) {
  const dow = new Date(ds).getDay();
  return WORKOUT_DAYS[dow] || null;
}

// ── Shopping List ──
const SHOP_CATEGORIES = [
  { id: "produce", label: "ירקות ופירות", icon: "🥬", color: "#4caf50" },
  { id: "protein", label: "חלבונים", icon: "🥩", color: "#ef4444" },
  { id: "dairy", label: "מוצרי חלב", icon: "🧀", color: "#eab308" },
  { id: "grains", label: "פחמימות", icon: "🌾", color: "#ff9800" },
  { id: "snacks", label: "חטיפים ואחר", icon: "🥜", color: "#a855f7" }
];

// Quantities calculated for 2-week (14-day) meal plan cycle
// breakfast(1 green veg) + lunch(2 veg, 1 green) + dinner(2 veg) = 5 veggies/day
// 3 protein options rotate: cottage / white cheese / tuna+egg (each ~5x per 14 days)
// yogurt: snack + night = 2/day, grains: 200g/day for lunch
const SHOP_ITEMS = [
  // Produce: 5 veggies/day × 14 = 70 total
  { id: "s-green-veg", label: "ירקות ירוקים", qty: "~35", cat: "produce" },
  { id: "s-vegetables", label: "ירקות (מלפפון, עגבניה, פלפל)", qty: "~40", cat: "produce" },
  { id: "s-fruit", label: "פרי", qty: "14", cat: "produce" },
  { id: "s-banana", label: "בננה", qty: "10", cat: "produce" },
  { id: "s-avocado", label: "אבוקדו", qty: "7", cat: "produce" },

  // Protein: lunch 250g/day rotating chicken/fish
  { id: "s-chicken", label: "עוף / הודו", qty: "2.5 ק״ג", cat: "protein" },
  { id: "s-fish", label: "דג / סלמון", qty: "1.5 ק״ג", cat: "protein" },
  { id: "s-eggs", label: "ביצים", qty: "2 תבניות (24)", cat: "protein" },
  { id: "s-tuna", label: "טונה (קופסאות)", qty: "10 קופסאות", cat: "protein" },
  { id: "s-protein-powder", label: "אבקת חלבון", qty: "1 אריזה", cat: "protein" },

  // Dairy: each option ~5x breakfast + ~5x dinner, yogurt 2/day
  { id: "s-cottage", label: 'קוטג׳ 2%', qty: "10", cat: "dairy" },
  { id: "s-white-cheese", label: "גבינה לבנה", qty: "7", cat: "dairy" },
  { id: "s-protein-yogurt", label: "יוגורט חלבון", qty: "28", cat: "dairy" },
  { id: "s-milk", label: "חלב", qty: "3 ליטר", cat: "dairy" },

  // Grains: breakfast+dinner bread/rice cakes, lunch 200g/day = 2.8kg
  { id: "s-bread", label: "לחם מלא", qty: "3 כיכרות", cat: "grains" },
  { id: "s-rice-cakes", label: "פריכיות אורז", qty: "4 חבילות", cat: "grains" },
  { id: "s-rice", label: "אורז", qty: "1 ק״ג", cat: "grains" },
  { id: "s-bulgur", label: "בורגול", qty: "500 גרם", cat: "grains" },
  { id: "s-buckwheat", label: "כוסמת", qty: "500 גרם", cat: "grains" },
  { id: "s-quinoa", label: "קינואה", qty: "500 גרם", cat: "grains" },
  { id: "s-lentils", label: "עדשים", qty: "500 גרם", cat: "grains" },

  // Snacks & other
  { id: "s-dates", label: "תמרים", qty: "2 חבילות (1 ק״ג)", cat: "snacks" },
  { id: "s-almonds", label: "שקדים", qty: "1 חבילה (400 גרם)", cat: "snacks" },
  { id: "s-walnuts", label: "אגוזי מלך", qty: "1 חבילה (300 גרם)", cat: "snacks" },
  { id: "s-snack-bar", label: "חטיף עד 100 קל׳", qty: "14", cat: "snacks" },
  { id: "s-tahini", label: "טחינה", qty: "1 צנצנת", cat: "snacks" },
  { id: "s-peanut-butter", label: "חמאת בוטנים", qty: "1 צנצנת", cat: "snacks" },
  { id: "s-coffee", label: "קפה", qty: "2 חבילות", cat: "snacks" }
];

// Shopping cycle: every 2 weeks starting 2026-04-05 (next Sunday)
const SHOP_CYCLE_START = "2026-04-05";
function isShoppingDay(ds) {
  const diff = Math.floor((new Date(ds) - new Date(SHOP_CYCLE_START)) / 864e5);
  return diff >= 0 && diff % 14 === 0;
}

// ── Helpers ──
// "Effective today" — before 5 AM counts as yesterday
function effectiveNow() {
  const now = new Date();
  if (now.getHours() < 5) {
    now.setDate(now.getDate() - 1);
  }
  return now;
}
function dateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function dayName(d) { return DAYS[d.getDay()]; }
function cycleType(ds) {
  const diff = Math.floor((new Date(ds) - new Date(START)) / 864e5);
  return CYCLE[((diff % 6) + 6) % 6];
}
const AEROBIC_DAYS = ["upper", "chestBack", "shouldersArms"];
function hasAerobic(ds) {
  return AEROBIC_DAYS.includes(cycleType(ds));
}

// ── IndexedDB ──
const DB_NAME = "fittrack";
const DB_VER = 2;
let db = null;

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, DB_VER);
    r.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains("days")) d.createObjectStore("days", { keyPath: "date" });
      if (!d.objectStoreNames.contains("photos")) {
        const ps = d.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
        ps.createIndex("date", "date", { unique: false });
      }
    };
    r.onsuccess = e => { db = e.target.result; res(db); };
    r.onerror = e => rej(e);
  });
}

function dbGet(date) {
  return new Promise((res, rej) => {
    const tx = db.transaction("days", "readonly");
    const s = tx.objectStore("days");
    const r = s.get(date);
    r.onsuccess = () => res(r.result || null);
    r.onerror = e => rej(e);
  });
}

function dbPut(data) {
  return new Promise((res, rej) => {
    const tx = db.transaction("days", "readwrite");
    const s = tx.objectStore("days");
    const r = s.put(data);
    r.onsuccess = () => res();
    r.onerror = e => rej(e);
  });
}

function dbGetAll() {
  return new Promise((res, rej) => {
    const tx = db.transaction("days", "readonly");
    const s = tx.objectStore("days");
    const r = s.getAll();
    r.onsuccess = () => res(r.result || []);
    r.onerror = e => rej(e);
  });
}

// ── Photos DB ──
function photoAdd(blob, date) {
  return new Promise((res, rej) => {
    const tx = db.transaction("photos", "readwrite");
    const s = tx.objectStore("photos");
    const r = s.put({ date, blob, timestamp: Date.now() });
    r.onsuccess = () => res(r.result);
    r.onerror = e => rej(e);
  });
}

function photoGetAll() {
  return new Promise((res, rej) => {
    const tx = db.transaction("photos", "readonly");
    const s = tx.objectStore("photos");
    const r = s.getAll();
    r.onsuccess = () => {
      const photos = r.result || [];
      photos.sort((a, b) => a.timestamp - b.timestamp);
      res(photos);
    };
    r.onerror = e => rej(e);
  });
}

function photoDelete(id) {
  return new Promise((res, rej) => {
    const tx = db.transaction("photos", "readwrite");
    const s = tx.objectStore("photos");
    const r = s.delete(id);
    r.onsuccess = () => res();
    r.onerror = e => rej(e);
  });
}

// Track object URLs for cleanup
let _photoURLs = [];
function revokePhotoURLs() {
  _photoURLs.forEach(u => URL.revokeObjectURL(u));
  _photoURLs = [];
}

// Scroll position saved at interaction time, survives across async renders
let _pendingScroll = null;

// ── Shopping Persistence ──
function loadShopping() {
  try {
    const raw = localStorage.getItem("fittrack_shopping");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { checked: {}, customItems: [] };
}
function saveShopping() {
  localStorage.setItem("fittrack_shopping", JSON.stringify(state.shopping));
}


// ── State ──
let state = {
  date: effectiveNow(),
  view: "today",
  dayData: null,
  weightHistory: [],
  showDetail: null,
  editingNote: null,
  noteText: "",
  weightInput: "",
  streak: 0,
  slideDirection: null,
  animateItems: true,
  lastToggled: null,
  notificationsEnabled: localStorage.getItem("fittrack_notif") === "true",
  shopping: loadShopping(),
  shopInput: "",
  shopCat: "produce",
  photos: [],
  photoIdx: 0
};

// ── Push Notifications (server-based) ──
const PUSH_SERVER = localStorage.getItem("fittrack_push_server") || "https://fittrack-push.onrender.com";
const VAPID_PUBLIC_KEY = "BEpcnuPgSWSR9s-QkFhWHmdr2V0xMQexnN2fyx1MHgLAL2DfRWg58H6jEVX6ZjklSgjTi7JYjye1UEc3lWsxv1I";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function toggleNotifications() {
  if (!state.notificationsEnabled) {
    const isStandalone = window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS && !isStandalone) {
      alert("כדי לקבל התראות באייפון:\n1. לחץ על כפתור השיתוף (⬆️)\n2. בחר ״הוסף למסך הבית״\n3. פתח את האפליקציה מהמסך הראשי\n4. לחץ שוב על 🔔");
      return;
    }

    if (!("Notification" in window)) {
      alert("הדפדפן לא תומך בהתראות");
      return;
    }
    if (!("serviceWorker" in navigator)) {
      alert("Service Worker לא זמין");
      return;
    }

    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      alert("ההתראות נחסמו. אפשר אותן בהגדרות הדפדפן/מכשיר");
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;

      if (!reg.pushManager) {
        alert("Push API לא זמין במכשיר זה");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      const resp = await fetch(PUSH_SERVER + "/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub)
      });

      if (!resp.ok) throw new Error("Server returned " + resp.status);

      state.notificationsEnabled = true;
      localStorage.setItem("fittrack_notif", "true");
    } catch (err) {
      console.error("Push subscription failed:", err);
      alert("שגיאה בהרשמה להתראות:\n" + err.message);
    }
  } else {
    // Turning off — unsubscribe
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch(PUSH_SERVER + "/api/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint })
        });
        await sub.unsubscribe();
      }
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    }
    state.notificationsEnabled = false;
    localStorage.setItem("fittrack_notif", "false");
  }
  render();
}

// Re-subscribe on load if notifications were enabled (ensures subscription stays active)
async function ensurePushSubscription() {
  if (!state.notificationsEnabled) return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }
    // Re-register with server (in case it lost the subscription)
    fetch(PUSH_SERVER + "/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub)
    }).catch(() => {});
  } catch (err) {
    console.error("Push re-subscribe failed:", err);
  }
}

function defaultDay(ds) {
  return { date: ds, completed: {}, notes: {}, weight: "", workoutType: cycleType(ds), hasAerobic: hasAerobic(ds) };
}

// ── Data ops ──
async function loadDay() {
  const ds = dateStr(state.date);
  const data = await dbGet(ds);
  state.dayData = data || defaultDay(ds);
  // Always recalculate workout type from cycle — START is the source of truth
  state.dayData.workoutType = cycleType(ds);
  state.dayData.hasAerobic = hasAerobic(ds);
  render();
}

async function saveDay() {
  await dbPut(state.dayData);
  await calculateStreak();
  render();
  checkAchievements();
}

async function loadPhotos() {
  state.photos = await photoGetAll();
}

function capturePhoto() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment";
  input.onchange = async () => {
    try {
      const file = input.files[0];
      if (!file) return;
      const blob = await compressImage(file, 1200, 0.7);
      await photoAdd(blob, dateStr(effectiveNow()));
      await loadPhotos();
      state.photoIdx = Math.max(0, state.photos.length - 1);
      state.view = "photos";
      render();
    } catch (e) {
      console.error("Photo capture error:", e);
      alert("שגיאה בשמירת התמונה. נסה שוב.");
    }
  };
  input.click();
}

function compressImage(file, maxSize, quality) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
          else { w = Math.round(w * maxSize / h); h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => {
          if (blob) res(blob);
          else rej(new Error("Canvas toBlob failed"));
        }, "image/jpeg", quality);
      };
      img.onerror = () => rej(new Error("Image load failed"));
      img.src = reader.result;
    };
    reader.onerror = () => rej(new Error("FileReader failed"));
    reader.readAsDataURL(file);
  });
}

async function deletePhoto(id) {
  if (!confirm("למחוק את התמונה?")) return;
  await photoDelete(id);
  await loadPhotos();
  if (state.photoIdx >= state.photos.length) state.photoIdx = Math.max(0, state.photos.length - 1);
  render();
}

function photoNav(dir) {
  state.photoIdx = Math.max(1, Math.min(state.photos.length - 1, state.photoIdx + dir));
  render();
}

async function loadWeights() {
  const all = await dbGetAll();
  state.weightHistory = all
    .filter(d => d.weight)
    .map(d => ({ date: d.date, weight: parseFloat(d.weight) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ── Streak ──
async function calculateStreak() {
  const all = await dbGetAll();
  const completionMap = new Map();
  all.forEach(day => {
    const count = Object.values(day.completed || {}).filter(Boolean).length;
    completionMap.set(day.date, count >= SCHEDULE.length);
  });

  let streak = 0;
  const today = effectiveNow();
  const d = new Date(today);

  // Check if today is complete — if so, count it
  const todayStr = dateStr(d);
  if (completionMap.get(todayStr)) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  // Walk backwards
  while (true) {
    const ds = dateStr(d);
    if (completionMap.get(ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  state.streak = streak;
}

// ── Actions ──
function saveScrollPosition() {
  const el = document.getElementById("content-root");
  if (el) _pendingScroll = el.scrollTop;
}

function toggleComplete(id) {
  saveScrollPosition();
  state.dayData.completed[id] = !state.dayData.completed[id];
  state.lastToggled = id;

  const completedCount = SCHEDULE.filter(s => state.dayData.completed[s.id]).length;
  const justCompleted = state.dayData.completed[id] && completedCount === SCHEDULE.length;

  saveDay().then(() => {
    if (justCompleted) fireConfetti();
  });
}

function saveNote(id) {
  saveScrollPosition();
  state.dayData.notes[id] = state.noteText;
  state.editingNote = null;
  state.noteText = "";
  saveDay();
}

async function saveWeight() {
  if (!state.weightInput) return;
  saveScrollPosition();
  state.dayData.weight = state.weightInput;
  state.weightInput = "";
  state.weightJustSaved = true;
  state.editingWeight = false;
  await dbPut(state.dayData);
  await loadWeights();
  render();
}

function editWeight() {
  saveScrollPosition();
  state.weightInput = state.dayData.weight || "";
  state.editingWeight = true;
  render();
  setTimeout(() => { const el = document.getElementById("weightIn"); if (el) el.focus(); }, 50);
}

async function removeWeight() {
  if (!confirm('למחוק את המשקל של היום?')) return;
  saveScrollPosition();
  state.dayData.weight = "";
  state.editingWeight = false;
  await dbPut(state.dayData);
  await loadWeights();
  render();
}

function changeDate(off) {
  _pendingScroll = null; // new day = scroll to top
  state.animateItems = true;
  state.slideDirection = off > 0 ? "left" : "right";
  const d = new Date(state.date);
  d.setDate(d.getDate() + off);
  state.date = d;
  state.showDetail = null;
  state.editingNote = null;
  loadDay();
}

function goToday() {
  _pendingScroll = null; // new day = scroll to top
  state.animateItems = true;
  state.slideDirection = null;
  state.date = effectiveNow();
  state.showDetail = null;
  state.editingNote = null;
  loadDay();
}

// ── Swipe ──
function initSwipe() {
  let startX = 0, startY = 0;
  const el = document.getElementById("app");

  el.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  el.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      // RTL: swipe right = previous day, swipe left = next day
      changeDate(dx > 0 ? -1 : 1);
    }
  }, { passive: true });
}

// ── Confetti ──
function fireConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#4caf50", "#3b82f6", "#ff9800", "#eab308", "#ef4444", "#a855f7", "#60a5fa", "#66bb6a"];
  const particles = [];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 8,
      vy: -(Math.random() * 14 + 8),
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      life: 1,
      decay: Math.random() * 0.015 + 0.008,
      shape: Math.random() > 0.5 ? "rect" : "circle"
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      if (p.life <= 0) return;
      alive = true;
      p.x += p.vx;
      p.vy += 0.3; // gravity
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.life -= p.decay;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;

      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (alive) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(animate);
}

// ── Render ──
function render() {
  const ds = dateStr(state.date);
  const ct = state.dayData.workoutType || cycleType(ds);
  const aero = state.dayData.hasAerobic !== undefined ? state.dayData.hasAerobic : hasAerobic(ds);
  const isRest = ct === "rest";
  const d = state.dayData;
  if (!d) return;

  const completed = SCHEDULE.filter(s => d.completed[s.id]).length;
  const total = SCHEDULE.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const isComplete = pct === 100;
  const isToday = dateStr(state.date) === dateStr(effectiveNow());

  // Header — rendered into permanent #header-root
  const bellIcon = state.notificationsEnabled ? "🔔" : "🔕";
  const headerHtml = `<div class="header-inner">
    <div class="header-top">
      <button class="notif-toggle ${state.notificationsEnabled ? "on" : ""}" onclick="toggleNotifications()" title="התראות">${bellIcon}</button>
      <div class="logo"><span>FIT</span><span>TRACK</span></div>
    </div>
    <div class="tabs">
      <button class="tab ${state.view === "today" ? "active" : ""}" onclick="setState('view','today')">📋 יומי</button>
      <button class="tab ${state.view === "weight" ? "active" : ""}" onclick="setState('view','weight');loadWeights().then(render)">⚖️ משקל</button>
      <button class="tab ${state.view === "workout" ? "active" : ""}" onclick="setState('view','workout');loadWorkoutHistory().then(render)">🏋️ אימון</button>
      <button class="tab ${state.view === "shopping" ? "active" : ""}" onclick="setState('view','shopping')">🛒 קניות</button>
      <button class="tab ${state.view === "photos" ? "active" : ""}" onclick="setState('view','photos');loadPhotos().then(render)">📸 תמונות</button>
    </div>
  </div>`;

  // Determine slide class
  const slideClass = state.slideDirection === "left" ? "slide-in-left" : state.slideDirection === "right" ? "slide-in-right" : "";
  state.slideDirection = null;

  // Tab enter animation
  const tabEnter = state.animateItems ? " tab-enter" : "";

  let html = "";

  if (state.view === "today") {
    // Date nav
    html += `<div class="date-nav">
      <button onclick="changeDate(-1)">→</button>
      <div class="date-center"><h2>יום ${dayName(state.date)}</h2><div class="sub">${ds}</div></div>
      <button onclick="changeDate(1)">←</button>
    </div>`;

    // Today button
    html += `<div class="today-row">
      <button class="today-btn ${isToday ? "hidden" : ""}" onclick="goToday()">📅 היום</button>
    </div>`;

    // Streak
    if (state.streak > 0) {
      const milestones = [5, 10, 25, 50, 100];
      const isMilestone = milestones.includes(state.streak);
      const milestoneClass = isMilestone ? " streak-milestone" : "";
      html += `<div class="streak-row">
        <div class="streak-badge${milestoneClass}" id="streak-badge">
          <span class="fire">🔥</span>
          <span>${state.streak} ימים ברצף${isMilestone ? " 🏆" : ""}</span>
        </div>
      </div>`;
    }

    // Shopping day reminder (every 2 weeks)
    if (isShoppingDay(ds)) {
      html += `<div class="shop-reminder fade-up" onclick="setState('view','shopping')">
        <span class="shop-reminder-icon">🛒</span>
        <div><div class="shop-reminder-title">יום קניות!</div><div class="shop-reminder-sub">הגיע הזמן להשלים את רשימת הקניות לשבועיים</div></div>
      </div>`;
    }

    // Friday photo reminder
    if (new Date(ds).getDay() === 5) {
      html += `<div class="photo-reminder fade-up" onclick="setState('view','photos');loadPhotos().then(()=>{capturePhoto()})">
        <span class="photo-reminder-icon">📸</span>
        <div><div class="photo-reminder-title">תמונת התקדמות</div><div class="photo-reminder-sub">יום שישי — הגיע הזמן לתעד את ההתקדמות!</div></div>
      </div>`;
    }

    // Badges (tap to open workout type selector)
    const bounceClass = state.badgeBounce ? " badge-bounce" : "";
    html += `<div class="badges">
      <div class="badge ${isRest ? "badge-rest" : "badge-workout"} badge-tap${bounceClass}" onclick="toggleWorkoutPicker()">
        <span style="font-size:18px">${CYCLE_EMOJI[ct]}</span>
        ${isRest ? "יום מנוחה" : "אימון " + CYCLE_LABELS[ct]}
        <span class="badge-edit">▼</span>
      </div>
      ${aero && !isRest ? `<div class="badge badge-aerobic"><span>🏃</span> 30 דק׳ אירובי</div>` : ""}
    </div>`;

    // Workout type picker dropdown
    if (state.showWorkoutPicker) {
      html += `<div class="wo-picker">`;
      CYCLE.forEach(type => {
        const active = ct === type ? " wo-picker-active" : "";
        html += `<div class="wo-picker-item${active}" onclick="selectWorkoutType('${type}')">
          <span>${CYCLE_EMOJI[type]}</span>
          <span>${type === "rest" ? "יום מנוחה" : CYCLE_LABELS[type]}</span>
        </div>`;
      });
      html += `</div>`;
    }

    // Progress
    html += `<div class="progress-box ${isComplete ? "complete" : ""}">
      <div class="progress-top"><span class="progress-label">התקדמות יומית</span><span class="progress-val" style="color:${isComplete ? "var(--green)" : "var(--text)"}">${completed}/${total} ${isComplete ? "✅" : ""}</span></div>
      <div class="progress-bar"><div class="progress-fill ${isComplete ? "complete" : ""}" style="width:${pct}%;background:${isComplete ? "linear-gradient(90deg,#4caf50,#66bb6a)" : "linear-gradient(90deg,#3b82f6,#60a5fa)"}"></div></div>
    </div>`;

    // Weight input
    const weightSavedClass = state.weightJustSaved ? " weight-saved" : "";
    const savedIndicator = state.weightJustSaved ? `<span class="saved-check">✓</span>` : "";
    if (d.weight && !state.editingWeight) {
      html += `<div class="weight-box${weightSavedClass}">
        <span style="font-size:18px">⚖️</span>
        <span class="weight-display">${d.weight} ק"ג</span>
        <button class="weight-edit-btn" onclick="editWeight()">✏️</button>
        <button class="weight-delete-btn" onclick="removeWeight()">🗑️</button>
        ${savedIndicator}
      </div>`;
    } else {
      html += `<div class="weight-box${weightSavedClass}">
        <span style="font-size:18px">⚖️</span>
        <input type="number" step="0.1" id="weightIn" placeholder="משקל בוקר" value="${state.weightInput}" oninput="state.weightInput=this.value;updateWeightBtn()">
        <button class="weight-btn ${state.weightInput ? "ready" : "idle"}" id="weightBtn" onclick="saveWeight()">שמור</button>
        ${savedIndicator}
      </div>`;
    }

    // Timeline
    html += `<div class="timeline">`;
    if (isToday) {
      html += `<div class="now-marker" id="now-marker">
        <span class="now-marker-label"></span>
        <div class="now-marker-line"></div>
        <div class="now-marker-dot"></div>
      </div>`;
    }
    SCHEDULE.forEach((item, idx) => {
      const done = d.completed[item.id];
      const note = d.notes[item.id];
      const col = CAT_COLORS[item.cat];
      const open = state.showDetail === item.id;
      const editing = state.editingNote === item.id;
      const isW = item.id === "workout";
      const wDetail = isW
        ? (isRest ? "יום מנוחה — אין אימון היום" : `אימון ${CYCLE_LABELS[ct]}${aero ? " + 30 דק׳ אירובי (דופק 130-140)" : ""}\nסדר: משקולות ← אירובי`)
        : item.detail;

      html += `<div class="tl-item${state.animateItems ? " fade-up" : ""}" style="${state.animateItems ? "animation-delay:" + (idx * 0.03) + "s" : ""}">
        <div class="tl-dot">
          <div class="check${done ? " on" : ""}" data-check-id="${item.id}" onclick="toggleComplete('${item.id}')" style="background:${done ? col.accent : "rgba(255,255,255,0.04)"};border:2px solid ${done ? col.accent : "rgba(255,255,255,0.1)"}">
            ${done ? "✓" : ""}
          </div>
        </div>
        <div class="tl-card ${done ? "done" : ""}" onclick="toggleDetail('${item.id}')" style="background:${col.bg};border:1px solid ${done ? col.accent + "40" : col.border}">
          <div class="tl-card-top">
            <div class="tl-card-main">
              <span class="tl-card-icon">${item.icon}</span>
              <div>
                <div class="tl-card-label ${done ? "done" : ""}">${item.label}</div>
                ${isW && !isRest ? `<span class="tl-card-badge" style="color:${col.accent};background:${col.accent}15">${CYCLE_LABELS[ct]}${aero ? " + אירובי" : ""}</span>` : ""}
              </div>
            </div>
            <span class="tl-card-time">${item.time}</span>
          </div>
          ${open && wDetail ? `<div class="detail-box">${wDetail.replace(/\n/g, "<br>")}</div>` : ""}
          ${note ? `<div class="note-display">📝 ${note}</div>` : ""}
          ${open ? `<div class="note-actions">
            <button onclick="event.stopPropagation();startEdit('${item.id}','${(note || "").replace(/'/g, "\\'")}')">${note ? "✏️ ערוך הערה" : "📝 הוסף הערה"}</button>
          </div>` : ""}
          ${editing ? `<div class="note-edit" onclick="event.stopPropagation()">
            <input id="noteInput" value="${state.noteText.replace(/"/g, "&quot;")}" oninput="state.noteText=this.value" onkeydown="if(event.key==='Enter')saveNote('${item.id}')" placeholder="מה שינית? (למשל: אכלתי טונה במקום עוף)">
            <div class="note-edit-btns">
              <button class="note-save" onclick="saveNote('${item.id}')">שמור</button>
              <button onclick="state.editingNote=null;state.noteText='';render()">ביטול</button>
            </div>
          </div>` : ""}
        </div>
      </div>`;
    });
    html += `</div>`;

    // Steps
    html += `<div class="steps-box" id="steps-box">
      <span class="steps-icon">👟</span>
      <div class="steps-info">
        <div class="steps-label">צעדים היום</div>
        <div class="steps-val" id="steps-val">—</div>
      </div>
      <button class="steps-sync-btn" onclick="event.stopPropagation();syncSteps()">🔄 סנכרון</button>
    </div>`;

    // Achievements summary
    const unlocked = loadUnlocked();
    const unlockedCount = ACHIEVEMENTS.filter(a => unlocked[a.id]).length;
    const totalAch = ACHIEVEMENTS.length;
    const achPct = Math.round((unlockedCount / totalAch) * 100);
    html += `<div class="ach-section">
      <div class="ach-summary" onclick="state.showAchievements=!state.showAchievements;render()">
        <div class="ach-summary-left">
          <span class="ach-summary-icon">🏆</span>
          <span class="ach-summary-text">הישגים ${unlockedCount}/${totalAch}</span>
        </div>
        <span class="ach-summary-arrow">${state.showAchievements ? "▲" : "▼"}</span>
      </div>
      <div class="ach-summary-bar"><div class="ach-summary-fill" style="width:${achPct}%"></div></div>`;

    if (state.showAchievements) {
      html += `<div class="ach-list">`;
      const achData = state._achData || { streak: state.streak, totalWorkouts: 0, perfectDays: 0, halfDays: 0, weightDays: 0, totalPRs: parseInt(unlocked._prCount || "0"), weightLost: 0, todaySteps: 0, totalDays: 0 };
      const allAchs = [...ACHIEVEMENTS].sort((a, b) => {
        const aUnlocked = unlocked[a.id] ? 1 : 0;
        const bUnlocked = unlocked[b.id] ? 1 : 0;
        if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
        const aP = a.progress ? a.progress(achData) / a.target : 0;
        const bP = b.progress ? b.progress(achData) / b.target : 0;
        return bP - aP;
      });
      allAchs.forEach(ach => {
        const isUnlocked = !!unlocked[ach.id];
        const prog = isUnlocked ? ach.target : (ach.progress ? Math.min(ach.progress(achData), ach.target) : 0);
        const pct = Math.round((prog / ach.target) * 100);
        html += `<div class="ach-card ${isUnlocked ? "ach-unlocked" : "ach-locked"}">
          <div class="ach-card-icon">${ach.icon}</div>
          <div class="ach-card-info">
            <div class="ach-card-title">${ach.title}</div>
            <div class="ach-card-desc">${ach.desc}</div>
            ${!isUnlocked ? `<div class="ach-card-bar"><div class="ach-card-fill" style="width:${pct}%"></div></div>
            <div class="ach-card-prog">${prog}/${ach.target}${ach.unit ? " " + ach.unit : ""}</div>` : `<div class="ach-card-date">הושג ${unlocked[ach.id]}</div>`}
          </div>
        </div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;

    // Water
    html += `<div class="water-box">
      <span class="icon">💧</span>
      <div><div class="title">תזכורת מים</div><div class="sub">לפחות 3 ליטר + 500-750 מ"ל על שעת אימון</div></div>
    </div>`;

    // Data backup
    html += `<div class="backup-box">
      <button class="backup-btn" onclick="exportData()">💾 גיבוי נתונים</button>
      <button class="backup-btn backup-import" onclick="importData()">📂 ייבוא גיבוי</button>
    </div>`;

  } else if (state.view === "weight") {
    // Weight view
    html += `<div class="weight-view"><h2>⚖️ מעקב משקל</h2>`;
    const wh = state.weightHistory;
    if (wh.length === 0) {
      html += `<div class="empty-state"><div class="icon">⚖️</div><div style="font-size:15px">עדיין אין נתוני משקל</div><div style="font-size:13px;margin-top:6px">הזן את המשקל שלך בתצוגה היומית</div></div>`;
    } else {
      // Chart
      html += `<div class="chart-box stagger-in" style="animation-delay:0.05s">`;
      const data = wh.slice(-30);
      if (data.length < 2) {
        html += `<div style="color:var(--text3);text-align:center;padding:20px">צריך לפחות 2 מדידות לגרף</div>`;
      } else {
        const mn = Math.min(...data.map(d => d.weight)) - 1;
        const mx = Math.max(...data.map(d => d.weight)) + 1;
        const rng = mx - mn || 1;
        const w = 520, h = 180;
        const pts = data.map((d, i) => ({ x: (i / (data.length - 1)) * (w - 60) + 40, y: h - 20 - ((d.weight - mn) / rng) * (h - 40), ...d }));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
        const area = `${path} L${pts[pts.length - 1].x},${h - 20} L${pts[0].x},${h - 20} Z`;
        let svg = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto">`;
        [0, .25, .5, .75, 1].forEach(f => {
          const y = h - 20 - f * (h - 40);
          const v = (mn + f * rng).toFixed(1);
          svg += `<line x1="40" y1="${y}" x2="${w - 20}" y2="${y}" stroke="rgba(255,255,255,0.05)"/>`;
          svg += `<text x="35" y="${y + 4}" fill="#64748b" font-size="10" text-anchor="end" font-family="Heebo">${v}</text>`;
        });
        svg += `<defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4caf50" stop-opacity="0.3"/><stop offset="100%" stop-color="#4caf50" stop-opacity="0"/></linearGradient></defs>`;
        // Calculate path length for draw animation
        let pathLen = 0;
        for (let i = 1; i < pts.length; i++) {
          pathLen += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y);
        }
        svg += `<path d="${area}" fill="url(#ag)" class="chart-area-animated"/>`;
        svg += `<path d="${path}" fill="none" stroke="#4caf50" stroke-width="2.5" stroke-linejoin="round" class="chart-line-animated" style="stroke-dasharray:${pathLen};--path-length:${pathLen}"/>`;
        pts.forEach((p, i) => {
          svg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#0a0e17" stroke="#4caf50" stroke-width="2" class="chart-dot-animated" style="animation-delay:${0.3 + i * 0.08}s"/>`;
          if (i === 0 || i === pts.length - 1) svg += `<text x="${p.x}" y="${p.y - 10}" fill="#e2e8f0" font-size="11" text-anchor="middle" font-weight="600" font-family="Heebo" class="chart-dot-animated" style="animation-delay:${0.3 + i * 0.08}s">${p.weight}</text>`;
        });
        svg += `</svg>`;
        html += svg;
      }
      html += `</div>`;

      // Stats
      if (wh.length >= 2) {
        const first = wh[0].weight, last = wh[wh.length - 1].weight, diff = (last - first).toFixed(1);
        const diffColor = parseFloat(diff) <= 0 ? "var(--green)" : "var(--red)";
        html += `<div class="stats-grid">
          <div class="stat-card stagger-in" style="animation-delay:0.1s"><div class="stat-label">התחלה</div><div class="stat-val" style="color:var(--text2)">${first}</div><div class="stat-unit">ק"ג</div></div>
          <div class="stat-card stagger-in" style="animation-delay:0.2s"><div class="stat-label">נוכחי</div><div class="stat-val">${last}</div><div class="stat-unit">ק"ג</div></div>
          <div class="stat-card stagger-in" style="animation-delay:0.3s"><div class="stat-label">שינוי</div><div class="stat-val" style="color:${diffColor}">${diff}</div><div class="stat-unit">ק"ג</div></div>
        </div>`;
      }

      // History
      html += `<div class="history-list stagger-in" style="animation-delay:0.4s">`;
      wh.slice().reverse().forEach(e => {
        html += `<div class="history-item"><span class="history-date">${e.date}</span><span class="history-weight">${e.weight} ק"ג</span></div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
  } else if (state.view === "workout") {
    // Workout view — follows the badge workout type
    // Use badge type if set, otherwise fall back to day-of-week
    const wType = d.workoutType === "rest" ? null : (d.workoutType && WORKOUTS[d.workoutType]) ? d.workoutType : getWorkoutType(ds);
    html += `<div class="workout-view">`;

    if (!wType) {
      html += `<div class="wo-rest"><div class="wo-rest-icon">😴</div><div class="wo-rest-title">Rest Day</div><div class="wo-rest-sub">No workout today</div></div>`;
    } else {
      const wo = WORKOUTS[wType];
      html += `<h2 class="wo-title">${wo.icon} ${wo.label}</h2>`;

      const log = d.workoutLog || {};
      const todayPRs = getTodayPRs();

      wo.groups.forEach((group, gIdx) => {
        html += `<div class="wo-group stagger-in" style="animation-delay:${gIdx * 0.06}s">`;

        group.exercises.forEach(ex => {
          const sets = log[ex.id] || [];
          const last = getLastSession(ex.id);
          const lastStr = last ? last.map(s => s.weight + "×" + s.reps).join(", ") : "—";
          const targetSets = ex.sets;

          // Ensure we show at least the target number of set rows
          const displaySets = [];
          for (let i = 0; i < Math.max(targetSets, sets.length); i++) {
            displaySets.push(sets[i] || { weight: "", reps: "" });
          }

          const isPR = todayPRs.has(ex.id);
          const allTimePR = getExercisePR(ex.id);

          html += `<div class="wo-exercise ${isPR ? "wo-exercise-pr" : ""}">
            <div class="wo-ex-header">
              <div class="wo-ex-name">${ex.label} ${ex.info ? `<button class="wo-info-btn" onclick="event.stopPropagation();showExInfo('${ex.id}')">ⓘ</button>` : ""} ${isPR ? `<span class="wo-pr-badge">🏆 PR!</span>` : ""}</div>
              <div class="wo-ex-target">${ex.sets} × ${ex.reps}</div>
            </div>
            <div class="wo-ex-sub">${ex.sub}</div>
            <div class="wo-ex-last">Last: <span class="wo-ex-last-val">${lastStr}</span>${allTimePR > 0 ? ` · Best: <span class="wo-ex-pr-val">${allTimePR} kg</span>` : ""}</div>`;

          displaySets.forEach((s, sIdx) => {
            html += `<div class="wo-set-row">
              <span class="wo-set-num">${sIdx + 1}</span>
              <input type="number" class="wo-input" placeholder="kg" value="${s.weight}" oninput="saveWorkoutSet('${ex.id}',${sIdx},'weight',this.value)">
              <span class="wo-x">×</span>
              <input type="number" class="wo-input" placeholder="reps" value="${s.reps}" oninput="saveWorkoutSet('${ex.id}',${sIdx},'reps',this.value)">
            </div>`;
          });

          html += `<div class="wo-set-actions">
              <button class="wo-add-set" onclick="addWorkoutSet('${ex.id}')">+ Set</button>
              ${sets.length > targetSets ? `<button class="wo-rm-set" onclick="removeWorkoutSet('${ex.id}')">− Set</button>` : ""}
            </div>`;
          html += `</div>`;
        });

        html += `</div>`;
      });

      // Progression chart section
      const allExercises = wo.groups.flatMap(g => g.exercises);
      const selEx = state.woChartEx || allExercises[0].id;
      html += `<div class="wo-progression stagger-in" style="animation-delay:0.4s">
        <h3 class="wo-prog-title">📈 Progression</h3>
        <select class="wo-prog-select" onchange="state.woChartEx=this.value;renderWorkoutChart()">
          ${allExercises.map(ex => `<option value="${ex.id}" ${selEx === ex.id ? "selected" : ""}>${ex.label}</option>`).join("")}
        </select>
        <div class="wo-chart-box" id="wo-chart"></div>
      </div>`;
    }

    html += `</div>`;

  } else if (state.view === "shopping") {
    // Shopping list view
    const sh = state.shopping;
    const allItems = [...SHOP_ITEMS, ...sh.customItems];
    const checkedCount = Object.keys(sh.checked).length;
    const totalCount = allItems.length;

    html += `<div class="shop-view">`;
    html += `<div class="shop-header">
      <h2>🛒 רשימת קניות</h2>
      <div class="shop-header-right">
        <span class="shop-counter">${checkedCount}/${totalCount}</span>
        <button class="shop-reset-btn" onclick="resetShopping()">🔄 איפוס</button>
      </div>
    </div>`;

    // Add item bar
    html += `<div class="shop-add-bar">
      <input type="text" id="shopInput" class="shop-add-input" placeholder="הוסף פריט..." value="${state.shopInput.replace(/"/g, "&quot;")}" oninput="state.shopInput=this.value" onkeydown="if(event.key==='Enter')addCustomItem()">
      <select class="shop-add-cat" id="shopCatSelect" onchange="state.shopCat=this.value">
        ${SHOP_CATEGORIES.map(c => `<option value="${c.id}" ${state.shopCat === c.id ? "selected" : ""}>${c.icon} ${c.label}</option>`).join("")}
      </select>
      <button class="shop-add-btn" onclick="addCustomItem()">הוסף</button>
    </div>`;

    // Render categories
    SHOP_CATEGORIES.forEach((cat, catIdx) => {
      const items = allItems.filter(i => i.cat === cat.id);
      if (items.length === 0) return;

      html += `<div class="shop-category stagger-in" style="animation-delay:${catIdx * 0.08}s">`;
      html += `<div class="shop-cat-header" style="color:${cat.color};border-color:${cat.color}30">
        <span class="shop-cat-icon">${cat.icon}</span>
        <span>${cat.label}</span>
      </div>`;

      items.forEach((item, idx) => {
        const checked = sh.checked[item.id];
        const isCustom = item.id.startsWith("custom-");
        html += `<div class="shop-item ${checked ? "shop-item-done" : ""} fade-up" style="animation-delay:${catIdx * 0.08 + idx * 0.02}s" onclick="toggleShopItem('${item.id}')">
          <div class="shop-check ${checked ? "on" : ""}" style="border-color:${checked ? cat.color : "rgba(255,255,255,0.15)"};background:${checked ? cat.color : "transparent"}">
            ${checked ? "✓" : ""}
          </div>
          <span class="shop-item-label ${checked ? "done" : ""}">${item.label}</span>
          ${item.qty ? `<span class="shop-item-qty">${item.qty}</span>` : ""}
          ${isCustom ? `<button class="shop-delete-btn" onclick="event.stopPropagation();removeCustomItem('${item.id}')">×</button>` : ""}
        </div>`;
      });

      html += `</div>`;
    });

    html += `</div>`;
  } else if (state.view === "photos") {
    revokePhotoURLs();
    const photos = state.photos;
    html += `<div class="photos-view">`;
    html += `<h2>📸 תמונות התקדמות</h2>`;
    html += `<button class="photo-capture-btn" onclick="capturePhoto()">📷 צלם תמונה חדשה</button>`;

    if (photos.length === 0) {
      html += `<div class="photo-empty"><div class="photo-empty-icon">📸</div><div class="photo-empty-title">עדיין אין תמונות</div><div class="photo-empty-sub">צלם את התמונה הראשונה שלך כדי לעקוב אחרי ההתקדמות</div></div>`;
    } else if (photos.length === 1) {
      const p = photos[0];
      const url = URL.createObjectURL(p.blob);
      _photoURLs.push(url);
      html += `<div class="photo-single"><div class="photo-compare-item"><div class="photo-compare-label">תמונה ראשונה</div><img src="${url}" class="photo-compare-img" loading="lazy"><div class="photo-compare-date">${p.date.split("-").reverse().join("/")}</div></div></div>`;
      html += `<div class="photo-hint">צלם עוד תמונה כדי לראות השוואה</div>`;
    } else {
      const idx = Math.max(1, Math.min(state.photoIdx, photos.length - 1));
      const after = photos[idx];
      const before = photos[idx - 1];
      const urlBefore = URL.createObjectURL(before.blob);
      const urlAfter = URL.createObjectURL(after.blob);
      _photoURLs.push(urlBefore, urlAfter);

      html += `<div class="photo-compare">
        <div class="photo-compare-item"><div class="photo-compare-label">לפני</div><img src="${urlBefore}" class="photo-compare-img" loading="lazy"><div class="photo-compare-date">${before.date.split("-").reverse().join("/")}</div></div>
        <div class="photo-compare-item"><div class="photo-compare-label">אחרי</div><img src="${urlAfter}" class="photo-compare-img" loading="lazy"><div class="photo-compare-date">${after.date.split("-").reverse().join("/")}</div></div>
      </div>`;
      html += `<div class="photo-compare-nav">
        <button onclick="photoNav(-1)" ${idx <= 1 ? "disabled" : ""}>→</button>
        <span>תמונה ${idx} מתוך ${photos.length - 1}</span>
        <button onclick="photoNav(1)" ${idx >= photos.length - 1 ? "disabled" : ""}>←</button>
      </div>`;
    }

    // Gallery grid
    if (photos.length > 0) {
      html += `<div class="photo-gallery-title">כל התמונות</div>`;
      html += `<div class="photo-gallery">`;
      photos.forEach(p => {
        const url = URL.createObjectURL(p.blob);
        _photoURLs.push(url);
        html += `<div class="photo-gallery-item">
          <img src="${url}" loading="lazy">
          <button class="photo-gallery-delete" onclick="event.stopPropagation();deletePhoto(${p.id})">×</button>
          <div class="photo-gallery-date">${p.date.split("-").reverse().join("/")}</div>
        </div>`;
      });
      html += `</div>`;
    }

    html += `</div>`;
  }

  // Update header (never touches scroll container)
  document.getElementById("header-root").innerHTML = headerHtml;

  // Update content — always save current scroll before replacing
  const scrollContainer = document.getElementById("content-root");
  const scrollBefore = scrollContainer.scrollTop;
  // Use interaction-time snapshot if available, otherwise use current scroll
  const restoreScroll = _pendingScroll !== null ? _pendingScroll : scrollBefore;

  const contentInner = document.getElementById("content-inner");
  contentInner.innerHTML = html;
  contentInner.className = "content-inner " + slideClass + tabEnter;

  // Restore scroll aggressively — covers sync render, async render, and browser paint
  scrollContainer.scrollTop = restoreScroll;
  setTimeout(() => { scrollContainer.scrollTop = restoreScroll; }, 0);
  requestAnimationFrame(() => {
    scrollContainer.scrollTop = restoreScroll;
    requestAnimationFrame(() => { scrollContainer.scrollTop = restoreScroll; });
  });

  // Post-render: checkbox pop animation with burst ring
  if (state.lastToggled) {
    const el = document.querySelector(`[data-check-id="${state.lastToggled}"]`);
    if (el && state.dayData.completed[state.lastToggled]) {
      el.classList.add("check-burst");
    } else if (el) {
      el.classList.add("pop");
    }
    state.lastToggled = null;
  }

  // Post-render: progress counter animation
  const progVal = document.querySelector(".progress-val");
  if (progVal && state._prevCompleted !== undefined && state._prevCompleted !== completed) {
    progVal.classList.add("number-bump");
  }
  state._prevCompleted = completed;

  // Post-render: streak milestone stars
  if (state.streak > 0) {
    const milestones = [5, 10, 25, 50, 100];
    if (milestones.includes(state.streak)) {
      const badge = document.getElementById("streak-badge");
      if (badge) fireStreakStars(badge);
    }
  }

  // Post-render: reset badge bounce
  if (state.badgeBounce) state.badgeBounce = false;

  // Post-render: reset weight saved indicator
  if (state.weightJustSaved) {
    setTimeout(() => {
      state.weightJustSaved = false;
      // Don't re-render, just remove the class/element
      const wb = document.querySelector(".weight-box");
      if (wb) wb.classList.remove("weight-saved");
      const sc = document.querySelector(".saved-check");
      if (sc) sc.remove();
    }, 1500);
  }

  // Focus note input if editing
  if (state.editingNote) {
    const inp = document.getElementById("noteInput");
    if (inp) inp.focus();
  }

  // Render workout progression chart + show timer
  const timerBar = document.getElementById("timer-bar");
  if (state.view === "workout") {
    renderWorkoutChart();
    if (timerBar) timerBar.style.display = "";
    updateTimerDisplay();
  } else {
    if (timerBar) timerBar.style.display = "none";
    stopTimer();
  }

  // Load steps for today
  if (state.view === "today") {
    loadSteps(ds);
  }

  // Position "now" marker after DOM settles
  if (isToday && state.view === "today") {
    requestAnimationFrame(() => positionNowMarker());
  }

  // Only animate items on first render / day change, not on toggles
  state.animateItems = false;
}

function toggleWorkoutPicker() {
  saveScrollPosition();
  state.showWorkoutPicker = !state.showWorkoutPicker;
  render();
}

function selectWorkoutType(type) {
  saveScrollPosition();
  state.showWorkoutPicker = false;
  state.badgeBounce = true;

  const ds = dateStr(state.date);
  const targetIdx = CYCLE.indexOf(type);
  const thisDate = new Date(ds);
  const newStart = new Date(thisDate);
  newStart.setDate(newStart.getDate() - targetIdx);
  START = dateStr(newStart);
  localStorage.setItem("fittrack_cycle_start", START);

  state.dayData.workoutType = type;
  state.dayData.hasAerobic = hasAerobic(ds);
  saveDay();
}

function cycleWorkoutType() {
  saveScrollPosition();
  state.badgeBounce = true;
  const current = state.dayData.workoutType || cycleType(dateStr(state.date));
  const idx = CYCLE.indexOf(current);
  const next = CYCLE[(idx + 1) % CYCLE.length];

  // Shift the cycle start so that this day produces `next`,
  // and all future days follow the new rotation
  const ds = dateStr(state.date);
  const targetIdx = CYCLE.indexOf(next);
  // new START = this date minus targetIdx days
  const thisDate = new Date(ds);
  const newStart = new Date(thisDate);
  newStart.setDate(newStart.getDate() - targetIdx);
  START = dateStr(newStart);
  localStorage.setItem("fittrack_cycle_start", START);

  // Update this day's data to match
  state.dayData.workoutType = next;
  state.dayData.hasAerobic = hasAerobic(ds);
  saveDay();
}

// ── Workout Actions ──
function saveWorkoutSet(exId, setIdx, field, value) {
  if (!state.dayData.workoutLog) state.dayData.workoutLog = {};
  if (!state.dayData.workoutLog[exId]) state.dayData.workoutLog[exId] = [];
  const sets = state.dayData.workoutLog[exId];
  while (sets.length <= setIdx) sets.push({ weight: "", reps: "" });

  // Check for new PR before saving (only on weight changes)
  const wasPR = getTodayPRs().has(exId);
  sets[setIdx][field] = value;
  dbPut(state.dayData);

  if (field === "weight" && !wasPR && checkForNewPR(exId, value)) {
    // New PR! Celebrate
    incrementPRCount();
    fireConfetti();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    checkAchievements();
    // Re-render to show badge
    render();
  }
}

function addWorkoutSet(exId) {
  if (!state.dayData.workoutLog) state.dayData.workoutLog = {};
  if (!state.dayData.workoutLog[exId]) state.dayData.workoutLog[exId] = [];
  state.dayData.workoutLog[exId].push({ weight: "", reps: "" });
  dbPut(state.dayData);
  render();
}

function removeWorkoutSet(exId) {
  if (!state.dayData.workoutLog || !state.dayData.workoutLog[exId]) return;
  state.dayData.workoutLog[exId].pop();
  dbPut(state.dayData);
  render();
}

async function getExerciseHistory(exId) {
  const all = await dbGetAll();
  return all
    .filter(d => d.workoutLog && d.workoutLog[exId] && d.workoutLog[exId].length > 0)
    .map(d => {
      const sets = d.workoutLog[exId];
      const maxWeight = Math.max(...sets.map(s => parseFloat(s.weight) || 0));
      return { date: d.date, weight: maxWeight, sets: sets };
    })
    .filter(d => d.weight > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getLastSession(exId) {
  // Find the most recent logged data for this exercise from loaded history
  if (!state._workoutHistory) return null;
  const hist = state._workoutHistory.filter(d =>
    d.workoutLog && d.workoutLog[exId] && d.workoutLog[exId].length > 0 && d.date !== dateStr(state.date)
  );
  if (hist.length === 0) return null;
  hist.sort((a, b) => b.date.localeCompare(a.date));
  return hist[0].workoutLog[exId];
}

async function loadWorkoutHistory() {
  state._workoutHistory = await dbGetAll();
}

// ── Shopping Actions ──
function toggleShopItem(id) {
  if (state.shopping.checked[id]) {
    delete state.shopping.checked[id];
  } else {
    state.shopping.checked[id] = true;
  }
  saveShopping();
  render();
}

function addCustomItem() {
  const label = state.shopInput.trim();
  if (!label) return;
  const id = "custom-" + Date.now();
  state.shopping.customItems.push({ id, label, cat: state.shopCat });
  state.shopInput = "";
  saveShopping();
  render();
}

function removeCustomItem(id) {
  state.shopping.customItems = state.shopping.customItems.filter(i => i.id !== id);
  delete state.shopping.checked[id];
  saveShopping();
  render();
}

function resetShopping() {
  state.shopping.checked = {};
  saveShopping();
  render();
}

// ── Data Export/Import ──
async function exportData() {
  const all = await dbGetAll();
  const data = {
    version: 1,
    exported: new Date().toISOString(),
    days: all,
    achievements: loadUnlocked(),
    shopping: loadShopping(),
    cycleStart: START,
    notificationsEnabled: state.notificationsEnabled
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fittrack-backup-" + dateStr(effectiveNow()) + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

async function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.days || !Array.isArray(data.days)) {
        alert("קובץ לא תקין");
        return;
      }
      if (!confirm(`לייבא ${data.days.length} ימים? הנתונים הקיימים יוחלפו.`)) return;
      for (const day of data.days) await dbPut(day);
      if (data.achievements) saveUnlocked(data.achievements);
      if (data.shopping) { state.shopping = data.shopping; saveShopping(); }
      if (data.cycleStart) { START = data.cycleStart; localStorage.setItem("fittrack_cycle_start", START); }
      alert("הייבוא הושלם! " + data.days.length + " ימים יובאו.");
      loadDay();
    } catch (err) {
      alert("שגיאה בייבוא: " + err.message);
    }
  };
  input.click();
}

// ── UI helpers ──
function setState(k, v) { _pendingScroll = null; state.animateItems = true; state[k] = v; render(); }
function toggleDetail(id) { saveScrollPosition(); state.showDetail = state.showDetail === id ? null : id; state.editingNote = null; render(); }
function startEdit(id, existing) { saveScrollPosition(); state.editingNote = id; state.noteText = existing; render(); }
function updateWeightBtn() {
  const b = document.getElementById("weightBtn");
  if (b) b.className = "weight-btn " + (state.weightInput ? "ready" : "idle");
}

// ── Steps ──
async function loadSteps(ds) {
  try {
    const resp = await fetch(PUSH_SERVER + "/api/steps?date=" + ds);
    const data = await resp.json();
    const el = document.getElementById("steps-val");
    if (el) {
      const prev = el.textContent;
      const newVal = data.steps > 0 ? data.steps.toLocaleString() : "—";
      el.textContent = newVal;
      if (prev !== newVal && prev !== "—") el.classList.add("number-bump");
    }
    if (data.steps > 0) checkAchievements();
  } catch (e) {}
}

function syncSteps() {
  window.location.href = "shortcuts://run-shortcut?name=Sync%20Steps";
  // Poll for updated steps after shortcut runs
  const ds = dateStr(state.date);
  let attempts = 0;
  const poll = setInterval(() => {
    attempts++;
    loadSteps(ds);
    if (attempts >= 6) clearInterval(poll);
  }, 3000);
}

// ── Now Marker ──
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  // Treat times before 05:00 as next day (e.g., 01:00 = 25*60) for timeline ordering
  return (h < 5 ? h + 24 : h) * 60 + m;
}

function positionNowMarker() {
  const marker = document.getElementById("now-marker");
  if (!marker) return;

  const items = document.querySelectorAll(".tl-item");
  if (items.length < 2) return;

  const now = new Date();
  const nowMin = timeToMinutes(now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0"));

  const times = SCHEDULE.map(s => timeToMinutes(s.time));

  // Find which two items we're between
  let beforeIdx = -1;
  for (let i = 0; i < times.length; i++) {
    if (nowMin >= times[i]) beforeIdx = i;
  }

  const timeline = document.querySelector(".timeline");
  if (!timeline) return;
  const timelineRect = timeline.getBoundingClientRect();

  let topPx;
  if (beforeIdx === -1) {
    // Before first item
    const firstRect = items[0].getBoundingClientRect();
    topPx = firstRect.top + firstRect.height / 2 - timelineRect.top;
  } else if (beforeIdx === times.length - 1) {
    // After last item
    const lastRect = items[items.length - 1].getBoundingClientRect();
    topPx = lastRect.top + lastRect.height / 2 - timelineRect.top;
  } else {
    // Between two items
    const aRect = items[beforeIdx].getBoundingClientRect();
    const bRect = items[beforeIdx + 1].getBoundingClientRect();
    const aY = aRect.top + aRect.height / 2 - timelineRect.top;
    const bY = bRect.top + bRect.height / 2 - timelineRect.top;
    const frac = (nowMin - times[beforeIdx]) / (times[beforeIdx + 1] - times[beforeIdx]);
    topPx = aY + (bY - aY) * frac;
  }

  marker.style.top = topPx + "px";

  // Update label
  const label = marker.querySelector(".now-marker-label");
  if (label) {
    label.textContent = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  }
}

// ── Achievements Logic ──
function loadUnlocked() {
  try { return JSON.parse(localStorage.getItem("fittrack_achievements") || "{}"); } catch (e) { return {}; }
}
function saveUnlocked(u) { localStorage.setItem("fittrack_achievements", JSON.stringify(u)); }

async function getAchievementData() {
  const all = await dbGetAll();
  let totalWorkouts = 0, perfectDays = 0, halfDays = 0, weightDays = 0, totalPRs = 0;

  for (const day of all) {
    if (day.workoutLog && Object.keys(day.workoutLog).length > 0) totalWorkouts++;
    if (day.weight) weightDays++;
    const completed = Object.values(day.completed || {}).filter(Boolean).length;
    if (completed >= SCHEDULE.length) perfectDays++;
    if (completed >= 5) halfDays++;
  }

  // Count unique exercise PRs
  const unlocked = loadUnlocked();
  totalPRs = parseInt(unlocked._prCount || "0");

  // Weight loss from first to latest
  let weightLost = 0;
  const weightEntries = all.filter(d => d.weight).sort((a, b) => a.date.localeCompare(b.date));
  if (weightEntries.length >= 2) {
    const first = parseFloat(weightEntries[0].weight);
    const latest = parseFloat(weightEntries[weightEntries.length - 1].weight);
    weightLost = Math.max(0, first - latest);
  }

  // Steps from server
  let todaySteps = 0;
  try {
    const resp = await fetch(PUSH_SERVER + "/api/steps?date=" + dateStr(effectiveNow()));
    const data = await resp.json();
    todaySteps = data.steps || 0;
  } catch (e) {}

  return {
    streak: state.streak,
    totalWorkouts,
    perfectDays,
    halfDays,
    weightDays,
    totalPRs,
    weightLost,
    todaySteps,
    totalDays: all.length
  };
}

async function checkAchievements() {
  const data = await getAchievementData();
  state._achData = data; // cache for UI display
  const unlocked = loadUnlocked();
  let newlyUnlocked = [];

  for (const ach of ACHIEVEMENTS) {
    if (unlocked[ach.id]) continue;
    if (ach.check(data)) {
      unlocked[ach.id] = dateStr(effectiveNow());
      newlyUnlocked.push(ach);
    }
  }

  if (newlyUnlocked.length > 0) {
    saveUnlocked(unlocked);
    // Celebrate the first one
    showAchievementToast(newlyUnlocked[0]);
    fireConfetti();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
  }
}

function incrementPRCount() {
  const unlocked = loadUnlocked();
  unlocked._prCount = (parseInt(unlocked._prCount || "0") + 1).toString();
  saveUnlocked(unlocked);
}

function showAchievementToast(ach) {
  const existing = document.querySelector(".ach-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "ach-toast";
  toast.innerHTML = `<div class="ach-toast-inner">
    <span class="ach-toast-icon">${ach.icon}</span>
    <div>
      <div class="ach-toast-title">הישג חדש!</div>
      <div class="ach-toast-name">${ach.title}</div>
    </div>
  </div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("ach-toast-show"), 10);
  setTimeout(() => {
    toast.classList.remove("ach-toast-show");
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ── Personal Records ──
// Find the minimum reps required for an exercise from its target range
function getMinReps(exId) {
  for (const wo of Object.values(WORKOUTS)) {
    for (const g of wo.groups) {
      for (const ex of g.exercises) {
        if (ex.id === exId) {
          const match = ex.reps.match(/^(\d+)/);
          return match ? parseInt(match[1]) : 1;
        }
      }
    }
  }
  return 1;
}

function getExercisePR(exId) {
  // Find all-time max weight where reps met the minimum target
  if (!state._workoutHistory) return 0;
  const minReps = getMinReps(exId);
  let max = 0;
  for (const day of state._workoutHistory) {
    if (!day.workoutLog || !day.workoutLog[exId]) continue;
    for (const set of day.workoutLog[exId]) {
      const w = parseFloat(set.weight) || 0;
      const r = parseInt(set.reps) || 0;
      if (w > max && r >= minReps) max = w;
    }
  }
  return max;
}

function checkForNewPR(exId, weight) {
  const w = parseFloat(weight) || 0;
  if (w <= 0) return false;
  const minReps = getMinReps(exId);
  // Check if this set has enough reps
  const todaySets = (state.dayData.workoutLog && state.dayData.workoutLog[exId]) || [];
  const thisSet = todaySets.find(s => parseFloat(s.weight) === w);
  const reps = thisSet ? (parseInt(thisSet.reps) || 0) : 0;
  if (reps < minReps) return false;
  const prevPR = getExercisePR(exId);
  return w > prevPR;
}

function getTodayPRs() {
  // Returns set of exercise IDs where today has a new PR (with valid reps)
  const prs = new Set();
  if (!state.dayData.workoutLog || !state._workoutHistory) return prs;
  for (const [exId, sets] of Object.entries(state.dayData.workoutLog)) {
    const minReps = getMinReps(exId);
    // Today's max weight WITH valid reps
    let todayMax = 0;
    for (const s of sets) {
      const w = parseFloat(s.weight) || 0;
      const r = parseInt(s.reps) || 0;
      if (w > todayMax && r >= minReps) todayMax = w;
    }
    if (todayMax <= 0) continue;
    // Get max from all OTHER days (also with valid reps)
    let histMax = 0;
    for (const day of state._workoutHistory) {
      if (day.date === state.dayData.date) continue;
      if (!day.workoutLog || !day.workoutLog[exId]) continue;
      for (const set of day.workoutLog[exId]) {
        const w = parseFloat(set.weight) || 0;
        const r = parseInt(set.reps) || 0;
        if (w > histMax && r >= minReps) histMax = w;
      }
    }
    if (todayMax > histMax && histMax > 0) prs.add(exId);
  }
  return prs;
}

// ── Rest Timer (Stopwatch) ──
let _timerInterval = null;
state.timerRunning = false;
state.timerStart = 0;
state.timerElapsed = 0;

function toggleTimer() {
  if (state.timerRunning) {
    // Pause
    state.timerElapsed += (Date.now() - state.timerStart) / 1000;
    state.timerStart = 0;
    state.timerRunning = false;
    clearInterval(_timerInterval);
    _timerInterval = null;
  } else {
    // Start/Resume
    state.timerStart = Date.now();
    state.timerRunning = true;
    _timerInterval = setInterval(updateTimerDisplay, 200);
  }
  updateTimerDisplay();
}

function resetTimer() {
  state.timerRunning = false;
  state.timerStart = 0;
  state.timerElapsed = 0;
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const el = document.getElementById("timer-display");
  if (!el) return;
  let total = state.timerElapsed;
  if (state.timerRunning) total += (Date.now() - state.timerStart) / 1000;
  const mins = Math.floor(total / 60);
  const secs = Math.floor(total % 60);
  el.textContent = mins.toString().padStart(2, "0") + ":" + secs.toString().padStart(2, "0");

  // Update play/pause icon
  const icon = document.getElementById("timer-icon");
  if (icon) icon.textContent = state.timerRunning ? "⏸" : "▶";

  // Update bar style
  const bar = document.getElementById("timer-bar");
  if (bar) bar.className = "timer-bar" + (state.timerRunning ? " timer-running" : "");

  // Vibrate on minute marks
  if (state.timerRunning && secs === 0 && mins > 0 && navigator.vibrate) {
    navigator.vibrate(200);
  }
}

function stopTimer() {
  state.timerRunning = false;
  state.timerStart = 0;
  state.timerElapsed = 0;
  if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
}

// ── Exercise Info Popup ──
function showExInfo(exId) {
  // Find the exercise across all workouts
  let ex = null;
  for (const wk of Object.values(WORKOUTS)) {
    for (const g of wk.groups) {
      for (const e of g.exercises) {
        if (e.id === exId) { ex = e; break; }
      }
      if (ex) break;
    }
    if (ex) break;
  }
  if (!ex || !ex.info) return;

  // Create overlay popup
  const overlay = document.createElement("div");
  overlay.className = "wo-info-overlay";
  overlay.onclick = () => overlay.remove();
  overlay.innerHTML = `<div class="wo-info-popup" onclick="event.stopPropagation()">
    <div class="wo-info-popup-header">
      <div class="wo-info-popup-title">${ex.label}</div>
      <button class="wo-info-close" onclick="this.closest('.wo-info-overlay').remove()">✕</button>
    </div>
    <div class="wo-info-popup-sub">${ex.sub}</div>
    <div class="wo-info-popup-target">${ex.sets} × ${ex.reps}</div>
    <div class="wo-info-popup-body">${ex.info.replace(/\n/g, "<br>")}</div>
  </div>`;
  document.body.appendChild(overlay);
}

// ── Workout Chart ──
async function renderWorkoutChart() {
  const chartBox = document.getElementById("wo-chart");
  if (!chartBox) return;
  const exId = state.woChartEx || "";
  if (!exId) { chartBox.innerHTML = ""; return; }

  const history = await getExerciseHistory(exId);
  if (history.length < 2) {
    chartBox.innerHTML = `<div style="color:var(--text3);text-align:center;padding:20px;font-size:13px">צריך לפחות 2 אימונים לגרף</div>`;
    return;
  }

  const data = history.slice(-15);
  const mn = Math.min(...data.map(d => d.weight)) - 5;
  const mx = Math.max(...data.map(d => d.weight)) + 5;
  const rng = mx - mn || 1;
  const w = 520, h = 160;
  const pts = data.map((d, i) => ({ x: (i / (data.length - 1)) * (w - 60) + 40, y: h - 20 - ((d.weight - mn) / rng) * (h - 40), ...d }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length - 1].x},${h - 20} L${pts[0].x},${h - 20} Z`;

  let pathLen = 0;
  for (let i = 1; i < pts.length; i++) pathLen += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y);

  let svg = `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto">`;
  [0, .25, .5, .75, 1].forEach(f => {
    const y = h - 20 - f * (h - 40);
    const v = (mn + f * rng).toFixed(0);
    svg += `<line x1="40" y1="${y}" x2="${w - 20}" y2="${y}" stroke="rgba(255,255,255,0.05)"/>`;
    svg += `<text x="35" y="${y + 4}" fill="#64748b" font-size="10" text-anchor="end" font-family="Heebo">${v}</text>`;
  });
  svg += `<defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/><stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/></linearGradient></defs>`;
  svg += `<path d="${area}" fill="url(#wg)" class="chart-area-animated"/>`;
  svg += `<path d="${path}" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linejoin="round" class="chart-line-animated" style="stroke-dasharray:${pathLen};--path-length:${pathLen}"/>`;
  pts.forEach((p, i) => {
    svg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#0a0e17" stroke="#3b82f6" stroke-width="2" class="chart-dot-animated" style="animation-delay:${0.3 + i * 0.08}s"/>`;
    if (i === 0 || i === pts.length - 1) svg += `<text x="${p.x}" y="${p.y - 10}" fill="#e2e8f0" font-size="11" text-anchor="middle" font-weight="600" font-family="Heebo" class="chart-dot-animated" style="animation-delay:${0.3 + i * 0.08}s">${p.weight}</text>`;
  });
  svg += `</svg>`;
  chartBox.innerHTML = svg;
}

// ── Ripple Effect ──
function initRipple() {
  document.addEventListener("pointerdown", e => {
    const target = e.target.closest(".tab, .check, .tl-card, .badge-tap, .today-btn, .date-nav button, .notif-toggle, .weight-btn, .note-actions button");
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const circle = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    circle.className = "ripple-circle";
    circle.style.width = circle.style.height = size + "px";
    circle.style.left = (e.clientX - rect.left - size / 2) + "px";
    circle.style.top = (e.clientY - rect.top - size / 2) + "px";
    target.style.position = target.style.position || "relative";
    target.style.overflow = "hidden";
    target.appendChild(circle);
    circle.addEventListener("animationend", () => circle.remove());
  });
}

// ── Animated Counter ──
function animateCounter(el, from, to) {
  const duration = 400;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const val = Math.round(from + (to - from) * ease);
    el.textContent = val;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── Streak Milestone Stars ──
function fireStreakStars(badgeEl) {
  const container = document.createElement("div");
  container.className = "streak-stars";
  const stars = ["⭐", "✨", "🌟", "💫"];
  for (let i = 0; i < 8; i++) {
    const star = document.createElement("span");
    star.className = "streak-star";
    star.textContent = stars[i % stars.length];
    const angle = (i / 8) * Math.PI * 2;
    star.style.setProperty("--sx", Math.cos(angle) * 40 + "px");
    star.style.setProperty("--sy", Math.sin(angle) * 40 + "px");
    star.style.animationDelay = (i * 0.05) + "s";
    container.appendChild(star);
  }
  badgeEl.style.position = "relative";
  badgeEl.appendChild(container);
  setTimeout(() => container.remove(), 1000);
}

// ── Init ──
openDB().then(async () => {
  await loadDay();
  await loadWeights();
  await loadPhotos();
  await calculateStreak();
  render();
  initSwipe();
  initRipple();
  ensurePushSubscription();
  checkAchievements();

  // Friday photo prompt — show once per day
  const today = dateStr(effectiveNow());
  const lastPhotoPrompt = localStorage.getItem("fittrack_photo_prompt");
  if (new Date(today).getDay() === 5 && lastPhotoPrompt !== today) {
    localStorage.setItem("fittrack_photo_prompt", today);
    setTimeout(() => {
      if (confirm("📸 יום שישי — הגיע הזמן לצלם תמונת התקדמות!\n\nלצלם עכשיו?")) {
        state.view = "photos";
        loadPhotos().then(() => { capturePhoto(); });
      }
    }, 1500);
  }

  // Refresh data when app comes back to foreground
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // Update steps, now marker, and reload day data
      if (state.view === "today") {
        loadSteps(dateStr(state.date));
        positionNowMarker();
      }
      // If date changed while away (e.g., opened next day), reload
      const now = effectiveNow();
      if (dateStr(state.date) !== dateStr(now)) {
        state.date = now;
        state.animateItems = true;
        loadDay();
      }
    }
  });

  // Update "now" marker every 60 seconds
  setInterval(() => {
    if (state.view === "today" && dateStr(state.date) === dateStr(effectiveNow())) {
      positionNowMarker();
    }
  }, 60000);

  // Auto-refresh steps every 30 seconds
  setInterval(() => {
    if (state.view === "today") {
      loadSteps(dateStr(state.date));
    }
  }, 30000);
});
