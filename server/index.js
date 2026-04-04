const express = require("express");
const cors = require("cors");
const webpush = require("web-push");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// VAPID keys — set via env vars in production
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || "BBzsqZhI0Mb7UgBf2U9QahzTLl3MY_FnuWOUaMwIDvkfRQ3KWRbXuPuqNEIQgLJnjTAL0yTwqw1DkLpGaxeheGQ";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "tKnqnHaVgjmd-2gV29p1wpgF02HH2QhCAtH1qWZ_gUg";

webpush.setVapidDetails("mailto:fittrack@example.com", VAPID_PUBLIC, VAPID_PRIVATE);

// Store subscriptions in a JSON file (simple persistence)
const SUBS_FILE = path.join(__dirname, "subscriptions.json");

function loadSubs() {
  try {
    if (fs.existsSync(SUBS_FILE)) return JSON.parse(fs.readFileSync(SUBS_FILE, "utf8"));
  } catch (e) {}
  return [];
}

function saveSubs(subs) {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
}

// ── Routes ──

app.get("/api/vapid-public-key", (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC });
});

app.post("/api/subscribe", (req, res) => {
  const sub = req.body;
  if (!sub || !sub.endpoint) return res.status(400).json({ error: "Invalid subscription" });

  const subs = loadSubs();
  // Avoid duplicates
  if (!subs.find(s => s.endpoint === sub.endpoint)) {
    subs.push(sub);
    saveSubs(subs);
    console.log(`[subscribe] New subscription added. Total: ${subs.length}`);
  }
  res.json({ ok: true });
});

app.post("/api/unsubscribe", (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });

  let subs = loadSubs();
  subs = subs.filter(s => s.endpoint !== endpoint);
  saveSubs(subs);
  console.log(`[unsubscribe] Removed. Total: ${subs.length}`);
  res.json({ ok: true });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", subscribers: loadSubs().length });
});

// ── Steps tracking ──
const STEPS_FILE = path.join(__dirname, "steps.json");

function loadSteps() {
  try {
    if (fs.existsSync(STEPS_FILE)) return JSON.parse(fs.readFileSync(STEPS_FILE, "utf8"));
  } catch (e) {}
  return {};
}

function saveSteps(data) {
  fs.writeFileSync(STEPS_FILE, JSON.stringify(data, null, 2));
}

// POST /api/steps — save steps for a date { date: "2026-04-04", steps: 8500 }
app.post("/api/steps", (req, res) => {
  const { date, steps } = req.body;
  if (!date || steps === undefined) return res.status(400).json({ error: "Missing date or steps" });
  const data = loadSteps();
  data[date] = parseInt(steps) || 0;
  saveSteps(data);
  console.log(`[steps] ${date}: ${data[date]}`);
  res.json({ ok: true, date, steps: data[date] });
});

// GET /api/steps?date=2026-04-04 or /api/steps?days=7
app.get("/api/steps", (req, res) => {
  const data = loadSteps();
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
app.post("/api/test", async (req, res) => {
  const subs = loadSubs();
  if (subs.length === 0) return res.json({ ok: false, error: "No subscribers" });
  await sendToAll("🔔 בדיקת התראות", "", "fittrack-test");
  res.json({ ok: true, sent: subs.length });
});

// ── Send notification to all subscribers ──
async function sendToAll(title, body, tag) {
  const subs = loadSubs();
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
    saveSubs(cleaned);
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
app.listen(PORT, () => {
  console.log(`FitTrack push server running on port ${PORT}`);
  console.log(`VAPID public key: ${VAPID_PUBLIC.substring(0, 20)}...`);
  console.log(`Subscribers: ${loadSubs().length}`);
});
