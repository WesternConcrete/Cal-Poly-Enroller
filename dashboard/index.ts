import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function HomePage() {
  //if the user is logged in, navigate to dashboard, else navigate to auth
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    } else {
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/auth");
      }
    }
  }, [sessionStatus]);
}
