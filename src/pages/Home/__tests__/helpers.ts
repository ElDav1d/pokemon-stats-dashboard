import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const typeInNameFilter = async (text: string) => {
  const user = userEvent.setup();
  const input = await screen.findByRole("searchbox", { name: /search by name/i });
  await user.clear(input);
  if (text) await user.type(input, text);
};

export const clickButtonFireType = async () => {
  const user = userEvent.setup();

  const buttonFireType = await screen.findByRole("button", {
    name: /fire/i,
  });

  await user.click(buttonFireType);
};

export const typeInMinHeightFilter = async (value: number | "") => {
  const user = userEvent.setup();
  const input = await screen.findByRole("spinbutton", { name: /min height/i });
  await user.clear(input);
  if (value !== "") await user.type(input, String(value));
};

export const typeInMaxHeightFilter = async (value: number | "") => {
  const user = userEvent.setup();
  const input = await screen.findByRole("spinbutton", { name: /max height/i });
  await user.clear(input);
  if (value !== "") await user.type(input, String(value));
};

export const clickSortByHeightCheckbox = async () => {
  const user = userEvent.setup();

  const contentArea = within(screen.getByRole("main")).getByRole("article");
  const orderCheckboxes = within(contentArea).getByRole("group", {
    name: /list controls/i,
  });
  const sortByHeightCheckbox = within(orderCheckboxes).getByRole("checkbox", {
    name: /by height/i,
  });

  await user.click(sortByHeightCheckbox);
};
