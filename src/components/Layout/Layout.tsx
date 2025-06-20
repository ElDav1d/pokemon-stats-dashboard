import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <main className="max-w-[1240px] mx-6 my-6 xl:mx-auto">{children}</main>
  );
};

export default Layout;
