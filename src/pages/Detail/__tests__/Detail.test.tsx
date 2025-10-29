import { render, screen, waitFor, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import Detail from "../Detail";
import { clickTypeButton, clickEvolutionLink } from "./helpers";

const renderDetailPage = (pokemonName: string) => {
  const router = createMemoryRouter(
    [
      {
        path: "/:name",
        element: <Detail />,
      },
    ],
    {
      initialEntries: [`/${pokemonName}`],
      initialIndex: 0,
    }
  );

  return render(<RouterProvider router={router} />);
};

it("renders the initial elements", async () => {
  renderDetailPage("bulbasaur");

  const header = screen.getByRole("banner");
  const heading = within(header).getByRole("heading", {
    name: /bulbasaur/i,
    level: 1,
  });

  expect(heading).toBeInTheDocument();

  const homeLink = within(header).getByRole("link", {
    name: /home/i,
  });
  expect(homeLink).toBeInTheDocument();
  expect(homeLink).toHaveAttribute("href", "/");

  const main = screen.getByRole("main");
  const article = within(main).getByRole("article");

  // Wait for pokemon image to load
  await waitFor(async () => {
    const image = await within(article).findByRole("img", {
      name: /bulbasaur/i,
    });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
    );
  });

  // Wait for stats section to appear
  await waitFor(async () => {
    const statsHeading = await within(article).findByRole("heading", {
      name: /stats:/i,
      level: 2,
    });
    expect(statsHeading).toBeInTheDocument();

    // Stats should be rendered in SVG
    const svg = within(article).getByRole("img", { hidden: true });
    expect(svg).toBeInTheDocument();
  });

  // Wait for types section to appear
  await waitFor(async () => {
    const typesHeading = await within(article).findByRole("heading", {
      name: /types:/i,
      level: 2,
    });
    expect(typesHeading).toBeInTheDocument();

    // Type buttons should be rendered
    const grassButton = await within(article).findByRole("button", {
      name: /grass/i,
    });
    expect(grassButton).toBeInTheDocument();

    const poisonButton = await within(article).findByRole("button", {
      name: /poison/i,
    });
    expect(poisonButton).toBeInTheDocument();
  });
});

it("displays evolution links excluding current pokemon", async () => {
  renderDetailPage("bulbasaur");

  const main = screen.getByRole("main");
  const article = within(main).getByRole("article");

  // Wait for evolutions section to appear
  await waitFor(async () => {
    const evolutionsHeading = await within(article).findByRole("heading", {
      name: /evolutions:/i,
      level: 2,
    });
    expect(evolutionsHeading).toBeInTheDocument();
  });

  // Check that evolution links are present
  const ivysaurLink = await within(article).findByRole("link", {
    name: /ivysaur/i,
  });
  expect(ivysaurLink).toBeInTheDocument();
  expect(ivysaurLink).toHaveAttribute("href", "/ivysaur");

  const venusaurLink = await within(article).findByRole("link", {
    name: /venusaur/i,
  });
  expect(venusaurLink).toBeInTheDocument();
  expect(venusaurLink).toHaveAttribute("href", "/venusaur");

  // Current pokemon (bulbasaur) should NOT be in the evolution links
  const bulbasaurLinks = within(article).queryAllByRole("link", {
    name: /bulbasaur/i,
  });
  // There should be no evolution link for bulbasaur (only home link exists)
  expect(bulbasaurLinks.length).toBe(0);
});

it("navigates to evolution pokemon when clicking evolution link", async () => {
  renderDetailPage("bulbasaur");

  // Wait for page to load
  await waitFor(async () => {
    const heading = await screen.findByRole("heading", {
      name: /bulbasaur/i,
      level: 1,
    });
    expect(heading).toBeInTheDocument();
  });

  // Wait for evolution links to appear
  await waitFor(async () => {
    const ivysaurLink = await screen.findByRole("link", {
      name: /ivysaur/i,
    });
    expect(ivysaurLink).toBeInTheDocument();
  });

  await clickEvolutionLink("ivysaur");

  // Check that the heading updates to ivysaur
  await waitFor(async () => {
    const ivysaurHeading = await screen.findByRole("heading", {
      name: /ivysaur/i,
      level: 1,
    });
    expect(ivysaurHeading).toBeInTheDocument();
  });

  // Check that ivysaur's image is displayed
  await waitFor(async () => {
    const image = await screen.findByRole("img", {
      name: /ivysaur/i,
    });
    expect(image).toHaveAttribute(
      "src",
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
    );
  });
});

it("displays list of pokemon when type button is clicked", async () => {
  renderDetailPage("bulbasaur");

  const main = screen.getByRole("main");
  const article = within(main).getByRole("article");

  // Wait for types section to appear
  await waitFor(async () => {
    const typesHeading = await within(article).findByRole("heading", {
      name: /types:/i,
      level: 2,
    });
    expect(typesHeading).toBeInTheDocument();
  });

  await clickTypeButton("grass");

  // Wait for pokemon list to appear in the types section
  await waitFor(() => {
    const typeSection = within(article).getByRole("region", {
      name: /types:/i,
    });
    const bulbasaurListItem = within(typeSection).getByText(/bulbasaur/i);
    expect(bulbasaurListItem).toBeInTheDocument();
  });

  const typeSection = within(article).getByRole("region", {
    name: /types:/i,
  });

  const ivysaurListItem = within(typeSection).getByText(/ivysaur/i);
  expect(ivysaurListItem).toBeInTheDocument();

  const venusaurListItem = within(typeSection).getByText(/venusaur/i);
  expect(venusaurListItem).toBeInTheDocument();

  const oddishListItem = within(typeSection).getByText(/oddish/i);
  expect(oddishListItem).toBeInTheDocument();

  const gloomListItem = within(typeSection).getByText(/gloom/i);
  expect(gloomListItem).toBeInTheDocument();
});

it("displays different list when different type button is clicked", async () => {
  renderDetailPage("bulbasaur");

  const main = screen.getByRole("main");
  const article = within(main).getByRole("article");

  // Wait for types section to appear
  await waitFor(async () => {
    const typesHeading = await within(article).findByRole("heading", {
      name: /types:/i,
      level: 2,
    });
    expect(typesHeading).toBeInTheDocument();
  });

  await clickTypeButton("poison");

  // Wait for pokemon list to appear in the types section
  await waitFor(() => {
    const typeSection = within(article).getByRole("region", {
      name: /types:/i,
    });
    const bulbasaurListItem = within(typeSection).getByText(/bulbasaur/i);
    expect(bulbasaurListItem).toBeInTheDocument();
  });

  const typeSection = within(article).getByRole("region", {
    name: /types:/i,
  });

  const ivysaurListItem = within(typeSection).getByText(/ivysaur/i);
  expect(ivysaurListItem).toBeInTheDocument();

  const venusaurListItem = within(typeSection).getByText(/venusaur/i);
  expect(venusaurListItem).toBeInTheDocument();

  const weedleListItem = within(typeSection).getByText(/weedle/i);
  expect(weedleListItem).toBeInTheDocument();

  const kakunaListItem = within(typeSection).getByText(/kakuna/i);
  expect(kakunaListItem).toBeInTheDocument();
});

it("renders pokemon stats in SVG graph", async () => {
  renderDetailPage("bulbasaur");

  const main = screen.getByRole("main");
  const article = within(main).getByRole("article");

  // Wait for stats section to appear
  await waitFor(async () => {
    const statsHeading = await within(article).findByRole("heading", {
      name: /stats:/i,
      level: 2,
    });
    expect(statsHeading).toBeInTheDocument();
  });

  // Check that SVG is rendered
  await waitFor(() => {
    const svgs = article.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  // Check that SVG has the correct attributes
  const svg = article.querySelector("svg");
  expect(svg).toBeInTheDocument();
  expect(svg?.tagName.toLowerCase()).toBe("svg");
  expect(svg).toHaveAttribute("viewBox", "0 0 500 300");
  expect(svg).toHaveAttribute("preserveAspectRatio", "xMinYMin meet");
});
