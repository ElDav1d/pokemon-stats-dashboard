import { memo } from "react";
export interface ISelectButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
  children: React.ReactNode;
  value: string;
}

const SelectButton = memo(
  ({ selected, children, value, ...props }: ISelectButtonProps) => {
    return (
      <button
        type="button"
        className={selected ? "button-type-selected" : ""}
        aria-pressed={selected}
        data-value={value}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export default SelectButton;
