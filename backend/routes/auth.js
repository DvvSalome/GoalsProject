import { Router } from "express";
import { createAnonClient, createUserClient } from "../lib/supabase.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required." });
  }

  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase.auth.signUp({
      email: String(email).trim(),
      password: String(password),
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(201).json({
      user: data.user,
      session: data.session,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required." });
  }

  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password),
    });
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    return res.json({
      user: data.user,
      session: data.session,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Login failed." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const supabase = createUserClient(req.accessToken);
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .maybeSingle();
    if (pErr) {
      return res.status(500).json({ error: pErr.message });
    }
    return res.json({
      user: req.user,
      profile: profile || { id: req.user.id, email: req.user.email },
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
