const express = require("express");
const { store } = require("../store");
const { getPlacesProvider } = require("../services/places/placesProvider");
const { findTableConflict } = require("../services/bookings/availability");

const router = express.Router();

router.get("/venues", (req, res) => {
  res.json({ city: "Rourkela", venues: store.listVenues(req.query) });
});

router.get("/venues/search", (req, res) => {
  res.json({ city: "Rourkela", venues: store.listVenues({ search: req.query.q || req.query.search }) });
});

router.get("/venues/:id", (req, res) => {
  const venue = store.getVenue(req.params.id);
  if (!venue) return res.status(404).json({ error: "Venue not found" });
  res.json({ venue });
});

router.get("/venues/:id/layout", (req, res) => {
  const venue = store.getVenue(req.params.id);
  if (!venue) return res.status(404).json({ error: "Venue not found" });
  res.json({ layout: store.getLayout(req.params.id) });
});

router.get("/venues/:id/tables/requestable", (req, res) => {
  const layout = store.getLayout(req.params.id);
  if (!layout) return res.status(404).json({ error: "Venue layout not found" });
  const startAt = req.query.start_at;
  const tables = layout.tables.map((table) => ({
    ...table,
    requestable: !startAt || !findTableConflict(store.bookings, req.params.id, table.id, startAt)
  }));
  res.json({ tables });
});

router.post("/admin/venues/sync-rourkela", async (req, res, next) => {
  try {
    const provider = getPlacesProvider();
    const venues = await provider.discoverRourkelaVenues();
    store.upsertVenues(venues);
    res.json({ count: venues.length, provider: venues[0] ? venues[0].provider : "none", venues });
  } catch (error) {
    next(error);
  }
});

module.exports = { venueRoutes: router };
