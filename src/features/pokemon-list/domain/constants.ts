export const responsiveBreakpoints = {
  desktopMinWidth: 768,
  tabletMinWidth: 640,
  desktopColumns: 5,
  tabletColumns: 3,
  mobileColumns: 2,
} as const;

export const pokemonListConfig = {
  gap: 16, // gap-4 in Tailwind (1rem = 16px)
  itemHeight: 200,
  overscan: 5, // Number of items to render outside the visible area for smoother scrolling
} as const;
