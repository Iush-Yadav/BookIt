const map = {
  restaurant: "RESTAURANT",
  cafe: "CAFE",
  coffee_shop: "CAFE",
  bar: "BAR",
  pub: "PUB",
  brewery: "BREWERY",
  bistro: "BISTRO",
  lounge: "LOUNGE",
  rooftop_restaurant: "ROOFTOP",
  fine_dining_restaurant: "FINE_DINING",
  family_restaurant: "FAMILY_DINING",
  bakery: "BAKERY_CAFE",
  hotel: "HOTEL_RESTAURANT",
  night_club: "LOUNGE"
};

function mapProviderTypes(types = [], name = "") {
  const loweredName = name.toLowerCase();
  if (loweredName.includes("brew")) return "BREWERY";
  if (loweredName.includes("rooftop")) return "ROOFTOP";
  if (loweredName.includes("restro")) return "RESTRO_BAR";
  if (loweredName.includes("bistro")) return "BISTRO";
  if (loweredName.includes("lounge")) return "LOUNGE";
  for (const type of types) {
    if (map[type]) return map[type];
  }
  return "RESTAURANT";
}

module.exports = { mapProviderTypes };
