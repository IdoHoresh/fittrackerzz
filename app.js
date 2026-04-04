// ── Config ──
const CYCLE = ["upper", "lower", "rest"];
const CYCLE_LABELS = { upper: "עליון", lower: "תחתון", rest: "מנוחה" };
const CYCLE_EMOJI = { upper: "💪", lower: "🦵", rest: "😴" };
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
function dateStr(d) { return d.toISOString().split("T")[0]; }
function dayName(d) { return DAYS[d.getDay()]; }
function cycleType(ds) {
  const diff = Math.floor((new Date(ds) - new Date(START)) / 864e5);
  return CYCLE[((diff % 3) + 3) % 3];
}
function hasAerobic(ds) {
  const diff = Math.floor((new Date(ds) - new Date(START)) / 864e5);
  const c = ((diff % 6) + 6) % 6;
  return c < 3 && CYCLE[c % 3] !== "rest";
}

// ── IndexedDB ──
const DB_NAME = "fittrack";
const DB_VER = 1;
let db = null;

function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, DB_VER);
    r.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains("days")) d.createObjectStore("days", { keyPath: "date" });
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
  date: new Date(),
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
  shopCat: "produce"
};

// ── Push Notifications (server-based) ──
const PUSH_SERVER = localStorage.getItem("fittrack_push_server") || "https://fittrack-push.onrender.com";
const VAPID_PUBLIC_KEY = "BBzsqZhI0Mb7UgBf2U9QahzTLl3MY_FnuWOUaMwIDvkfRQ3KWRbXuPuqNEIQgLJnjTAL0yTwqw1DkLpGaxeheGQ";

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
  render();
}

async function saveDay() {
  await dbPut(state.dayData);
  await calculateStreak();
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
  const today = new Date();
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
  state.date = new Date();
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
  const isToday = dateStr(state.date) === dateStr(new Date());

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
      <button class="tab ${state.view === "shopping" ? "active" : ""}" onclick="setState('view','shopping')">🛒 קניות</button>
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

    // Badges (tap to change workout type)
    const bounceClass = state.badgeBounce ? " badge-bounce" : "";
    html += `<div class="badges">
      <div class="badge ${isRest ? "badge-rest" : "badge-workout"} badge-tap${bounceClass}" onclick="cycleWorkoutType()">
        <span style="font-size:18px">${CYCLE_EMOJI[ct]}</span>
        ${isRest ? "יום מנוחה" : "אימון " + CYCLE_LABELS[ct]}
        <span class="badge-edit">✏️</span>
      </div>
      ${aero && !isRest ? `<div class="badge badge-aerobic"><span>🏃</span> 30 דק׳ אירובי</div>` : ""}
    </div>`;

    // Progress
    html += `<div class="progress-box ${isComplete ? "complete" : ""}">
      <div class="progress-top"><span class="progress-label">התקדמות יומית</span><span class="progress-val" style="color:${isComplete ? "var(--green)" : "var(--text)"}">${completed}/${total} ${isComplete ? "✅" : ""}</span></div>
      <div class="progress-bar"><div class="progress-fill ${isComplete ? "complete" : ""}" style="width:${pct}%;background:${isComplete ? "linear-gradient(90deg,#4caf50,#66bb6a)" : "linear-gradient(90deg,#3b82f6,#60a5fa)"}"></div></div>
    </div>`;

    // Weight input
    const weightSavedClass = state.weightJustSaved ? " weight-saved" : "";
    const savedIndicator = state.weightJustSaved ? `<span class="saved-check">✓</span>` : "";
    html += `<div class="weight-box${weightSavedClass}">
      <span style="font-size:18px">⚖️</span>
      <input type="number" step="0.1" id="weightIn" placeholder="${d.weight ? d.weight + ' ק"ג ✓' : 'משקל בוקר'}" value="${state.weightInput}" oninput="state.weightInput=this.value;updateWeightBtn()">
      <button class="weight-btn ${state.weightInput ? "ready" : "idle"}" id="weightBtn" onclick="saveWeight()">שמור</button>
      ${savedIndicator}
    </div>`;

    // Timeline
    html += `<div class="timeline">`;
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

    // Water
    html += `<div class="water-box">
      <span class="icon">💧</span>
      <div><div class="title">תזכורת מים</div><div class="sub">לפחות 3 ליטר + 500-750 מ"ל על שעת אימון</div></div>
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

  // Only animate items on first render / day change, not on toggles
  state.animateItems = false;
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
  // We need: (daysDiff % 3) === targetIdx
  // So new START = this date minus targetIdx days
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

// ── UI helpers ──
function setState(k, v) { _pendingScroll = null; state.animateItems = true; state[k] = v; render(); }
function toggleDetail(id) { saveScrollPosition(); state.showDetail = state.showDetail === id ? null : id; state.editingNote = null; render(); }
function startEdit(id, existing) { saveScrollPosition(); state.editingNote = id; state.noteText = existing; render(); }
function updateWeightBtn() {
  const b = document.getElementById("weightBtn");
  if (b) b.className = "weight-btn " + (state.weightInput ? "ready" : "idle");
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
  await calculateStreak();
  render();
  initSwipe();
  initRipple();
  ensurePushSubscription();
});
