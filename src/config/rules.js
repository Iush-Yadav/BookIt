const RULES = {
  PRICING: {
    table_random: 20,
    table_specific: 200,
    gathering: 100,
    banquet_hall: 500
  },
  TIMING: {
    DEFAULT_BOOKING_DURATION_MINUTES: 120,
    ARRIVAL_WINDOW_MINUTES: 30,
    RESTAURANT_RESPONSE_WINDOW_MINUTES: Number(process.env.RESTAURANT_RESPONSE_WINDOW_MINUTES || 15),
    AUTO_SWEEP_INTERVAL_MS: 60000,
    MAX_ADVANCE_BOOKING_DAYS: 30
  },
  BOOKING_TYPES: [
    "table_random",
    "table_specific",
    "gathering",
    "banquet_hall"
  ],
  BOOKING_STATUSES: [
    "pending_restaurant",
    "confirmed",
    "declined",
    "expired",
    "arrived",
    "completed",
    "cancelled_by_customer",
    "cancelled_by_restaurant",
    "no_show"
  ],
  CLAIM_STATUSES: ["pending", "verified", "rejected"],
  CATEGORIES: [
    "RESTAURANT",
    "CAFE",
    "BAR",
    "BISTRO",
    "LOUNGE",
    "RESTRO_BAR",
    "PUB",
    "BREWERY",
    "ROOFTOP",
    "FINE_DINING",
    "FAMILY_DINING",
    "BAKERY_CAFE",
    "HOTEL_RESTAURANT"
  ]
};

module.exports = { RULES };
