const { seedVenues } = require("../../data/rourkelaSeed");

async function discoverRourkelaVenues() {
  return seedVenues;
}

module.exports = { discoverRourkelaVenues };
