const { RULES } = require("../../config/rules");

const transitions = {
  pending_restaurant: ["confirmed", "declined", "expired", "cancelled_by_customer"],
  confirmed: ["arrived", "cancelled_by_customer", "cancelled_by_restaurant", "no_show"],
  arrived: ["completed", "cancelled_by_restaurant"],
  declined: [],
  expired: [],
  completed: [],
  cancelled_by_customer: [],
  cancelled_by_restaurant: [],
  no_show: []
};

function assertKnownStatus(status) {
  if (!RULES.BOOKING_STATUSES.includes(status)) {
    const error = new Error(`Unknown booking status: ${status}`);
    error.status = 400;
    throw error;
  }
}

function canTransition(from, to) {
  assertKnownStatus(from);
  assertKnownStatus(to);
  return transitions[from].includes(to);
}

function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    const error = new Error(`Cannot transition booking from ${from} to ${to}`);
    error.status = 409;
    throw error;
  }
}

module.exports = { transitions, canTransition, assertTransition };
