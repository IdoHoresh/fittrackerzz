// ── Config ──
const CYCLE = ["upper", "lower", "rest"];
const CYCLE_LABELS = { upper: "עליון", lower: "תחתון", rest: "מנוחה" };
const CYCLE_EMOJI = { upper: "💪", lower: "🦵", rest: "😴" };
const START = "2026-04-05";

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
  lastToggled: null
};

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
  await dbPut(state.dayData);
  await loadWeights();
  render();
}

function changeDate(off) {
  _pendingScroll = null; // new day = scroll to top
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
  const ct = cycleType(ds);
  const aero = hasAerobic(ds);
  const isRest = ct === "rest";
  const d = state.dayData;
  if (!d) return;

  const completed = SCHEDULE.filter(s => d.completed[s.id]).length;
  const total = SCHEDULE.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const isComplete = pct === 100;
  const isToday = dateStr(state.date) === dateStr(new Date());

  // Header — rendered into permanent #header-root
  const headerHtml = `<div class="header-inner">
    <div class="tabs">
      <button class="tab ${state.view === "today" ? "active" : ""}" onclick="setState('view','today')">📋 יומי</button>
      <button class="tab ${state.view === "weight" ? "active" : ""}" onclick="setState('view','weight');loadWeights().then(render)">⚖️ משקל</button>
    </div>
    <div class="logo"><span>FIT</span><span>TRACK</span></div>
  </div>`;

  // Determine slide class
  const slideClass = state.slideDirection === "left" ? "slide-in-left" : state.slideDirection === "right" ? "slide-in-right" : "";
  state.slideDirection = null;

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
      html += `<div class="streak-row">
        <div class="streak-badge">
          <span class="fire">🔥</span>
          <span>${state.streak} ימים ברצף</span>
        </div>
      </div>`;
    }

    // Badges
    html += `<div class="badges">
      <div class="badge ${isRest ? "badge-rest" : "badge-workout"}">
        <span style="font-size:18px">${CYCLE_EMOJI[ct]}</span>
        ${isRest ? "יום מנוחה" : "אימון " + CYCLE_LABELS[ct]}
      </div>
      ${aero && !isRest ? `<div class="badge badge-aerobic"><span>🏃</span> 30 דק׳ אירובי</div>` : ""}
    </div>`;

    // Progress
    html += `<div class="progress-box ${isComplete ? "complete" : ""}">
      <div class="progress-top"><span class="progress-label">התקדמות יומית</span><span class="progress-val" style="color:${isComplete ? "var(--green)" : "var(--text)"}">${completed}/${total} ${isComplete ? "✅" : ""}</span></div>
      <div class="progress-bar"><div class="progress-fill ${isComplete ? "complete" : ""}" style="width:${pct}%;background:${isComplete ? "linear-gradient(90deg,#4caf50,#66bb6a)" : "linear-gradient(90deg,#3b82f6,#60a5fa)"}"></div></div>
    </div>`;

    // Weight input
    html += `<div class="weight-box">
      <span style="font-size:18px">⚖️</span>
      <input type="number" step="0.1" id="weightIn" placeholder="${d.weight ? d.weight + ' ק"ג ✓' : 'משקל בוקר (ק"ג)'}" value="${state.weightInput}" oninput="state.weightInput=this.value;updateWeightBtn()">
      <button class="weight-btn ${state.weightInput ? "ready" : "idle"}" id="weightBtn" onclick="saveWeight()">שמור</button>
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

      html += `<div class="tl-item fade-up" style="animation-delay:${idx * 0.03}s">
        <div class="tl-dot">
          <div class="check" data-check-id="${item.id}" onclick="toggleComplete('${item.id}')" style="background:${done ? col.accent : "rgba(255,255,255,0.04)"};border:2px solid ${done ? col.accent : "rgba(255,255,255,0.15)"}">
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

  } else {
    // Weight view
    html += `<div class="weight-view"><h2>⚖️ מעקב משקל</h2>`;
    const wh = state.weightHistory;
    if (wh.length === 0) {
      html += `<div class="empty-state"><div class="icon">⚖️</div><div style="font-size:15px">עדיין אין נתוני משקל</div><div style="font-size:13px;margin-top:6px">הזן את המשקל שלך בתצוגה היומית</div></div>`;
    } else {
      // Chart
      html += `<div class="chart-box">`;
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
        svg += `<path d="${area}" fill="url(#ag)"/>`;
        svg += `<path d="${path}" fill="none" stroke="#4caf50" stroke-width="2.5" stroke-linejoin="round"/>`;
        pts.forEach((p, i) => {
          svg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#0a0e17" stroke="#4caf50" stroke-width="2"/>`;
          if (i === 0 || i === pts.length - 1) svg += `<text x="${p.x}" y="${p.y - 10}" fill="#e2e8f0" font-size="11" text-anchor="middle" font-weight="600" font-family="Heebo">${p.weight}</text>`;
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
          <div class="stat-card"><div class="stat-label">התחלה</div><div class="stat-val" style="color:var(--text2)">${first}</div><div class="stat-unit">ק"ג</div></div>
          <div class="stat-card"><div class="stat-label">נוכחי</div><div class="stat-val">${last}</div><div class="stat-unit">ק"ג</div></div>
          <div class="stat-card"><div class="stat-label">שינוי</div><div class="stat-val" style="color:${diffColor}">${diff}</div><div class="stat-unit">ק"ג</div></div>
        </div>`;
      }

      // History
      html += `<div class="history-list">`;
      wh.slice().reverse().forEach(e => {
        html += `<div class="history-item"><span class="history-date">${e.date}</span><span class="history-weight">${e.weight} ק"ג</span></div>`;
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
  contentInner.className = "content-inner " + slideClass;

  // Restore scroll aggressively — covers sync render, async render, and browser paint
  scrollContainer.scrollTop = restoreScroll;
  setTimeout(() => { scrollContainer.scrollTop = restoreScroll; }, 0);
  requestAnimationFrame(() => {
    scrollContainer.scrollTop = restoreScroll;
    requestAnimationFrame(() => { scrollContainer.scrollTop = restoreScroll; });
  });

  // Post-render: checkbox pop animation
  if (state.lastToggled) {
    const el = document.querySelector(`[data-check-id="${state.lastToggled}"]`);
    if (el) el.classList.add("pop");
    state.lastToggled = null;
  }

  // Focus note input if editing
  if (state.editingNote) {
    const inp = document.getElementById("noteInput");
    if (inp) inp.focus();
  }
}

// ── UI helpers ──
function setState(k, v) { _pendingScroll = null; state[k] = v; render(); }
function toggleDetail(id) { saveScrollPosition(); state.showDetail = state.showDetail === id ? null : id; state.editingNote = null; render(); }
function startEdit(id, existing) { saveScrollPosition(); state.editingNote = id; state.noteText = existing; render(); }
function updateWeightBtn() {
  const b = document.getElementById("weightBtn");
  if (b) b.className = "weight-btn " + (state.weightInput ? "ready" : "idle");
}

// ── Init ──
openDB().then(async () => {
  await loadDay();
  await loadWeights();
  await calculateStreak();
  render();
  initSwipe();
});
