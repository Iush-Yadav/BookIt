const demoImages = {
  restaurant: [
    { uri: "asset:/demo/premium-restaurant.jpg", provenance: "ai_generated_demo", alt: "Premium demo restaurant interior" },
    { uri: "asset:/demo/family-dining.jpg", provenance: "ai_generated_demo", alt: "Family dining demo interior" },
    { uri: "asset:/demo/bistro.jpg", provenance: "ai_generated_demo", alt: "Bistro demo interior" }
  ],
  cafe: [
    { uri: "asset:/demo/modern-cafe.jpg", provenance: "ai_generated_demo", alt: "Modern cafe demo interior" },
    { uri: "asset:/demo/bakery-cafe.jpg", provenance: "ai_generated_demo", alt: "Bakery cafe demo counter" },
    { uri: "asset:/demo/quiet-cafe.jpg", provenance: "ai_generated_demo", alt: "Quiet cafe demo seating" }
  ],
  bar: [
    { uri: "asset:/demo/upscale-bar.jpg", provenance: "ai_generated_demo", alt: "Upscale bar demo interior" },
    { uri: "asset:/demo/lounge.jpg", provenance: "ai_generated_demo", alt: "Lounge demo seating" },
    { uri: "asset:/demo/restro-bar.jpg", provenance: "ai_generated_demo", alt: "Restro bar demo interior" }
  ],
  brewery: [
    { uri: "asset:/demo/brewery.jpg", provenance: "ai_generated_demo", alt: "Brewery demo interior" },
    { uri: "asset:/demo/upscale-bar.jpg", provenance: "ai_generated_demo", alt: "Upscale bar demo interior" },
    { uri: "asset:/demo/family-dining.jpg", provenance: "ai_generated_demo", alt: "Family dining demo interior" }
  ],
  rooftop: [
    { uri: "asset:/demo/rooftop-lounge.jpg", provenance: "ai_generated_demo", alt: "Rooftop lounge demo seating" },
    { uri: "asset:/demo/lounge.jpg", provenance: "ai_generated_demo", alt: "Lounge demo seating" },
    { uri: "asset:/demo/premium-restaurant.jpg", provenance: "ai_generated_demo", alt: "Premium demo restaurant interior" }
  ],
  banquet: [
    { uri: "asset:/demo/banquet-dining.jpg", provenance: "ai_generated_demo", alt: "Banquet dining demo space" },
    { uri: "asset:/demo/family-dining.jpg", provenance: "ai_generated_demo", alt: "Family dining demo interior" },
    { uri: "asset:/demo/premium-restaurant.jpg", provenance: "ai_generated_demo", alt: "Premium demo restaurant interior" }
  ]
};

function imagesForCategory(category) {
  if (["CAFE", "BAKERY_CAFE"].includes(category)) return demoImages.cafe;
  if (["BAR", "LOUNGE", "RESTRO_BAR", "PUB"].includes(category)) return demoImages.bar;
  if (category === "BREWERY") return demoImages.brewery;
  if (category === "ROOFTOP") return demoImages.rooftop;
  if (category === "HOTEL_RESTAURANT") return demoImages.banquet;
  return demoImages.restaurant;
}

module.exports = { demoImages, imagesForCategory };
