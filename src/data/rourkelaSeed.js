const { imagesForCategory } = require("./demoImages");

const seedVenues = [
  ["demo-bolt-brewing-co", "BOLT Brewing Co", "Panposh Road, Rourkela", "BREWERY", ["Brewery", "Pub Food", "Continental"], ["bar", "restaurant", "brewery"]],
  ["demo-maaya-bar-bistro", "Maaya Bar & Bistro", "Civil Township, Rourkela", "BISTRO", ["Bistro", "Indian", "Bar"], ["bar", "restaurant"]],
  ["demo-bar-cloud9-lounge", "Bar Cloud9 & Lounge", "Rourkela, Odisha", "LOUNGE", ["Lounge", "Bar Food"], ["bar", "night_club"]],
  ["demo-moksha", "Moksha", "Rourkela, Odisha", "FINE_DINING", ["Indian", "Fine Dining"], ["restaurant"]],
  ["demo-ispat-bar-restaurant", "Ispat Bar & Restaurant", "Rourkela, Odisha", "RESTRO_BAR", ["Indian", "Chinese", "Bar"], ["restaurant", "bar"]],
  ["demo-curry-pot", "Curry Pot", "Rourkela, Odisha", "FAMILY_DINING", ["North Indian", "Chinese"], ["restaurant"]],
  ["demo-the-park-tp", "The Park / TP", "Rourkela, Odisha", "RESTAURANT", ["Indian", "Casual Dining"], ["restaurant"]],
  ["demo-paapi-pet", "Paapi Pet", "Rourkela, Odisha", "RESTAURANT", ["Casual Dining", "Fast Casual"], ["restaurant"]],
  ["demo-affectionary-cafe", "Affectionary Cafe & Restaurant", "Rourkela, Odisha", "BAKERY_CAFE", ["Cafe", "Bakery", "Restaurant"], ["cafe", "bakery", "restaurant"]],
  ["demo-jomha-tribal", "JOMHA Tribal Cuisine Restaurant", "Rourkela, Odisha", "RESTAURANT", ["Tribal Cuisine", "Regional"], ["restaurant"]],
  ["demo-becafe", "Becafe", "Rourkela, Odisha", "CAFE", ["Cafe", "Coffee"], ["cafe"]],
  ["demo-arena-cafe", "Arena Cafe", "Rourkela, Odisha", "CAFE", ["Cafe", "Snacks"], ["cafe"]],
  ["demo-daawat", "Daawat Restaurant", "Rourkela, Odisha", "FAMILY_DINING", ["Indian", "Family Dining"], ["restaurant"]],
  ["demo-yavis-cafe", "YAVIS CAFE", "Rourkela, Odisha", "CAFE", ["Cafe", "Coffee"], ["cafe"]],
  ["demo-nottee9", "NOTTEE9", "Rourkela, Odisha", "CAFE", ["Cafe", "Desserts"], ["cafe"]],
  ["demo-motimahal-deluxe", "Motimahal Deluxe", "Rourkela, Odisha", "RESTAURANT", ["North Indian", "Mughlai"], ["restaurant"]],
  ["demo-soul-cafe-cakes", "SOUL CAFE & CAKES", "Rourkela, Odisha", "BAKERY_CAFE", ["Cafe", "Cakes", "Bakery"], ["cafe", "bakery"]],
  ["demo-fusion-restaurant-cafe", "FUSION Restaurant & Cafe", "Rourkela, Odisha", "RESTAURANT", ["Cafe", "Multi Cuisine"], ["restaurant", "cafe"]],
  ["demo-dumbledoor-cafe", "Dumble'door Cafe", "Rourkela, Odisha", "CAFE", ["Cafe", "Coffee"], ["cafe"]],
  ["demo-khatti-cafe", "Khatti Cafe", "Rourkela, Odisha", "CAFE", ["Cafe", "Snacks"], ["cafe"]]
].map(([provider_place_id, name, address, category, cuisines, raw_provider_types], index) => ({
  id: provider_place_id,
  provider: "demo",
  provider_place_id,
  name,
  address,
  area: address.split(",")[0],
  city: "Rourkela",
  state: "Odisha",
  country: "India",
  category,
  raw_provider_types,
  cuisines,
  phone: null,
  rating: null,
  price_level: null,
  open_now: null,
  description: `${name} is included as a Rourkela discovery candidate in BookIt's demo catalog. Demo imagery is illustrative and not an authentic venue photograph.`,
  images: imagesForCategory(category),
  booking_mode: "request_based",
  booking_status: "accepting_requests",
  layout_template_id: chooseTemplate(category, index),
  data_provenance: "curated_demo_seed"
}));

function chooseTemplate(category, index) {
  if (category === "CAFE" || category === "BAKERY_CAFE") return "compact_cafe";
  if (category === "BREWERY") return "brewery";
  if (category === "ROOFTOP") return "rooftop";
  if (["BAR", "RESTRO_BAR", "PUB"].includes(category)) return "restro_bar";
  if (category === "LOUNGE") return "lounge";
  if (category === "BISTRO" || category === "FINE_DINING") return "premium_bistro";
  if (index % 5 === 0) return "banquet_restaurant";
  return "medium_restaurant";
}

module.exports = { seedVenues };
