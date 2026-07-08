const { createApp } = require("./app");
const { env } = require("./config/env");
const { RULES } = require("./config/rules");
const { sweepExpiredAndNoShows } = require("./services/bookings/bookingService");

sweepExpiredAndNoShows();
setInterval(sweepExpiredAndNoShows, RULES.TIMING.AUTO_SWEEP_INTERVAL_MS).unref();

const app = createApp();
app.listen(env.port, () => {
  console.log(`BookIt backend listening on http://localhost:${env.port}`);
});
