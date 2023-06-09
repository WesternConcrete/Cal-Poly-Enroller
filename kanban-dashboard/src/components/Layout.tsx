import React from "react";
import Menubar from "../dashboard/Menubar";
import { useSession } from "next-auth/react";
import withAuth from "./AuthChecker";

export interface LayoutProps {
  children?: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { data: session, status: sessionStatus } = useSession();

  return (
    <div className="h-screen grid overflow-y-hidden grid-rows-[min-content,1fr]">
      {sessionStatus !== "loading" && (
        <>
          {" "}
          <Menubar />
          {children}
        </>
      )}
    </div>
  );
}


export default withAuth(Layout)