import { HTMLAttributes, ReactElement } from "react";
import SelectButton, { ISelectButtonProps } from "./SelectButton";

export interface ISelectButtonListProps
  extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
  optionNames: string[];
  children: (
    optionName: string
  ) => ReactElement<ISelectButtonProps, typeof SelectButton>;
}

const SelectButtonList = ({
  optionNames,
  children,
  ...props
}: ISelectButtonListProps) => {
  return (
    <ul className="flex flex-wrap gap-2" {...props}>
      {optionNames.map((name) => (
        <li key={name}>{children(name)}</li>
      ))}
    </ul>
  );
};

export default SelectButtonList;
