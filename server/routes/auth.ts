import { Router } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const router = Router();
const DATA = path.resolve(__dirname, "../data");
const USERS_FILE = path.join(DATA, "users.json");
const RESETS_FILE = path.join(DATA, "resets.json");
const OTPS_FILE = path.join(DATA, "otps.json");

function readJson(file: string) {
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function writeJson(file: string, data: any) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

function hashPW(password: string, salt?: string) {
  salt = salt || crypto.randomBytes(12).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 310000, 32, "sha256")
    .toString("hex");
  return { salt, hash };
}

function verifyPW(password: string, salt: string, hash: string) {
  const h = crypto
    .pbkdf2Sync(password, salt, 310000, 32, "sha256")
    .toString("hex");
  return h === hash;
}

// ensure files
if (!fs.existsSync(USERS_FILE)) writeJson(USERS_FILE, []);
if (!fs.existsSync(RESETS_FILE)) writeJson(RESETS_FILE, {});
if (!fs.existsSync(OTPS_FILE)) writeJson(OTPS_FILE, {});

// Helper to load users
function loadUsers() {
  return readJson(USERS_FILE) || [];
}
function saveUsers(users: any[]) {
  writeJson(USERS_FILE, users);
}

// Seed default passwords if missing
const users = loadUsers();
let changed = false;
for (const u of users) {
  if (!u.hash || !u.salt) {
    const creds = hashPW("Password123!");
    u.salt = creds.salt;
    u.hash = creds.hash;
    changed = true;
  }
}
if (changed) saveUsers(users);

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password)
    return res.json({ ok: false, error: "Missing" });
  const users = loadUsers();
  const u = users.find(
    (x: any) =>
      (x.email && x.email.toLowerCase() === identifier.toLowerCase()) ||
      x.name.toLowerCase() === identifier.toLowerCase(),
  );
  if (!u) return res.json({ ok: false, error: "User not found" });

  if (u.lockedUntil) {
    const until = new Date(u.lockedUntil);
    if (until > new Date()) return res.json({ ok: false, error: "Locked" });
    u.lockedUntil = null;
    u.failedAttempts = 0;
  }

  if (!verifyPW(password, u.salt, u.hash)) {
    u.failedAttempts = (u.failedAttempts || 0) + 1;
    if (u.failedAttempts >= 5) {
      const until = new Date();
      until.setMinutes(until.getMinutes() + 15);
      u.lockedUntil = until.toISOString();
    }
    saveUsers(users);
    return res.json({ ok: false, error: "Invalid credentials" });
  }

  // success
  u.failedAttempts = 0;
  u.lockedUntil = null;
  saveUsers(users);
  if (u.twoFactor) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otps = readJson(OTPS_FILE) || {};
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 5);
    otps[u.id] = { code, expiresAt: expires.toISOString() };
    writeJson(OTPS_FILE, otps);
    // For demo return code
    return res.json({ ok: true, mfa: true, userId: u.id, demoCode: code });
  }

  if (u.mustChangePassword) {
    return res.json({ ok: true, mustChangePassword: true, userId: u.id });
  }

  return res.json({
    ok: true,
    user: { id: u.id, name: u.name, email: u.email },
  });
});

// POST /api/auth/admin/set-password
router.post("/admin/set-password", (req, res) => {
  const { identifier, userId, password, mustChangePassword } = req.body || {};
  if ((!identifier && !userId) || !password)
    return res.json({ ok: false, error: "Missing" });
  const users = loadUsers();
  const u = users.find(
    (x: any) =>
      (identifier && x.email && x.email.toLowerCase() === String(identifier).toLowerCase()) ||
      (userId && x.id === userId),
  );
  if (!u) return res.json({ ok: false, error: "User not found" });
  const creds = hashPW(password);
  u.salt = creds.salt;
  u.hash = creds.hash;
  u.failedAttempts = 0;
  u.lockedUntil = null;
  if (typeof mustChangePassword === "boolean") u.mustChangePassword = mustChangePassword;
  saveUsers(users);
  return res.json({ ok: true });
});

// POST /api/auth/first-login
router.post("/first-login", (req, res) => {
  const { userId, password } = req.body || {};
  if (!userId || !password) return res.json({ ok: false, error: "Missing" });
  const users = loadUsers();
  const u = users.find((x: any) => x.id === userId);
  if (!u) return res.json({ ok: false, error: "User not found" });
  const creds = hashPW(password);
  u.salt = creds.salt;
  u.hash = creds.hash;
  u.failedAttempts = 0;
  u.lockedUntil = null;
  u.mustChangePassword = false;
  saveUsers(users);
  return res.json({ ok: true });
});

// update admin users output to include mustChangePassword
router.get("/admin/users", (req, res) => {
  const users = loadUsers();
  const out = users.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    failedAttempts: u.failedAttempts || 0,
    lockedUntil: u.lockedUntil || null,
    twoFactor: !!u.twoFactor,
    mustChangePassword: !!u.mustChangePassword,
  }));
  res.json(out);
});

// POST /api/auth/verify-otp
router.post("/verify-otp", (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.json({ ok: false, error: "Missing" });
  const otps = readJson(OTPS_FILE) || {};
  const entry = otps[userId];
  if (!entry) return res.json({ ok: false, error: "No OTP" });
  if (new Date(entry.expiresAt) < new Date())
    return res.json({ ok: false, error: "Expired" });
  if (entry.code !== code) return res.json({ ok: false, error: "Invalid" });
  delete otps[userId];
  writeJson(OTPS_FILE, otps);
  return res.json({ ok: true });
});

// POST /api/auth/verify-token
router.post("/verify-token", (req, res) => {
  const { token } = req.body;
  if (!token) return res.json({ ok: false, error: "Missing" });
  const resets = readJson(RESETS_FILE) || {};
  const entry = resets[token];
  if (!entry) return res.json({ ok: false, error: "Invalid token" });
  if (new Date(entry.expiresAt) < new Date())
    return res.json({ ok: false, error: "Expired" });
  return res.json({ ok: true, email: entry.email });
});

// POST /api/auth/forgot
router.post("/forgot", (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ ok: false });
  const users = loadUsers();
  const u = users.find((x: any) => x.email === email);
  if (!u) return res.json({ ok: false });
  const token = Math.random().toString(36).slice(2, 10);
  const resets = readJson(RESETS_FILE) || {};
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);
  resets[token] = { email, expiresAt: expires.toISOString() };
  writeJson(RESETS_FILE, resets);
  return res.json({ ok: true, token });
});

// POST /api/auth/reset
router.post("/reset", (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.json({ ok: false, error: "Missing" });
  const resets = readJson(RESETS_FILE) || {};
  const entry = resets[token];
  if (!entry) return res.json({ ok: false, error: "Invalid" });
  if (new Date(entry.expiresAt) < new Date())
    return res.json({ ok: false, error: "Expired" });
  const users = loadUsers();
  const u = users.find((x: any) => x.email === entry.email);
  if (!u) return res.json({ ok: false, error: "User not found" });
  const creds = hashPW(password);
  u.salt = creds.salt;
  u.hash = creds.hash;
  u.failedAttempts = 0;
  u.lockedUntil = null;
  saveUsers(users);
  delete resets[token];
  writeJson(RESETS_FILE, resets);
  return res.json({ ok: true });
});

// Admin endpoints
router.get("/admin/users", (req, res) => {
  const users = loadUsers();
  const out = users.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    failedAttempts: u.failedAttempts || 0,
    lockedUntil: u.lockedUntil || null,
    twoFactor: !!u.twoFactor,
  }));
  res.json(out);
});

router.patch("/admin/users/:id", (req, res) => {
  const id = req.params.id;
  const { twoFactor, resetLock } = req.body;
  const users = loadUsers();
  const u = users.find((x: any) => x.id === id);
  if (!u) return res.json({ ok: false, error: "User not found" });
  if (typeof twoFactor === "boolean") u.twoFactor = twoFactor;
  if (resetLock) {
    u.failedAttempts = 0;
    u.lockedUntil = null;
  }
  saveUsers(users);
  res.json({ ok: true });
});

export default router;
