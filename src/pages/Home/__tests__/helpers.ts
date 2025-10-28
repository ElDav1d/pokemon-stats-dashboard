import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const clickButtonFireType = async () => {
  const user = userEvent.setup();

  const buttonFireType = await screen.findByRole("button", {
    name: /fire/i,
  });

  await user.click(buttonFireType);
};

export const clickSortByHeightCheckbox = async () => {
  const user = userEvent.setup();

  const contentArea = within(screen.getByRole("main")).getByRole("article");
  const orderCheckboxes = within(contentArea).getByRole("group", {
    name: /order the pokemons/i,
  });
  const sortByHeightCheckbox = within(orderCheckboxes).getByRole("checkbox", {
    name: /by height/i,
  });

  await user.click(sortByHeightCheckbox);
};
