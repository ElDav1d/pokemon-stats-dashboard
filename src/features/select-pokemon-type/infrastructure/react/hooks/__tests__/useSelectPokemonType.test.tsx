import { renderHook, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { it, expect } from "vitest";
import useSelectPokemonType from "../useSelectPokemonType";

it("returns selected type from URL params", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={["/?type=fire"]}>{children}</MemoryRouter>
  );

  const { result } = renderHook(
    () => useSelectPokemonType("normal"),
    { wrapper }
  );

  expect(result.current.selectedTypeParam).toBe("fire");
});

it("sets default type when no type in URL", async () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
  );

  const { result } = renderHook(
    () => useSelectPokemonType("normal"),
    { wrapper }
  );

  await waitFor(() => {
    expect(result.current.selectedTypeParam).toBe("normal");
  });
});

it("updates URL when selectType is called", async () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={["/?type=normal"]}>{children}</MemoryRouter>
  );

  const { result } = renderHook(
    () => useSelectPokemonType("normal"),
    { wrapper }
  );

  await act(async () => {
    result.current.selectType("fire");
  });

  await waitFor(() => {
    expect(result.current.selectedTypeParam).toBe("fire");
  });
});
