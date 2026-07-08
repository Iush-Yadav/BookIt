require("dotenv").config();

const ROURKELA_CENTER = {
  lat: Number(process.env.ROURKELA_LAT || 22.2604),
  lng: Number(process.env.ROURKELA_LNG || 84.8536),
  radiusMeters: Number(process.env.ROURKELA_RADIUS_METERS || 12000)
};

const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "dev-only-change-me",
  dataStore: process.env.DATA_STORE || "memory",
  placesProvider: process.env.PLACES_PROVIDER || (process.env.GOOGLE_MAPS_API_KEY ? "google" : "mock"),
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  claimsInstantApproval: String(process.env.CLAIMS_INSTANT_APPROVAL || "true") === "true",
  adminEmail: process.env.ADMIN_EMAIL || "",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  rourkela: ROURKELA_CENTER
};

module.exports = { env };
