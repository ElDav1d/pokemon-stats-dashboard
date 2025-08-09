const paths = {
  BASE: "/",
  DETAIL: ":name",
};

const url = {
  BASE: "https://pokeapi.co/api/v2/",
  TYPE: "type/",
  POKEMON: "pokemon/",
};

const graphConfig = {
  WIDTH: 500,
  HEIGHT: 300,
  MARGIN_TOP: 20,
  MARGIN_RIGHT: 20,
  MARGIN_BOTTOM: 30,
  MARGIN_LEFT: 120,
};

const pokemonListConfig = {
  GAP: 16, // gap-4 in Tailwind (1rem = 16px)
  ITEM_HEIGHT: 200,
  ITEMS_OVERSCAN: 5, // Number of items to render outside the visible area for smoother scrolling
};

export { paths, url, graphConfig, pokemonListConfig };
