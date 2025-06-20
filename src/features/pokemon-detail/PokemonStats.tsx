import { Stat } from "../../shared/entities";

interface IPokemonStatsProps {
  stats: Stat[];
}

const PokemonStats = ({ stats }: IPokemonStatsProps) => (
  <>
    <h2 className="mb-2 text-lg l:text-xl xl:text-2xl font-semibold">Stats:</h2>
    <ul
      className="w-full bg-stone-200 rounded-lg p-4 mb-4 text-stone-800 list-none"
      aria-live="polite"
    >
      {stats.map((stat) => (
        <li className="capitalize" key={stat.stat.name}>
          {stat.stat.name}: {stat.base_stat}
        </li>
      ))}
    </ul>
  </>
);

export default PokemonStats;
