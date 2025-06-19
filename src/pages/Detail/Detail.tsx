import { useParams } from "react-router-dom";

const Detail = () => {
  const { name } = useParams();
  return <h1>Pokemon Stats Detail for {name}</h1>;
};

export default Detail;
