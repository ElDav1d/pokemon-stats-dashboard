export const POKEMON_DETAIL_CONFIG = {
  DEFAULT_IMAGE:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
} as const;

export const STATS_CHART_CONFIG = {
  WIDTH: 500,
  HEIGHT: 300,
  MARGIN: {
    TOP: 20,
    RIGHT: 30,
    BOTTOM: 40,
    LEFT: 90,
  },
  BAR_COLOR: "#60a5fa",
  ANIMATION_DURATION_MS: 800,
  AXIS_FONT_SIZE: "0.85rem",
  SCALE_PADDING: 0.3,
  AXIS_TICKS: 5,
} as const;
