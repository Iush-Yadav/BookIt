const express = require("express");
const { env } = require("../config/env");
const { store } = require("../store");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function publicUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

function register(role) {
  // Use requireAuth without roles to verify the Firebase token but skip DB check
  return [requireAuth([]), async (req, res, next) => {
    try {
      if (store.findUserByEmail(req.user.email, role)) {
        return res.status(409).json({ error: "An account already exists for this email" });
      }
      const user = store.createUser({
        id: store.nextId(role),
        role,
        name: req.body.name || req.body.owner_name || req.user.email.split("@")[0],
        phone: req.body.phone || null,
        email: String(req.user.email).toLowerCase(),
        password_hash: null, // Password handled by Firebase
        claimed_venue_id: null,
        claim_status: null,
        created_at: new Date().toISOString()
      });
      res.status(201).json({ user: publicUser(user) });
    } catch (error) {
      next(error);
    }
  }];
}

function login(role) {
  // requireAuth(roles) will verify the Firebase token AND fetch the DB user matching the role
  return [requireAuth([role]), async (req, res, next) => {
    try {
      const user = store.findUserByEmail(req.user.email, role);
      if (!user) {
        return res.status(404).json({ error: "User profile not found" });
      }
      res.json({ user: publicUser(user) });
    } catch (error) {
      next(error);
    }
  }];
}

router.post("/host/register", register("host"));
router.post("/host/login", login("host"));
router.post("/customer/register", register("customer"));
router.post("/customer/login", login("customer"));

// Admin route kept similar but requires custom claims or special logic.
// For now, allow admin login if it matches env admin email and they have a Firebase token.
router.post("/admin/login", [requireAuth([]), async (req, res, next) => {
  try {
    if (!env.adminEmail || String(req.user.email).toLowerCase() !== env.adminEmail.toLowerCase()) {
      return res.status(401).json({ error: "Not an admin" });
    }
    let user = store.findUserByEmail(req.user.email, "admin");
    if (!user) {
      user = store.createUser({
        id: store.nextId("admin"),
        role: "admin",
        name: "BookIt Admin",
        phone: null,
        email: String(req.user.email).toLowerCase(),
        password_hash: null,
        claimed_venue_id: null,
        claim_status: null,
        created_at: new Date().toISOString()
      });
    }
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}]);

module.exports = { authRoutes: router };
