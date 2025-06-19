import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { url } from "../../lib/constants";

const Home = () => {
  const [types, setTypes] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTypeParam = searchParams.get("type");

  useEffect(() => {
    setSearchParams((prev) => {
      if (!prev.has("type")) {
        prev.set("type", "normal");
      }
      return prev;
    });
  }, [setSearchParams]);

  useEffect(() => {
    setSearchParams((prev) => {
      if (!prev.has("type")) {
        prev.set("type", "normal");
      }
      return prev;
    });
    const fetchTypes = async () => {
      const response = await fetch(`${url.BASE}${url.TYPE}`);

      if (!response.ok) {
        throw new Error("Failed to fetch types");
      }

      const data = await response.json();

      try {
        setTypes(data.results);
      } catch (error) {
        console.error("Error setting types:", error);
      }
    };
    fetchTypes();
  }, []);

  const selectType = (type: string) => {
    setSearchParams({ type });
  };

  return (
    <article>
      <h1>Pokemon Stats Dashboard</h1>

      <section>
        <h2>Select a type to view details</h2>
        <ul className="flex gap-2 overflow-x-auto">
          <li key={"normal"}>
            <button
              onClick={() => selectType("normal")}
              className={`${
                selectedTypeParam === "normal" ? "button-default-type" : ""
              }`}
            >
              normal
            </button>
          </li>
          {types.map(
            (type, index) =>
              index > 0 && (
                <li key={type.name}>
                  <button onClick={() => selectType(type.name)}>
                    {type.name}
                  </button>
                </li>
              )
          )}
        </ul>
      </section>

      <section>
        <h2>Selected Type: {selectedTypeParam}</h2>
      </section>
    </article>
  );
};

export default Home;
