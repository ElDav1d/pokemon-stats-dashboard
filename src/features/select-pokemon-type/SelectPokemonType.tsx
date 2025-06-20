import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { url } from "../../lib/constants";

const SelectPokemonType = () => {
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

    const fetchTypes = async () => {
      const response = await fetch(`${url.BASE}${url.TYPE}`);

      if (!response.ok) {
        throw new Error("Failed to fetch types");
      }

      try {
        const data = await response.json();
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
    <>
      <h2 className="text-lg l:text-xl xl:text-2xl mb-4">
        Select a Pokemon Type to get the list
      </h2>
      {types.length > 0 && (
        <ul aria-live="polite" className="flex flex-wrap gap-2 mb-6">
          {types.map(({ name }) => (
            <li key={name}>
              <button
                onClick={() => selectType(name)}
                className={`${
                  selectedTypeParam === name ? "button-type-selected" : ""
                }`}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default SelectPokemonType;
