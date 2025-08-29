export interface ISelectButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
  children: React.ReactNode;
}

const SelectButton = ({ selected, children, ...props }: ISelectButtonProps) => (
  <button
    type="button"
    className={selected ? "button-type-selected" : ""}
    aria-pressed={selected}
    {...props}
  >
    {children}
  </button>
);

export default SelectButton;
