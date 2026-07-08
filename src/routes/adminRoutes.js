const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { store } = require("../store");
const { buildLayout } = require("../services/layouts/templates");

const router = express.Router();

router.post("/admin/venues/:id/assign-layout-template", requireAuth(["admin"]), (req, res) => {
  const venue = store.getVenue(req.params.id);
  if (!venue) return res.status(404).json({ error: "Venue not found" });
  venue.layout_template_id = req.body.template_id;
  const layout = store.setLayout(venue.id, buildLayout(req.body.template_id, venue.id));
  res.json({ venue, layout });
});

router.put("/admin/venues/:id/layout", requireAuth(["admin"]), (req, res) => {
  const venue = store.getVenue(req.params.id);
  if (!venue) return res.status(404).json({ error: "Venue not found" });
  const layout = store.setLayout(venue.id, req.body.layout);
  res.json({ layout });
});

router.post("/admin/venues/:id/tables", requireAuth(["admin"]), (req, res) => {
  const layout = store.getLayout(req.params.id);
  if (!layout) return res.status(404).json({ error: "Venue layout not found" });
  const table = { ...req.body, venue_id: req.params.id, id: req.body.id || store.nextId("table"), source: "bookit_admin", is_active: true };
  layout.tables.push(table);
  res.status(201).json({ table });
});

router.put("/admin/tables/:id", requireAuth(["admin"]), (req, res) => {
  for (const venue of store.venues) {
    const layout = store.getLayout(venue.id);
    const table = layout && layout.tables.find((item) => item.id === req.params.id);
    if (table) {
      Object.assign(table, req.body);
      return res.json({ table });
    }
  }
  res.status(404).json({ error: "Table not found" });
});

router.delete("/admin/tables/:id", requireAuth(["admin"]), (req, res) => {
  for (const venue of store.venues) {
    const layout = store.getLayout(venue.id);
    const table = layout && layout.tables.find((item) => item.id === req.params.id);
    if (table) {
      table.is_active = false;
      return res.json({ table });
    }
  }
  res.status(404).json({ error: "Table not found" });
});

module.exports = { adminRoutes: router };
