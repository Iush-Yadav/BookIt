const templates = {
  compact_cafe: { zones: ["Indoor", "Window"], tables: [[0.2, 0.25, 2, "round"], [0.45, 0.25, 2, "round"], [0.7, 0.25, 4, "rect"], [0.25, 0.65, 4, "rect"], [0.65, 0.68, 2, "round"]] },
  medium_restaurant: { zones: ["Main Hall", "Window"], tables: [[0.18, 0.2, 4, "rect"], [0.45, 0.2, 4, "rect"], [0.72, 0.2, 6, "rect"], [0.2, 0.55, 2, "round"], [0.48, 0.55, 4, "rect"], [0.78, 0.58, 6, "rect"]] },
  large_family_restaurant: { zones: ["Main Hall", "Private"], tables: [[0.15, 0.18, 4, "rect"], [0.38, 0.18, 6, "rect"], [0.65, 0.18, 8, "rect"], [0.18, 0.52, 4, "rect"], [0.45, 0.55, 6, "rect"], [0.75, 0.55, 8, "rect"], [0.5, 0.82, 10, "rect"]] },
  premium_bistro: { zones: ["Main Hall", "Window", "Private"], tables: [[0.2, 0.2, 2, "round"], [0.42, 0.22, 2, "round"], [0.68, 0.22, 4, "round"], [0.24, 0.58, 4, "rect"], [0.54, 0.6, 4, "round"], [0.82, 0.62, 6, "rect"]] },
  restro_bar: { zones: ["Bar Side", "Main Hall"], tables: [[0.18, 0.22, 2, "round"], [0.4, 0.22, 4, "round"], [0.72, 0.24, 4, "rect"], [0.22, 0.62, 4, "rect"], [0.55, 0.62, 6, "rect"], [0.82, 0.72, 2, "round"]] },
  lounge: { zones: ["Lounge", "Private"], tables: [[0.18, 0.24, 4, "sofa"], [0.48, 0.22, 6, "sofa"], [0.78, 0.26, 4, "sofa"], [0.28, 0.66, 6, "sofa"], [0.68, 0.68, 8, "sofa"]] },
  brewery: { zones: ["Brewery", "Bar Side", "Main Hall"], tables: [[0.16, 0.18, 4, "bench"], [0.42, 0.18, 6, "bench"], [0.7, 0.2, 8, "bench"], [0.2, 0.58, 4, "rect"], [0.5, 0.6, 6, "rect"], [0.8, 0.62, 8, "bench"]] },
  rooftop: { zones: ["Rooftop", "Outdoor"], tables: [[0.18, 0.2, 2, "round"], [0.42, 0.2, 4, "round"], [0.68, 0.25, 4, "round"], [0.25, 0.62, 6, "rect"], [0.62, 0.66, 6, "rect"], [0.84, 0.72, 2, "round"]] },
  banquet_restaurant: { zones: ["Main Hall", "Private", "Banquet"], tables: [[0.15, 0.16, 4, "rect"], [0.38, 0.18, 6, "rect"], [0.62, 0.2, 8, "rect"], [0.84, 0.22, 10, "rect"], [0.25, 0.58, 8, "rect"], [0.55, 0.58, 10, "rect"], [0.82, 0.64, 12, "rect"]] }
};

function buildLayout(templateId, venueId) {
  const template = templates[templateId] || templates.medium_restaurant;
  const floor = { id: `${venueId}-floor-main`, venue_id: venueId, name: "Main Floor", sort_order: 1 };
  const zones = template.zones.map((name, index) => ({
    id: `${venueId}-zone-${index + 1}`,
    venue_id: venueId,
    floor_id: floor.id,
    name
  }));
  const tables = template.tables.map(([pos_x, pos_y, capacity, shape], index) => ({
    id: `${venueId}-T${index + 1}`,
    venue_id: venueId,
    floor_id: floor.id,
    zone_id: zones[index % zones.length].id,
    label: `T${index + 1}`,
    capacity,
    pos_x,
    pos_y,
    shape,
    is_active: true,
    source: "bookit_template"
  }));
  return { template_id: templateId, floors: [floor], zones, tables };
}

module.exports = { templates, buildLayout };
