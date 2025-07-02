import { HTMLAttributes, ReactNode } from "react";

export interface ISelectButtonListProps<T>
  extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
  items: T[];
  getKey: (item: T) => string;
  children: (item: T) => ReactNode;
}

const SelectButtonList = <T,>({
  items,
  getKey,
  children,
  ...props
}: ISelectButtonListProps<T>) => {
  return (
    <ul className="flex flex-wrap gap-2" {...props}>
      {items.map((item) => (
        <li key={getKey(item)}>{children(item)}</li>
      ))}
    </ul>
  );
};

export default SelectButtonList;
