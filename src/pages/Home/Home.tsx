import { useState, useEffect } from "react";
import { url } from "../../lib/constants";

const Home = () => {
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("normal");

  useEffect(() => {
    const fetchTypes = async () => {
      const response = await fetch(`${url.BASE}${url.TYPE}`);

      const data = await response.json();
      setTypes(data.results);
    };
    fetchTypes();
  }, []);

  const selectType = (type: string) => {
    setSelectedType(type);
  };

  return (
    <article>
      <h1>Pokemon Stats Dashboard</h1>

      <section>
        <h2>Select a type to view details</h2>
        <ul className="flex gap-2 overflow-x-auto">
          {types.map((type) => (
            <li key={type.name}>
              <button onClick={() => selectType(type.name)}>{type.name}</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Selected Type: {selectedType}</h2>
      </section>
    </article>
  );
};

export default Home;
