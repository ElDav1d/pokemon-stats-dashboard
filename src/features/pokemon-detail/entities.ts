export interface IEvolutionChainLink {
  species: {
    name: string;
  };
  evolves_to: IEvolutionChainLink[];
}
