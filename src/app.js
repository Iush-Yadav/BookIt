const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { authRoutes } = require("./routes/authRoutes");
const { venueRoutes } = require("./routes/venueRoutes");
const { claimRoutes } = require("./routes/claimRoutes");
const { bookingRoutes } = require("./routes/bookingRoutes");
const { adminRoutes } = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errors");

function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "200kb" }));
  app.use(rateLimit({ windowMs: 60 * 1000, limit: 240, standardHeaders: true, legacyHeaders: false }));
  app.get("/health", (req, res) => res.json({ ok: true, service: "bookit-backend" }));
  app.use("/api/auth", authRoutes);
  app.use("/api", venueRoutes);
  app.use("/api", claimRoutes);
  app.use("/api", bookingRoutes);
  app.use("/api", adminRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
