process.env.NODE_ENV = "test";
process.env.ADMIN_EMAIL = "admin@bookit.test";
process.env.ADMIN_PASSWORD = "adminsecret";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");
const { store } = require("../src/store");
const { RULES } = require("../src/config/rules");
const { sweepExpiredAndNoShows } = require("../src/services/bookings/bookingService");

let baseUrl;
let server;

test.before(async () => {
  server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test.beforeEach(() => {
  store.reset();
});

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const json = await response.json();
  return { response, json };
}

async function register(role, suffix = "") {
  const path = role === "host" ? "/auth/host/register" : "/auth/customer/register";
  const { response, json } = await request(path, {
    method: "POST",
    body: { name: `${role}${suffix}`, owner_name: `Owner ${suffix}`, phone: "9999999999", email: `${role}${suffix}@bookit.test`, password: "secret123" }
  });
  assert.equal(response.status, 201);
  return json;
}

async function claimVenue(hostToken, venueId = "demo-bolt-brewing-co") {
  const { response, json } = await request("/host/claims", {
    method: "POST",
    headers: { Authorization: `Bearer ${hostToken}` },
    body: { venue_id: venueId }
  });
  assert.equal(response.status, 201);
  return json;
}

async function createBooking(customerToken, body = {}, key = "booking-key") {
  const start = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const { response, json } = await request("/bookings", {
    method: "POST",
    headers: { Authorization: `Bearer ${customerToken}`, "Idempotency-Key": key },
    body: {
      venue_id: "demo-bolt-brewing-co",
      booking_type: "table_random",
      party_size: 2,
      start_at: start,
      customer_name: "Asha",
      ...body
    }
  });
  return { response, json };
}

test("auth supports customer and host registration, login, invalid credentials, and role rejection", async () => {
  const host = await register("host");
  const customer = await register("customer");
  assert.equal(host.user.role, "host");
  assert.equal(customer.user.role, "customer");

  const login = await request("/auth/customer/login", {
    method: "POST",
    body: { email: "customer@bookit.test", password: "secret123" }
  });
  assert.equal(login.response.status, 200);
  assert.ok(login.json.token);

  const badLogin = await request("/auth/customer/login", {
    method: "POST",
    body: { email: "customer@bookit.test", password: "wrongpass" }
  });
  assert.equal(badLogin.response.status, 401);

  const rejected = await request("/host/home", {
    headers: { Authorization: `Bearer ${customer.token}` }
  });
  assert.equal(rejected.response.status, 403);
});

test("places catalog is Rourkela-only demo mode with categories, images, and search", async () => {
  const { response, json } = await request("/venues");
  assert.equal(response.status, 200);
  assert.equal(json.city, "Rourkela");
  assert.ok(json.venues.length >= 20);
  assert.ok(json.venues.every((venue) => venue.city === "Rourkela"));
  assert.ok(json.venues.some((venue) => venue.name.includes("BOLT")));
  assert.ok(json.venues.some((venue) => venue.name.includes("Maaya")));
  assert.ok(json.venues.every((venue) => venue.images.length >= 2));

  const search = await request("/venues/search?q=bar");
  assert.equal(search.response.status, 200);
  assert.ok(search.json.venues.some((venue) => venue.category === "BAR" || venue.category === "BISTRO" || venue.category === "RESTRO_BAR"));
});

test("host claims venue and duplicate claim is protected", async () => {
  const host = await register("host");
  const claim = await claimVenue(host.token);
  assert.equal(claim.claim.status, "verified");

  const duplicate = await request("/host/claims", {
    method: "POST",
    headers: { Authorization: `Bearer ${host.token}` },
    body: { venue_id: "demo-bolt-brewing-co" }
  });
  assert.equal(duplicate.response.status, 409);
});

test("admin login bootstraps operations access from environment credentials", async () => {
  const login = await request("/auth/admin/login", {
    method: "POST",
    body: { email: "admin@bookit.test", password: "adminsecret" }
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.json.user.role, "admin");

  const assigned = await request("/admin/venues/demo-bolt-brewing-co/assign-layout-template", {
    method: "POST",
    headers: { Authorization: `Bearer ${login.json.token}` },
    body: { template_id: "restro_bar" }
  });
  assert.equal(assigned.response.status, 200);
  assert.equal(assigned.json.venue.layout_template_id, "restro_bar");
});

test("host can pause and resume booking requests for claimed venue", async () => {
  const host = await register("host");
  const customer = await register("customer");
  await claimVenue(host.token);

  const paused = await request("/host/venue/booking-status", {
    method: "PUT",
    headers: { Authorization: `Bearer ${host.token}` },
    body: { booking_status: "paused" }
  });
  assert.equal(paused.response.status, 200);
  assert.equal(paused.json.venue.booking_status, "paused");

  const blocked = await createBooking(customer.token, {}, "paused-booking");
  assert.equal(blocked.response.status, 409);

  const resumed = await request("/host/venue/booking-status", {
    method: "PUT",
    headers: { Authorization: `Bearer ${host.token}` },
    body: { booking_status: "accepting_requests" }
  });
  assert.equal(resumed.response.status, 200);

  const created = await createBooking(customer.token, {}, "resumed-booking");
  assert.equal(created.response.status, 201);
});

test("booking request uses server price, idempotency, accept, arrived, and completed", async () => {
  const host = await register("host");
  const customer = await register("customer");
  await claimVenue(host.token);

  const created = await createBooking(customer.token, { booking_fee: 9999 });
  assert.equal(created.response.status, 201);
  assert.equal(created.json.booking.status, "pending_restaurant");
  assert.equal(created.json.booking.booking_fee, RULES.PRICING.table_random);

  const duplicate = await createBooking(customer.token, { booking_fee: 9999 });
  assert.equal(duplicate.json.booking.id, created.json.booking.id);

  const accepted = await request(`/host/bookings/${created.json.booking.id}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${host.token}`, "Idempotency-Key": "accept-one" },
    body: {}
  });
  assert.equal(accepted.response.status, 200);
  assert.equal(accepted.json.booking.status, "confirmed");

  const arrived = await request(`/host/bookings/${created.json.booking.id}/arrived`, {
    method: "POST",
    headers: { Authorization: `Bearer ${host.token}` },
    body: {}
  });
  assert.equal(arrived.json.booking.status, "arrived");

  const completed = await request(`/host/bookings/${created.json.booking.id}/completed`, {
    method: "POST",
    headers: { Authorization: `Bearer ${host.token}` },
    body: {}
  });
  assert.equal(completed.json.booking.status, "completed");
});

test("decline flow records safe reason and note", async () => {
  const host = await register("host");
  const customer = await register("customer");
  await claimVenue(host.token);
  const created = await createBooking(customer.token, {}, "decline-booking");

  const declined = await request(`/host/bookings/${created.json.booking.id}/decline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${host.token}`, "Idempotency-Key": "decline-one" },
    body: { reason: "Fully booked", note: "Try 8:30 PM" }
  });
  assert.equal(declined.response.status, 200);
  assert.equal(declined.json.booking.status, "declined");
  assert.equal(declined.json.booking.decline_reason, "Fully booked");
});

test("specific table pending hold, alternate table acceptance, and conflict on acceptance", async () => {
  const host = await register("host");
  const customer = await register("customer");
  await claimVenue(host.token);
  const layout = await request("/venues/demo-bolt-brewing-co/layout");
  const [tableOne, tableTwo] = layout.json.layout.tables;
  const start_at = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  const first = await createBooking(customer.token, {
    booking_type: "table_specific",
    requested_table_id: tableOne.id,
    start_at
  }, "specific-one");
  assert.equal(first.response.status, 201);

  const blockedPending = await createBooking(customer.token, {
    booking_type: "table_specific",
    requested_table_id: tableOne.id,
    start_at
  }, "specific-two");
  assert.equal(blockedPending.response.status, 409);

  const accepted = await request(`/host/bookings/${first.json.booking.id}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${host.token}` },
    body: { assigned_table_id: tableTwo.id }
  });
  assert.equal(accepted.response.status, 200);
  assert.equal(accepted.json.booking.assignment_changed, true);

  const second = await createBooking(customer.token, {
    booking_type: "table_specific",
    requested_table_id: tableOne.id,
    start_at
  }, "specific-three");
  assert.equal(second.response.status, 201);
  const conflict = await request(`/host/bookings/${second.json.booking.id}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${host.token}` },
    body: { assigned_table_id: tableTwo.id }
  });
  assert.equal(conflict.response.status, 409);
});

test("customer cancel, restaurant cancel, invalid transition, expiry, and no-show sweeps", async () => {
  const host = await register("host");
  const customer = await register("customer");
  await claimVenue(host.token);

  const cancellable = await createBooking(customer.token, {}, "customer-cancel");
  const cancelled = await request(`/bookings/${cancellable.json.booking.id}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${customer.token}` },
    body: {}
  });
  assert.equal(cancelled.json.booking.status, "cancelled_by_customer");

  const invalid = await request(`/host/bookings/${cancellable.json.booking.id}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${host.token}` },
    body: {}
  });
  assert.equal(invalid.response.status, 409);

  const expiring = await createBooking(customer.token, {}, "expire-me");
  store.updateBooking(expiring.json.booking.id, { expires_at: new Date(Date.now() - 1000).toISOString() });
  sweepExpiredAndNoShows(new Date());
  assert.equal(store.getBooking(expiring.json.booking.id).status, "expired");

  const noShowCandidate = await createBooking(customer.token, {
    start_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  }, "noshow-me");
  const accepted = await request(`/host/bookings/${noShowCandidate.json.booking.id}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${host.token}` },
    body: {}
  });
  assert.equal(accepted.json.booking.status, "confirmed");
  sweepExpiredAndNoShows(new Date());
  assert.equal(store.getBooking(noShowCandidate.json.booking.id).status, "no_show");

  const restaurantCancelCandidate = await createBooking(customer.token, {}, "restaurant-cancel");
  await request(`/host/bookings/${restaurantCancelCandidate.json.booking.id}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${host.token}` },
    body: {}
  });
  const restaurantCancel = await request(`/host/bookings/${restaurantCancelCandidate.json.booking.id}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${host.token}` },
    body: { reason: "Private event" }
  });
  assert.equal(restaurantCancel.json.booking.status, "cancelled_by_restaurant");
});

test("layout tables use normalized positions", async () => {
  const { response, json } = await request("/venues/demo-bolt-brewing-co/layout");
  assert.equal(response.status, 200);
  assert.ok(json.layout.tables.every((table) => table.pos_x >= 0 && table.pos_x <= 1 && table.pos_y >= 0 && table.pos_y <= 1));
});

test("requestable tables only block canonical overlapping table windows", async () => {
  const customer = await register("customer");
  const layout = await request("/venues/demo-bolt-brewing-co/layout");
  const table = layout.json.layout.tables[0];
  const start_at = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
  const later_start_at = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

  const created = await createBooking(customer.token, {
    booking_type: "table_specific",
    requested_table_id: table.id,
    start_at
  }, "requestable-one");
  assert.equal(created.response.status, 201);

  const overlapping = await request(`/venues/demo-bolt-brewing-co/tables/requestable?start_at=${encodeURIComponent(start_at)}`);
  assert.equal(overlapping.response.status, 200);
  assert.equal(overlapping.json.tables.find((item) => item.id === table.id).requestable, false);

  const nonOverlapping = await request(`/venues/demo-bolt-brewing-co/tables/requestable?start_at=${encodeURIComponent(later_start_at)}`);
  assert.equal(nonOverlapping.response.status, 200);
  assert.equal(nonOverlapping.json.tables.find((item) => item.id === table.id).requestable, true);
});
