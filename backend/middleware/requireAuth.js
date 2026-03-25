import { createAnonClient } from "../lib/supabase.js";

/**
 * Expects `Authorization: Bearer <access_token>`.
 * Sets `req.user`, `req.accessToken`.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return res.status(401).json({ error: "Missing Authorization Bearer token." });
  }

  try {
    const supabase = createAnonClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired session." });
    }
    req.user = user;
    req.accessToken = token;
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Authentication failed." });
  }
}
