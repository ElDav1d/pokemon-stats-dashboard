import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const clickButtonFireType = async () => {
  const user = userEvent.setup();

  const buttonFireType = await screen.findByRole("button", {
    name: /fire/i,
  });

  await user.click(buttonFireType);
};
