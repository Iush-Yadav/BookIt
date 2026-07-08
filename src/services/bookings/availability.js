const { RULES } = require("../../config/rules");

function addMinutes(date, minutes) {
  return new Date(new Date(date).getTime() + minutes * 60000);
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
}

function bookingWindow(startAt) {
  const start = new Date(startAt);
  return {
    start,
    end: addMinutes(start, RULES.TIMING.DEFAULT_BOOKING_DURATION_MINUTES)
  };
}

function findTableConflict(bookings, venueId, tableId, requestedStartAt, ignoreBookingId) {
  if (!tableId) return null;
  const requested = bookingWindow(requestedStartAt);
  return bookings.find((booking) => {
    if (booking.id === ignoreBookingId || booking.venue_id !== venueId) return false;
    if (!["confirmed", "pending_restaurant"].includes(booking.status)) return false;
    const heldTable = booking.assigned_table_id || booking.requested_table_id;
    if (heldTable !== tableId) return false;
    const existing = bookingWindow(booking.start_at);
    return overlaps(existing.start, existing.end, requested.start, requested.end);
  }) || null;
}

module.exports = { addMinutes, overlaps, bookingWindow, findTableConflict };
