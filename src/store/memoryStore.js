const { randomUUID } = require("crypto");
const { seedVenues } = require("../data/rourkelaSeed");
const { buildLayout } = require("../services/layouts/templates");

function createMemoryStore() {
  const users = [];
  const claims = [];
  const bookings = [];
  const idempotency = new Map();
  const venues = seedVenues.map((venue) => ({ ...venue }));
  const layouts = new Map(venues.map((venue) => [venue.id, buildLayout(venue.layout_template_id, venue.id)]));

  function resetVenuesAndLayouts() {
    venues.splice(0, venues.length, ...seedVenues.map((venue) => ({ ...venue })));
    layouts.clear();
    for (const venue of venues) {
      layouts.set(venue.id, buildLayout(venue.layout_template_id, venue.id));
    }
  }

  return {
    users,
    claims,
    bookings,
    venues,
    reset() {
      users.splice(0);
      claims.splice(0);
      bookings.splice(0);
      idempotency.clear();
      resetVenuesAndLayouts();
    },
    nextId(prefix) {
      return `${prefix}_${randomUUID()}`;
    },
    idempotencyGet(key) {
      return idempotency.get(key);
    },
    idempotencySet(key, value) {
      idempotency.set(key, value);
    },
    findUserByEmail(email, role) {
      return users.find((user) => user.email.toLowerCase() === String(email).toLowerCase() && user.role === role);
    },
    findUserById(id) {
      return users.find((user) => user.id === id);
    },
    createUser(user) {
      users.push(user);
      return user;
    },
    listVenues(query = {}) {
      let result = venues;
      if (query.search) {
        const needle = String(query.search).toLowerCase();
        result = result.filter((venue) => [venue.name, venue.address, venue.category, ...venue.cuisines].join(" ").toLowerCase().includes(needle));
      }
      if (query.category && query.category !== "All") {
        result = result.filter((venue) => venue.category === query.category);
      }
      return result;
    },
    getVenue(id) {
      return venues.find((venue) => venue.id === id);
    },
    upsertVenues(nextVenues) {
      for (const venue of nextVenues) {
        const existing = venues.find((item) => item.provider_place_id === venue.provider_place_id);
        if (existing) Object.assign(existing, venue);
        else venues.push(venue);
        if (!layouts.has(venue.id)) layouts.set(venue.id, buildLayout(venue.layout_template_id, venue.id));
      }
      return venues;
    },
    getLayout(venueId) {
      return layouts.get(venueId);
    },
    setLayout(venueId, layout) {
      layouts.set(venueId, layout);
      return layout;
    },
    createClaim(claim) {
      claims.push(claim);
      return claim;
    },
    findClaimByHost(hostId) {
      return claims.find((claim) => claim.host_user_id === hostId);
    },
    findClaimByVenueAndHost(venueId, hostId) {
      return claims.find((claim) => claim.venue_id === venueId && claim.host_user_id === hostId);
    },
    getClaim(id) {
      return claims.find((claim) => claim.id === id);
    },
    updateClaim(id, patch) {
      const claim = claims.find((item) => item.id === id);
      if (!claim) return null;
      Object.assign(claim, patch);
      return claim;
    },
    createBooking(booking) {
      bookings.push(booking);
      return booking;
    },
    getBooking(id) {
      return bookings.find((booking) => booking.id === id);
    },
    updateBooking(id, patch) {
      const booking = bookings.find((item) => item.id === id);
      if (!booking) return null;
      Object.assign(booking, patch);
      return booking;
    },
    listBookings(filter = {}) {
      return bookings.filter((booking) => {
        if (filter.customer_user_id && booking.customer_user_id !== filter.customer_user_id) return false;
        if (filter.venue_id && booking.venue_id !== filter.venue_id) return false;
        if (filter.status && booking.status !== filter.status) return false;
        return true;
      });
    }
  };
}

module.exports = { createMemoryStore };
