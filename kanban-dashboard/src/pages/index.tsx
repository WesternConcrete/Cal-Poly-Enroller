import { Dashboard } from "../dashboard";
import Layout from "../components/Layout";
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation';
import AuthPage from "./auth";

export default function HomePage() {
  const { data: session, status: sessionStatus } = useSession();


  return (
    <AuthPage />
  );
}
