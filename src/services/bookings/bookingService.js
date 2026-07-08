const { RULES } = require("../../config/rules");
const { store } = require("../../store");
const { addMinutes, findTableConflict } = require("./availability");
const { assertTransition } = require("./stateMachine");

function requireVenueClaim(hostUserId, venueId) {
  const claim = store.findClaimByHost(hostUserId);
  if (!claim || claim.venue_id !== venueId || claim.status !== "verified") {
    const error = new Error("A verified venue claim is required");
    error.status = 403;
    throw error;
  }
  return claim;
}

function validateBookingPayload(body) {
  if (!RULES.BOOKING_TYPES.includes(body.booking_type)) {
    const error = new Error("Unsupported booking type");
    error.status = 400;
    throw error;
  }
  if (!body.venue_id || !body.start_at || !body.party_size || Number(body.party_size) < 1) {
    const error = new Error("Venue, start time, and party size are required");
    error.status = 400;
    throw error;
  }
  const start = new Date(body.start_at);
  if (Number.isNaN(start.getTime())) {
    const error = new Error("Invalid booking start time");
    error.status = 400;
    throw error;
  }
  const max = addMinutes(new Date(), RULES.TIMING.MAX_ADVANCE_BOOKING_DAYS * 24 * 60);
  if (start > max) {
    const error = new Error("Bookings can only be requested up to 30 days ahead");
    error.status = 400;
    throw error;
  }
}

function createBooking({ customerUserId, body, idempotencyKey }) {
  validateBookingPayload(body);
  const venue = store.getVenue(body.venue_id);
  if (!venue) {
    const error = new Error("Venue not found");
    error.status = 404;
    throw error;
  }
  if (venue.booking_status !== "accepting_requests") {
    const error = new Error("This venue is not accepting booking requests right now");
    error.status = 409;
    throw error;
  }
  const stableKey = idempotencyKey || body.request_id;
  if (!stableKey) {
    const error = new Error("Idempotency-Key header or request_id is required");
    error.status = 400;
    throw error;
  }
  const stored = store.idempotencyGet(`booking:${customerUserId}:${stableKey}`);
  if (stored) return stored;

  if (body.booking_type === "table_specific") {
    if (!body.requested_table_id) {
      const error = new Error("A requested table is required for Pick My Table");
      error.status = 400;
      throw error;
    }
    const conflict = findTableConflict(store.bookings, venue.id, body.requested_table_id, body.start_at);
    if (conflict) {
      const error = new Error("That table already has an overlapping request");
      error.status = 409;
      throw error;
    }
  }

  const now = new Date();
  const booking = store.createBooking({
    id: store.nextId("booking"),
    venue_id: venue.id,
    customer_user_id: customerUserId,
    customer_name: body.customer_name || "Guest",
    booking_type: body.booking_type,
    party_size: Number(body.party_size),
    start_at: new Date(body.start_at).toISOString(),
    duration_minutes: RULES.TIMING.DEFAULT_BOOKING_DURATION_MINUTES,
    requested_table_id: body.requested_table_id || null,
    assigned_table_id: null,
    assignment_changed: false,
    special_request: body.special_request || "",
    decline_reason: null,
    decline_note: null,
    status: "pending_restaurant",
    booking_fee: RULES.PRICING[body.booking_type],
    payment_status: "not_collected",
    expires_at: addMinutes(now, RULES.TIMING.RESTAURANT_RESPONSE_WINDOW_MINUTES).toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  });
  store.idempotencySet(`booking:${customerUserId}:${stableKey}`, booking);
  return booking;
}

function transitionBooking(booking, status, patch = {}) {
  assertTransition(booking.status, status);
  return store.updateBooking(booking.id, { ...patch, status, updated_at: new Date().toISOString() });
}

function acceptBooking({ hostUserId, bookingId, assignedTableId, idempotencyKey }) {
  const booking = store.getBooking(bookingId);
  if (!booking) {
    const error = new Error("Booking not found");
    error.status = 404;
    throw error;
  }
  requireVenueClaim(hostUserId, booking.venue_id);
  const stableKey = idempotencyKey || `accept:${bookingId}`;
  const stored = store.idempotencyGet(`host:${hostUserId}:${stableKey}`);
  if (stored) return stored;
  if (booking.status === "confirmed") return booking;
  const tableId = assignedTableId || booking.requested_table_id || null;
  if (tableId) {
    const conflict = findTableConflict(store.bookings, booking.venue_id, tableId, booking.start_at, booking.id);
    if (conflict) {
      const error = new Error("Selected table has an overlapping confirmed or pending request");
      error.status = 409;
      throw error;
    }
  }
  const updated = transitionBooking(booking, "confirmed", {
    assigned_table_id: tableId,
    assignment_changed: Boolean(booking.requested_table_id && tableId && tableId !== booking.requested_table_id),
    accepted_at: new Date().toISOString()
  });
  store.idempotencySet(`host:${hostUserId}:${stableKey}`, updated);
  return updated;
}

function declineBooking({ hostUserId, bookingId, reason, note, idempotencyKey }) {
  const booking = store.getBooking(bookingId);
  if (!booking) {
    const error = new Error("Booking not found");
    error.status = 404;
    throw error;
  }
  requireVenueClaim(hostUserId, booking.venue_id);
  const stableKey = idempotencyKey || `decline:${bookingId}`;
  const stored = store.idempotencyGet(`host:${hostUserId}:${stableKey}`);
  if (stored) return stored;
  if (booking.status === "declined") return booking;
  const updated = transitionBooking(booking, "declined", {
    decline_reason: reason || "Other",
    decline_note: note || "",
    declined_at: new Date().toISOString()
  });
  store.idempotencySet(`host:${hostUserId}:${stableKey}`, updated);
  return updated;
}

function sweepExpiredAndNoShows(now = new Date()) {
  const changed = [];
  for (const booking of store.bookings) {
    if (booking.status === "pending_restaurant" && new Date(booking.expires_at) <= now) {
      changed.push(transitionBooking(booking, "expired", { expired_at: now.toISOString() }));
    }
    if (booking.status === "confirmed") {
      const noShowAt = addMinutes(booking.start_at, RULES.TIMING.ARRIVAL_WINDOW_MINUTES);
      if (noShowAt <= now) {
        changed.push(transitionBooking(booking, "no_show", { no_show_at: now.toISOString() }));
      }
    }
  }
  return changed;
}

module.exports = {
  createBooking,
  acceptBooking,
  declineBooking,
  transitionBooking,
  requireVenueClaim,
  sweepExpiredAndNoShows
};
