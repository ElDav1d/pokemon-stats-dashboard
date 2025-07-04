import { url } from "../../../lib/constants";
import { IPokemonTypeItem } from "./entities";

const fetchPokemonTypes = async (): Promise<IPokemonTypeItem[]> => {
  const response = await fetch(`${url.BASE}${url.TYPE}`);

  if (!response.ok) throw new Error("Failed to fetch types");

  const data = await response.json();

  return (data.results ?? []) as IPokemonTypeItem[];
};

export const services = {
  fetchPokemonTypes,
};
