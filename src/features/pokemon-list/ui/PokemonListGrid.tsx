import React from "react";
import PokemonListItem from "./PokemonListItem";
import { PokemonListItem as PokemonListItemEntity } from "../domain/entities/PokemonListItem";
import { pokemonListConfig } from "../domain/constants";

interface VisibleItem {
  item: PokemonListItemEntity;
  index: number;
  offsetY: number;
  offsetX: string;
  width: string;
}

interface PokemonListGridProps {
  visibleItems: VisibleItem[];
  totalHeight: number;
}

const PokemonListGrid: React.FC<PokemonListGridProps> = ({
  visibleItems,
  totalHeight,
}) => {
  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <ul
      aria-label="Pokemon List"
      aria-live="polite"
      className="relative"
      style={{
        minHeight: `${totalHeight}px`,
      }}
    >
      {/* Spacer to maintain total height */}
      <li
        className="absolute top-0 left-0 pointer-events-none invisible"
        style={{
          height: totalHeight,
        }}
        aria-hidden="true"
      />
      {visibleItems.map(({ item, offsetY, offsetX, width }) => (
        <li
          key={item.id}
          className="absolute"
          style={{
            top: offsetY,
            left: offsetX,
            width: width,
            height: pokemonListConfig.itemHeight,
          }}
        >
          <PokemonListItem
            name={item.name}
            height={item.height}
            imageUrl={item.imageUrl}
          />
        </li>
      ))}
    </ul>
  );
};

export default PokemonListGrid;
