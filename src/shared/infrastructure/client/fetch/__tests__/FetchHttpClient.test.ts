import { it, expect, beforeEach, afterEach, vi } from "vitest";
import { FetchHttpClient } from "../FetchHttpClient";

beforeEach(() => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ name: "pikachu" }),
  });
});

afterEach(() => {
  vi.resetAllMocks();
});

it("calls fetch with the correct URL and returns data", async () => {
  const data = await new FetchHttpClient("https://pokeapi.co/api/v2").get("/pokemon/pikachu");

  expect(globalThis.fetch).toHaveBeenCalledWith("https://pokeapi.co/api/v2/pokemon/pikachu");
  expect(data).toEqual({ name: "pikachu" });
});

it("throws an error when the response is not ok", async () => {
  (globalThis.fetch as any).mockResolvedValueOnce({ ok: false, status: 404 });

  await expect(
    new FetchHttpClient("https://pokeapi.co/api/v2").get("/pokemon/nonexistent")
  ).rejects.toThrow("HTTP error! status: 404");
});
