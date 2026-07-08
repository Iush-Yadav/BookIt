const express = require("express");
const { RULES } = require("../config/rules");
const { requireAuth } = require("../middleware/auth");
const { store } = require("../store");
const {
  createBooking,
  acceptBooking,
  declineBooking,
  transitionBooking,
  requireVenueClaim
} = require("../services/bookings/bookingService");

const router = express.Router();

function decorate(booking) {
  return {
    ...booking,
    venue: store.getVenue(booking.venue_id)
  };
}

router.post("/bookings", requireAuth(["customer"]), (req, res, next) => {
  try {
    const booking = createBooking({
      customerUserId: req.user.sub,
      body: req.body,
      idempotencyKey: req.headers["idempotency-key"]
    });
    res.status(201).json({ booking: decorate(booking) });
  } catch (error) {
    next(error);
  }
});

router.get("/bookings/mine", requireAuth(["customer"]), (req, res) => {
  res.json({ bookings: store.listBookings({ customer_user_id: req.user.sub }).map(decorate) });
});

router.post("/bookings/:id/cancel", requireAuth(["customer"]), (req, res, next) => {
  try {
    const booking = store.getBooking(req.params.id);
    if (!booking || booking.customer_user_id !== req.user.sub) return res.status(404).json({ error: "Booking not found" });
    const updated = transitionBooking(booking, "cancelled_by_customer", { cancelled_at: new Date().toISOString() });
    res.json({ booking: decorate(updated) });
  } catch (error) {
    next(error);
  }
});

router.post("/bookings/:id/retry", requireAuth(["customer"]), (req, res, next) => {
  try {
    const previous = store.getBooking(req.params.id);
    if (!previous || previous.customer_user_id !== req.user.sub) return res.status(404).json({ error: "Booking not found" });
    if (!["declined", "expired", "cancelled_by_customer"].includes(previous.status)) {
      return res.status(409).json({ error: "Only declined, expired, or cancelled requests can be retried" });
    }
    const booking = createBooking({
      customerUserId: req.user.sub,
      body: { ...previous, ...req.body, request_id: req.body.request_id },
      idempotencyKey: req.headers["idempotency-key"]
    });
    res.status(201).json({ booking: decorate(booking) });
  } catch (error) {
    next(error);
  }
});

router.get("/host/home", requireAuth(["host"]), (req, res, next) => {
  try {
    const claim = store.findClaimByHost(req.user.sub);
    if (!claim || claim.status !== "verified") return res.status(403).json({ error: "Claim a venue before viewing bookings" });
    const venue = store.getVenue(claim.venue_id);
    const bookings = store.listBookings({ venue_id: venue.id }).map(decorate);
    const today = new Date().toISOString().slice(0, 10);
    res.json({
      venue,
      accepting_requests: venue.booking_status === "accepting_requests",
      stats: {
        new_requests: bookings.filter((b) => b.status === "pending_restaurant").length,
        confirmed_today: bookings.filter((b) => b.status === "confirmed" && b.start_at.startsWith(today)).length,
        arriving_soon: bookings.filter((b) => b.status === "confirmed").length,
        completed_today: bookings.filter((b) => b.status === "completed" && b.updated_at.startsWith(today)).length
      },
      new_requests: bookings.filter((b) => b.status === "pending_restaurant")
    });
  } catch (error) {
    next(error);
  }
});

router.get("/host/bookings", requireAuth(["host"]), (req, res, next) => {
  try {
    const claim = store.findClaimByHost(req.user.sub);
    if (!claim || claim.status !== "verified") return res.status(403).json({ error: "Claim a venue before viewing bookings" });
    let bookings = store.listBookings({ venue_id: claim.venue_id }).map(decorate);
    if (req.query.status) bookings = bookings.filter((booking) => booking.status === req.query.status);
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

router.get("/host/bookings/:id", requireAuth(["host"]), (req, res, next) => {
  try {
    const booking = store.getBooking(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    requireVenueClaim(req.user.sub, booking.venue_id);
    res.json({ booking: decorate(booking) });
  } catch (error) {
    next(error);
  }
});

router.put("/host/venue/booking-status", requireAuth(["host"]), (req, res, next) => {
  try {
    const claim = store.findClaimByHost(req.user.sub);
    if (!claim || claim.status !== "verified") return res.status(403).json({ error: "Claim a venue before changing booking status" });
    const venue = store.getVenue(claim.venue_id);
    const status = req.body.booking_status;
    if (!["accepting_requests", "paused"].includes(status)) {
      return res.status(400).json({ error: "booking_status must be accepting_requests or paused" });
    }
    venue.booking_status = status;
    res.json({ venue });
  } catch (error) {
    next(error);
  }
});

router.post("/host/bookings/:id/accept", requireAuth(["host"]), (req, res, next) => {
  try {
    const booking = acceptBooking({
      hostUserId: req.user.sub,
      bookingId: req.params.id,
      assignedTableId: req.body.assigned_table_id,
      idempotencyKey: req.headers["idempotency-key"]
    });
    res.json({ booking: decorate(booking) });
  } catch (error) {
    next(error);
  }
});

router.post("/host/bookings/:id/decline", requireAuth(["host"]), (req, res, next) => {
  try {
    const booking = declineBooking({
      hostUserId: req.user.sub,
      bookingId: req.params.id,
      reason: req.body.reason,
      note: req.body.note,
      idempotencyKey: req.headers["idempotency-key"]
    });
    res.json({ booking: decorate(booking) });
  } catch (error) {
    next(error);
  }
});

router.post("/host/bookings/:id/arrived", requireAuth(["host"]), (req, res, next) => {
  try {
    const booking = store.getBooking(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    requireVenueClaim(req.user.sub, booking.venue_id);
    res.json({ booking: decorate(transitionBooking(booking, "arrived", { arrived_at: new Date().toISOString() })) });
  } catch (error) {
    next(error);
  }
});

router.post("/host/bookings/:id/completed", requireAuth(["host"]), (req, res, next) => {
  try {
    const booking = store.getBooking(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    requireVenueClaim(req.user.sub, booking.venue_id);
    res.json({ booking: decorate(transitionBooking(booking, "completed", { completed_at: new Date().toISOString() })) });
  } catch (error) {
    next(error);
  }
});

router.post("/host/bookings/:id/cancel", requireAuth(["host"]), (req, res, next) => {
  try {
    const booking = store.getBooking(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    requireVenueClaim(req.user.sub, booking.venue_id);
    res.json({ booking: decorate(transitionBooking(booking, "cancelled_by_restaurant", { cancelled_at: new Date().toISOString(), cancel_reason: req.body.reason || "" })) });
  } catch (error) {
    next(error);
  }
});

router.get("/rules", (req, res) => res.json({ rules: RULES }));

module.exports = { bookingRoutes: router };
