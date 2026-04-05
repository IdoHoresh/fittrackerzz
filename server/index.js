const express = require("express");
const cors = require("cors");
const webpush = require("web-push");
const cron = require("node-cron");
const { Redis } = require("@upstash/redis");

const app = express();

// CORS — restrict to app domains only
const ALLOWED_ORIGINS = [
  "https://idohoresh.github.io",
  "https://fittrackerzz.netlify.app",
  "https://fittracker-gilt.vercel.app",
  "http://localhost:3000"
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o))) cb(null, true);
    else cb(null, false);
  }
}));
app.use(express.json());

// Redis client — credentials from env vars only
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Rate limiting
const rateMap = new Map();
function rateLimit(maxReqs, windowMs) {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const key = ip + req.path;
    const now = Date.now();
    const entry = rateMap.get(key) || { count: 0, reset: now + windowMs };
    if (now > entry.reset) { entry.count = 0; entry.reset = now + windowMs; }
    entry.count++;
    rateMap.set(key, entry);
    if (entry.count > maxReqs) return res.status(429).json({ error: "Too many requests" });
    next();
  };
}

// API key for sensitive endpoints
const API_KEY = process.env.API_KEY || "fittrack_sk_2026";
function requireAuth(req, res, next) {
  const key = req.headers["x-api-key"] || req.query.key;
  if (key === API_KEY) return next();
  res.status(401).json({ error: "Unauthorized" });
}

// VAPID keys — must be set via env vars in production
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.error("ERROR: VAPID keys not set! Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars.");
}

webpush.setVapidDetails("mailto:fittrack@example.com", VAPID_PUBLIC, VAPID_PRIVATE);

// Store subscriptions in Redis (persists across deploys)
async function loadSubs() {
  const subs = await redis.get("subscriptions");
  return subs || [];
}

async function saveSubs(subs) {
  await redis.set("subscriptions", subs);
}

// ── Routes ──

app.get("/api/vapid-public-key", (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC });
});

app.post("/api/subscribe", rateLimit(10, 60000), async (req, res) => {
  const sub = req.body;
  if (!sub || !sub.endpoint) return res.status(400).json({ error: "Invalid subscription" });

  const subs = await loadSubs();
  // Avoid duplicates
  if (!subs.find(s => s.endpoint === sub.endpoint)) {
    subs.push(sub);
    await saveSubs(subs);
    console.log(`[subscribe] New subscription added. Total: ${subs.length}`);
  }
  res.json({ ok: true });
});

app.post("/api/unsubscribe", rateLimit(10, 60000), async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });

  let subs = await loadSubs();
  subs = subs.filter(s => s.endpoint !== endpoint);
  await saveSubs(subs);
  console.log(`[unsubscribe] Removed. Total: ${subs.length}`);
  res.json({ ok: true });
});

// Health check
app.get("/api/health", async (req, res) => {
  const subs = await loadSubs();
  res.json({ status: "ok", subscribers: subs.length });
});

// ── Steps tracking ──
async function loadSteps() {
  const data = await redis.get("steps");
  return data || {};
}

async function saveSteps(data) {
  await redis.set("steps", data);
}

// POST /api/steps — save steps for a date { date: "2026-04-04", steps: 8500 }
// Also accepts GET for easy iOS Shortcut: /api/steps/save?date=2026-04-04&steps=8500
async function validateAndSaveSteps(date, steps, res) {
  if (!date) date = new Date().toISOString().split("T")[0];
  const stepCount = parseInt(steps);
  if (isNaN(stepCount) || stepCount < 0 || stepCount > 500000) {
    return res.status(400).json({ error: "Invalid steps (0-500000)" });
  }
  const parsed = new Date(date);
  if (isNaN(parsed)) return res.status(400).json({ error: "Invalid date" });
  const ds = parsed.toISOString().split("T")[0];
  const data = await loadSteps();
  data[ds] = stepCount;
  await saveSteps(data);
  console.log(`[steps] ${ds}: ${stepCount}`);
  res.json({ ok: true, date: ds, steps: stepCount });
}

app.post("/api/steps", rateLimit(30, 60000), (req, res) => {
  validateAndSaveSteps(req.body.date, req.body.steps, res);
});

app.get("/api/steps/save", rateLimit(30, 60000), (req, res) => {
  validateAndSaveSteps(req.query.date, req.query.steps, res);
});

// GET /api/steps?date=2026-04-04 or /api/steps?days=7
app.get("/api/steps", rateLimit(60, 60000), async (req, res) => {
  const data = await loadSteps();
  if (req.query.date) {
    return res.json({ date: req.query.date, steps: data[req.query.date] || 0 });
  }
  // Return last N days
  const days = parseInt(req.query.days) || 7;
  const result = {};
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    result[ds] = data[ds] || 0;
  }
  res.json(result);
});

// Test push — send a test notification to all subscribers
app.post("/api/test", requireAuth, rateLimit(5, 60000), async (req, res) => {
  const subs = await loadSubs();
  if (subs.length === 0) return res.json({ ok: false, error: "No subscribers" });
  await sendToAll("🔔 בדיקת התראות", "", "fittrack-test");
  res.json({ ok: true, sent: subs.length });
});

// ── Send notification to all subscribers ──
async function sendToAll(title, body, tag) {
  const subs = await loadSubs();
  const expired = [];

  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, JSON.stringify({ title, body, tag, dir: "rtl", lang: "he" }));
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        // Subscription expired or invalid
        expired.push(sub.endpoint);
      } else {
        console.error(`[push error] ${err.message}`);
      }
    }
  }

  // Clean up expired subscriptions
  if (expired.length > 0) {
    const cleaned = subs.filter(s => !expired.includes(s.endpoint));
    await saveSubs(cleaned);
    console.log(`[cleanup] Removed ${expired.length} expired subscriptions`);
  }
}

// ── Schedule: daily meal/task reminders ──
// Times are in Israel timezone (Asia/Jerusalem)
const SCHEDULE = [
  { cron: "30 7", display: "07:30", label: "השכמה", icon: "☀️", tag: "wake" },
  { cron: "45 7", display: "07:45", label: "ארוחת בוקר", icon: "🍳", tag: "meal1" },
  { cron: "0 8", display: "08:00", label: "יציאה לעבודה", icon: "💼", tag: "work" },
  { cron: "30 12", display: "12:30", label: "ארוחת צהריים", icon: "🥗", tag: "meal2" },
  { cron: "0 16", display: "16:00", label: "ארוחת ביניים", icon: "🥜", tag: "meal3" },
  { cron: "0 19", display: "19:00", label: "ארוחת ערב", icon: "🍽️", tag: "meal4" },
  { cron: "0 20", display: "20:00", label: "אימון", icon: "🏋️", tag: "workout" },
  { cron: "30 22", display: "22:30", label: "שייק אחרי אימון", icon: "🥤", tag: "shake" },
  { cron: "15 23", display: "23:15", label: "ארוחת לילה", icon: "🌙", tag: "meal5" },
  { cron: "0 1", display: "01:00", label: "שינה", icon: "😴", tag: "sleep" }
];

SCHEDULE.forEach(item => {
  cron.schedule(`${item.cron} * * *`, () => {
    console.log(`[cron] Sending: ${item.icon} ${item.label} (${item.display})`);
    sendToAll(`${item.icon} ${item.label}`, "", `fittrack-${item.tag}`);
  }, { timezone: "Asia/Jerusalem" });
});

// ── Shopping day reminder: every 2 weeks on Sunday at 09:00 ──
const SHOP_CYCLE_START = new Date("2026-04-05");

cron.schedule("0 9 * * 0", () => {
  // Check if this Sunday is a shopping week (every 2 weeks from start)
  const now = new Date();
  const diffDays = Math.floor((now - SHOP_CYCLE_START) / 864e5);
  if (diffDays >= 0 && diffDays % 14 < 7) {
    // This is a shopping Sunday (within the first week of a 2-week cycle)
    if (diffDays % 14 === 0) {
      console.log("[cron] Shopping day notification!");
      sendToAll("🛒 יום קניות!", "", "fittrack-shopping");
    }
  }
}, { timezone: "Asia/Jerusalem" });

// ── Start ──
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`FitTrack push server running on port ${PORT}`);
  console.log(`VAPID public key: ${VAPID_PUBLIC.substring(0, 20)}...`);
  const subs = await loadSubs();
  console.log(`Subscribers: ${subs.length}`);
  console.log(`Storage: Upstash Redis`);
});
