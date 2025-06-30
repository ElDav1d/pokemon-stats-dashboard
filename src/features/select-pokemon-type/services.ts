import { url } from "../../lib/constants";

const fetchPokemonTypes = async () => {
  const response = await fetch(`${url.BASE}${url.TYPE}`);

  if (!response.ok) throw new Error("Failed to fetch types");

  const data = await response.json();

  return data.results ?? [];
};

export const services = {
  fetchPokemonTypes,
};
