# BookIt

BookIt is a Rourkela-first restaurant discovery and request-based reservation marketplace. It supports restaurants, cafes, bars, lounges, restro-bars, breweries, bistros, rooftop dining, hotel restaurants, family dining, fine dining, bakery cafes, and banquet-capable dining venues.

The product principle is that restaurants do almost no setup work. BookIt prepares venue data, demo layouts, and booking surfaces; hosts register, find their venue, claim it, and accept or decline incoming reservation requests.

## Repository Structure

- `backend/` - Node.js, Express, plain JavaScript API.
- `backend/prisma/schema.prisma` - PostgreSQL-first production schema.
- `backend/src/services/places/` - provider abstraction for Google Places and demo mode.
- `backend/src/services/layouts/` - BookIt-managed layout templates.
- `backend/src/services/bookings/` - booking state machine, availability, expiry, and no-show sweeps.
- `apps/customer/` - Expo customer app, package `com.tablebook.user`.
- `apps/host/` - Expo host app, package `com.tablebook.host`.

## Booking Model

BookIt uses request-based reservations, not default instant confirmation.

`pending_restaurant -> confirmed -> arrived -> completed`

Other valid paths include declined, expired, customer cancellation, restaurant cancellation, and no-show. The backend enforces these transitions with an explicit state machine.

Pending requests expire after `RESTAURANT_RESPONSE_WINDOW_MINUTES`, default 15 minutes. Confirmed bookings become `no_show` if the customer does not arrive within the 30 minute arrival grace window. The sweep runs once at backend startup and every 60 seconds.

## Pricing

All pricing comes from `backend/src/config/rules.js`.

- Any table: `20`
- Specific table: `200`
- Gathering: `100`
- Banquet hall / large space: `500`

No payment gateway is integrated. API responses use `payment_status = "not_collected"` and the UI refers to a booking fee only.

## Places And Demo Mode

The app runs in demo mode when no Google key is supplied. Demo mode loads curated Rourkela discovery candidates including BOLT Brewing Co, Maaya Bar & Bistro, Bar Cloud9 & Lounge, Moksha, Ispat Bar & Restaurant, Curry Pot, and cafes/restaurants from the launch brief.

Demo records are discovery candidates, not hardcoded truth. Demo images are represented as `ai_generated_demo` assets and are not authentic venue photographs.

Google Places mode is selected with:

```bash
PLACES_PROVIDER=google
GOOGLE_MAPS_API_KEY=...
```

The Google provider uses official Places API (New) requests, field masks, provider place IDs, raw provider types, and provider photo references. Do not scrape Google Maps HTML, Zomato, Swiggy, TripAdvisor, Instagram, or any unauthorised source. Do not permanently cache provider content beyond the permissions of the provider terms.

## Environment

Copy the example file:

```bash
cp backend/.env.example backend/.env
```

Important variables:

- `PORT=4000`
- `JWT_SECRET=replace-with-a-long-random-secret`
- `DATABASE_URL=postgresql://bookit:bookit@localhost:5432/bookit`
- `DATA_STORE=memory`
- `PLACES_PROVIDER=mock`
- `GOOGLE_MAPS_API_KEY=`
- `ROURKELA_LAT=22.2604`
- `ROURKELA_LNG=84.8536`
- `ROURKELA_RADIUS_METERS=12000`
- `CLAIMS_INSTANT_APPROVAL=true`
- `RESTAURANT_RESPONSE_WINDOW_MINUTES=15`
- `ADMIN_EMAIL=admin@bookit.local`
- `ADMIN_PASSWORD=replace-with-a-strong-admin-password`

Admin access is login-only in the local memory runtime. The first successful `/api/auth/admin/login` with `ADMIN_EMAIL` and `ADMIN_PASSWORD` bootstraps the BookIt operations admin account. Do not expose public admin registration.

## Database

Production architecture is PostgreSQL-first. The relational schema is in `backend/prisma/schema.prisma`.

Local demo and tests use `DATA_STORE=memory` so the product can run without a provisioned database. A production deployment should replace the memory repository with a Prisma-backed repository using transactions for booking creation, acceptance conflict checks, and idempotency writes.

Migration commands after enabling Prisma client:

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

## Install

```bash
npm run install:all
```

## Run Backend

```bash
npm run dev:backend
```

Backend URL:

```text
http://localhost:4000
```

Android emulator API URL used by both apps:

```text
http://10.0.2.2:4000/api
```

Physical device on the same WiFi:

```text
http://<YOUR_LAN_IP>:4000/api
```

Update `apps/customer/src/api/client.js` and `apps/host/src/api/client.js` for physical devices or production.

## Run Apps

Customer:

```bash
npm run start:customer
```

Host:

```bash
npm run start:host
```

Open each project in Expo Go.

The originally requested `react@18.3.2` package is not published on npm. The mobile apps use `react@18.3.1`, the published React 18.3 patch compatible with Expo SDK 52.

## APK Builds

EAS build:

```bash
cd apps/customer
npx eas build -p android --profile preview
cd ../host
npx eas build -p android --profile preview
```

Local Android build after native prebuild:

```bash
cd apps/customer
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

APK output path:

```text
apps/customer/android/app/build/outputs/apk/release/app-release.apk
apps/host/android/app/build/outputs/apk/release/app-release.apk
```

## Tests

```bash
npm test
```

Coverage includes auth, Rourkela demo catalog, duplicate claims, admin operations bootstrap, host pause/resume, server-side booking fee, idempotency, accept, decline, specific-table pending hold, alternate table assignment, conflict on acceptance, customer cancellation, restaurant cancellation, invalid state transitions, expiry, no-show, requestable table overlap logic, and normalized layout coordinates.

## Production Deployment

1. Provision PostgreSQL.
2. Set a strong `JWT_SECRET`.
3. Set `DATA_STORE=postgres` after implementing the Prisma repository boundary.
4. Run Prisma migrations.
5. Configure Google Places credentials if running verified provider discovery.
6. Deploy the backend behind HTTPS.
7. Point both apps at the production API URL.
8. Build signed Android artifacts with EAS or native Gradle release signing.

## Known Limitations

- The local runtime uses an in-memory store, so data resets on backend restart.
- The Prisma schema is present, but the Prisma repository implementation is not enabled in this local demo runtime.
- Demo images are URI placeholders with provenance metadata; real bitmap assets or provider-authorized photos should be added before store release.
- Admin auth is environment-bootstrapped in memory mode. Production should use an explicit secure admin provisioning process.
- Push notifications, SMS verification, and payment collection are intentionally not implemented.
- Google Places discovery is implemented as an official API abstraction but was not executed without credentials.
- Expo SDK 52 currently reports transitive npm audit findings in its CLI/config toolchain. `npm audit fix --force` resolves them only by upgrading to Expo 57, which is a breaking dependency migration outside this build.

## Future City Expansion

Rourkela center, radius, provider queries, seed mode, and city filters are centralized so new launch cities can be added without changing the booking model.
