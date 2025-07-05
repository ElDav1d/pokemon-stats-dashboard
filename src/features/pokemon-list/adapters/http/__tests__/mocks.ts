import { url } from "../../../../../lib/constants";

export const mockApiResponse = {
  pokemon: [
    {
      name: "charmander",
      url: `${url.BASE}${url.POKEMON}4/`,
      height: 6,
      sprites: { front_default: "sprite-url" },
    },
    {
      name: "vulpix",
      url: `${url.BASE}${url.POKEMON}37/`,
      height: 6,
      sprites: { front_default: "sprite-url2" },
    },
  ],
};
