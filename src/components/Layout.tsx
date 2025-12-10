import type { ReactNode } from "react";
import NavBar from "./NavBar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <NavBar />
      <main style={{ padding: "0 20px" }}>{children}</main>
    </div>
  );
}
