import { url } from "../../../../../../lib/constants";
import { PokemonListItem } from "../../../../domain/entities/PokemonListItem";

export const pokemonMock1: PokemonListItem = {
  id: "1",
  name: "bulbasaur",
  url: `${url.BASE}${url.POKEMON}1/`,
  height: 7,
  imageUrl:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
};
export const pokemonMock2: PokemonListItem = {
  id: "2",
  name: "ivysaur",
  url: `${url.BASE}${url.POKEMON}2/`,
  height: 20,
  imageUrl:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
};

export const pokemonMock3: PokemonListItem = {
  id: "3",
  name: "venusaur",
  url: `${url.BASE}${url.POKEMON}3/`,
  height: 12,
  imageUrl:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
};
