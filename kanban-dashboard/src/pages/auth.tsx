import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"; // Import useState hook
import Layout from "~/components/Layout";

export default function AuthPage() {
    const { data: session, status: sessionStatus } = useSession();

    const [isLoadingLogin, setIsLoadingLogin] = useState(false); // Add isLoading state variable
    const [isLoadingLogout, setIsLoadingLogout] = useState(false); // Add isLoading state variable
    const [isLoadingSignUp, setIsLoadingSignUp] = useState(false); // Add isLoading state variable

    
    const handleLogout = () => {
      setIsLoadingLogout(true);
      signOut({ redirect: false }).then(() => {
        setIsLoadingLogout(false);
      });
    };
    // Function to handle login button click
    const handleLogin = (singup = false) => {
      singup? setIsLoadingSignUp(true): setIsLoadingLogin(true); // Set isLoading to true when login button is clicked
      signIn("google", {
        callbackUrl: `${window.location.origin}/onboarding`,
      }); // Perform login action
      setTimeout(() => {
        singup? setIsLoadingSignUp(false): setIsLoadingLogin(false); // Set isLoading to true when login button is clicked
      }, 2000);
    };

    return (
      <Layout>
        <div>
        <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex flex-col items-center gap-2 max-w-[980px] text-center">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            Welcome to the Cal Poly Flowchart Module
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            The Cal Poly Flowchart Module is a personalized tool, integrated into the Cal Poly enrollment software, that allows students to track their major progress, plan future classes, and easily enroll in up-to-date courses, enhancing efficiency and effectiveness in academic planning.
          </p>
        </div>
        <div className="flex justify-center gap-4">
        {sessionStatus === "loading" ? <Loader2 className="animate-spin" />: session ? (
          <>
            <Button
              className="bg-primaryGreen"
              onClick={handleLogout} // Add handleLogout function to sign out
              disabled={isLoadingLogout}
            >
              {isLoadingLogout ? <Loader2 className="animate-spin" /> : "Logout"}
            </Button>
          </>
        ) : (
          <>
            <Button
              className="bg-primaryGreen"
              onClick={() => handleLogin()}
              disabled={isLoadingLogin}
            >
              {isLoadingLogin ? <Loader2 className="animate-spin" /> : "Login"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleLogin(true)}
              disabled={isLoadingSignUp}
            >
              {isLoadingSignUp ? <Loader2 className="animate-spin" /> : "Sign Up"}
            </Button>
          </>
        )}
       
      </div>
      </section>
        </div>
       
      </Layout>
    )
}



