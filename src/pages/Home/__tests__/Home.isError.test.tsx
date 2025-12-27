import { render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import Home from "../Home";
import { store } from "../../../shared/infrastructure/redux/store";

beforeEach(() => {
  // Suppress console.error for these tests since we're testing error states
  vi.spyOn(console, "error").mockImplementation(() => {});

  // Mock fetch to return an error only for pokemon list endpoints
  global.fetch = vi.fn((url: string) => {
    // Only fail pokemon list endpoints (type/{type} and pokemon/{name})
    if (url.includes("/type/") || url.includes("/pokemon/")) {
      return Promise.resolve({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);
    }
    // SelectPokemonType's /type endpoint responds successfully
    return Promise.resolve({
      ok: true,
      json: async () => ({
        results: [],
      }),
    } as Response);
  });
});

afterEach(() => {
  // Restore console.error and other mocks after each test
  vi.restoreAllMocks();
});

it("shows error message when fetch fails", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=normal"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  await waitFor(
    () => {
      const errorMessage = screen.getByRole("heading", {
        level: 3,
        name: /error loading pokemon list/i,
      });
      expect(errorMessage).toBeInTheDocument();
    },
    { timeout: 2000 }
  );
});

it("does not show error message when no type is selected", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  await waitFor(() => {
    const errorMessage = screen.queryByRole("heading", {
      level: 3,
      name: /error loading pokemon list/i,
    });

    expect(errorMessage).not.toBeInTheDocument();
  });
});
