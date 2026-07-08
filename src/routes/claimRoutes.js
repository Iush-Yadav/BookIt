const express = require("express");
const { env } = require("../config/env");
const { requireAuth } = require("../middleware/auth");
const { store } = require("../store");

const router = express.Router();

router.post("/host/claims", requireAuth(["host"]), (req, res) => {
  const venue = store.getVenue(req.body.venue_id);
  if (!venue) return res.status(404).json({ error: "Venue not found" });
  if (store.findClaimByVenueAndHost(venue.id, req.user.sub)) {
    return res.status(409).json({ error: "You already claimed this venue" });
  }
  const status = env.claimsInstantApproval ? "verified" : "pending";
  const claim = store.createClaim({
    id: store.nextId("claim"),
    host_user_id: req.user.sub,
    venue_id: venue.id,
    status,
    created_at: new Date().toISOString(),
    reviewed_at: status === "verified" ? new Date().toISOString() : null
  });
  store.updateClaim(claim.id, claim);
  const host = store.findUserById(req.user.sub);
  Object.assign(host, { claimed_venue_id: venue.id, claim_status: status });
  res.status(201).json({ claim, venue });
});

router.get("/host/claim", requireAuth(["host"]), (req, res) => {
  const claim = store.findClaimByHost(req.user.sub);
  if (!claim) return res.status(404).json({ error: "No venue claim found" });
  res.json({ claim, venue: store.getVenue(claim.venue_id) });
});

router.post("/admin/claims/:id/approve", requireAuth(["admin"]), (req, res) => {
  const claim = store.updateClaim(req.params.id, { status: "verified", reviewed_at: new Date().toISOString() });
  if (!claim) return res.status(404).json({ error: "Claim not found" });
  const host = store.findUserById(claim.host_user_id);
  Object.assign(host, { claimed_venue_id: claim.venue_id, claim_status: "verified" });
  res.json({ claim });
});

router.post("/admin/claims/:id/reject", requireAuth(["admin"]), (req, res) => {
  const claim = store.updateClaim(req.params.id, { status: "rejected", reviewed_at: new Date().toISOString(), rejection_reason: req.body.reason || null });
  if (!claim) return res.status(404).json({ error: "Claim not found" });
  res.json({ claim });
});

module.exports = { claimRoutes: router };
