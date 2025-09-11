export const responsiveBreakpoints = {
  DESKTOP_MIN_WIDTH: 768,
  TABLET_MIN_WIDTH: 640,
  DESKTOP_COLUMNS: 5,
  TABLET_COLUMNS: 3,
  MOBILE_COLUMNS: 2,
} as const;

export const pokemonListConfig = {
  GAP: 16, // gap-4 in Tailwind (1rem = 16px)
  ITEM_HEIGHT: 200,
  ITEMS_OVERSCAN: 5, // Number of items to render outside the visible area for smoother scrolling
} as const;
