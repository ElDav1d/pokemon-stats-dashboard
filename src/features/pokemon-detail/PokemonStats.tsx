import { Stat } from "../../shared/entities";

interface IPokemonStatsProps {
  stats: Stat[];
}

const PokemonStats = ({ stats }: IPokemonStatsProps) => (
  <>
    <h2>Stats</h2>
    <ul aria-live="polite">
      {stats.map((stat) => (
        <li key={stat.stat.name}>
          {stat.stat.name}: {stat.base_stat}
        </li>
      ))}
    </ul>
  </>
);

export default PokemonStats;
