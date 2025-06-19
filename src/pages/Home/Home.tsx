import { useState, useEffect } from "react";
import { url } from "../../lib/constants";

const Home = () => {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchTypes = async () => {
      const response = await fetch(`${url.BASE}${url.TYPE}`);

      const data = await response.json();
      setTypes(data.results);
    };
    fetchTypes();
  }, []);

  return (
    <article>
      <h1>Pokemon Stats Dashboard</h1>

      <section>
        <h2>Select a type to view details</h2>
        <ul>
          {types.map((type) => (
            <li key={type.name}>{type.name}</li>
          ))}
        </ul>
      </section>
    </article>
  );
};

export default Home;
