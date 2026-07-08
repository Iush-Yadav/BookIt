const { env } = require("../../config/env");
const mock = require("./mockPlacesProvider");
const google = require("./googlePlacesProvider");

function getPlacesProvider() {
  if (env.placesProvider === "google") return google;
  return mock;
}

module.exports = { getPlacesProvider };
