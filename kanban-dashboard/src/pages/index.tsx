import { useSession } from "next-auth/react";
import AuthPage from "./auth";

export default function HomePage() {
  const { data: session, status: sessionStatus } = useSession();

  return <AuthPage />;
}
