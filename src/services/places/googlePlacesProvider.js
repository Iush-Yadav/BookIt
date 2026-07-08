const { env } = require("../../config/env");
const { imagesForCategory } = require("../../data/demoImages");
const { mapProviderTypes } = require("./categoryMap");

const includedTypes = [
  "restaurant",
  "cafe",
  "coffee_shop",
  "bar",
  "pub",
  "night_club"
];

async function discoverRourkelaVenues() {
  if (!env.googleMapsApiKey) {
    const error = new Error("GOOGLE_MAPS_API_KEY is required for Google Places mode");
    error.status = 400;
    throw error;
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.googleMapsApiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.priceLevel,places.currentOpeningHours,places.nationalPhoneNumber,places.photos"
    },
    body: JSON.stringify({
      includedTypes,
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: env.rourkela.lat, longitude: env.rourkela.lng },
          radius: env.rourkela.radiusMeters
        }
      }
    })
  });

  if (!response.ok) {
    const error = new Error("Google Places discovery failed");
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  return (data.places || []).map((place) => {
    const category = mapProviderTypes(place.types, place.displayName && place.displayName.text);
    return {
      id: `google-${place.id}`,
      provider: "google_places_new",
      provider_place_id: place.id,
      name: place.displayName && place.displayName.text,
      address: place.formattedAddress,
      area: "Rourkela",
      city: "Rourkela",
      state: "Odisha",
      country: "India",
      category,
      raw_provider_types: place.types || [],
      cuisines: [],
      phone: place.nationalPhoneNumber || null,
      rating: place.rating || null,
      price_level: place.priceLevel || null,
      open_now: place.currentOpeningHours ? place.currentOpeningHours.openNow : null,
      description: "Venue metadata supplied by Google Places where available. Demo imagery is used unless authorized photos are separately integrated.",
      images: imagesForCategory(category),
      provider_photo_references: (place.photos || []).slice(0, 3).map((photo) => photo.name),
      booking_mode: "request_based",
      booking_status: "accepting_requests",
      layout_template_id: category === "CAFE" ? "compact_cafe" : "medium_restaurant",
      data_provenance: "google_places"
    };
  });
}

module.exports = { discoverRourkelaVenues };
