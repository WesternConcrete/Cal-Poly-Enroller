import React from 'react';
import Menubar from '../dashboard/Menubar';
import { useSession } from "next-auth/react"

export interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
const { data: session, status: sessionStatus } = useSession();

  return (
    <div className="h-screen grid overflow-y-hidden grid-rows-[min-content,1fr]">
    {sessionStatus !== 'loading' && 
    <>  <Menubar />
   {children}
    
    </>
    }
    
 </div>
   
  );
}
