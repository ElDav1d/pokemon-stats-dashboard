import { PokemonStat } from "../domain/value-objects/PokemonStat";
import PokemonEvolutions from "./PokemonEvolutions";
import PokemonStats from "./PokemonStats";

export interface IPokemonDetailDataProps {
  imageUrl: string;
  name: string;
  evolutions: string[];
  stats: PokemonStat[];
}

const PokemonDetailData = ({
  imageUrl,
  name,
  evolutions,
  stats,
}: IPokemonDetailDataProps) => (
  <section className="flex flex-col gap-4 md:flex-row bg-stone-600 rounded-lg p-4 mb-4">
    <img
      className="w-full md:w-80 xl:w-86 object-contain"
      src={imageUrl}
      alt={name}
    />
    <div className="w-full">
      {evolutions.length > 0 && <PokemonEvolutions evolutions={evolutions} />}
      {stats.length > 0 && <PokemonStats stats={stats} />}
    </div>
  </section>
);

export default PokemonDetailData;
