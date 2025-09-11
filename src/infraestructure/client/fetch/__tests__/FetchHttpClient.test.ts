import { it, expect, beforeEach, afterEach, vi } from "vitest";
import { FetchHttpClient } from "../FetchHttpClient";
import { url } from "../../../../lib/constants";

declare const global: any;

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ name: "pikachu" }),
  });
});

afterEach(() => {
  vi.resetAllMocks();
});

it("calls fetch with the correct URL and returns data", async () => {
  const data = await new FetchHttpClient(url.BASE).get(`${url.POKEMON}pikachu`);

  expect(global.fetch).toHaveBeenCalledWith(`${url.BASE}${url.POKEMON}pikachu`);
  expect(data).toEqual({ name: "pikachu" });
});

it("throws an error when the response is not ok", async () => {
  global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });

  await expect(
    new FetchHttpClient(url.BASE).get(`${url.POKEMON}nonexistent`)
  ).rejects.toThrow("HTTP error! status: 404");
});
