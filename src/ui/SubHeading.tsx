export interface SubHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string;
}

const SubHeading = ({ title, ...props }: SubHeadingProps) => {
  return (
    <h2 className="text-lg l:text-xl xl:text-2xl mb-4" {...props}>
      {title}
    </h2>
  );
};

export default SubHeading;
