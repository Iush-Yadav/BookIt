const { verifyToken } = require("../auth/jwt");
const { store } = require("../store");

function requireAuth(roles = []) {
  return async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Authentication required" });
    
    try {
      const payload = await verifyToken(token);
      
      // Allow passing without DB user if the route is for registration/syncing
      if (req.path.includes("/register") || req.path.includes("/sync")) {
         req.user = { email: payload.email, uid: payload.uid };
         return next();
      }

      // Find the user in the database to get their role and internal ID
      let dbUser = null;
      for (const role of (roles.length ? roles : ["customer", "host", "admin"])) {
        dbUser = store.findUserByEmail(payload.email, role);
        if (dbUser) break;
      }

      if (!dbUser) {
        return res.status(401).json({ error: "User profile not found. Please complete registration." });
      }

      if (roles.length && !roles.includes(dbUser.role)) {
        return res.status(403).json({ error: "This account cannot access that resource" });
      }

      req.user = { sub: dbUser.id, role: dbUser.role, email: dbUser.email, uid: payload.uid };
      return next();
    } catch (error) {
      console.error("Auth error:", error.message);
      return res.status(401).json({ error: "Invalid or expired session" });
    }
  };
}

module.exports = { requireAuth };
