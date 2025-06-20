import { useParams } from "react-router-dom";
import { PokemonDetail } from "../../features/pokemon-detail";

const Detail = () => {
  const { name } = useParams();

  return (
    <article>
      <h1>Pokemon Stats Detail for {name}</h1>
      {name && <PokemonDetail name={name} />}
    </article>
  );
};

export default Detail;
